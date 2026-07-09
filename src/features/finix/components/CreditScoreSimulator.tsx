import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal, TrendingUp, TrendingDown, RotateCcw,
  CreditCard, Clock, AlertTriangle, CheckCircle2,
  Minus, ArrowUpRight, ArrowDownRight, Info, Zap,
  PiggyBank, Landmark, RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { CreditScoreDial } from '../../../components/ui/CreditScoreDial';

// ─────────────────────────────────────────────────────────────────────────────
//  SIMULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

interface SimParams {
  utilization: number;      // 0-100
  missedPayments: number;   // 0-12
  creditAge: number;        // months
  totalAccounts: number;    // 1-20
  hardInquiries: number;    // 0-10
  newAccounts: number;      // 0-5 in last 6mo
  hasLoan: boolean;
  debtToIncome: number;     // 0-100
}

function simulateScore(base: number, params: SimParams): number {
  let score = base;

  // Payment History (35% weight) — missed payments tank the score heavily
  if (params.missedPayments > 0) {
    const penalty = Math.min(params.missedPayments * 35, 200);
    score -= penalty;
  }

  // Credit Utilization (30% weight)
  if (params.utilization <= 10) score += 20;
  else if (params.utilization <= 30) score += 10;
  else if (params.utilization <= 50) score -= 15;
  else if (params.utilization <= 75) score -= 40;
  else score -= 80;

  // Credit Age (15% weight)
  if (params.creditAge >= 84) score += 30;       // 7+ years
  else if (params.creditAge >= 36) score += 15;   // 3+ years
  else if (params.creditAge >= 12) score += 0;    // 1+ year
  else score -= 20;                               // < 1 year

  // Credit Mix (10% weight)
  if (params.totalAccounts >= 5 && params.hasLoan) score += 15;
  else if (params.totalAccounts >= 3) score += 10;
  else if (params.totalAccounts >= 2) score += 5;
  else score -= 10;

  // New Inquiries (10% weight)
  if (params.hardInquiries >= 6) score -= 40;
  else if (params.hardInquiries >= 3) score -= 20;
  else if (params.hardInquiries >= 1) score -= 5;

  if (params.newAccounts >= 3) score -= 25;
  else if (params.newAccounts >= 2) score -= 10;

  // Debt-to-income ratio
  if (params.debtToIncome > 50) score -= 30;
  else if (params.debtToIncome > 40) score -= 15;
  else if (params.debtToIncome > 30) score -= 5;

  return Math.max(300, Math.min(900, Math.round(score)));
}

function getScoreLabel(score: number): { label: string; color: string } {
  const c = (v: string) => `rgb(var(${v}))`;
  if (score >= 800) return { label: 'Exceptional', color: c('--color-profit')     };
  if (score >= 750) return { label: 'Excellent',   color: c('--color-brand-500')  };
  if (score >= 700) return { label: 'Good',        color: c('--color-sage-500')   };
  if (score >= 650) return { label: 'Fair',        color: c('--color-caution')    };
  if (score >= 550) return { label: 'Poor',        color: c('--color-copper-500') };
  return                    { label: 'Very Poor',   color: c('--color-loss')       };
}

// Palette tokens for slider accents — keeps the simulator on the app's colour system.
const C = {
  brand:   'rgb(var(--color-brand-500))',
  steel:   'rgb(var(--color-steel-500))',
  copper:  'rgb(var(--color-copper-500))',
  profit:  'rgb(var(--color-profit))',
  loss:    'rgb(var(--color-loss))',
  caution: 'rgb(var(--color-caution))',
};

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDER INPUT
// ─────────────────────────────────────────────────────────────────────────────

