import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download, ChevronLeft, ChevronRight, TrendingUp,
  Minus, ArrowUpRight, ArrowDownRight, Receipt, PiggyBank,
  CreditCard, Star,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import { CARD_DATASET } from '../../finix/data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  dining: '#FF6B6B', shopping: '#4ECDC4', travel: '#45B7D1', groceries: '#96CEB4',
  transport: '#FFEEAD', entertainment: '#D4A5A5', utilities: '#9B59B6',
  health: '#2ecc71', fuel: '#e67e22', subscriptions: '#FF9FF3', other: '#95A5A6',
};

const CATEGORY_EMOJI: Record<string, string> = {
  dining: '🍽️', shopping: '🛍️', travel: '✈️', groceries: '🛒',
  transport: '🚗', entertainment: '🎬', utilities: '💡',
  health: '🏥', fuel: '⛽', subscriptions: '📺', other: '📦',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

function formatINRFull(val: number): string {
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATA PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

function useMonthlyData(year: number, month: number) {
  const transactions   = useDashboardStore((s) => s.transactions);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const rewards        = useDashboardStore((s) => s.rewards);
  const userCards      = useDashboardStore((s) => s.userCards);
  const profile        = useDashboardStore((s) => s.profile);
  const budgets        = useDashboardStore((s) => s.budgets);

  return useMemo(() => {
    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const prevMonthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      return d.getFullYear() === py && d.getMonth() === pm;
    });

    const debits  = monthTxns.filter((t) => t.amount > 0);
    const credits = monthTxns.filter((t) => t.amount < 0);

    const totalSpend    = debits.reduce((s, t) => s + t.amount, 0) / 100;
    const totalRefunds  = Math.abs(credits.reduce((s, t) => s + t.amount, 0)) / 100;
    const netSpend      = totalSpend - totalRefunds;

    const prevDebits    = prevMonthTxns.filter((t) => t.amount > 0);
    const prevTotalSpend = prevDebits.reduce((s, t) => s + t.amount, 0) / 100;
    const spendChange   = prevTotalSpend > 0 ? ((totalSpend - prevTotalSpend) / prevTotalSpend) * 100 : 0;

    const pointsEarned  = debits.reduce((s, t) => s + (t.rewardPoints || 0), 0);
    const txnCount      = monthTxns.length;
    const avgTxn        = debits.length > 0 ? totalSpend / debits.length : 0;

    // Category breakdown
    const catMap: Record<string, { total: number; count: number }> = {};
    debits.forEach((t) => {
      const cat = t.category || 'other';
      if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
      catMap[cat].total += t.amount / 100;
      catMap[cat].count += 1;
    });

    const categories = Object.entries(catMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        pct: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
        color: CATEGORY_COLORS[name] || '#95A5A6',
        emoji: CATEGORY_EMOJI[name] || '📦',
      }))
      .sort((a, b) => b.total - a.total);

    // Card-level spend
    const cardSpend: Record<string, number> = {};
    debits.forEach((t) => {
      cardSpend[t.cardId] = (cardSpend[t.cardId] || 0) + t.amount / 100;
    });
    const cardBreakdown = Object.entries(cardSpend)
      .map(([cardId, total]) => {
        const uc = userCards.find((c) => c.id === cardId);
        const dc = CARD_DATASET.find((c) => c.id === cardId);
        return { cardId, label: uc?.label || 'Unknown', total, dc };
      })
      .sort((a, b) => b.total - a.total);

    // Top merchants
    const merchantMap: Record<string, number> = {};
    debits.forEach((t) => {
      merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount / 100;
    });
    const topMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    // Day-of-week pattern
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    debits.forEach((t) => {
      const day = new Date(t.date).getDay();
      dayTotals[day] += t.amount / 100;
    });
    const maxDayTotal = Math.max(...dayTotals, 1);

    // Budget utilization
    const budgetStatus = budgets.map((b) => ({
      category: b.category,
      limit: b.limitAmount / 100,
      spent: b.currentSpend / 100,
      pct: b.limitAmount > 0 ? Math.round((b.currentSpend / b.limitAmount) * 100) : 0,
    }));

    const totalLimit = creditAccounts.reduce((s, a) => s + a.totalLimit / 100, 0);
    const totalBal   = creditAccounts.reduce((s, a) => s + a.currentBalance / 100, 0);
    const utilization = totalLimit > 0 ? Math.round((totalBal / totalLimit) * 100) : 0;

    return {
      totalSpend, totalRefunds, netSpend, spendChange, pointsEarned,
      txnCount, avgTxn, categories, cardBreakdown, topMerchants,
      dayTotals, maxDayTotal, budgetStatus, utilization, profile,
    };
  }, [transactions, year, month, creditAccounts, rewards, userCards, profile, budgets]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof TrendingUp; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="panel-glass rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider">{label}</p>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center')} style={{ background: `${color}18` }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-display font-bold text-ink-primary tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-ink-tertiary">{sub}</p>}
    </div>
  );
}

