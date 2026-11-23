import { useState, useMemo } from 'react';
import { getSarLabBriefForDomain, evaluateSarNarrative } from '../data/caseAndSarLabBank';
import { recordCompletedAttempt } from '../data/knowledgeTestBank';
import { completeLearnerTask } from '../data/amlSkillPassportEngine';

export default function SarNarrativeLab({
  domain,
  difficulty,
  onExitToSetup,
  onAttemptRecorded,
}) {
  const brief = useMemo(() => getSarLabBriefForDomain(domain), [domain]);
  const [narrativeText, setNarrativeText] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  const handleEvaluate = () => {
    const result = evaluateSarNarrative(narrativeText, brief);
    setEvaluation(result);
    const updated = recordCompletedAttempt({
      id: `${Date.now()}-${domain}-sar`,
      completedAt: new Date().toISOString(),
      domain,
      difficulty,
      mode: 'sar',
      score: result.totalScore,
      total: result.maxTotal,
      accuracyPercent: result.percentage,
      durationSeconds: 0,
    });
    if (typeof onAttemptRecorded === 'function') {
      onAttemptRecorded(updated);
    }
    try {
      completeLearnerTask({
        sourceFeature: 'sar_practice',
        externalEventId: `sar-${updated?.id || 'lab'}-${Date.now()}`,
        domain: 'SAR/STR',
        title: brief?.title || 'SAR Narrative Practice',
        questionsAnswered: 1,
        correctAnswers: (result.percentage || 0) >= 70 ? 1 : 0,
        scorePercent: result.percentage || 0,
        xpAwarded: Math.max(35, Math.round((result.percentage || 0) * 0.6) + 25),
      });
    } catch {
      // Do not block SAR evaluation if passport storage fails
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6 transition-opacity duration-300">
      <div className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4A77D]">
              SAR Narrative Lab · {domain} · {difficulty}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F8FC] mt-0.5">
              {brief.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onExitToSetup}
            className="px-3.5 py-1.5 rounded-lg bg-[#081C33] border border-[var(--amld-border)] text-xs font-bold text-[#F5F8FC] cursor-pointer"
          >
            Back to Setup
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#C4A77D]">
            Case Facts & Activity Summary
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[#B8C7D9]">
            {brief.caseFacts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
          <p className="text-[11px] text-[#F4B860] pt-1">
            Fictional Training Scenario: Simulated case facts for educational SAR drafting practice only ? never disclose confidential activity or tip off any subject.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sar-narrative-draft"
            className="block text-xs font-bold uppercase tracking-wider text-[#C4A77D]"
          >
            Draft Your Suspicious Activity Narrative
          </label>
          <textarea
            id="sar-narrative-draft"
            rows={7}
            value={narrativeText}
            onChange={(e) => setNarrativeText(e.target.value)}
            placeholder="Summarize the account baseline, chronological dates and amounts, observed red flags, missing documentation, and confidential escalation rationale without asserting unproven intent..."
            className="w-full p-4 rounded-xl bg-[#081C33] border border-[var(--amld-border)] text-sm text-[#F5F8FC] placeholder:text-[#7E94AE] focus:outline-none focus:border-[#C4A77D]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#9BB0C7]">
            <span>{narrativeText.trim().length} characters</span>
            <span>Evaluated against 4 compliance rubric dimensions</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setNarrativeText('');
              setEvaluation(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#081C33] border border-white/15 text-xs font-bold text-[#B8C7D9] hover:text-[#F5F8FC] cursor-pointer"
          >
            Clear Draft
          </button>
          <button
            type="button"
            onClick={handleEvaluate}
            className="px-5 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold hover:bg-[#d2b891] transition-colors cursor-pointer"
          >
            Evaluate Against Rubric
          </button>
        </div>
      </div>

      {evaluation && (
        <div className="p-6 rounded-2xl bg-[#0D1E30] border border-[#C4A77D]/50 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
                Rubric Evaluation Result
              </p>
              <h3 className="text-2xl font-extrabold text-[#F5F8FC] mt-0.5">
                {evaluation.totalScore} / {evaluation.maxTotal} ({evaluation.percentage}%)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.breakdown.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#081C33]/75 border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#F5F8FC]">{item.label}</span>
                  <span className="text-xs font-bold text-[#C4A77D]">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
                <p className="text-xs text-[#B8C7D9] leading-relaxed">{item.feedback}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#132B3E]/60 border border-white/10 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C4A77D]">
              Reference Structure Guidance
            </p>
            <p className="text-xs text-[#B8C7D9] leading-relaxed">{brief.modelOutline}</p>
          </div>
        </div>
      )}
    </section>
  );
}
