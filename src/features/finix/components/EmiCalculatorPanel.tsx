import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, Wallet, Clock, Percent, Receipt,
  TrendingUp, Trophy, CreditCard, Info, AlertTriangle,
  CheckCircle2, Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { CARD_DATASET } from '../data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Compact INR formatter — mirrors CardComparisonPanel. */
function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000)     return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

/** Full rupee formatter with thousands separators (no decimals). */
function formatFullINR(val: number): string {
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

/**
 * Reducing-balance EMI:  EMI = P·r·(1+r)^n / ((1+r)^n − 1)
 * where r = monthly rate, n = tenure in months. Returns 0 for zero-rate → P/n.
 */
function computeEmi(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (months <= 0) return { emi: 0, totalInterest: 0, totalPayable: principal };
  const emi =
    r === 0
      ? principal / months
      : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;
  return { emi, totalInterest, totalPayable };
}

/**
 * Derive an EMI conversion APR for a card from its tier. Premium cards (higher
 * annual fee / income requirement) tend to offer lower reducing-balance EMI rates.
 */
function deriveCardApr(annualFee: number, minIncome: number): number {
  let apr = 16;
  if (annualFee >= 10000 || minIncome >= 2500000) apr = 12;
  else if (annualFee >= 5000 || minIncome >= 1500000) apr = 13;
  else if (annualFee >= 1000) apr = 14;
  else if (annualFee > 0) apr = 15;
  return apr;
}

const TENURE_PRESETS = [3, 6, 9, 12, 18, 24];

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDER (brand-palette only — matches Simulator's SimSlider language)
// ─────────────────────────────────────────────────────────────────────────────

function EmiSlider({
  label, value, onChange, min, max, step = 1, display, icon: Icon, colorVar = '--color-brand-500',
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; display: string;
  icon: typeof TrendingUp; colorVar?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = `rgb(var(${colorVar}))`;
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-white/[0.03] last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `rgb(var(${colorVar}) / 0.12)` }}
          >
            <Icon size={14} style={{ color }} />
          </div>
          <p className="text-sm font-semibold text-ink-primary">{label}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl px-3 py-1.5">
          <span className="text-sm font-bold text-ink-primary tabular-nums">{display}</span>
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-150" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESULT STAT TILE
// ─────────────────────────────────────────────────────────────────────────────

function StatTile({ label, value, icon: Icon, colorVar }: {
  label: string; value: string; icon: typeof TrendingUp; colorVar: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgb(var(${colorVar}) / 0.12)` }}>
          <Icon size={13} style={{ color: `rgb(var(${colorVar}))` }} />
        </div>
        <p className="text-[11px] font-semibold text-ink-tertiary">{label}</p>
      </div>
      <p className="text-lg font-display font-bold text-ink-primary tabular-nums leading-none">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function EmiCalculatorPanel() {
  const userCards = useDashboardStore((s) => s.userCards);

  const [amount, setAmount]   = useState(150000);
  const [tenure, setTenure]   = useState(12);
  const [rate, setRate]       = useState(15);
  const [feePct, setFeePct]   = useState(1);

  const { emi, totalInterest, totalPayable } = useMemo(
    () => computeEmi(amount, rate, tenure),
    [amount, rate, tenure],
  );
  const processingFee = (amount * feePct) / 100;
  const grandTotal    = totalPayable + processingFee;

  // Principal vs interest split for the amortization bar
  const principalPct = totalPayable > 0 ? (amount / totalPayable) * 100 : 100;

  // ── "Which card" ranking ──────────────────────────────────────────────────
  const rankedCards = useMemo(() => {
    return userCards
      .map((card) => {
        const meta = CARD_DATASET.find((c) => c.id === card.id);
        const apr = deriveCardApr(meta?.annualFee ?? 0, meta?.minIncome ?? 0);
        const { emi: cardEmi, totalInterest: cardInterest } = computeEmi(amount, apr, tenure);
        const availableRupees = card.availableCredit / 100;
        const covered = availableRupees >= amount;
        return {
          card,
          bank: meta?.bank ?? card.bank ?? '',
          apr,
          cardEmi,
          cardInterest,
          availableRupees,
          covered,
        };
      })
      // Prefer cards that can cover the purchase, then lowest interest cost.
      .sort((a, b) => {
        if (a.covered !== b.covered) return a.covered ? -1 : 1;
        return a.cardInterest - b.cardInterest;
      });
  }, [userCards, amount, tenure]);

  const bestId = rankedCards.find((r) => r.covered)?.card.id ?? rankedCards[0]?.card.id;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
          <Calculator size={18} className="text-brand-500" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-ink-primary">EMI Calculator</h3>
          <p className="text-xs text-ink-tertiary">Plan a big purchase and find the best card to convert it</p>
        </div>
      </div>

      {/* Result Hero */}
      <div className="panel-glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-1.5">Monthly EMI</p>
            <div className="flex items-baseline gap-2">
              <motion.p
                key={Math.round(emi)}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-display font-bold text-ink-primary tabular-nums tracking-tight"
              >
                {formatFullINR(emi)}
              </motion.p>
              <span className="text-sm font-semibold text-ink-tertiary">/mo</span>
            </div>
            <p className="text-xs text-ink-tertiary mt-1.5">
              {formatFullINR(amount)} over {tenure} months at {rate}% p.a.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/[0.08] border border-brand-500/15 self-start">
            <Sparkles size={13} className="text-brand-500" />
            <span className="text-xs font-bold text-brand-500">Reducing balance</span>
          </div>
        </div>

        {/* Amortization bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-ink-tertiary">Principal vs Interest</span>
            <span className="text-[11px] font-semibold text-ink-tertiary tabular-nums">{formatFullINR(totalPayable)}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-white/[0.06]">
            <motion.div
              className="h-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${principalPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className="h-full bg-copper-500"
              initial={{ width: 0 }}
              animate={{ width: `${100 - principalPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-[11px] text-ink-tertiary">Principal · {formatINR(amount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-copper-500" />
              <span className="text-[11px] text-ink-tertiary">Interest · {formatINR(totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <StatTile label="Total Interest"  value={formatINR(totalInterest)}          icon={TrendingUp} colorVar="--color-copper-500" />
          <StatTile label="Processing Fee"   value={formatINR(processingFee)}          icon={Receipt}    colorVar="--color-steel-500" />
          <StatTile label="Total Payable"    value={formatINR(grandTotal)}             icon={Wallet}     colorVar="--color-brand-500" />
        </div>
      </div>

      {/* Inputs */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-3">Loan Details</p>

        {/* Amount with text input */}
        <div className="flex flex-col gap-2 py-3 border-b border-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/[0.12]">
                <Wallet size={14} className="text-brand-500" />
              </div>
              <p className="text-sm font-semibold text-ink-primary">Purchase Amount</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">₹</span>
              <input
                type="number"
                value={amount}
                min={5000}
                max={1000000}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAmount(Number.isFinite(v) ? Math.max(0, Math.min(1000000, v)) : 0);
                }}
                className="input-premium py-1.5 pl-6 pr-3 text-sm font-bold w-32 text-right tabular-nums"
              />
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-500 transition-all duration-150" style={{ width: `${((amount - 5000) / (1000000 - 5000)) * 100}%` }} />
            </div>
            <input
              type="range" min={5000} max={1000000} step={5000} value={Math.min(1000000, Math.max(5000, amount))}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Tenure with presets */}
        <div className="flex flex-col gap-2.5 py-3 border-b border-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-steel-500/[0.12]">
                <Clock size={14} className="text-steel-500" />
              </div>
              <p className="text-sm font-semibold text-ink-primary">Tenure</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl px-3 py-1.5">
              <span className="text-sm font-bold text-ink-primary tabular-nums">{tenure}</span>
              <span className="text-[10px] text-ink-tertiary">months</span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TENURE_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setTenure(m)}
                className={cn(
                  'text-[11px] font-bold px-3 py-1 rounded-full transition-all',
                  tenure === m
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/[0.05] text-ink-tertiary hover:text-ink-secondary',
                )}
              >
                {m}mo
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-steel-500 transition-all duration-150" style={{ width: `${((tenure - 3) / (36 - 3)) * 100}%` }} />
            </div>
            <input
              type="range" min={3} max={36} step={1} value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <EmiSlider
          label="Interest Rate (p.a.)" value={rate} onChange={setRate}
          min={10} max={24} step={0.5} display={`${rate}%`} icon={Percent}
          colorVar="--color-copper-500"
        />
        <EmiSlider
          label="Processing Fee" value={feePct} onChange={setFeePct}
          min={0} max={3} step={0.25} display={`${feePct}%`} icon={Receipt}
          colorVar="--color-steel-500"
        />
      </div>

      {/* Which card should I use */}
      <div className="panel-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <CreditCard size={15} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-ink-primary">Which card should I use?</p>
              <p className="text-[11px] text-ink-tertiary">Ranked by lowest EMI interest cost</p>
            </div>
          </div>
        </div>

        {rankedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <CreditCard size={24} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-primary">No cards in your wallet yet</p>
              <p className="text-xs text-ink-tertiary mt-1 max-w-[260px]">
                Add a card on the Dashboard to see which one gives you the cheapest EMI for this purchase.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rankedCards.map(({ card, bank, apr, cardEmi, cardInterest, availableRupees, covered }) => {
              const isBest = card.id === bestId;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl border p-3 transition-all',
                    isBest
                      ? 'border-brand-500/25 bg-brand-500/[0.05]'
                      : 'border-white/[0.04] bg-white/[0.01]',
                  )}
                >
                  {/* Card face chip */}
                  <div
                    className="w-12 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})` }}
                  >
                    <span className="text-[7px] font-black text-white/80 uppercase tracking-wide truncate px-1">
                      {(bank || 'CARD').slice(0, 4)}
                    </span>
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-ink-primary truncate leading-tight">{card.label || 'Credit Card'}</p>
                      {isBest && (
                        <span className="flex items-center gap-0.5 bg-brand-500/15 text-brand-500 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0">
                          <Trophy size={8} /> Best
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-ink-tertiary">{apr}% p.a.</span>
                      <span className="text-[10px] text-ink-disabled">·</span>
                      {covered ? (
                        <span className="flex items-center gap-1 text-[10px] text-profit">
                          <CheckCircle2 size={9} /> {formatINR(availableRupees)} avail.
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-caution">
                          <AlertTriangle size={9} /> Limit too low
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EMI figure */}
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-sm font-bold tabular-nums', isBest ? 'text-brand-500' : 'text-ink-primary')}>
                      {formatFullINR(cardEmi)}
                    </p>
                    <p className="text-[10px] text-ink-tertiary tabular-nums">+{formatINR(cardInterest)} int.</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-brand-500/[0.04] border border-brand-500/10">
        <Info size={13} className="text-brand-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-ink-secondary leading-relaxed">
          Estimates use the reducing-balance method. Actual EMI offers, interest rates, and processing
          fees vary by bank, card, and merchant. Per-card rates shown here are indicative, derived from
          each card's tier — always confirm the exact terms before converting a transaction to EMI.
        </p>
      </div>
    </div>
  );
}