function CategoryBar({ name, pct, total, color, emoji }: {
  name: string; pct: number; total: number; color: string; emoji: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base flex-shrink-0 w-6 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-ink-primary capitalize truncate">{name}</p>
          <p className="text-xs font-bold text-ink-primary tabular-nums flex-shrink-0 ml-2">{formatINRFull(total)}</p>
        </div>
        <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <span className="text-[10px] font-bold text-ink-tertiary tabular-nums flex-shrink-0 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null!);

  const data = useMonthlyData(year, month);

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goNext = () => {
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2, useCORS: true, allowTaint: true, logging: false,
      });
      const link = document.createElement('a');
      link.download = `spending-report-${MONTHS[month]}-${year}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Report capture failed', e);
    } finally {
      setSaving(false);
    }
  };

  const trendIcon = data.spendChange > 2
    ? { Icon: ArrowUpRight, color: 'text-loss', label: `+${Math.abs(data.spendChange).toFixed(0)}% vs last month` }
    : data.spendChange < -2
    ? { Icon: ArrowDownRight, color: 'text-profit', label: `${Math.abs(data.spendChange).toFixed(0)}% less vs last month` }
    : { Icon: Minus, color: 'text-ink-tertiary', label: 'No change vs last month' };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Month Selector ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[160px]">
            <p className="text-lg font-display font-bold text-ink-primary">{MONTHS[month]} {year}</p>
            <p className="text-[10px] text-ink-tertiary uppercase tracking-wider">{isCurrentMonth ? 'Current Month' : 'Past Month'}</p>
          </div>
          <button onClick={goNext} disabled={isCurrentMonth}
            className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all',
              isCurrentMonth ? 'bg-white/[0.02] text-ink-disabled cursor-not-allowed' : 'bg-white/[0.04] hover:bg-white/[0.08] text-ink-tertiary hover:text-ink-primary')}>
            <ChevronRight size={16} />
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}
        >
          <Download size={14} /> {saving ? 'Saving…' : 'Download Report'}
        </motion.button>
      </div>

      {/* ── Report Content ────────────────────────────────────────── */}
      <div ref={reportRef} className="flex flex-col gap-5 bg-canvas-100 dark:bg-canvas-100 rounded-3xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
          <div>
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-1">Monthly Spending Report</p>
            <p className="text-xl font-display font-bold text-ink-primary">{MONTHS[month]} {year}</p>
          </div>
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', trendIcon.color,
            data.spendChange > 2 ? 'bg-loss/10' : data.spendChange < -2 ? 'bg-profit/10' : 'bg-white/[0.04]')}>
            <trendIcon.Icon size={13} />
            {trendIcon.label}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Receipt}    label="Total Spend"    value={formatINRFull(data.totalSpend)} sub={`${data.txnCount} transactions`} color="#6366f1" />
          <StatCard icon={PiggyBank}  label="Refunds"        value={formatINRFull(data.totalRefunds)} sub={`Net: ${formatINRFull(data.netSpend)}`} color="#10b981" />
          <StatCard icon={Star}       label="Points Earned"  value={data.pointsEarned.toLocaleString()} sub={`Avg ${formatINRFull(data.avgTxn)}/txn`} color="#f59e0b" />
          <StatCard icon={CreditCard} label="Utilization"    value={`${data.utilization}%`} sub={data.utilization > 30 ? 'Above 30% target' : 'Healthy range'} color={data.utilization > 30 ? '#ef4444' : '#10b981'} />
        </div>

        {/* Category Breakdown */}
        <div className="panel-glass rounded-2xl p-5">
          <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-4">Spending by Category</p>
          <div className="flex flex-col gap-3.5">
            {data.categories.length === 0 ? (
              <p className="text-sm text-ink-tertiary text-center py-6">No transactions this month</p>
            ) : (
              data.categories.map((cat) => (
                <CategoryBar key={cat.name} {...cat} />
              ))
            )}
          </div>
        </div>

        {/* Two-Column: Card Breakdown + Top Merchants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Card Breakdown */}
          <div className="panel-glass rounded-2xl p-5">
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-4">Spend by Card</p>
            <div className="flex flex-col gap-3">
              {data.cardBreakdown.length === 0 ? (
                <p className="text-sm text-ink-tertiary text-center py-4">No card data</p>
              ) : (
                data.cardBreakdown.map(({ cardId, label, total, dc }) => (
                  <div key={cardId} className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded-md flex-shrink-0"
                      style={{ background: dc ? `linear-gradient(135deg, ${dc.gradientFrom}, ${dc.gradientTo})` : '#333' }} />
                    <p className="text-xs font-semibold text-ink-primary truncate flex-1">{label}</p>
                    <p className="text-xs font-bold text-ink-primary tabular-nums">{formatINRFull(total)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Merchants */}
          <div className="panel-glass rounded-2xl p-5">
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-4">Top Merchants</p>
            <div className="flex flex-col gap-3">
              {data.topMerchants.length === 0 ? (
                <p className="text-sm text-ink-tertiary text-center py-4">No data</p>
              ) : (
                data.topMerchants.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className={cn('w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0',
                      i === 0 ? 'bg-brand-500/15 text-brand-500' : 'bg-white/[0.04] text-ink-disabled')}>
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold text-ink-primary truncate flex-1">{m.name}</p>
                    <p className="text-xs font-bold text-ink-primary tabular-nums">{formatINRFull(m.total)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Spending Heatmap by Day of Week */}
        <div className="panel-glass rounded-2xl p-5">
          <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-4">Spending by Day of Week</p>
          <div className="flex items-end gap-2 h-24">
            {data.dayTotals.map((total, i) => {
              const pct = data.maxDayTotal > 0 ? (total / data.maxDayTotal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[9px] font-bold text-ink-tertiary tabular-nums">{total > 0 ? formatINR(total) : '–'}</p>
                  <div className="w-full relative" style={{ height: 60 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                      style={{ background: pct > 70 ? '#6366f1' : pct > 40 ? '#8b5cf6' : 'rgba(99,102,241,0.3)' }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-ink-tertiary">{DAY_LABELS[i]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Status */}
        {data.budgetStatus.length > 0 && (
          <div className="panel-glass rounded-2xl p-5">
            <p className="text-[10px] font-black text-ink-disabled uppercase tracking-widest mb-4">Budget Status</p>
            <div className="flex flex-col gap-3">
              {data.budgetStatus.map((b) => (
                <div key={b.category} className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0 w-6 text-center">{CATEGORY_EMOJI[b.category] || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-ink-primary capitalize">{b.category}</p>
                      <p className="text-[10px] font-bold text-ink-tertiary">{formatINRFull(b.spent)} / {formatINRFull(b.limit)}</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(b.pct, 100)}%`,
                        backgroundColor: b.pct >= 100 ? '#ef4444' : b.pct >= 80 ? '#f59e0b' : '#10b981',
                      }} />
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-bold tabular-nums w-8 text-right',
                    b.pct >= 100 ? 'text-loss' : b.pct >= 80 ? 'text-amber-500' : 'text-profit')}>
                    {b.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span style={{ fontSize: 9, color: 'white', fontWeight: 900 }}>R</span>
            </div>
            <span className="text-[11px] font-bold text-ink-disabled">RenoCred</span>
          </div>
          <span className="text-[11px] text-ink-disabled">Generated {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
