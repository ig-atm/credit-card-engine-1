import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Plus, Scale, Check,
  Trophy,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

const CATEGORY_META: { key: SpendCategory; label: string }[] = [
  { key: 'dining',        label: 'Dining'        },
  { key: 'travel',        label: 'Travel'        },
  { key: 'shopping',      label: 'Shopping'      },
  { key: 'groceries',     label: 'Groceries'     },
  { key: 'fuel',          label: 'Fuel'          },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'utilities',     label: 'Utilities'     },
  { key: 'health',        label: 'Health'        },
];

function getRate(card: FinixCard, cat: SpendCategory): number {
  const r = card.rewards?.find((x) => x.category === cat);
  return r ? r.rate : card.baseRewardRate;
}

function getWinnerIdx(cards: FinixCard[], getValue: (c: FinixCard) => number, higherIsBetter = true): number {
  if (cards.length < 2) return -1;
  const vals = cards.map(getValue);
  const best = higherIsBetter ? Math.max(...vals) : Math.min(...vals);
  const bestIdx = vals.findIndex((v) => v === best);
  return vals.filter((v) => v === best).length === 1 ? bestIdx : -1;
}

function getLoserIdx(cards: FinixCard[], getValue: (c: FinixCard) => number, higherIsBetter: boolean, winnerIdx: number): number {
  if (cards.length < 3) return -1;
  const vals = cards.map(getValue);
  const worst = higherIsBetter ? Math.min(...vals) : Math.max(...vals);
  const worstIdx = vals.lastIndexOf(worst);
  return worstIdx !== winnerIdx ? worstIdx : -1;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CardPicker({ onSelect, onClose, excludeIds }: {
  onSelect: (card: FinixCard) => void;
  onClose: () => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [bankFilter, setBankFilter] = useState('');

  const filtered = CARD_DATASET
    .filter((c) => !excludeIds.includes(c.id))
    .filter((c) => !bankFilter || c.bank === bankFilter)
    .filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.bank.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-lg bg-canvas-100 dark:bg-canvas-200 rounded-[2rem] shadow-2xl border border-white/[0.06] overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.04]">
          <div>
            <h3 className="text-lg font-display font-bold text-ink-primary">Pick a Card</h3>
            <p className="text-xs text-ink-tertiary mt-0.5">{CARD_DATASET.length} cards available</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-white/[0.06] transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input type="text" placeholder="Search by bank or card name..." value={query} onChange={(e) => setQuery(e.target.value)}
              className="input-search" autoFocus />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', 'HDFC Bank', 'SBI Card', 'Axis Bank', 'ICICI Bank'].map((b) => (
              <button key={b || 'all'} onClick={() => setBankFilter(b)}
                className={cn('text-[11px] font-bold px-3 py-1 rounded-full transition-all',
                  bankFilter === b ? 'bg-secondary-400 text-neutral-900' : 'bg-canvas-300/50 dark:bg-white/[0.05] text-ink-tertiary hover:text-ink-secondary')}>
                {b === '' ? 'All Banks' : b.replace(' Bank', '').replace(' Card', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-tertiary text-center py-8">No cards found</p>
          ) : (
            filtered.slice(0, 60).map((c) => (
              <motion.button key={c.id} whileHover={{ x: 4 }}
                onClick={() => { onSelect(c); onClose(); }}
                className="w-full p-3 rounded-2xl flex items-center gap-3 border border-white/[0.03] hover:border-brand-500/20 hover:bg-brand-500/[0.03] text-left transition-all group"
              >
                <div className="w-10 h-7 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})` }}>
                  <span className="text-[7px] font-black text-white/80 uppercase tracking-wide truncate px-1">{c.bank.slice(0, 4)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary truncate leading-tight">{c.name}</p>
                  <p className="text-[11px] text-ink-tertiary mt-0.5">{c.bank} · {c.annualFee === 0 ? 'Free' : formatINR(c.annualFee) + '/yr'}</p>
                </div>
                <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
              </motion.button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCORE BAR
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className="h-full bg-brand-500 rounded-full" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARE SECTION & ROW
// ─────────────────────────────────────────────────────────────────────────────

function CompareSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black text-ink-disabled uppercase tracking-[0.15em] mb-2 px-1">{title}</p>
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.03]">
        {children}
      </div>
    </div>
  );
}

function CompareRow({ label, cards, getValue, format = 'text', higherIsBetter = true, suffix }: {
  label: string;
  cards: FinixCard[];
  getValue: (c: FinixCard) => number | string;
  format?: 'text' | 'rate' | 'inr';
  higherIsBetter?: boolean;
  suffix?: string;
}) {
  const numGet = (c: FinixCard) => Number(getValue(c));
  const winnerIdx = format !== 'text' ? getWinnerIdx(cards, numGet, higherIsBetter) : -1;
  const loserIdx  = format !== 'text' ? getLoserIdx(cards, numGet, higherIsBetter, winnerIdx) : -1;

  return (
    <div className="grid items-center py-2.5 px-3" style={{ gridTemplateColumns: `120px repeat(${cards.length}, 1fr)` }}>
      <p className="text-xs font-semibold text-ink-tertiary truncate pr-2">{label}</p>
      {cards.map((card, i) => {
        const val = getValue(card);
        const display = format === 'rate' ? `${val}%` : format === 'inr' ? formatINR(Number(val)) : `${val}${suffix ?? ''}`;
        const isWinner = winnerIdx === i;
        const isLoser  = loserIdx === i;
        return (
          <div key={card.id} className={cn('flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-colors', isWinner && 'bg-brand-500/[0.06]', isLoser && 'opacity-50')}>
            <span className={cn('text-sm font-bold tabular-nums', isWinner ? 'text-brand-500' : 'text-ink-primary')}>{display}</span>
            {isWinner && (
              <div className="flex items-center gap-0.5 mt-0.5">
                <Trophy size={8} className="text-brand-500" />
                <span className="text-[9px] font-bold text-brand-500 uppercase tracking-wide">Best</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function CardComparisonPanel() {
  const [selectedCards, setSelectedCards] = useState<FinixCard[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addCard = (card: FinixCard) => {
    if (selectedCards.length < 3 && !selectedCards.find((c) => c.id === card.id))
      setSelectedCards([...selectedCards, card]);
  };
  const removeCard = (id: string) => setSelectedCards(selectedCards.filter((c) => c.id !== id));

  const overallScore = (card: FinixCard) => {
    const rewardScore = CATEGORY_META.reduce((sum, { key }) => sum + getRate(card, key), 0);
    const feeScore    = card.annualFee === 0 ? 30 : card.annualFee < 1000 ? 20 : card.annualFee < 5000 ? 10 : 0;
    const loungeScore = (card.loungeAccess ?? 0) * 2;
    return rewardScore + feeScore + loungeScore;
  };

  const scores   = selectedCards.map(overallScore);
  const maxScore = scores.length > 0 ? Math.max(...scores) : 1;
  const hasCards = selectedCards.length >= 2;

  return (
    <div className="flex flex-col gap-6">

      {/* Header + Slots */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-ink-primary flex items-center gap-2">
              <Scale size={18} className="text-brand-500" /> Card Comparison
            </h3>
            <p className="text-xs text-ink-tertiary mt-0.5">Select 2–3 cards to compare side-by-side</p>
          </div>
          {selectedCards.length > 0 && (
            <button onClick={() => setSelectedCards([])} className="text-xs font-bold text-ink-tertiary hover:text-loss transition-colors flex items-center gap-1">
              <X size={12} /> Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((slot) => {
            const card = selectedCards[slot];
            return card ? (
              <motion.div key={card.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="relative rounded-2xl border border-brand-500/15 bg-brand-500/[0.03] flex flex-col gap-3 p-4 group overflow-hidden"
              >
                <div className="w-full h-20 rounded-xl overflow-hidden relative shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})` }}>
                  <div className="absolute inset-0 flex flex-col items-start justify-between p-3">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{card.bank}</p>
                    <p className="text-[11px] font-bold text-white leading-tight truncate w-full">{card.name}</p>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-semibold text-ink-tertiary">Score</p>
                    <p className="text-[10px] font-bold text-brand-500">{Math.round(scores[slot] ?? 0)}</p>
                  </div>
                  <ScoreBar score={scores[slot] ?? 0} maxScore={maxScore} />
                </div>
                <button onClick={() => removeCard(card.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-ink-tertiary hover:text-loss hover:bg-loss/10 transition-all opacity-0 group-hover:opacity-100">
                  <X size={11} />
                </button>
              </motion.div>
            ) : (
              <motion.button key={`empty-${slot}`}
                whileHover={{ scale: slot <= selectedCards.length ? 1.02 : 1 }}
                whileTap={{ scale: slot <= selectedCards.length ? 0.98 : 1 }}
                onClick={() => slot <= selectedCards.length && setShowPicker(true)}
                disabled={slot > selectedCards.length}
                className={cn('rounded-2xl p-4 border-2 border-dashed flex flex-col items-center justify-center gap-2 h-[148px] transition-all group',
                  slot <= selectedCards.length
                    ? 'border-canvas-300 dark:border-white/[0.08] hover:border-brand-500/40 hover:bg-brand-500/[0.02] cursor-pointer'
                    : 'border-canvas-200 dark:border-white/[0.04] opacity-30 cursor-not-allowed')}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  slot <= selectedCards.length ? 'bg-white/[0.04] group-hover:bg-brand-500/10' : 'bg-white/[0.02]')}>
                  <Plus size={18} className={cn('transition-colors', slot <= selectedCards.length ? 'text-ink-disabled group-hover:text-brand-500' : 'text-ink-disabled/40')} />
                </div>
                <p className="text-xs font-semibold text-ink-disabled group-hover:text-ink-tertiary transition-colors text-center">
                  {slot === 0 ? 'Add first card' : slot === 1 ? 'Add second card' : 'Add third (optional)'}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {!hasCards && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <Scale size={28} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-primary">Ready to compare?</p>
            <p className="text-xs text-ink-tertiary mt-1 max-w-[280px]">Add at least 2 cards to see a detailed side-by-side comparison of fees, rewards, and perks.</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowPicker(true)}
            className="btn-brand text-sm px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
            <Plus size={16} /> Add Your First Card
          </motion.button>
        </motion.div>
      )}

      {/* Comparison Table */}
      <AnimatePresence>
        {hasCards && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex flex-col gap-5">

            {/* Column Headers */}
            <div className="grid items-center" style={{ gridTemplateColumns: `120px repeat(${selectedCards.length}, 1fr)` }}>
              <div />
              {selectedCards.map((card) => (
                <div key={card.id} className="text-center px-1">
                  <p className="text-xs font-bold text-ink-primary leading-tight truncate">{card.name}</p>
                  <p className="text-[10px] text-ink-tertiary mt-0.5 truncate">{card.bank}</p>
                </div>
              ))}
            </div>

            <CompareSection title="Basics">
              <CompareRow label="Annual Fee"    cards={selectedCards} getValue={(c) => c.annualFee}           format="inr"  higherIsBetter={false} />
              <CompareRow label="Fee Waiver"    cards={selectedCards} getValue={(c) => c.feeWaiverSpend ?? 0} format="inr"  higherIsBetter={false} />
              <CompareRow label="Min Income"    cards={selectedCards} getValue={(c) => c.minIncome}           format="inr"  higherIsBetter={false} />
              <CompareRow label="Min CIBIL"     cards={selectedCards} getValue={(c) => c.minCibil}            higherIsBetter={false} />
              <CompareRow label="Network"       cards={selectedCards} getValue={(c) => c.network}             format="text" />
            </CompareSection>

            <CompareSection title="Perks & Benefits">
              <CompareRow label="Lounge/yr"     cards={selectedCards} getValue={(c) => c.loungeAccess ?? 0}   suffix=" visits" />
              <CompareRow label="Base Reward"   cards={selectedCards} getValue={(c) => c.baseRewardRate}      format="rate" />
              <CompareRow label="Welcome Bonus" cards={selectedCards} getValue={(c) => c.welcomeBonus || '–'} format="text" />
            </CompareSection>

            <CompareSection title="Category Reward Rates">
              {CATEGORY_META.map(({ key, label }) => (
                <CompareRow key={key} label={label} cards={selectedCards} getValue={(c) => getRate(c, key)} format="rate" />
              ))}
            </CompareSection>

            <CompareSection title="Key Highlights">
              <div className="grid gap-3 p-4" style={{ gridTemplateColumns: `120px repeat(${selectedCards.length}, 1fr)` }}>
                <div />
                {selectedCards.map((card) => (
                  <div key={card.id} className="flex flex-col gap-2">
                    {card.highlights.slice(0, 4).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check size={10} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-ink-secondary leading-snug">{h}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CompareSection>

            {/* Verdict */}
            {(() => {
              const winnerCard = selectedCards[scores.indexOf(Math.max(...scores))];
              return (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-brand-500/20 bg-brand-500/[0.04] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                      <Trophy size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-500 uppercase tracking-wider">Our Verdict</p>
                      <p className="text-sm font-bold text-ink-primary mt-0.5">
                        <span className="text-brand-500">{winnerCard.name}</span> wins overall
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedCards.length}, 1fr)` }}>
                    {selectedCards.map((card, i) => (
                      <div key={card.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold text-ink-tertiary truncate">{card.name.split(' ')[0]}</p>
                          <p className="text-[10px] font-bold text-ink-primary">{Math.round(scores[i])}</p>
                        </div>
                        <ScoreBar score={scores[i]} maxScore={maxScore} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-tertiary mt-3 leading-relaxed">
                    Score = reward rates across all categories + fee efficiency + lounge access. Higher is better.
                  </p>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <CardPicker onSelect={addCard} onClose={() => setShowPicker(false)} excludeIds={selectedCards.map((c) => c.id)} />
        )}
      </AnimatePresence>
    </div>
  );
}
