import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  History,
  Play,
  Sparkles,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { AcademyBrandMark } from './AcademyPrimitives';
import { useThemeMode } from '../hooks/useThemeMode';
import { selectQuestionsForSession } from '../data/aiInterviewBank';
import {
  deleteLocalSession,
  loadLocalSessions,
  saveLocalSession,
  syncSessionToSupabase,
} from '../data/aiInterviewEvaluator';
import InterviewSetupModal from './interview/InterviewSetupModal';
import InterviewWorkspace from './interview/InterviewWorkspace';
import LiveVideoInterviewRoom from './interview/LiveVideoInterviewRoom';
import InterviewReport from './interview/InterviewReport';
import { completeLearnerTask } from '../data/amlSkillPassportEngine';

export default function AiInterviewHub({
  onBackHome,
  onOpenModule,
}) {
  const { isDark, toggleTheme } = useThemeMode();
  const [sessions, setSessions] = useState(() => loadLocalSessions());
  const [setupOpen, setSetupOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [reportSessionId, setReportSessionId] = useState(null);
  const [interviewMode, setInterviewMode] = useState('video');


  const inProgressSession = useMemo(
    () => sessions.find((s) => s.status === 'in_progress') || null,
    [sessions]
  );

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'completed'),
    [sessions]
  );

  const latestCompleted = completedSessions[0] || null;

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const reportSession = useMemo(
    () => sessions.find((s) => s.id === reportSessionId) || null,
    [sessions, reportSessionId]
  );

  const handleStartSession = (config) => {
    const questions = selectQuestionsForSession({
      role: config.role,
      experienceLevel: config.experienceLevel,
      questionCount: config.questionCount,
    });

    const newSession = {
      id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `sess_${Date.now()}`,
      company: config.company,
      role: config.role,
      experienceLevel: config.experienceLevel,
      questionCount: config.questionCount,
      status: 'in_progress',
      currentIndex: 0,
      elapsedSeconds: 0,
      questions,
      records: [],
      startedAt: new Date().toISOString(),
    };

    saveLocalSession(newSession);
    syncSessionToSupabase(newSession);
    setSessions(loadLocalSessions());
    setSetupOpen(false);
    setReportSessionId(null);
    setActiveSessionId(newSession.id);
  };

  const handleUpdateSession = (updated) => {
    saveLocalSession(updated);
    syncSessionToSupabase(updated);
    setSessions(loadLocalSessions());
  };

  const handleCompleteSession = (sessionToFinish) => {
    const recs = sessionToFinish.records || [];
    const avgOverall =
      recs.length > 0
        ? Math.round(recs.reduce((acc, r) => acc + (r.evaluation?.totalScore || 0), 0) / recs.length)
        : 0;

    const completed = {
      ...sessionToFinish,
      status: 'completed',
      overallScore: avgOverall,
      completedAt: new Date().toISOString(),
    };

    saveLocalSession(completed);
    syncSessionToSupabase(completed);

    try {
      const answeredCount = recs.length;
      const strongCount = recs.filter((r) => (r.evaluation?.totalScore || 0) >= 70).length;
      const interviewDomain = completed.domain || completed.focusArea || completed.role || 'Financial Crime Investigation';
      const interviewTitle = completed.title || completed.scenarioTitle || 'AI Compliance Interview';
      completeLearnerTask({
        sourceFeature: 'ai-interview',
        externalEventId: `interview-${completed.id || 'session'}-${Date.now()}`,
        domain: interviewDomain,
        title: interviewTitle,
        questionsAnswered: answeredCount,
        correctAnswers: strongCount,
        scorePercent: avgOverall,
        xpAwarded: Math.max(35, Math.round(avgOverall * 0.6) + 20),
      });
    } catch {
      // Do not block interview completion if passport storage fails
    }
    setSessions(loadLocalSessions());
    setActiveSessionId(null);
    setReportSessionId(completed.id);
  };

  const handleDeleteSession = (id) => {
    deleteLocalSession(id);
    if (activeSessionId === id) setActiveSessionId(null);
    if (reportSessionId === id) setReportSessionId(null);
    setSessions(loadLocalSessions());
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 text-[#081C33] dark:text-slate-100 transition-colors">
      {/* Compact Top Bar matching AMLDecode aesthetic */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-stone-200 dark:border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#081C33] dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <span className="text-stone-300 dark:text-slate-700">|</span>
            <AcademyBrandMark theme={isDark ? 'dark' : 'light'} />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark or light mode"
            className="p-2 rounded-xl border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {activeSession ? (
        interviewMode === 'video' ? (
            <LiveVideoInterviewRoom
              session={activeSession}
              onUpdateSession={handleUpdateSession}
              onCompleteSession={handleCompleteSession}
              onSwitchToTextMode={(updated) => {
                handleUpdateSession(updated);
                setInterviewMode('text');
              }}
              onExitToHub={() => setActiveSessionId(null)}
            />
          ) : (
            <InterviewWorkspace
          session={activeSession}
          onUpdateSession={handleUpdateSession}
          onCompleteSession={handleCompleteSession}
          onExitToHub={() => { setSessions(loadLocalSessions()); setActiveSessionId(null); }}
        />
          )
      ) : reportSession ? (
        <InterviewReport
          session={reportSession}
          onStartNew={() => {
            setReportSessionId(null);
            setSetupOpen(true);
          }}
          onOpenModule={onOpenModule}
          onBackToHub={() => { setSessions(loadLocalSessions()); setReportSessionId(null); }}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          {/* Hero Card */}
          <section className="rounded-3xl bg-gradient-to-br from-[#081C33] via-[#1E3A5F] to-[#0F213A] text-white p-7 sm:p-11 shadow-sm border border-[#C4A77D]/30">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C4A77D] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                AMLDecode AI Interview Simulator
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                AMLDecode AI Interview Simulator
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Practice realistic AML, KYC and Financial Crime interviews. Get personalized feedback and improve your confidence.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSetupOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#C4A77D] hover:bg-[#b5966a] text-[#081C33] shadow-sm transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start AI Interview
                </button>
                {inProgressSession && (
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(inProgressSession.id)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-colors cursor-pointer"
                  >
                    Continue Your Interview
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Returning Learner Summary + Continue Card */}
          {(inProgressSession || latestCompleted) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inProgressSession && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#C4A77D]/60 p-5 shadow-2xs flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] dark:text-[#C4A77D]">
                      In-Progress Session
                    </span>
                    <h2 className="text-lg font-extrabold text-[#081C33] dark:text-white">
                      Continue Your Interview
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {inProgressSession.role} ? {inProgressSession.company} ({inProgressSession.experienceLevel}) ? Question{' '}
                      {(inProgressSession.currentIndex || 0) + 1} of {inProgressSession.questionCount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(inProgressSession.id)}
                    className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#081C33] hover:bg-[#1E3A5F] text-white cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Continue Your Interview
                  </button>
                </div>
              )}

              {latestCompleted && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Latest Practice Snapshot
                    </span>
                    <h2 className="text-lg font-extrabold text-[#081C33] dark:text-white">
                      Score: {latestCompleted.overallScore ?? 0}/100 ? {latestCompleted.role}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Company Context: {latestCompleted.company} ({latestCompleted.experienceLevel}). Recommended next step: run another {latestCompleted.role} session focusing on any lower-scoring rubric dimensions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportSessionId(latestCompleted.id)}
                    className="self-start px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-slate-700 text-[#081C33] dark:text-slate-100 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    View Latest Report
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Past Interview History */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#081C33] dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#1E3A5F] dark:text-[#C4A77D]" />
                Past Interview Sessions ({completedSessions.length})
              </h2>
            </div>

            {completedSessions.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                No completed interview sessions yet. Click <strong>Start AI Interview</strong> above to begin your first practice session.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-slate-800">
                {completedSessions.map((s) => (
                  <div key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-[#081C33] dark:text-slate-100 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#1E3A5F] dark:text-[#C4A77D]" />
                        {s.role} ? {s.company}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.experienceLevel} ? {(s.records || []).length}/{s.questionCount} questions ? Score: {s.overallScore ?? 0}/100
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReportSessionId(s.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-[#081C33] dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        Report
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.id)}
                        aria-label="Delete session history"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <InterviewSetupModal
        isOpen={setupOpen}
        initialConfig={
          latestCompleted
            ? {
                company: latestCompleted.company,
                role: latestCompleted.role,
                experienceLevel: latestCompleted.experienceLevel,
                questionCount: 5,
              }
            : null
        }
        onClose={() => setSetupOpen(false)}
        onStartSession={handleStartSession}
      />
    </div>
  );
}
