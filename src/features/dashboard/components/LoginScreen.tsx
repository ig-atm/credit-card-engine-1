import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CreditCard, ChevronRight, BookOpen, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile } from '../types/dashboard.types';

const AVATAR_SEEDS = ['Atharva', 'Aria', 'Kabir', 'Zoe', 'Rohan', 'Elena'];

export function LoginScreen() {
  const login = useDashboardStore((s) => s.login);

  // Step state
  const [step, setStep] = useState(1);

  // Profile details state (Step 1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(AVATAR_SEEDS[0]);

  // Credit profile state (Step 2)
  const [salary, setSalary] = useState(1500000); // default 15L
  const [creditScore, setCreditScore] = useState(750); // default 750

  const [error, setError] = useState('');
  const [showBlog, setShowBlog] = useState(false);

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=f8f9fa`;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (phone.length < 10) return setError('Please enter a valid 10-digit phone number.');

    setError('');
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (creditScore < 300 || creditScore > 900) {
      return setError('CIBIL Score must be between 300 and 900.');
    }

    const profile: AppProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarUrl,
      salary,
      creditScore,
    };

    login(profile);
  };

  const handleUseDemo = () => {
    const firstNames = ['Atharva', 'Aria', 'Kabir', 'Zoe', 'Rohan', 'Elena', 'Vikram', 'Meera', 'Rahul', 'Priya', 'Aditya', 'Neha', 'Arjun', 'Sanya', 'Karan'];
    const lastNames = ['Kulkarni', 'Sharma', 'Patel', 'Singh', 'Verma', 'Rao', 'Desai', 'Iyer', 'Joshi', 'Reddy', 'Nair', 'Menon', 'Gupta', 'Kumar', 'Das'];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomName = `${randomFirstName} ${randomLastName}`;
    
    const randomSalary = Math.floor(Math.random() * (4500000 - 300000 + 1)) + 300000; // Between 3L and 48L
    const randomScore = Math.floor(Math.random() * (850 - 600 + 1)) + 600; // Between 600 and 850
    
    const demoProfile: AppProfile = {
      name: randomName,
      email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
      phone: 'XXXXXXXXXX',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${randomFirstName}&backgroundColor=f8f9fa`,
      salary: randomSalary,
      creditScore: randomScore,
    };
    useDashboardStore.getState()._reset();
    login(demoProfile);
  };

  const handleSalarySliderChange = (val: number) => {
    setSalary(val);
  };

  const handleSalaryInputChange = (valStr: string) => {
    const val = parseInt(valStr.replace(/[^0-9]/g, '')) || 0;
    setSalary(val);
  };

  const handleScoreSliderChange = (val: number) => {
    setCreditScore(val);
  };

  const handleScoreInputChange = (valStr: string) => {
    const val = parseInt(valStr.replace(/[^0-9]/g, '')) || 0;
    setCreditScore(Math.min(900, val));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mesh p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] max-w-5xl w-full gap-8 items-center">
        {/* Left Side: Branding & Premium Dashboard Teaser */}
        <div className="flex flex-col gap-6 text-left hidden lg:flex">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 flex items-center justify-center shadow-ag-glow-primary">
              <Sparkles size={24} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink-primary tracking-tight">
                renocred
              </p>
              <p className="text-[10px] font-semibold text-ink-tertiary tracking-[0.2em] uppercase">
                credit intelligence
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-display font-extrabold text-ink-primary tracking-tight leading-tight">
              Unlock the power of your <span className="text-gradient-brand">financial profile</span>.
            </h1>
            <p className="text-sm text-ink-secondary mt-4 max-w-md leading-relaxed">
              renocred evaluates your credit score, compares 130+ cards, and acts as your personal optimizer to maximize your rewards and savings.
            </p>
          </div>

          {/* Interactive Card Preview */}
          <div className="relative mt-4 w-full max-w-sm h-56 rounded-3xl p-6 bg-gradient-to-br from-[#1b2a26] via-[#151f1c] to-[#0c100e] border border-white/[0.06] shadow-2xl flex flex-col justify-between overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-brand-400 tracking-[0.2em] uppercase font-bold">renocred select</p>
                <p className="text-[10px] text-ink-tertiary mt-1">Virtual Credentials</p>
              </div>
              <div className="w-10 h-7 bg-white/10 rounded-md backdrop-blur border border-white/10 flex items-center justify-center">
                <CreditCard size={16} className="text-brand-300" />
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-tertiary font-mono tracking-widest">••••  ••••  ••••  4242</p>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-ink-disabled font-medium">Cardholder</p>
                  <p className="text-sm font-bold text-white tracking-wide truncate max-w-[200px]">
                    {name.trim() || 'Your Name'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-ink-disabled font-medium">Credit Score</p>
                  <p className="text-sm font-bold text-profit">{creditScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sleek Glassmorphic Form Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="panel-glass rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-ink-primary">Sign In</h2>
              <p className="text-xs text-ink-tertiary mt-0.5">
                {step === 1 ? 'Enter details to access your dashboard' : 'Verify credit profile details'}
              </p>
            </div>
            {step === 1 && (
              <button
                onClick={handleUseDemo}
                className="text-xs font-bold text-brand-500 hover:text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full transition-all active:scale-95"
              >
                Skip / Use Demo
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleStep1Submit}
                className="flex flex-col gap-4"
              >
                {/* Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-ink-secondary">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Atharva Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium w-full text-sm"
                    required
                  />
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-bold text-ink-secondary">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium w-full text-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-bold text-ink-secondary">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="input-premium w-full text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Avatar Select */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-ink-secondary">Select Profile Avatar</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500 bg-canvas-200 flex-shrink-0">
                      <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[280px]">
                      {AVATAR_SEEDS.map((seed) => (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => setAvatarSeed(seed)}
                          className={cn(
                            'w-8 h-8 rounded-full border flex-shrink-0 text-xs font-semibold flex items-center justify-center transition-all overflow-hidden',
                            avatarSeed === seed
                              ? 'border-brand-500 scale-110 shadow-sm ring-2 ring-brand-500/20'
                              : 'border-canvas-300 hover:border-brand-300 bg-surface'
                          )}
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=f8f9fa`}
                            alt={seed}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-loss mt-1">{error}</p>}

                <button
                  type="submit"
                  className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-[0.98]"
                >
                  Continue to Credit Profile <ChevronRight size={16} />
                </button>
              </motion.form>
            )}

            {/* STEP 2: Credit Profile Questionnaire */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-5 text-left"
              >
                {/* Salary Input + Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-ink-secondary">Annual Salary (INR)</label>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">₹</span>
                      <input
                        type="text"
                        value={salary.toLocaleString('en-IN')}
                        onChange={(e) => handleSalaryInputChange(e.target.value)}
                        className="w-full input-premium pl-6 pr-2 py-1 text-xs font-bold text-right"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={5000000}
                    step={50000}
                    value={salary}
                    onChange={(e) => handleSalarySliderChange(Number(e.target.value))}
                    className="w-full accent-brand-500 bg-canvas-300 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-disabled font-medium">
                    <span>₹1 Lakh</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                {/* Credit Score Input + Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-ink-secondary">CIBIL Credit Score</label>
                    <input
                      type="number"
                      min={300}
                      max={900}
                      value={creditScore || ''}
                      onChange={(e) => handleScoreInputChange(e.target.value)}
                      className="w-20 input-premium py-1 px-2 text-xs font-bold text-right"
                    />
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={900}
                    step={1}
                    value={creditScore}
                    onChange={(e) => handleScoreSliderChange(Number(e.target.value))}
                    className="w-full accent-brand-500 bg-canvas-300 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-disabled font-medium">
                    <span>300 (Poor)</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>

                {/* Don't know score button */}
                <button
                  type="button"
                  onClick={() => setShowBlog(true)}
                  className="text-xs text-brand-500 hover:text-brand-650 font-bold self-start mt-1 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen size={13} /> Don't know your credit score?
                </button>

                {error && <p className="text-xs font-bold text-loss mt-1">{error}</p>}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-canvas-300 dark:border-white/[0.04] text-ink-secondary rounded-full text-sm font-semibold hover:bg-canvas-200/50 dark:hover:bg-white/[0.02] text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-[0.98]"
                  >
                    Complete Sign In <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Credit Blog Modal */}
      <AnimatePresence>
        {showBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 border-b border-canvas-200/50 dark:border-white/[0.04] pb-3">
                <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="text-brand-500" size={18} /> Credit Health Guide
                </h3>
                <button
                  onClick={() => setShowBlog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Blog Content */}
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-ink-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>. A higher score represents lower risk to credit card issuers and loan providers.
                  </p>
                </div>

                <div className="bg-canvas-100 dark:bg-canvas-200/50 rounded-2xl p-4 border border-canvas-200/40">
                  <h5 className="font-bold text-ink-primary text-xs uppercase tracking-wider mb-2">CIBIL Score Ranges</h5>
                  <ul className="flex flex-col gap-1.5 text-xs">
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-loss">Below 650: Poor</span>
                      <span className="text-ink-tertiary">Difficult to get approved</span>
                    </li>
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-caution">650 - 699: Average</span>
                      <span className="text-ink-tertiary">Limited/Entry-level cards only</span>
                    </li>
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-brand-500">700 - 749: Good</span>
                      <span className="text-ink-tertiary">Easy approval for standard cards</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-profit">750 - 900: Excellent</span>
                      <span className="text-ink-tertiary">Qualifies for premium, high-reward cards</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-ink-primary text-base">How to Check Your Score</h4>
                  <p className="mt-1">
                    You can pull your official credit report directly from CIBIL (www.cibil.com) or download apps that offer free soft pulls. Free soft checks do not hurt your credit rating.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-ink-primary text-base">5 Rules to Build an Excellent Credit Score</h4>
                  <ol className="list-decimal pl-4 flex flex-col gap-2 mt-2">
                    <li>
                      <strong>Pay All Bills on Time:</strong> Repayment history accounts for 35% of your score.
                    </li>
                    <li>
                      <strong>Keep Credit Utilization Low:</strong> Try not to spend more than 30% of your total credit limit.
                    </li>
                    <li>
                      <strong>Maintain a Healthy Credit Age:</strong> Keep your oldest credit card active.
                    </li>
                    <li>
                      <strong>Mix Secure and Unsecure Debt:</strong> Combine cards with loans.
                    </li>
                    <li>
                      <strong>Avoid Spamming Applications:</strong> Each application triggers a hard inquiry.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-canvas-200/50 dark:border-white/[0.04] text-center">
                <button
                  onClick={() => setShowBlog(false)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-6 py-2 rounded-full transition-all active:scale-95"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LoginScreen;
