import { useState, useEffect, useMemo } from 'react';
import { recordCompletedAttempt, readStoredRecentAttempts } from '../data/knowledgeTestBank';
import AiTutorPanel from './AiTutorPanel';
import { completeLearnerTask } from '../data/amlSkillPassportEngine';

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

export default function AssessmentRunner({
  questions = [],
  domain,
  difficulty,
  mode = 'practice',
  onExitToSetup,
  onAttemptRecorded,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isSubmitted || questions.length === 0) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSubmitted, questions.length]);

  const getQuestionKey = (q, idx) => String(q?.id ?? q?.questionId ?? q?.index ?? idx);
  const getExpectedAnswer = (q) => String(q?.correct_answer ?? q?.correctAnswer ?? q?.answer ?? '').trim();

  const currentQuestion = questions[currentIndex] || null;
  const isPractice = mode === 'practice';
  const totalQuestions = questions.length;

  const answeredCount = useMemo(
    () => questions.filter((q, idx) => Boolean(answers[getQuestionKey(q, idx)])).length,
    [questions, answers]
  );

  const resultsSummary = useMemo(() => {
    const bySubtopic = {};
    const reviewItems = questions.map((q, idx) => {
      const selectedOption = answers[getQuestionKey(q, idx)] || null;
      const expectedAnswer = getExpectedAnswer(q);
      const isCorrect = Boolean(selectedOption) && Boolean(expectedAnswer) && String(selectedOption).trim() === expectedAnswer;

      const subKey = q.subtopic || 'General';
      if (!bySubtopic[subKey]) {
        bySubtopic[subKey] = { subtopic: subKey, correct: 0, total: 0 };
      }
      bySubtopic[subKey].total += 1;
      if (isCorrect) bySubtopic[subKey].correct += 1;

      return {
        index: idx,
        question: q,
        selectedOption,
        isCorrect,
      };
    });

    const correctCount = reviewItems.filter((item) => item.isCorrect).length;
    const accuracyPercent =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    return {
      correctCount,
      incorrectCount: Math.max(0, totalQuestions - correctCount),
      accuracyPercent,
      bySubtopic: Object.values(bySubtopic),
      reviewItems,
    };
  }, [questions, answers, totalQuestions]);

  const handleSelectOption = (questionId, option) => {
    if (isSubmitted) return;
    if (isPractice && answers[questionId]) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitAssessment = () => {
    if (isSubmitted || totalQuestions === 0) return;
    setIsSubmitted(true);
    const saved = recordCompletedAttempt({
      id: `${Date.now()}-${domain}`,
      completedAt: new Date().toISOString(),
      domain,
      difficulty,
      mode,
      score: resultsSummary.correctCount,
      total: totalQuestions,
      accuracyPercent: resultsSummary.accuracyPercent,
      durationSeconds: elapsedSeconds,
    });
    if (typeof onAttemptRecorded === 'function') {
      onAttemptRecorded(saved);
    }
    try {
      const attemptId = saved?.id || `${Date.now()}-${domain || 'aml'}`;
      completeLearnerTask({
        sourceFeature: 'quiz',
        externalEventId: `quiz-${attemptId}-${Date.now()}`,
        domain: domain || 'AML Fundamentals',
        title: `${domain || 'AML'} Knowledge Test`,
        questionsAnswered: totalQuestions,
        correctAnswers: resultsSummary.correctCount,
        scorePercent: resultsSummary.accuracyPercent,
        xpAwarded: Math.max(30, Math.round(resultsSummary.accuracyPercent * 0.6) + totalQuestions * 5),
      });
    } catch {
      // Do not block assessment submission if passport storage fails
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setElapsedSeconds(0);
  };

  if (!currentQuestion) {
    return (
      <section className="max-w-4xl mx-auto p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
        <h2 className="text-xl font-bold text-[#F5F8FC]">No Questions Available</h2>
        <p className="text-sm text-[#B8C7D9]">
          No reviewed questions matched {domain}. Return to setup to choose another domain.
        </p>
        <button
          type="button"
          onClick={onExitToSetup}
          className="px-4 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-bold cursor-pointer"
        >
          Back to Setup
        </button>
      </section>
    );
  }

  if (isSubmitted) {
    const weakAreas = resultsSummary.bySubtopic.filter(
      (item) => item.total > 0 && item.correct / item.total < 0.7
    );

    return (
      <section
        aria-label="Assessment Results"
        className="max-w-4xl mx-auto space-y-8 transition-opacity duration-300"
      >
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[#C4A77D]/50 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C4A77D]">
                Assessment Complete · {domain}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F8FC] mt-1">
                Score: {resultsSummary.correctCount} / {totalQuestions} ({resultsSummary.accuracyPercent}%)
              </h2>
              <p className="text-xs text-[#B8C7D9] mt-1">
                Difficulty: {difficulty} · Mode: {mode} · Elapsed Time: {formatDuration(elapsedSeconds)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold hover:bg-[#d2b891] transition-colors cursor-pointer"
              >
                Retake Assessment
              </button>
              <button
                type="button"
                onClick={onExitToSetup}
                className="px-4 py-2.5 rounded-xl bg-[#081C33] border border-[var(--amld-border)] text-xs font-bold text-[#F5F8FC] hover:border-[#C4A77D]/60 transition-colors cursor-pointer"
              >
                Change Configuration
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-[#9BB0C7]">Correct Answers</p>
              <p className="text-2xl font-extrabold text-[#C4A77D] mt-1">
                {resultsSummary.correctCount}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-[#9BB0C7]">Needs Review</p>
              <p className="text-2xl font-extrabold text-[#F5F8FC] mt-1">
                {resultsSummary.incorrectCount}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-[#9BB0C7]">Time Spent</p>
              <p className="text-2xl font-extrabold text-[#F5F8FC] mt-1">
                {formatDuration(elapsedSeconds)}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
              Subtopic Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resultsSummary.bySubtopic.map((entry) => {
                const pct = Math.round((entry.correct / entry.total) * 100);
                return (
                  <div
                    key={entry.subtopic}
                    className="p-3.5 rounded-xl bg-[#081C33]/60 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-semibold text-[#F5F8FC]">{entry.subtopic}</span>
                    <span className="text-xs font-bold text-[#C4A77D]">
                      {entry.correct}/{entry.total} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <AiTutorPanel
            domain={domain}
            difficulty={difficulty}
            recentAttempts={readStoredRecentAttempts()}
            subtopicBreakdown={resultsSummary.bySubtopic}
          />
          <div className="p-4 rounded-xl bg-[#132B3E]/60 border border-white/10 text-xs text-[#B8C7D9]">
            <strong className="text-[#F5F8FC]">Suggested Next Step: </strong>
            {weakAreas.length > 0
              ? `Focus review on ${weakAreas.map((w) => w.subtopic).join(', ')}, then retake to verify mastery.`
              : `Strong accuracy across ${domain}. Retake to reinforce recall or try another domain at ${difficulty} level.`}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#C4A77D]">
            Question-by-Question Review
          </h3>
          {resultsSummary.reviewItems.map(({ index, question, selectedOption, isCorrect }) => (
            <div
              key={question.id || index}
              className={`p-6 rounded-2xl bg-[#0D1E30] border space-y-3 ${
                isCorrect ? 'border-[#C4A77D]/60' : 'border-red-400/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C4A77D]">
                    Question {index + 1} · {question.subtopic}
                  </span>
                  <h4 className="text-base font-bold text-[#F5F8FC] mt-1">{question.question}</h4>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isCorrect
                      ? 'bg-[#C4A77D] text-[#081C33]'
                      : 'bg-red-500/20 text-red-300 border border-red-400/40'
                  }`}
                >
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <div className="text-xs space-y-1 pt-1">
                <p className="text-[#B8C7D9]">
                  Your Answer:{' '}
                  <span className="font-semibold text-[#F5F8FC]">
                    {selectedOption || 'Not answered'}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-[#C4A77D]">
                    Correct Answer:{' '}
                    <span className="font-semibold">{question.correct_answer}</span>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#081C33]/70 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#C4A77D] mb-1">
                  Compliance Rationale
                </p>
                <p className="text-xs text-[#B8C7D9] leading-relaxed">{question.explanation}</p>
                {selectedOption && !isCorrect && (
                  <p className="text-xs text-[#9BB0C7] mt-1.5 leading-relaxed">
                    Why your selection missed: <span className="text-[#F5F8FC]/90">"{selectedOption}"</span> does not align with the required AML/KYC control standard compared to <span className="text-[#C4A77D]">"{question.correct_answer}"</span>.
                  </p>
                )}
                {question.jurisdiction && (
                  <p className="text-[11px] text-[#9BB0C7] mt-1.5">
                    Jurisdiction / Domain Focus: {question.jurisdiction} ? {question.subtopic || domain}
                  </p>
                )}
                {question.sourceRef && (
                  <p className="text-[11px] text-[#9BB0C7] mt-2">
                    Reference: {question.sourceRef}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const selectedForCurrent = answers[currentQuestion.id] || null;
  const isCurrentCorrect = selectedForCurrent === currentQuestion.correct_answer;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <section
      aria-label="Active Assessment Session"
      className="max-w-4xl mx-auto space-y-6 transition-opacity duration-300"
    >
      {/* Top Session Bar */}
      <div className="p-5 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4A77D]">
              {domain} · {difficulty} · {isPractice ? 'Practice Mode' : 'Exam Mode'}
            </p>
            <h2 className="text-lg font-extrabold text-[#F5F8FC] mt-0.5">
              Question {currentIndex + 1} of {totalQuestions}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#B8C7D9]">
            <span>Answered: {answeredCount}/{totalQuestions}</span>
            <span>·</span>
            <span>Time: {formatDuration(elapsedSeconds)}</span>
            <button
              type="button"
              onClick={onExitToSetup}
              className="px-3 py-1.5 rounded-lg bg-[#081C33] border border-[var(--amld-border)] text-[#F5F8FC] hover:border-[#C4A77D]/60 transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#081C33] overflow-hidden">
          <div
            className="h-full bg-[#C4A77D] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Jump Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const hasAnswer = Boolean(answers[q.id]);
            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#C4A77D] text-[#081C33] border-[#C4A77D]'
                    : hasAnswer
                    ? 'bg-[#132B3E] text-[#C4A77D] border-[#C4A77D]/50'
                    : 'bg-[#081C33] text-[#9BB0C7] border-white/10 hover:text-[#F5F8FC]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      <div className="rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-[#132B3E]/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-[#C4A77D]">
            <span>{currentQuestion.subtopic}</span>
            <span>{currentQuestion.jurisdiction}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#F5F8FC] leading-snug">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="p-6 space-y-3">
          {(currentQuestion.options || []).map((option, optIdx) => {
            const isSelected = selectedForCurrent === option;
            const isRightOption = option === currentQuestion.correct_answer;

            let styleClasses =
              'border-white/10 bg-[#081C33]/70 text-[#B8C7D9] hover:border-[#C4A77D]/50 hover:text-[#F5F8FC]';

            if (isPractice && selectedForCurrent) {
              if (isRightOption) {
                styleClasses = 'border-[#C4A77D] bg-[#C4A77D]/15 text-[#C4A77D]';
              } else if (isSelected && !isRightOption) {
                styleClasses = 'border-red-500 bg-red-500/15 text-red-300';
              } else {
                styleClasses = 'border-white/5 bg-[#081C33]/40 text-slate-500 opacity-65';
              }
            } else if (!isPractice && isSelected) {
              styleClasses = 'border-[#C4A77D] bg-[#C4A77D]/15 text-[#F5F8FC]';
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isPractice && Boolean(selectedForCurrent)}
                onClick={() => handleSelectOption(currentQuestion.id, option)}
                className={`block w-full text-left p-4 rounded-xl border transition-all duration-150 font-semibold text-sm cursor-pointer ${styleClasses}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Immediate Rationale in Practice Mode Only */}
        {isPractice && selectedForCurrent && (
          <div className="p-6 border-t border-white/10 bg-[#081C33]/65 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
              {isCurrentCorrect ? 'Correct — Compliance Rationale' : 'Review — Compliance Rationale'}
            </p>
            <p className="text-sm text-[#B8C7D9] leading-relaxed">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.sourceRef && (
              <p className="text-xs text-[#9BB0C7] pt-1">Source: {currentQuestion.sourceRef}</p>
            )}
          </div>
        )}
      </div>

      <AiTutorPanel
        domain={domain}
        difficulty={difficulty}
        question={currentQuestion}
        hasAnswered={Boolean(selectedForCurrent)}
        recentAttempts={readStoredRecentAttempts()}
      />

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="px-4 py-2.5 rounded-xl bg-[#0D1E30] border border-[var(--amld-border)] text-xs font-bold text-[#F5F8FC] disabled:opacity-40 cursor-pointer"
        >
          Previous Question
        </button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 && (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
              }
              className="px-4 py-2.5 rounded-xl bg-[#132B3E] border border-[#C4A77D]/50 text-xs font-bold text-[#C4A77D] hover:bg-[#132B3E]/80 cursor-pointer"
            >
              Next Question
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmitAssessment}
            className="px-5 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold hover:bg-[#d2b891] transition-colors cursor-pointer"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </section>
  );
}



