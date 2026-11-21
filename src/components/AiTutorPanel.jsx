import { useState } from 'react';
import {
  buildQuestionHint,
  buildStudyRecommendations,
} from '../data/aiTutorCoach';

export default function AiTutorPanel({
  domain,
  difficulty,
  question = null,
  hasAnswered = false,
  recentAttempts = [],
  subtopicBreakdown = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hint');

  const hintText = buildQuestionHint(question, hasAnswered);
  const studyPlan = buildStudyRecommendations({
    domain,
    difficulty,
    recentAttempts,
    subtopicBreakdown,
  });

  return (
    <div className="p-5 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C4A77D]">
            AI Compliance Coach · Guided Study Layer
          </p>
          <h3 className="text-sm font-bold text-[#F5F8FC] mt-0.5">
            {question ? `Coaching for ${question.subtopic || domain}` : `${domain} Study Coach`}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-lg bg-[#081C33] border border-[#C4A77D]/50 text-xs font-bold text-[#C4A77D] hover:border-[#C4A77D] transition-colors cursor-pointer"
        >
          {isOpen ? 'Hide Coach' : 'Open Coach'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {question && (
              <button
                type="button"
                onClick={() => setActiveTab('hint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  activeTab === 'hint'
                    ? 'bg-[#C4A77D]/15 border-[#C4A77D] text-[#C4A77D]'
                    : 'bg-[#081C33] border-white/10 text-[#B8C7D9]'
                }`}
              >
                {hasAnswered ? 'Rationale Check' : 'Non-Spoiler Hint'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                activeTab === 'study' || !question
                  ? 'bg-[#C4A77D]/15 border-[#C4A77D] text-[#C4A77D]'
                  : 'bg-[#081C33] border-white/10 text-[#B8C7D9]'
              }`}
            >
              Study Recommendations
            </button>
          </div>

          {activeTab === 'hint' && question ? (
            <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10 space-y-2">
              <p className="text-xs text-[#F5F8FC] leading-relaxed">{hintText}</p>
              {question.sourceRef && (
                <p className="text-[11px] text-[#9BB0C7]">Reference Basis: {question.sourceRef}</p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#081C33]/80 border border-white/10 space-y-3">
              <p className="text-xs text-[#F5F8FC] leading-relaxed">
                {studyPlan.paceRecommendation}
              </p>
              {studyPlan.weakSubtopics.length > 0 && (
                <p className="text-xs text-[#C4A77D]">
                  Priority Subtopics to Revisit: {studyPlan.weakSubtopics.join(', ')}
                </p>
              )}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9BB0C7]">
                  Key {domain} Focus Areas
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#B8C7D9]">
                  {studyPlan.focusAreas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#9BB0C7]">
            Educational compliance coaching only — verify against your institution’s policies and applicable regulations.
          </p>
        </div>
      )}
    </div>
  );
}
