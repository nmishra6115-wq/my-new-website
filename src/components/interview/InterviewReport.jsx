import { Award, BookOpen, Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { notesContent } from '../../content';

export default function InterviewReport({
  session,
  onStartNew,
  onOpenModule,
  onBackToHub,
}) {
  const records = session.records || [];
  const totalQ = (session.questions || []).length || records.length || 1;
  const answeredCount = records.filter((r) => !r.skipped && r.answerText).length;
  const completionPct = Math.round((answeredCount / totalQ) * 100);

  const avgDim = (key) => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + (r.evaluation?.[key] || 0), 0);
    return Math.round(sum / records.length);
  };

  const overallScore =
    typeof session.overallScore === 'number'
      ? Math.round(session.overallScore)
      : avgDim('totalScore');

  const techScore = avgDim('technicalAccuracy');
  const practicalScore = avgDim('practicalApplication');
  const riskScore = avgDim('riskIdentification');
  const clarityScore = avgDim('communicationClarity');

  const allStrengths = records.flatMap((r) => r.evaluation?.strengths || []).slice(0, 6);
  const allImprovements = records
    .flatMap((r) => [...(r.evaluation?.missingPoints || []), ...(r.evaluation?.improvements || [])])
    .slice(0, 6);

  const recommendedModuleIndices = [
    ...new Set(
      records
        .filter((r) => (r.evaluation?.totalScore ?? 0) < 75 && typeof r.recommendedModuleIndex === 'number')
        .map((r) => r.recommendedModuleIndex)
    ),
  ];

  const fallbackModules = recommendedModuleIndices.length > 0 ? recommendedModuleIndices : [0, 3, 5];

  const handleDownloadPdfReport = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBackToHub}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#081C33] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Interview Hub
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdfReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Interview Report
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#081C33] hover:bg-[#1E3A5F] text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
        </div>
      </div>

      {/* Main Summary Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A5F] dark:text-[#C4A77D]">
              <Award className="w-4 h-4" />
              AMLDecode Practice Performance Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081C33] dark:text-white mt-1">
              {session.role} - {session.company}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Experience Level: {session.experienceLevel} · Educational Mock Interview Assessment - Educational practice score only (not an employer hiring prediction)
            </p>
          </div>

          <div className="rounded-2xl bg-[#081C33] text-white px-6 py-4 text-center shrink-0">
            <div className="text-xs uppercase tracking-wider text-slate-300">Overall Score</div>
            <div className="text-3xl font-extrabold text-[#C4A77D] mt-0.5">{overallScore}/100</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {answeredCount}/{totalQ} Answered ({completionPct}%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Technical Accuracy', techScore],
            ['Technical Knowledge', techScore],
            ['Investigation Approach', practicalScore],
            ['Risk Identification', riskScore],
            ['Communication Clarity', clarityScore],
          ].map(([label, score]) => (
            <div key={label} className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              <div className="text-xl font-extrabold text-[#081C33] dark:text-white mt-1">{score}/100</div>
            </div>
          ))}
        </div>

        {/* Strengths & Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/40">
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-300 mb-2">Demonstrated Strengths</h2>
            {allStrengths.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-100 list-disc pl-4">
                {allStrengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Complete more questions to build a detailed strengths profile.
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/40">
            <h2 className="text-sm font-bold text-amber-950 dark:text-amber-300 mb-2">Priority Improvement Areas</h2>
            {allImprovements.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-100 list-disc pl-4">
                {allImprovements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Strong baseline coverage across evaluated prompts.
              </p>
            )}
          </div>
        </div>

        {/* Recommended AMLDecode Study Modules & Next Practice Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 space-y-2.5">
            <h2 className="text-sm font-bold text-[#081C33] dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1E3A5F] dark:text-[#C4A77D]" />
              Recommended AMLDecode Study Modules
            </h2>
            <div className="space-y-2">
              {fallbackModules.map((mIdx) => {
                const mod = notesContent[mIdx];
                if (!mod) return null;
                return (
                  <button
                    key={mIdx}
                    type="button"
                    onClick={() => onOpenModule?.(mIdx)}
                    className="w-full text-left p-2.5 rounded-lg bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#081C33] dark:text-slate-100 transition-colors cursor-pointer"
                  >
                    Module {mIdx + 1}: {mod.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <h2 className="text-sm font-bold text-[#081C33] dark:text-white">Suggested Next Practice Plan</h2>
            <p>
              1. Review the recommended syllabus notes above and practice explaining red flags and escalation triggers out loud.
            </p>
            <p>
              2. Run a 5-question focused session for <strong>{session.role}</strong> ({session.experienceLevel}) and aim to raise your lowest-scoring dimension by 15+ points.
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#081C33] dark:text-white">Question-by-Question Review</h2>
        {records.map((rec, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1E3A5F] dark:text-[#C4A77D]">
                Q{idx + 1} - {rec.category} ({rec.questionCode})
              </span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-[#081C33] dark:text-white">
                {rec.evaluation?.totalScore ?? 0}/100
              </span>
            </div>
            <p className="text-sm font-bold text-[#081C33] dark:text-slate-100">{rec.questionText}</p>
            <div className="text-xs text-slate-700 dark:text-slate-300 bg-stone-50 dark:bg-slate-800/70 p-3 rounded-xl">
              <strong className="text-[#081C33] dark:text-white">Your Answer: </strong>
              {rec.skipped || !rec.answerText ? 'Skipped' : rec.answerText}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-blue-100 dark:border-slate-700/60">
              <strong className="text-[#1E3A5F] dark:text-[#C4A77D]">Model Answer: </strong>
              {rec.evaluation?.suggestedAnswer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