function SimSlider({ label, value, onChange, min, max, step = 1, unit, icon: Icon, description, color }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
  icon: typeof TrendingUp; description?: string; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const c = color ?? 'rgb(var(--color-steel-500))';
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-white/[0.03] last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${c} 14%, transparent)` }}>
            <Icon size={14} style={{ color: c }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-primary">{label}</p>
            {description && <p className="text-[10px] text-ink-tertiary mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl px-3 py-1.5">
          <span className="text-sm font-bold text-ink-primary tabular-nums">{value}</span>
          {unit && <span className="text-[10px] text-ink-tertiary">{unit}</span>}
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-150" style={{ width: `${pct}%`, backgroundColor: c }} />
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
//  IMPACT CHIP
// ─────────────────────────────────────────────────────────────────────────────

function ImpactChip({ label, impact }: { label: string; impact: number }) {
  const isPositive = impact > 0;
  const isNeutral  = impact === 0;
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all',
      isPositive ? 'border-profit/15 bg-profit/[0.04]' :
      isNeutral  ? 'border-white/[0.04] bg-white/[0.01]' :
                   'border-loss/15 bg-loss/[0.04]',
    )}>
      <span className="text-xs font-semibold text-ink-secondary">{label}</span>
      <div className="flex items-center gap-1">
        {isPositive && <ArrowUpRight size={12} className="text-profit" />}
        {!isPositive && !isNeutral && <ArrowDownRight size={12} className="text-loss" />}
        {isNeutral && <Minus size={12} className="text-ink-disabled" />}
        <span className={cn('text-xs font-bold tabular-nums',
          isPositive ? 'text-profit' : isNeutral ? 'text-ink-disabled' : 'text-loss')}>
          {isPositive ? '+' : ''}{impact}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CreditScoreSimulator() {
  const profile        = useDashboardStore((s) => s.profile);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const userCards      = useDashboardStore((s) => s.userCards);

  const baseScore = profile?.creditScore || 750;
  const totalLimit = creditAccounts.reduce((s, a) => s + a.totalLimit, 0);
  const totalBal   = creditAccounts.reduce((s, a) => s + a.currentBalance, 0);
  const currentUtil = totalLimit > 0 ? Math.round((totalBal / totalLimit) * 100) : 20;

  const defaultParams: SimParams = {
    utilization: currentUtil,
    missedPayments: 0,
    creditAge: 14,
    totalAccounts: userCards.length || 2,
    hardInquiries: 0,
    newAccounts: 0,
    hasLoan: false,
    debtToIncome: 25,
  };

  const [params, setParams] = useState<SimParams>(defaultParams);
  const set = (key: keyof SimParams, val: number | boolean) =>
    setParams((p) => ({ ...p, [key]: val }));

  const simulated = useMemo(() => simulateScore(baseScore, params), [baseScore, params]);
  const diff      = simulated - baseScore;
  const simLabel  = getScoreLabel(simulated);
  const baseLabel = getScoreLabel(baseScore);

  // Per-factor impact calculation
  const factorImpact = useMemo(() => {
    const base = simulateScore(baseScore, defaultParams);
    const impactOf = (key: keyof SimParams, val: number | boolean) => {
      const tweaked = { ...defaultParams, [key]: val };
      return simulateScore(baseScore, tweaked) - base;
    };
    return {
      utilization:    impactOf('utilization', params.utilization),
      missedPayments: impactOf('missedPayments', params.missedPayments),
      creditAge:      impactOf('creditAge', params.creditAge),
      totalAccounts:  impactOf('totalAccounts', params.totalAccounts),
      hardInquiries:  impactOf('hardInquiries', params.hardInquiries),
      newAccounts:    impactOf('newAccounts', params.newAccounts),
      debtToIncome:   impactOf('debtToIncome', params.debtToIncome),
    };
  }, [params, baseScore]);

  const handleReset = () => setParams(defaultParams);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
            <SlidersHorizontal size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-ink-primary">Credit Score Simulator</h3>
            <p className="text-xs text-ink-tertiary">Adjust the sliders to see how actions affect your score</p>
          </div>
        </div>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-ink-tertiary hover:text-ink-primary bg-white/[0.04] hover:bg-white/[0.08] transition-all">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Score Display: Before → After */}
      <div className="panel-glass rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">

          {/* Current Score */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest">Current</p>
            <CreditScoreDial score={baseScore} size={140} animate={false} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: baseLabel.color }}>{baseLabel.label}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('w-12 h-12 rounded-full flex items-center justify-center',
                diff > 0 ? 'bg-profit/10' : diff < 0 ? 'bg-loss/10' : 'bg-white/[0.04]')}
            >
              {diff > 0 ? <TrendingUp size={20} className="text-profit" /> :
               diff < 0 ? <TrendingDown size={20} className="text-loss" /> :
               <Minus size={20} className="text-ink-disabled" />}
            </motion.div>
            <p className={cn('text-lg font-bold tabular-nums',
              diff > 0 ? 'text-profit' : diff < 0 ? 'text-loss' : 'text-ink-disabled')}>
              {diff > 0 ? '+' : ''}{diff}
            </p>
          </div>

          {/* Simulated Score */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest">Simulated</p>
            <CreditScoreDial score={simulated} size={140} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: simLabel.color }}>{simLabel.label}</p>
            </div>
          </div>
        </div>

        {/* Mobile diff display */}
        <div className="sm:hidden flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
          {diff > 0 ? <TrendingUp size={16} className="text-profit" /> :
           diff < 0 ? <TrendingDown size={16} className="text-loss" /> :
           <Minus size={16} className="text-ink-disabled" />}
          <p className={cn('text-lg font-bold tabular-nums',
            diff > 0 ? 'text-profit' : diff < 0 ? 'text-loss' : 'text-ink-disabled')}>
            {diff > 0 ? '+' : ''}{diff} points
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-3">Adjust Factors</p>

        <SimSlider
          label="Credit Utilization" value={params.utilization} onChange={(v) => set('utilization', v)}
          min={0} max={100} unit="%" icon={PiggyBank}
          description="% of total credit limit currently used"
          color={params.utilization > 30 ? C.caution : C.profit}
        />
        <SimSlider
          label="Missed Payments" value={params.missedPayments} onChange={(v) => set('missedPayments', v)}
          min={0} max={12} icon={AlertTriangle}
          description="Missed/late payments in last 12 months"
          color={params.missedPayments > 0 ? C.loss : C.profit}
        />
        <SimSlider
          label="Credit Age" value={params.creditAge} onChange={(v) => set('creditAge', v)}
          min={1} max={120} unit="mo" icon={Clock}
          description="Average age of all credit accounts"
          color={C.steel}
        />
        <SimSlider
          label="Total Accounts" value={params.totalAccounts} onChange={(v) => set('totalAccounts', v)}
          min={1} max={15} icon={CreditCard}
          description="Total credit cards + loan accounts"
          color={C.steel}
        />
        <SimSlider
          label="Hard Inquiries" value={params.hardInquiries} onChange={(v) => set('hardInquiries', v)}
          min={0} max={10} icon={Zap}
          description="Hard credit pulls in last 6 months"
          color={params.hardInquiries >= 3 ? C.copper : C.steel}
        />
        <SimSlider
          label="New Accounts" value={params.newAccounts} onChange={(v) => set('newAccounts', v)}
          min={0} max={5} icon={RefreshCw}
          description="Accounts opened in last 6 months"
          color={params.newAccounts >= 3 ? C.copper : C.steel}
        />
        <SimSlider
          label="Debt-to-Income" value={params.debtToIncome} onChange={(v) => set('debtToIncome', v)}
          min={0} max={80} unit="%" icon={Landmark}
          description="Total debt payments vs. monthly income"
          color={params.debtToIncome > 40 ? C.loss : C.profit}
        />

        {/* Loan toggle */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-500/15">
              <Landmark size={14} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-primary">Active Loan</p>
              <p className="text-[10px] text-ink-tertiary">Having a loan improves credit mix</p>
            </div>
          </div>
          <button
            onClick={() => set('hasLoan', !params.hasLoan)}
            className={cn(
              'w-12 h-7 rounded-full p-0.5 transition-colors duration-200',
              params.hasLoan ? 'bg-brand-500' : 'bg-white/[0.08]'
            )}
          >
            <motion.div
              animate={{ x: params.hasLoan ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-3">Factor Impact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ImpactChip label="Utilization"      impact={factorImpact.utilization}    />
          <ImpactChip label="Payment History"  impact={factorImpact.missedPayments} />
          <ImpactChip label="Credit Age"       impact={factorImpact.creditAge}      />
          <ImpactChip label="Total Accounts"   impact={factorImpact.totalAccounts}  />
          <ImpactChip label="Hard Inquiries"   impact={factorImpact.hardInquiries}  />
          <ImpactChip label="New Accounts"     impact={factorImpact.newAccounts}    />
          <ImpactChip label="Debt-to-Income"   impact={factorImpact.debtToIncome}   />
        </div>
      </div>

      {/* Tips */}
      <div className="panel-glass rounded-2xl p-5">
        <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-3">Quick Tips</p>
        <div className="flex flex-col gap-2.5">
          {[
            { tip: 'Keep credit utilization below 30% for optimal scoring', show: params.utilization > 30 },
            { tip: 'Even 1 missed payment can drop your score 35+ points', show: params.missedPayments > 0 },
            { tip: 'Avoid opening 3+ new accounts in 6 months', show: params.newAccounts >= 3 },
            { tip: 'Reduce hard inquiries by applying only for cards you need', show: params.hardInquiries >= 3 },
            { tip: 'Having a mix of credit cards + loans improves your score', show: !params.hasLoan },
            { tip: 'Keep debt-to-income ratio below 40%', show: params.debtToIncome > 40 },
          ].filter((t) => t.show).map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-brand-500/[0.04] border border-brand-500/10">
              <Info size={13} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ink-secondary leading-relaxed">{t.tip}</p>
            </div>
          ))}
          {[
            { tip: 'Keep credit utilization below 30% for optimal scoring', show: params.utilization > 30 },
            { tip: 'Even 1 missed payment can drop your score 35+ points', show: params.missedPayments > 0 },
            { tip: 'Avoid opening 3+ new accounts in 6 months', show: params.newAccounts >= 3 },
            { tip: 'Reduce hard inquiries by applying only for cards you need', show: params.hardInquiries >= 3 },
            { tip: 'Having a mix of credit cards + loans improves your score', show: !params.hasLoan },
            { tip: 'Keep debt-to-income ratio below 40%', show: params.debtToIncome > 40 },
          ].every((t) => !t.show) && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-profit/[0.04] border border-profit/10">
              <CheckCircle2 size={13} className="text-profit mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ink-secondary leading-relaxed">Great job! Your current parameters are all in healthy ranges.</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-ink-disabled text-center leading-relaxed px-4">
        This is an educational simulator based on general CIBIL scoring factors. Actual scores depend on your full credit history and may differ from these estimates.
      </p>
    </div>
  );
}
