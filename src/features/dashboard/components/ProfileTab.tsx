import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Coins, Mail, Phone, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile } from '../types/dashboard.types';

const AVATAR_SEEDS = ['Atharva', 'Aria', 'Kabir', 'Zoe', 'Rohan', 'Elena'];

function formatINR(val: number) {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export function ProfileTab() {
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);

  // Initial form values from store
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (!profile?.avatar) return AVATAR_SEEDS[0];
    const match = profile.avatar.match(/seed=([^&]+)/);
    return match ? match[1] : AVATAR_SEEDS[0];
  });

  // Salary state (manual + slider)
  const [salary, setSalary] = useState(profile?.salary || 1500000);
  const [salaryInput, setSalaryInput] = useState(() => (profile?.salary || 1500000).toString());

  // Credit Score state (manual + slider)
  const [creditScore, setCreditScore] = useState(profile?.creditScore || 750);
  const [creditInput, setCreditInput] = useState(() => (profile?.creditScore || 750).toString());

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=f8f9fa`;

  const handleSalarySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSalary(val);
    setSalaryInput(val.toString());
  };

  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    setSalaryInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setSalary(Math.min(100000000, Math.max(0, val)));
    }
  };

  const handleCreditSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCreditScore(val);
    setCreditInput(val.toString());
  };

  const handleCreditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    setCreditInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setCreditScore(Math.min(900, Math.max(300, val)));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (phone.length < 10) return setError('Please enter a valid 10-digit phone number.');

    const updatedProfile: AppProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarUrl,
      salary,
      creditScore,
    };

    updateProfile(updatedProfile);
    setSuccess(true);
    setError('');

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-2xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">
          Review and update your CIBIL score, income details, and personal contacts.
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-profit/10 border border-profit/25 rounded-2xl text-profit shadow-ag-glow-profit"
          >
            <CheckCircle2 size={18} />
            <p className="text-sm font-bold">Profile updated successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="panel-glass rounded-[2rem] p-6 lg:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Name & Contact */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-secondary flex items-center gap-2">
              <User size={13} className="text-brand-500" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium w-full text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink-secondary flex items-center gap-2">
                <Mail size={13} className="text-brand-500" /> Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium w-full text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink-secondary flex items-center gap-2">
                <Phone size={13} className="text-brand-500" /> Phone Number
              </label>
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
        </div>

        {/* Avatar Select */}
        <div className="flex flex-col gap-1.5 border-t border-canvas-200/50 dark:border-white/[0.04] pt-4">
          <label className="text-xs font-bold text-ink-secondary">Select Profile Avatar</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-500 bg-canvas-200 flex-shrink-0 shadow-ag-base">
              <img src={avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-md">
              {AVATAR_SEEDS.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setAvatarSeed(seed)}
                  className={cn(
                    'w-9 h-9 rounded-full border flex-shrink-0 text-xs font-semibold flex items-center justify-center transition-all overflow-hidden',
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

        {/* Salary: Manual + Slider */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-canvas-200/50 dark:border-white/[0.04]">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-ink-secondary flex items-center gap-1.5">
              <Coins size={13} className="text-caution" /> Annual Income
            </label>
            <div className="relative w-36">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">₹</span>
              <input
                type="text"
                value={salaryInput}
                onChange={handleSalaryInputChange}
                className="w-full input-premium py-1 pl-6 pr-2 text-right text-xs font-semibold"
              />
            </div>
          </div>
          <p className="text-[10px] text-brand-500 font-bold self-end mt-0.5">
            Formatted: {formatINR(salary)} / year
          </p>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={50000}
            value={salary}
            onChange={handleSalarySliderChange}
            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-canvas-200 rounded-lg appearance-none mt-1"
          />
        </div>

        {/* Credit Score: Manual + Slider */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-canvas-200/50 dark:border-white/[0.04]">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-ink-secondary flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-profit" /> Credit Score (CIBIL)
            </label>
            <input
              type="text"
              maxLength={3}
              value={creditInput}
              onChange={handleCreditInputChange}
              className="w-20 input-premium py-1 px-2 text-right text-xs font-semibold"
            />
          </div>
          <p className="text-[10px] text-profit font-bold self-end mt-0.5">
            Rating: {creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : 'Poor'}
          </p>
          <input
            type="range"
            min={300}
            max={900}
            step={1}
            value={creditScore}
            onChange={handleCreditSliderChange}
            className="w-full accent-brand-500 cursor-pointer h-1.5 bg-canvas-200 rounded-lg appearance-none mt-1"
          />
        </div>

        {error && <p className="text-xs font-bold text-loss mt-1">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-[0.98]"
        >
          <UserCheck size={16} /> Save Changes
        </button>
      </form>
    </div>
  );
}
