import { useEffect, useState } from 'react';

const VIEW_LABELS = {
  notes: 'Syllabus Notes',
  quiz: 'Knowledge Test & Case Simulations',
  jobs: 'Compliance Careers & Job Matcher',
  network: 'Network & Briefings',
  available: 'Available Referrals',
  referralForm: 'Submit Network Referral',
  contribute: 'Recruiter Desk',
  faq: 'FAQ',
  contact: 'Contact Us',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  'skill-passport': 'AMLDecode Skill Certificate',
  'daily-challenge': 'Daily Challenge',
  'ai-interview': 'AI Interview Practice',
};

export default function LearnerLoginModal({
  isOpen,
  pendingConfig,
  pendingView = null,
  initialLearner,
  onClose,
  onLoginSuccess,
}) {
  const [name, setName] = useState(initialLearner?.name || '');
  const [email, setEmail] = useState(initialLearner?.email || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetPageLabel = pendingView ? (VIEW_LABELS[pendingView] || pendingView) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter your full name and a valid email address to create your account or sign in.');
      return;
    }

    setError('');
    const profile = {
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      loggedInAt: new Date().toISOString(),
    };
    onLoginSuccess(profile, pendingConfig);
  };

  const handleQuickDemo = () => {
    setError('');
    const profile = {
      name: 'Compliance Analyst',
      email: 'analyst@amldecode.local',
      loggedInAt: new Date().toISOString(),
    };
    onLoginSuccess(profile, pendingConfig);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kt2-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#C4A77D]">
              Account Required for Pages
            </p>
            <h2
              id="kt2-login-title"
              className="text-xl font-extrabold text-[#F5F8FC] mt-1"
            >
              Create Account or Sign In
            </h2>
            <p className="text-xs text-[#9BB0C7] mt-1">
              The homepage is open to everyone. Create an account or sign in to view platform pages.
            </p>
            {pendingConfig && (
              <p className="text-xs text-[#9BB0C7] mt-1.5">
                Queued: <span className="text-[#F5F8FC] font-semibold">{pendingConfig.domain}</span>{' '}
                · <span className="text-[#F5F8FC] font-semibold">{pendingConfig.difficulty}</span>{' '}
                · <span className="text-[#F5F8FC] font-semibold">{pendingConfig.count} Qs</span>
              </p>
            )}
            {!pendingConfig && targetPageLabel && (
              <p className="text-xs text-[#9BB0C7] mt-1.5">
                Requested page: <span className="text-[#F4B860] font-semibold">{targetPageLabel}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account and sign-in modal"
            className="text-xs font-bold text-[#9BB0C7] hover:text-[#F5F8FC] px-2 py-1 rounded-lg border border-white/10 cursor-pointer shrink-0"
          >
            Esc / Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="kt2-learner-name"
              className="block text-xs font-semibold text-[#B8C7D9] mb-1.5"
            >
              Full Name
            </label>
            <input
              id="kt2-learner-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nitesh Mishra"
              className="w-full rounded-xl bg-[#081C33] border border-[var(--amld-border)] px-3.5 py-2.5 text-sm text-[#F5F8FC] placeholder-[#6F859E] focus:outline-none focus:border-[#C4A77D]"
            />
          </div>

          <div>
            <label
              htmlFor="kt2-learner-email"
              className="block text-xs font-semibold text-[#B8C7D9] mb-1.5"
            >
              Work or Study Email
            </label>
            <input
              id="kt2-learner-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl bg-[#081C33] border border-[var(--amld-border)] px-3.5 py-2.5 text-sm text-[#F5F8FC] placeholder-[#6F859E] focus:outline-none focus:border-[#C4A77D]"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-[#B8C7D9] hover:text-[#F5F8FC] hover:border-white/30 transition-colors cursor-pointer"
            >
              Quick Demo Login
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold tracking-wide hover:bg-[#d2b891] transition-colors cursor-pointer"
            >
              {pendingConfig ? 'Continue to Assessment' : 'Continue to Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
