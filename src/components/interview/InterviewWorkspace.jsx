import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  SkipForward,
  Square,
  UserCheck,
} from 'lucide-react';
import { evaluateInterviewAnswer } from '../../data/aiInterviewEvaluator';

const MAX_ANSWER_CHARS = 2500;

function formatElapsed(sec) {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export default function InterviewWorkspace({
  session,
  onUpdateSession,
  onCompleteSession,
  onExitToHub,
}) {
  const questions = session.questions || [];
  const totalQ = questions.length;
  const currentIdx = Math.min(session.currentIndex || 0, Math.max(0, totalQ - 1));
  const currentQ = questions[currentIdx];

  const draftKey = `amldecode_draft_${session.id}_${currentIdx}`;
  const [answerText, setAnswerText] = useState(() => {
    try {
      return localStorage.getItem(draftKey) || '';
    } catch {
      return '';
    }
  });
  const [inputMode, setInputMode] = useState('text');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [followUpAccepted, setFollowUpAccepted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('');
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [elapsed, setElapsed] = useState(session.elapsedSeconds || 0);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Autosave draft answer
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, answerText);
    } catch {
      // ignore storage errors
    }
  }, [draftKey, answerText]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechStatus('Browser speech recognition is not supported here?please type your response.');
      setInputMode('text');
      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        setListening(true);
        setSpeechStatus('Listening via browser speech recognition (no raw audio recorded or uploaded)...');
      };

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          transcript += event.results[i][0]?.transcript || '';
        }
        if (transcript.trim()) {
          setInputMode('voice');
          setAnswerText((prev) => {
            const combined = prev ? `${prev} ${transcript.trim()}` : transcript.trim();
            return combined.slice(0, MAX_ANSWER_CHARS);
          });
        }
      };

      rec.onerror = () => {
        setListening(false);
        setSpeechStatus('Voice capture stopped or unavailable?you can continue typing your answer.');
      };

      rec.onend = () => {
        setListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
      setSpeechStatus('Unable to start speech recognition?please use text input.');
    }
  };

  const processAnswer = async ({ skipped = false }) => {
    if (!currentQ || isEvaluating) return;
    if (!skipped && !answerText.trim()) return;

    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
    setIsEvaluating(true);

    const activePrompt = followUpAccepted && currentQ.followUpPrompt
      ? `${currentQ.prompt} (Follow-up: ${currentQ.followUpPrompt})`
      : currentQ.prompt;

    const evaluation = await evaluateInterviewAnswer({
      question: { ...currentQ, prompt: activePrompt },
      answerText: skipped ? '' : answerText,
      skipped,
      role: session.role,
      experienceLevel: session.experienceLevel,
      company: session.company,
    });

    const record = {
      questionIndex: currentIdx,
      questionCode: currentQ.code,
      category: currentQ.category,
      recommendedModuleIndex: currentQ.recommendedModuleIndex,
      questionText: activePrompt,
      answerText: skipped ? '' : answerText.trim(),
      skipped,
      inputMode: skipped ? 'skipped' : inputMode,
      timeSpentSeconds: elapsed,
      evaluation,
    };

    const existingRecords = Array.isArray(session.records) ? session.records : [];
    const filtered = existingRecords.filter((r) => r.questionIndex !== currentIdx);
    const updatedRecords = [...filtered, record].sort((a, b) => a.questionIndex - b.questionIndex);

    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    const updatedSession = {
      ...session,
      elapsedSeconds: elapsed,
      records: updatedRecords,
    };

    onUpdateSession(updatedSession);
    setLatestFeedback(record);
    setIsEvaluating(false);
  };

  const advanceOrFinish = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= totalQ) {
      onCompleteSession({
        ...session,
        elapsedSeconds: elapsed,
        currentIndex: totalQ,
      });
    } else {
      setLatestFeedback(null);
      setFollowUpAccepted(false);
      setInputMode('text');
      try {
        setAnswerText(localStorage.getItem(`amldecode_draft_${session.id}_${nextIdx}`) || '');
      } catch {
        setAnswerText('');
      }
      onUpdateSession({
        ...session,
        elapsedSeconds: elapsed,
        currentIndex: nextIdx,
      });
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  };

  const handleFinishEarly = () => {
    setConfirmEndOpen(false);
    onCompleteSession({
      ...session,
      elapsedSeconds: elapsed,
      completedEarly: true,
    });
  };

  const completionPct = Math.round(((currentIdx + (latestFeedback ? 1 : 0)) / Math.max(1, totalQ)) * 100);

  if (!currentQ) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-stone-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1E3A5F] dark:text-[#C4A77D]">
            <span>{session.company}</span>
            <span>?</span>
            <span>{session.role}</span>
            <span>?</span>
            <span>{session.experienceLevel}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#081C33] dark:text-white mt-0.5">
            AI Compliance Interview Simulator
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExitToHub}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Save & Exit
          </button>
          <button
            type="button"
            onClick={() => setConfirmEndOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            End Interview
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Ending Unfinished Interview */}
      {confirmEndOpen && (
        <div className="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-amber-950 dark:text-amber-100">
            <strong>End this interview now?</strong> You have completed{' '}
            {(session.records || []).length} of {totalQ} questions. Ending now will generate your performance report from answered questions.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmEndOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 cursor-pointer"
            >
              Keep Going
            </button>
            <button
              type="button"
              onClick={handleFinishEarly}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081C33] text-white cursor-pointer"
            >
              View Report Now
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Layout: Left Conversation/Question, Right Progress/Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* AI Interviewer Question Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#081C33] text-[#C4A77D] flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] dark:text-[#C4A77D]">
                    Hiring Manager - {currentQ.category}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Question {currentIdx + 1} of {totalQ} ({currentQ.difficulty})
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Simulated Practice
              </span>
            </div>

            <p className="text-base sm:text-lg font-bold text-[#081C33] dark:text-slate-100 leading-relaxed">
              {currentQ.prompt}
            </p>

            {followUpAccepted && currentQ.followUpPrompt && (
              <div className="mt-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 text-sm text-[#081C33] dark:text-slate-200">
                <strong className="text-[#1E3A5F] dark:text-[#C4A77D]">Follow-Up Probe:</strong>{' '}
                {currentQ.followUpPrompt}
              </div>
            )}

            {currentQ.contextHint && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Tip: {currentQ.contextHint}
              </p>
            )}
          </div>

          {/* Answer Composer or Immediate Evaluation Feedback */}
          {!latestFeedback ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="interview-answer-input" className="text-sm font-bold text-[#081C33] dark:text-slate-100">
                  Your Response
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      listening
                        ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#1E3A5F]'
                    }`}
                  >
                    {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {listening ? 'Stop Voice' : 'Voice Input'}
                  </button>
                </div>
              </div>

              {speechStatus && (
                <p className="text-xs text-[#1E3A5F] dark:text-[#C4A77D]">{speechStatus}</p>
              )}

              <textarea
                id="interview-answer-input"
                ref={textareaRef}
                rows={6}
                maxLength={MAX_ANSWER_CHARS}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && answerText.trim() && !isEvaluating) {
                    e.preventDefault();
                    processAnswer({ skipped: false });
                  }
                }}
                placeholder="Explain your analysis, red flags, verification steps, and escalation rationale clearly... (Ctrl/Cmd + Enter to submit)"
                className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Draft autosaved locally - {answerText.length}/{MAX_ANSWER_CHARS} chars
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={() => processAnswer({ skipped: true })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Skip Question
                  </button>

                  <button
                    type="button"
                    disabled={isEvaluating || !answerText.trim()}
                    onClick={() => processAnswer({ skipped: false })}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#081C33] hover:bg-[#1E3A5F] text-white disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Immediate Answer Evaluation Card */
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-[#081C33] dark:text-white">
                    Answer Score: {latestFeedback.evaluation.totalScore}/100
                  </h2>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {latestFeedback.evaluation.evaluationSource === 'free_tier_ai'
                    ? 'AI-Assisted Feedback'
                    : 'Deterministic Rubric Feedback'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {[
                  ['Tech (30%)', latestFeedback.evaluation.technicalAccuracy],
                  ['Practical (25%)', latestFeedback.evaluation.practicalApplication],
                  ['Risk (20%)', latestFeedback.evaluation.riskIdentification],
                  ['Clarity (15%)', latestFeedback.evaluation.communicationClarity],
                  ['Complete (10%)', latestFeedback.evaluation.completeness],
                ].map(([label, val]) => (
                  <div key={label} className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200/70 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="text-sm font-extrabold text-[#081C33] dark:text-white mt-0.5">{val}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/40">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">Strengths</div>
                  <ul className="space-y-1 text-emerald-950 dark:text-emerald-100 list-disc pl-4">
                    {(latestFeedback.evaluation.strengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-800/40">
                  <div className="font-bold text-amber-900 dark:text-amber-300 mb-1.5">Missing Key Points & Next Steps</div>
                  <ul className="space-y-1 text-amber-950 dark:text-amber-100 list-disc pl-4">
                    {[...(latestFeedback.evaluation.missingPoints || []), ...(latestFeedback.evaluation.improvements || [])]
                      .slice(0, 4)
                      .map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-[#081C33] dark:text-slate-100">Suggested Professional Answer</div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {latestFeedback.evaluation.suggestedAnswer}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!followUpAccepted && currentQ.followUpPrompt && currentIdx + 1 < totalQ ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpAccepted(true);
                      setLatestFeedback(null);
                      setAnswerText('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#1E3A5F] text-[#1E3A5F] dark:text-[#C4A77D] dark:border-[#C4A77D] hover:bg-stone-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Practice Follow-Up Probe
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={advanceOrFinish}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#081C33] hover:bg-[#1E3A5F] text-white cursor-pointer"
                >
                  {currentIdx + 1 >= totalQ ? 'Generate Final Report' : 'Next Question'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Progress, Timer & Session Context */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Session Progress
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#081C33] dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#C4A77D]" />
                {formatElapsed(elapsed)}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>
                  Question {currentIdx + 1} / {totalQ}
                </span>
                <span>{completionPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#1E3A5F] dark:bg-[#C4A77D] transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Target Role
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Company Context</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Experience Tier</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Category</span>
                <span className="font-semibold text-[#1E3A5F] dark:text-[#C4A77D]">{currentQ.category}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Scoring Rubric:</strong> Technical Accuracy (30%), Practical Application (25%), Risk Identification (20%), Communication Clarity (15%), and Completeness (10%). Clear technical reasoning matters more than polished grammar.
          </div>
        </aside>
      </div>
    </div>
  );
}
