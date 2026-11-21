import { supabase } from '../supabaseClient';
import {
  VERIFIED_DAILY_CHALLENGES,
  resolveRelatedNoteIndex,
} from './dailyChallengeBank';
import { planDailyPublication } from './dkcSchedulerLogic';
import { readLocalChallengeHistory } from './dkcProgressLogic';

const SESSION_KEY_STORAGE = 'amldecode_dkc_session_v1';

function getOrCreateSessionKey(learnerEmail = '') {
  if (learnerEmail && typeof learnerEmail === 'string') {
    return `learner:${learnerEmail.trim().toLowerCase()}`;
  }
  try {
    let existing = window.localStorage.getItem(SESSION_KEY_STORAGE);
    if (!existing) {
      existing = `anon_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`;
      window.localStorage.setItem(SESSION_KEY_STORAGE, existing);
    }
    return existing;
  } catch {
    return 'anon_ephemeral_session';
  }
}

function mapSupabaseQuestion(row) {
  const resolvedIdx = resolveRelatedNoteIndex(row.related_note_index, row.topic);
  return {
    id: row.id,
    topic: row.topic,
    difficulty: row.difficulty || 'Intermediate',
    jurisdiction: row.jurisdiction || 'Global',
    statement: row.statement,
    correctAnswer: Boolean(row.correct_answer),
    explanation: row.explanation,
    sourceReference: row.source_references || 'Verified AMLDecode Compliance Reference',
    relatedArticleId: row.related_article_id || null,
    relatedNoteIndex: resolvedIdx,
    relatedArticleTitle: row.related_article_title || 'AMLDecode Study Notes',
    contentHash: row.content_hash,
    reviewStatus: row.review_status || 'verified',
    publicationStatus: row.publication_status || 'published',
  };
}

export async function loadDailyChallengeWithStore({ dateIsoIst, rotationTopic, customSchedule = null }) {
  const plan = planDailyPublication({
    now: new Date(),
    questionPool: VERIFIED_DAILY_CHALLENGES,
    customSchedule,
  });

  if (!supabase) {
    return {
      challenge: plan.question,
      rotationTopic: plan.rotationTopic,
      isFallback: plan.isFallback,
      source: 'local-verified-fallback',
    };
  }

  try {
    const { data: pubRow, error: pubError } = await supabase
      .from('dkc_daily_publications')
      .select('question_id, rotation_topic, is_fallback, publication_status')
      .eq('publication_date_ist', dateIsoIst)
      .eq('publication_status', 'published')
      .maybeSingle();

    if (!pubError && pubRow?.question_id) {
      const { data: qRow, error: qError } = await supabase
        .from('dkc_questions')
        .select('*')
        .eq('id', pubRow.question_id)
        .eq('publication_status', 'published')
        .in('review_status', ['verified', 'approved'])
        .maybeSingle();

      if (!qError && qRow && typeof qRow.correct_answer === 'boolean') {
        return {
          challenge: mapSupabaseQuestion(qRow),
          rotationTopic: pubRow.rotation_topic || rotationTopic || plan.rotationTopic,
          isFallback: Boolean(pubRow.is_fallback),
          source: 'supabase-published',
        };
      }
    }

    const { data: poolRows, error: poolError } = await supabase
      .from('dkc_questions')
      .select('*')
      .eq('publication_status', 'published')
      .in('review_status', ['verified', 'approved'])
      .limit(100);

    if (!poolError && Array.isArray(poolRows) && poolRows.length > 0) {
      const mappedPool = poolRows.map(mapSupabaseQuestion);
      const plannedFromDb = planDailyPublication({
        now: new Date(),
        questionPool: mappedPool,
        customSchedule,
      });
      return {
        challenge: plannedFromDb.question,
        rotationTopic: plannedFromDb.rotationTopic,
        isFallback: plannedFromDb.isFallback,
        source: 'supabase-verified-pool',
      };
    }

    return {
      challenge: plan.question,
      rotationTopic: plan.rotationTopic,
      isFallback: plan.isFallback,
      source: 'local-verified-fallback',
    };
  } catch {
    return {
      challenge: plan.question,
      rotationTopic: plan.rotationTopic,
      isFallback: plan.isFallback,
      source: 'local-verified-fallback',
    };
  }
}

export async function recordDailyChallengeAttempt({
  dateIsoIst,
  challenge,
  selectedAnswer,
  learner,
}) {
  if (!challenge || typeof selectedAnswer !== 'boolean') return null;

  const verifiedAnswer = Boolean(challenge.correctAnswer);
  const isCorrect = selectedAnswer === verifiedAnswer;
  const sessionKey = getOrCreateSessionKey(learner?.email || '');
  const attemptRecord = {
    session_key: sessionKey,
    learner_email: learner?.email ? learner.email.trim().toLowerCase() : null,
    publication_date_ist: dateIsoIst,
    question_id: challenge.id,
    topic: challenge.topic,
    statement: challenge.statement,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    answered_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase
        .from('dkc_attempts')
        .upsert(attemptRecord, {
          onConflict: 'session_key,publication_date_ist,question_id',
        });
    } catch {
      // Local history still persists even if remote write fails
    }
  }

  return {
    ...attemptRecord,
    verifiedAnswer,
  };
}

export async function fetchChallengeHistoryWithFallback(learner) {
  const localHistory = readLocalChallengeHistory();
  if (!supabase || !learner?.email) {
    return localHistory;
  }

  try {
    const emailNormalized = learner.email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('dkc_attempts')
      .select('publication_date_ist, question_id, selected_answer, is_correct, answered_at')
      .eq('learner_email', emailNormalized)
      .order('publication_date_ist', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data) || data.length === 0) {
      return localHistory;
    }

    const questionLookup = new Map(
      VERIFIED_DAILY_CHALLENGES.map((q) => [q.id, q])
    );

    const mapped = data.map((row) => {
      const q = questionLookup.get(row.question_id);
      return {
        publication_date_ist: row.publication_date_ist,
        question_id: row.question_id,
        topic: q?.topic || 'Compliance Challenge',
        statement: q?.statement || `Challenge ${row.question_id}`,
        selected_answer: Boolean(row.selected_answer),
        is_correct: Boolean(row.is_correct),
        answered_at: row.answered_at,
      };
    });

    return mapped.length > 0 ? mapped : localHistory;
  } catch {
    return localHistory;
  }
}
