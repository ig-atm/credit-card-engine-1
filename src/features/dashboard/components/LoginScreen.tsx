import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, BookOpen, X, ChevronRight, Info } from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile } from '../types/dashboard.types';
import { CreditScoreDial } from '../../../components/ui/CreditScoreDial';
import { cn } from '../../../lib/utils';

export function LoginScreen() {
  const { isSignedIn, user } = useUser();
  const login = useDashboardStore((s) => s.login);

  const [showBlog, setShowBlog] = useState(false);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Credit profile state (Step 2)
  const [salary, setSalary] = useState(1500000);
  const [creditScore, setCreditScore] = useState(750);
  const [error, setError] = useState('');

  // Listen to hash changes to toggle between sign-in and sign-up
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.includes('sign-up')) {
        setMode('signup');
      } else {
        setMode('signin');
      }
    };
    
    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSalarySliderChange = (val: number) => setSalary(val);
  const handleSalaryInputChange = (valStr: string) => {
    const val = parseInt(valStr.replace(/[^0-9]/g, '')) || 0;
    setSalary(val);
  };

  const handleScoreSliderChange = (val: number) => setCreditScore(val);
  const handleScoreInputChange = (valStr: string) => {
    const val = parseInt(valStr.replace(/[^0-9]/g, '')) || 0;
    setCreditScore(Math.min(900, val));
  };

  const handleFinalSubmit = () => {
    if (creditScore < 300 || creditScore > 900) {
      return setError('CIBIL Score must be between 300 and 900.');
    }

    const profile: AppProfile = {
      name: user?.fullName || user?.firstName || 'Your Name',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || 'XXXXXXXXXX',
      avatar: user?.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=f8f9fa`,
      salary,
      creditScore,
    };

    login(profile);
  };

  const displayName = isSignedIn ? (user?.fullName || user?.firstName || 'Your Name') : 'Your Name';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mesh p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] max-w-5xl w-full gap-8 items-center">
        {/* Left Side: Branding & Premium Dashboard Teaser */}
        <div className="flex flex-col gap-6 text-left hidden lg:flex">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-ag-glow-primary overflow-hidden bg-black">
              <img src="/logo.jpg" alt="Renocred" className="w-full h-full object-cover" />
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
                    {displayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-ink-disabled font-medium">Credit Score</p>
                  <p className="text-sm font-bold text-profit">{isSignedIn ? creditScore : '750'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth or Questionnaire */}
        {isSignedIn ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="panel-glass rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative overflow-hidden text-left flex flex-col gap-5"
          >
            <div className="mb-2">
              <h2 className="text-xl font-display font-bold text-ink-primary">Complete Profile</h2>
              <p className="text-xs text-ink-tertiary mt-0.5">
                Verify credit profile details to generate your dashboard
              </p>
            </div>

            {/* Salary Input + Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-ink-secondary">Annual Salary (INR)</label>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-tertiary">₹</span>
                  <input
                    type="text"
                    value={salary.toLocaleString('en-IN')}
                    onChange={(e) => handleSalaryInputChange(e.target.value)}
                    className="w-full input-premium pl-7 pr-3 py-2 text-sm font-bold text-right tabular-nums bg-canvas-50 dark:bg-canvas-200 focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
              </div>
              
              {/* Quick Select Salary Pills */}
              <div className="flex gap-2">
                {[500000, 1000000, 1500000, 2500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSalary(val)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                      salary === val 
                        ? "bg-brand-500 text-white border-brand-500 shadow-ag-glow-primary" 
                        : "bg-surface border-canvas-300 dark:border-white/5 text-ink-secondary hover:bg-canvas-200"
                    )}
                  >
                    {val >= 100000 ? `${val / 100000}L` : val.toLocaleString()}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={100000}
                max={5000000}
                step={50000}
                value={salary}
                onChange={(e) => handleSalarySliderChange(Number(e.target.value))}
                className="w-full accent-brand-500 bg-canvas-300 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>

            <hr className="border-canvas-300 dark:border-white/[0.05]" />

            {/* Credit Score Input + Dial */}
            <div className="flex gap-6 items-center">
              <div className="flex-shrink-0">
                <CreditScoreDial score={creditScore} size={110} animate={false} />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-ink-secondary">CIBIL Score</label>
                  <input
                    type="number"
                    min={300}
                    max={900}
                    value={creditScore || ''}
                    onChange={(e) => handleScoreInputChange(e.target.value)}
                    className="w-20 input-premium py-1.5 px-3 text-sm font-bold text-right tabular-nums bg-canvas-50 dark:bg-canvas-200 focus:ring-2 focus:ring-brand-500/50"
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
                <div className="flex justify-between text-[9px] text-ink-disabled font-bold uppercase tracking-wider">
                  <span>300 (Poor)</span>
                  <span>900 (Excellent)</span>
                </div>
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

            <div className="flex gap-2 p-3 bg-canvas-200/50 rounded-xl border border-white/5 mt-2">
              <Info size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-ink-tertiary leading-relaxed">
                We use your salary and CIBIL score strictly to recommend cards you are highly likely to be approved for. <strong>We do not sell your data.</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-[0.98]"
            >
              Generate Dashboard <ChevronRight size={16} />
            </button>
            <div className="text-center flex justify-center gap-3">
              <button onClick={() => setShowLegal('terms')} className="text-[10px] text-ink-disabled hover:text-ink-secondary">Terms of Service</button>
              <span className="text-ink-disabled text-[10px]">•</span>
              <button onClick={() => setShowLegal('privacy')} className="text-[10px] text-ink-disabled hover:text-ink-secondary">Privacy Policy</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="panel-glass rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative flex flex-col justify-center items-center"
          >
            {/* By forcing path="/" and routing="path", Clerk is tricked into believing it is 
                always exactly on the right page, completely disabling its external redirect logic. */}
            <div className="w-full">
              {mode === 'signin' ? (
                <SignIn routing="path" path="/" signUpUrl="/" />
              ) : (
                <SignUp routing="path" path="/" signInUrl="/" />
              )}
            </div>

            {/* Custom SPA Navigation Toggle */}
            <div className="text-center mt-2 z-10 relative bg-transparent">
              {mode === 'signin' ? (
                <p className="text-ink-secondary text-sm">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setMode('signup');
                    }}
                    className="text-brand-500 hover:text-brand-600 font-bold transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-ink-secondary text-sm">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setMode('signin');
                    }}
                    className="text-brand-500 hover:text-brand-600 font-bold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Credit Blog Modal - Kept for aesthetics/future */}
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
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-ink-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>.
                  </p>
                </div>
              </div>
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
      {/* Legal Modal */}
      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLegal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-canvas-200/50 dark:border-white/[0.04] pb-3">
                <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="text-brand-500" size={18} /> {showLegal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  onClick={() => setShowLegal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                {showLegal === 'privacy' ? (
                  <div>
                    <h4 className="font-bold text-ink-primary text-base">Data Protection Commitment</h4>
                    <p className="mt-1">
                      At Renocred, we take your privacy seriously. Your financial information (such as salary and CIBIL score) is used exclusively to power the Wallet Optimizer and Taqdeer AI to provide you with the most accurate credit card recommendations.
                    </p>
                    <p className="mt-2">
                      We strictly <strong>do not sell, rent, or share</strong> your personal financial data with third-party advertisers or brokers. Your data is encrypted and stored securely.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-ink-primary text-base">Terms of Service</h4>
                    <p className="mt-1">
                      By using Renocred, you agree to our Terms of Service. The recommendations provided by Taqdeer AI and the Wallet Optimizer are for informational purposes only and do not constitute financial advice.
                    </p>
                    <p className="mt-2">
                      Approval for any credit card is strictly at the discretion of the issuing bank. Renocred is not responsible for any rejected applications or changes to bank reward structures.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-canvas-200/50 dark:border-white/[0.04] text-center">
                <button
                  onClick={() => setShowLegal(null)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-6 py-2 rounded-full transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
