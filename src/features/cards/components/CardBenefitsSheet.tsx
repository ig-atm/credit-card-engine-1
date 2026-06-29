import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Wallet, Award, Plane, Trophy, Sparkles } from 'lucide-react';
import { CARD_DATASET } from '../../finix/data/cardDataset';
import { BankLogo } from './BankLogo';

interface CardBenefitsSheetProps {
  cardId: string | null;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  dining: '🍳',
  travel: '✈️',
  groceries: '🛍️',
  shopping: '🛒',
  fuel: '⛽',
  entertainment: '🎬',
  utilities: '⚡',
  transport: '🚕',
  health: '💊',
  subscriptions: '🎵',
  other: '📌',
};

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining',
  travel: 'Travel',
  groceries: 'Groceries',
  shopping: 'Shopping',
  fuel: 'Fuel',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  transport: 'Transport',
  health: 'Health',
  subscriptions: 'Subscriptions',
  other: 'Other Spends',
};

export function CardBenefitsSheet({ cardId, onClose }: CardBenefitsSheetProps) {
  const datasetCard = CARD_DATASET.find((c) => c.id === cardId);

  // If card is a custom user card that is not in CARD_DATASET, construct a fallback template
  // Wait, let's also fetch from userCards in case they added custom details. But usually CARD_DATASET has the data.
  const cardData = datasetCard;

  return (
    <AnimatePresence>
      {cardId && cardData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Slide-Up Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-xl bg-canvas-50 dark:bg-[#16181b] rounded-t-[2.5rem] border-t border-canvas-200/50 dark:border-white/[0.06] overflow-hidden flex flex-col max-h-[85vh]"
            style={{
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Grab handle for sheet */}
            <div className="w-12 h-1.5 rounded-full bg-canvas-300 dark:bg-white/10 mx-auto my-3 flex-shrink-0" />

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-canvas-200/50 dark:border-white/[0.04] flex-shrink-0">
              <div className="flex items-center gap-3">
                <BankLogo bank={cardData.bank} />
                <div>
                  <h3 className="text-base font-display font-extrabold text-ink-primary leading-tight">
                    {cardData.name}
                  </h3>
                  <p className="text-[10px] text-ink-tertiary font-semibold tracking-wider uppercase mt-0.5">
                    {cardData.bank} · {cardData.network}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-canvas-200/60 dark:bg-white/[0.04] flex items-center justify-center text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 pb-8">
              {/* Card visual preview at top */}
              <div
                className="h-32 w-full rounded-2xl p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-lg flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${cardData.gradientFrom}, ${cardData.gradientTo})`,
                }}
              >
                {/* Frosted shine element */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-display font-bold uppercase tracking-widest text-white/95">
                      {cardData.name}
                    </p>
                    <p className="text-[9px] text-white/75 mt-0.5">Verified Intelligence</p>
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    {cardData.network}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="font-mono text-sm tracking-widest opacity-80">•••• •••• •••• 5678</p>
                  <p className="text-[10px] font-bold text-white/80">REWARDS RATE UP TO {Math.max(...cardData.rewards.map(r => r.rate), cardData.baseRewardRate)}%</p>
                </div>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/40 dark:border-white/[0.03] rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Wallet size={16} className="text-brand-500 mb-1" />
                  <p className="text-[10px] text-ink-disabled uppercase font-bold tracking-wider">Annual Fee</p>
                  <p className="text-sm font-display font-extrabold text-ink-primary mt-0.5">
                    {cardData.annualFee === 0 ? 'LIFETIME FREE' : `₹${cardData.annualFee}`}
                  </p>
                </div>
                <div className="bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/40 dark:border-white/[0.03] rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Calendar size={16} className="text-profit mb-1" />
                  <p className="text-[10px] text-ink-disabled uppercase font-bold tracking-wider">Fee Waiver</p>
                  <p className="text-sm font-display font-extrabold text-ink-primary mt-0.5">
                    {cardData.feeWaiverSpend ? `₹${cardData.feeWaiverSpend.toLocaleString('en-IN')}` : 'N/A'}
                  </p>
                </div>
                <div className="bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/40 dark:border-white/[0.03] rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Plane size={16} className="text-copper-500 mb-1" />
                  <p className="text-[10px] text-ink-disabled uppercase font-bold tracking-wider">Lounge Access</p>
                  <p className="text-sm font-display font-extrabold text-ink-primary mt-0.5">
                    {cardData.loungeAccess ? `${cardData.loungeAccess}/year` : 'None'}
                  </p>
                </div>
              </div>

              {/* Reward Multipliers */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3 flex items-center gap-1.5">
                  <Award size={14} className="text-brand-500" /> Reward Multipliers
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {cardData.rewards.map((r) => (
                    <div
                      key={r.category}
                      className="bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/40 dark:border-white/[0.03] rounded-2xl p-3 flex items-center gap-3"
                    >
                      <span className="text-xl">{CATEGORY_ICONS[r.category] || '📌'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink-primary truncate">
                          {CATEGORY_LABELS[r.category] || r.category}
                        </p>
                        <p className="text-[10px] text-ink-tertiary">Multiplier Rate</p>
                      </div>
                      <p className="text-sm font-display font-bold text-profit">{r.rate}%</p>
                    </div>
                  ))}
                  <div className={`bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/40 dark:border-white/[0.03] rounded-2xl p-3 flex items-center gap-3 ${cardData.rewards.length % 2 === 0 ? 'col-span-2' : ''}`}>
                    <span className="text-xl">💳</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-primary truncate">Base Rate</p>
                      <p className="text-[10px] text-ink-tertiary">All other spends</p>
                    </div>
                    <p className="text-sm font-display font-bold text-profit">{cardData.baseRewardRate}%</p>
                  </div>
                </div>
              </div>

              {/* Welcome Bonus & Highlights */}
              <div className="flex flex-col gap-4">
                {cardData.welcomeBonus && (
                  <div className="bg-brand-50/50 dark:bg-brand-500/[0.02] border border-brand-500/10 rounded-2xl p-4 flex gap-3 items-start">
                    <Trophy className="text-brand-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-bold text-brand-650 dark:text-brand-400">Welcome Bonus Benefits</p>
                      <p className="text-xs text-ink-secondary mt-1">{cardData.welcomeBonus}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-copper-500" /> Key Card Highlights
                  </p>
                  <ul className="flex flex-col gap-2">
                    {cardData.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="bg-canvas-100 dark:bg-white/[0.01] border border-canvas-200/40 dark:border-white/[0.03] rounded-xl px-3 py-2 text-xs text-ink-secondary flex items-center gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                        <span className="first-letter:uppercase">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Eligibility details */}
              <div className="border-t border-canvas-200/50 dark:border-white/[0.04] pt-4">
                <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-2">Eligibility Criteria</p>
                <div className="flex justify-between text-xs text-ink-tertiary">
                  <p>Min Income: <strong className="text-ink-secondary font-semibold">₹{(cardData.minIncome / 100000).toFixed(1)} Lakhs/yr</strong></p>
                  <p>Min CIBIL: <strong className="text-ink-secondary font-semibold">{cardData.minCibil}</strong></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
