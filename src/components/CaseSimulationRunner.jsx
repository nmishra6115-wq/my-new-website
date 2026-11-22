import { useState, useMemo } from 'react';
import { getCaseSimulationForDomain } from '../data/caseAndSarLabBank';
import { recordCompletedAttempt } from '../data/knowledgeTestBank';

export default function CaseSimulationRunner({
  domain,
  difficulty,
  onExitToSetup,
  onAttemptRecorded,
}) {
  const cases = useMemo(() => getCaseSimulationForDomain(domain), [domain]);
  const activeCase = cases[0] || null;
  const stages = useMemo(() => (activeCase ? activeCase.stages || [] : []), [activeCase]);

  const [stageIndex, setStageIndex] = useState(0);
  const [selectedByStage, setSelectedByStage] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStage = stages[stageIndex] || null;
  const selectedOptionId = currentStage ? selectedByStage[currentStage.stageNumber] : null;
  const selectedOption = currentStage?.options.find((o) => o.id === selectedOptionId) || null;

  const summary = useMemo(() => {
    const stageResults = stages.map((st) => {
      const maxPts = Math.max(...st.options.map((o) => o.points));
      const chosenId = selectedByStage[st.stageNumber];
      const chosen = st.options.find((o) => o.id === chosenId) || null;
      const pts = chosen ? chosen.points : 0;
      return {
        stage: st,
        chosen,
        earned: pts,
        possible: maxPts,
      };
    });
    const earned = stageResults.reduce((acc, item) => acc + item.earned, 0);
    const possible = stageResults.reduce((acc, item) => acc + item.possible, 0);
    const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    return { earned, possible, pct, stageResults };
  }, [stages, selectedByStage]);

  const handleChooseOption = (optionId) => {
    if (!currentStage || isCompleted) return;
    setSelectedByStage((prev) => ({
      ...prev,
      [currentStage.stageNumber]: optionId,
    }));
  };

  const handleFinishCase = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    const updated = recordCompletedAttempt({
      id: `${Date.now()}-${domain}-case`,
      completedAt: new Date().toISOString(),
      domain,
      difficulty,
      mode: 'case',
      score: summary.earned,
      total: summary.possible,
      accuracyPercent: summary.pct,
      durationSeconds: 0,
    });
    if (typeof onAttemptRecorded === 'function') {
      onAttemptRecorded(updated);
    }
  };

  const handleRestartCase = () => {
    setStageIndex(0);
    setSelectedByStage({});
    setIsCompleted(false);
  };

  if (!activeCase || !currentStage) {
    return null;
  }

  if (isCompleted) {
    return (
      <section className="max-w-4xl mx-auto space-y-6 transition-opacity duration-300">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[#C4A77D]/50 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C4A77D]">
                Case Simulation Complete · {domain}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F8FC] mt-1">
                Rubric Score: {summary.earned} / {summary.possible} ({summary.pct}%)
              </h2>
              <p className="text-xs text-[#B8C7D9] mt-1">{activeCase.title}</p>
              <p className="text-[11px] text-[#F4B860] mt-1">
                Fictional Training Scenario: All entities, accounts, and transaction events are simulated for AML/KYC educational practice.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleRestartCase}
                className="px-4 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold cursor-pointer"
              >
                Replay Case
              </button>
              <button
                type="button"
                onClick={onExitToSetup}
                className="px-4 py-2.5 rounded-xl bg-[#081C33] border border-[var(--amld-border)] text-xs font-bold text-[#F5F8FC] cursor-pointer"
              >
                Back to Setup
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {summary.stageResults.map(({ stage, chosen, earned, possible }) => (
              <div
                key={stage.stageNumber}
                className="p-5 rounded-xl bg-[#081C33]/75 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#F5F8FC]">
                    Stage {stage.stageNumber}: {stage.title}
                  </h3>
                  <span className="text-xs font-bold text-[#C4A77D]">
                    {earned} / {possible} pts
                  </span>
                </div>
                <p className="text-xs text-[#B8C7D9]">
                  Selected Decision:{' '}
                  <span className="font-semibold text-[#F5F8FC]">
                    {chosen ? chosen.label : 'No selection made'}
                  </span>
                </p>
                {chosen && (
                  <p className="text-xs text-[#9BB0C7] leading-relaxed">{chosen.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6 transition-opacity duration-300">
      <div className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C4A77D]">
              Case Simulation · {domain} · {difficulty}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F8FC] mt-0.5">
              {activeCase.title}
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

        <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10 text-xs sm:text-sm text-[#B8C7D9] leading-relaxed">
          <span className="font-bold text-[#C4A77D] uppercase tracking-wider text-[11px] block mb-1">
            Investigation Dossier
          </span>
          {activeCase.dossierSummary}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#9BB0C7]">
          {stages.map((st, idx) => (
            <span
              key={st.stageNumber}
              className={`px-3 py-1 rounded-full border ${
                idx === stageIndex
                  ? 'bg-[#C4A77D] text-[#081C33] border-[#C4A77D]'
                  : selectedByStage[st.stageNumber]
                  ? 'bg-[#132B3E] text-[#C4A77D] border-[#C4A77D]/40'
                  : 'bg-[#081C33] text-[#9BB0C7] border-white/10'
              }`}
            >
              Stage {st.stageNumber}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            Stage {currentStage.stageNumber} of {stages.length}: {currentStage.title}
          </p>
          <h3 className="text-lg font-bold text-[#F5F8FC]">{currentStage.prompt}</h3>
          <p className="text-xs text-[#9BB0C7]">Evidence Note: {currentStage.evidenceNote}</p>
        </div>

        <div className="space-y-3 pt-1">
          {currentStage.options.map((opt) => {
            const active = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChooseOption(opt.id)}
                className={`block w-full text-left p-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#132B3E] border-[#C4A77D] text-[#F5F8FC]'
                    : 'bg-[#081C33]/70 border-white/10 text-[#B8C7D9] hover:border-[#C4A77D]/50 hover:text-[#F5F8FC]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
              Stage Feedback ({selectedOption.points} pts)
            </p>
            <p className="text-xs text-[#B8C7D9] leading-relaxed">{selectedOption.rationale}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={stageIndex === 0}
          onClick={() => setStageIndex((i) => Math.max(0, i - 1))}
          className="px-4 py-2.5 rounded-xl bg-[#0D1E30] border border-[var(--amld-border)] text-xs font-bold text-[#F5F8FC] disabled:opacity-40 cursor-pointer"
        >
          Previous Stage
        </button>

        {stageIndex < stages.length - 1 ? (
          <button
            type="button"
            onClick={() => setStageIndex((i) => Math.min(stages.length - 1, i + 1))}
            className="px-5 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold cursor-pointer"
          >
            Next Stage
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishCase}
            className="px-5 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold cursor-pointer"
          >
            Complete Case Simulation
          </button>
        )}
      </div>
    </section>
  );
}
