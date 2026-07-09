import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, ArrowRight, Scale, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { BankLogo } from '../../cards/components/BankLogo';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

const COMPARE_CATEGORIES: { key: SpendCategory; label: string }[] = [
  { key: 'dining', label: 'Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'utilities', label: 'Utilities' },
];

function getRate(card: FinixCard, cat: SpendCategory): number {
  const r = card.rewards?.find((x) => x.category === cat);
  return r ? r.rate : card.baseRewardRate;
}

function getBestRate(cards: FinixCard[], cat: SpendCategory): number {
  return Math.max(...cards.map((c) => getRate(c, cat)));
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CardPicker({
  onSelect,
  onClose,
  excludeIds,
}: {
  onSelect: (card: FinixCard) => void;
  onClose: () => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState('');
  const filtered = CARD_DATASET
    .filter((c) => !excludeIds.includes(c.id))
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.bank.toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-2xl border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-ink-primary">Select a Card</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search by bank or card name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full input-premium pl-10 py-2 text-sm"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-tertiary text-center py-8">No cards found</p>
          ) : (
            filtered.slice(0, 50).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className="w-full p-3 rounded-2xl flex items-center gap-3 border border-canvas-200/40 dark:border-white/[0.03] hover:bg-canvas-200/50 dark:hover:bg-white/[0.02] text-left transition-all"
              >
                <BankLogo bank={c.bank} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary truncate">{c.name}</p>
                  <p className="text-xs text-ink-tertiary">{c.bank} · {c.network} · Fee: {formatINR(c.annualFee)}</p>
                </div>
                <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
                  Compare
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARISON ROW
// ─────────────────────────────────────────────────────────────────────────────

function CompareRow({
  label,
  values,
  bestIndex,
  format = 'text',
}: {
  label: string;
  values: (string | number)[];
  bestIndex?: number;
  format?: 'text' | 'rate' | 'inr';
}) {
  return (
    <div className="grid gap-3 items-center border-b border-white/[0.03] py-3 last:border-b-0" style={{ gridTemplateColumns: `140px repeat(${values.length}, 1fr)` }}>
      <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">{label}</p>
      {values.map((val, i) => (
        <div key={i} className="flex items-center justify-center">
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              bestIndex === i ? 'text-brand-500' : 'text-ink-primary',
            )}
          >
            {format === 'rate' ? `${val}%` : format === 'inr' ? formatINR(Number(val)) : val}
            {bestIndex === i && <Check size={12} className="inline ml-1 text-brand-500" />}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CardComparisonPanel() {
  const [selectedCards, setSelectedCards] = useState<FinixCard[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addCard = (card: FinixCard) => {
    if (selectedCards.length < 3 && !selectedCards.find((c) => c.id === card.id)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const removeCard = (id: string) => {
    setSelectedCards(selectedCards.filter((c) => c.id !== id));
  };

  const hasCards = selectedCards.length >= 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Card Slots */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <Scale size={16} className="text-brand-500" /> Compare Cards
            </h3>
            <p className="text-xs text-ink-tertiary mt-0.5">Select 2 or 3 cards to compare side-by-side</p>
          </div>
          {selectedCards.length > 0 && (
            <button
              onClick={() => setSelectedCards([])}
              className="text-xs font-bold text-ink-tertiary hover:text-loss transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((slot) => {
            const card = selectedCards[slot];
            return card ? (
              <motion.div
                key={card.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative rounded-2xl p-4 border border-brand-500/15 bg-brand-500/[0.03] flex flex-col items-center gap-2 group"
              >
                <button
                  onClick={() => removeCard(card.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-canvas-200/80 dark:bg-white/[0.06] flex items-center justify-center text-ink-tertiary hover:text-loss hover:bg-loss/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
                <div
                  className="w-full h-16 rounded-xl overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})` }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-[8px] font-bold text-white/80 uppercase tracking-wider truncate px-2">{card.name}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-ink-primary truncate max-w-[140px]">{card.name}</p>
                  <p className="text-[10px] text-ink-tertiary">{card.bank} · {card.network}</p>
                </div>
              </motion.div>
            ) : (
              <button
                key={`empty-${slot}`}
                onClick={() => setShowPicker(true)}
                className="rounded-2xl p-4 border-2 border-dashed border-canvas-300 dark:border-white/[0.06] flex flex-col items-center justify-center gap-2 h-[120px] hover:border-brand-500/30 hover:bg-brand-500/[0.02] transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-canvas-200/60 dark:bg-white/[0.04] flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                  <Plus size={18} className="text-ink-disabled group-hover:text-brand-500 transition-colors" />
                </div>
                <p className="text-xs font-semibold text-ink-disabled group-hover:text-ink-tertiary transition-colors">
                  {slot === 0 ? 'Add first card' : slot === 1 ? 'Add second card' : 'Add third (optional)'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <AnimatePresence>
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="rounded-2xl border border-canvas-200/40 dark:border-white/[0.04] bg-canvas-50/30 dark:bg-white/[0.01] p-5 overflow-x-auto"
          >
            <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest mb-4">Comparison</p>

            {/* Annual Fee */}
            <CompareRow
              label="Annual Fee"
              values={selectedCards.map((c) => c.annualFee)}
              bestIndex={selectedCards.indexOf(selectedCards.reduce((a, b) => a.annualFee <= b.annualFee ? a : b))}
              format="inr"
            />

            {/* Fee Waiver */}
            <CompareRow
              label="Fee Waiver"
              values={selectedCards.map((c) => c.feeWaiverSpend ? formatINR(c.feeWaiverSpend) + ' spend' : 'N/A')}
            />

            {/* Min Income */}
            <CompareRow
              label="Min Income"
              values={selectedCards.map((c) => c.minIncome)}
              bestIndex={selectedCards.indexOf(selectedCards.reduce((a, b) => a.minIncome <= b.minIncome ? a : b))}
              format="inr"
            />

            {/* Min CIBIL */}
            <CompareRow
              label="Min CIBIL"
              values={selectedCards.map((c) => c.minCibil)}
              bestIndex={selectedCards.indexOf(selectedCards.reduce((a, b) => a.minCibil <= b.minCibil ? a : b))}
            />

            {/* Network */}
            <CompareRow
              label="Network"
              values={selectedCards.map((c) => c.network)}
            />

            {/* Lounge Access */}
            <CompareRow
              label="Lounge Access"
              values={selectedCards.map((c) => c.loungeAccess ? `${c.loungeAccess}/yr` : 'None')}
              bestIndex={selectedCards.indexOf(selectedCards.reduce((a, b) => (a.loungeAccess ?? 0) >= (b.loungeAccess ?? 0) ? a : b))}
            />

            {/* Welcome Bonus */}
            <CompareRow
              label="Welcome Bonus"
              values={selectedCards.map((c) => c.welcomeBonus || 'None')}
            />

            {/* Base Reward */}
            <CompareRow
              label="Base Reward"
              values={selectedCards.map((c) => c.baseRewardRate)}
              bestIndex={selectedCards.indexOf(selectedCards.reduce((a, b) => a.baseRewardRate >= b.baseRewardRate ? a : b))}
              format="rate"
            />

            {/* Category-specific rates */}
            <div className="mt-4 mb-2">
              <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Category Rewards</p>
            </div>
            {COMPARE_CATEGORIES.map(({ key, label }) => {
              const rates = selectedCards.map((c) => getRate(c, key));
              const best = getBestRate(selectedCards, key);
              const bestIdx = rates.indexOf(best);
              return (
                <CompareRow
                  key={key}
                  label={label}
                  values={rates}
                  bestIndex={bestIdx}
                  format="rate"
                />
              );
            })}

            {/* Highlights */}
            <div className="mt-4 mb-2">
              <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Key Highlights</p>
            </div>
            <div
              className="grid gap-3 pt-3"
              style={{ gridTemplateColumns: `140px repeat(${selectedCards.length}, 1fr)` }}
            >
              <div />
              {selectedCards.map((card) => (
                <div key={card.id} className="flex flex-col gap-1.5">
                  {card.highlights.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight size={10} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-ink-secondary leading-snug">{h}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <CardPicker
            onSelect={addCard}
            onClose={() => setShowPicker(false)}
            excludeIds={selectedCards.map((c) => c.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
