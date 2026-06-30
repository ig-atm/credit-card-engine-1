import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  CIBIL PANEL (PORTED FROM CIBIL_SERVICE)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  good:    { text: 'text-profit',   bg: 'bg-profit/10',   border: 'border-profit/20'  },
  warning: { text: 'text-caution',  bg: 'bg-caution/10',  border: 'border-caution/20' },
  bad:     { text: 'text-loss',     bg: 'bg-loss/10',     border: 'border-loss/20'    },
};

function getCibilLabel(score: number): { label: string; color: string } {
  if (score >= 800) return { label: 'Excellent', color: '#129A6D' };
  if (score >= 750) return { label: 'Very Good', color: '#129A6D' };
  if (score >= 700) return { label: 'Good', color: '#D9931E' };
  if (score >= 650) return { label: 'Fair', color: '#D9931E' };
  return { label: 'Poor', color: '#D94556' };
}

export function CibilPanel() {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);

  const cibilScore = profile?.creditScore || 750;
  const { label, color } = getCibilLabel(cibilScore);
  const pct = ((cibilScore - 300) / 600) * 100; // 300–900 range

  // Dynamic calculations
  const totalLimit = creditAccounts.reduce((acc, a) => acc + a.totalLimit, 0);
  const totalBalance = creditAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const utilizationPct = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

  const cibilFactors = [
    {
      label: 'Payment History',
      description: userCards.length > 0 
        ? '100% of bills paid on time across your active cards'
        : 'No payment history on record. Add cards to begin building history.',
      weight: 35,
      status: userCards.length > 0 ? ('good' as const) : ('warning' as const),
      icon: CheckCircle2,
    },
    {
      label: 'Credit Utilization',
      description: userCards.length > 0
        ? `Using ${utilizationPct}% of total available limit (₹${(totalLimit/100).toLocaleString('en-IN')})`
        : '0% credit utilization. No credit cards active.',
      weight: 30,
      status: utilizationPct > 30 ? ('warning' as const) : ('good' as const),
      icon: utilizationPct > 30 ? AlertTriangle : CheckCircle2,
      note: utilizationPct > 30 ? 'Target: below 30%' : undefined,
    },
    {
      label: 'Credit Age',
      description: userCards.length > 0
        ? 'Average credit age: 1.2 years'
        : 'No active accounts on profile.',
      weight: 15,
      status: userCards.length > 0 ? ('good' as const) : ('warning' as const),
      icon: CheckCircle2,
    },
    {
      label: 'Credit Mix',
      description: userCards.length > 0
        ? `${userCards.length} credit card(s) active — no active loans`
        : 'No active credit accounts on record.',
      weight: 15,
      status: userCards.length > 0 ? ('good' as const) : ('warning' as const),
      icon: Info,
    },
    {
      label: 'New Inquiries',
      description: '0 hard inquiries in last 6 months',
      weight: 5,
      status: 'good' as const,
      icon: CheckCircle2,
    },
  ];

  // SVG arc gauge
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = -210;
  const sweepAngle = 240;
  const angleRad = (a: number) => (a * Math.PI) / 180;
  const arcPath = (pctFill: number) => {
    const a = startAngle + pctFill * sweepAngle / 100;
    const x1 = cx + radius * Math.cos(angleRad(startAngle));
    const y1 = cy + radius * Math.sin(angleRad(startAngle));
    const x2 = cx + radius * Math.cos(angleRad(a));
    const y2 = cy + radius * Math.sin(angleRad(a));
    const large = sweepAngle * (pctFill / 100) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="180" height="130" viewBox="0 0 180 130" aria-label={`CIBIL score: ${cibilScore}`}>
            {/* Track */}
            <path
              d={arcPath(100)}
              fill="none"
              stroke="currentColor"
              className="text-canvas-300 dark:text-white/[0.08]"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fill */}
            <motion.path
              d={arcPath(pct)}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {/* Score text */}
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              fontSize="28"
              fontWeight="700"
              className="fill-ink-primary"
              fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            >
              {cibilScore}
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" fontSize="11" fill={color} fontWeight="600">
              {label}
            </text>
          </svg>
        </div>
        <div className="flex items-center gap-6 text-xs text-ink-disabled">
          <span>300</span>
          <div className="flex-1 text-center text-ink-tertiary text-xs">TransUnion CIBIL</div>
          <span>900</span>
        </div>
      </div>

      {/* Eligibility chips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Basic Cards', eligible: true },
          { label: 'Premium Cards', eligible: cibilScore >= 720 },
          { label: 'Super Premium', eligible: cibilScore >= 800 },
        ].map(({ label: l, eligible }) => (
          <div
            key={l}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-2xl border text-center',
              eligible 
                ? 'border-profit/25 bg-profit/5' 
                : 'border-canvas-200/60 dark:border-white/[0.04] bg-canvas-50/50 dark:bg-white/[0.02]',
            )}
          >
            {eligible
              ? <CheckCircle2 size={16} className="text-profit" />
              : <Minus size={16} className="text-ink-disabled" />}
            <p className={cn('text-xs font-semibold', eligible ? 'text-profit' : 'text-ink-disabled')}>{l}</p>
          </div>
        ))}
      </div>

      {/* Factors */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary">Score Factors</p>
        {cibilFactors.map((factor) => {
          const styles = STATUS_STYLES[factor.status];
          const Icon = factor.icon;
          return (
            <motion.div
              key={factor.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'rounded-2xl border p-4 flex items-start gap-3 backdrop-blur-sm',
                styles.bg,
                factor.status === 'good' 
                  ? 'border-profit/20' 
                  : 'border-caution/20',
              )}
            >
              <Icon size={16} className={cn('flex-shrink-0 mt-0.5', styles.text)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-primary">{factor.label}</p>
                  <span className="text-[10px] text-ink-disabled">{factor.weight}%</span>
                </div>
                <p className="text-xs text-ink-tertiary mt-0.5">{factor.description}</p>
                {factor.note && (
                  <p className={cn('text-xs font-medium mt-1', styles.text)}>{factor.note}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BILL TRACKER PANEL (PORTED FROM BILLS_SERVICE)
// ─────────────────────────────────────────────────────────────────────────────

type BillStatus = 'safe' | 'warning' | 'urgent';

interface Bill {
  id: string;
  merchant: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  category: string;
  emoji: string;
  cardName: string;
}

const BILL_STATUS_STYLES: Record<BillStatus, { badge: string; border: string; bg: string }> = {
  safe:    { badge: 'bg-profit/10 text-profit',   border: 'border-profit/20',   bg: 'bg-profit/5'   },
  warning: { badge: 'bg-caution/10 text-caution', border: 'border-caution/20',  bg: 'bg-caution/5'  },
  urgent:  { badge: 'bg-loss/10 text-loss',       border: 'border-loss/20',     bg: 'bg-loss/5'     },
};

const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  safe: 'Upcoming', warning: 'Due Soon', urgent: 'Overdue',
};

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Check } from 'lucide-react';

interface PayBillModalProps {
  bill: Bill;
  onClose: () => void;
}

function PayBillModal({ bill, onClose }: PayBillModalProps) {
  const payBill = useDashboardStore((s) => s.payBill);
  const userCards = useDashboardStore((s) => s.userCards);
  const card = userCards.find((c) => c.id === bill.id);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [payAmount, setPayAmount] = useState(String(bill.amount));
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'debit'>('upi');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        // Perform payBill store dispatch
        const amtCents = Math.round(parseFloat(payAmount) * 100);
        payBill({ cardId: bill.id, amount: amtCents });
        setStep(3);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (amt > bill.amount) {
      setError(`Amount cannot exceed the total outstanding of ₹${bill.amount.toLocaleString('en-IN')}.`);
      return;
    }
    setError(null);
    setStep(2);
  };

  const pointsEarned = Math.floor(parseFloat(payAmount) * 0.1); // Mock 10% points back on bill payment value

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 1 ? onClose : undefined}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-sm bg-canvas-50 dark:bg-[#1a1d21] rounded-[2rem] p-6 shadow-2xl border border-canvas-200/40 dark:border-white/[0.06] overflow-hidden flex flex-col text-left"
        style={{
          boxShadow: '0 10px 50px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        {step === 1 && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-display font-bold text-ink-primary">Pay Credit Card Bill</h3>
              <p className="text-[11px] text-ink-tertiary">Safe & secure instant settlement</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Step 1: Confirmation */}
        {step === 1 && (
          <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
            {/* Visual card summary */}
            {card && (
              <div
                className="h-24 rounded-2xl p-4 flex flex-col justify-between text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})` }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold uppercase tracking-wider">{card.label || 'Credit Card'}</p>
                  <p className="text-[9px] font-semibold opacity-80 uppercase">{card.network}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="font-mono text-xs tracking-widest">•••• •••• •••• {card.pan.slice(-4)}</p>
                  <div className="text-right">
                    <p className="text-[8px] text-white/60 uppercase">Due Date</p>
                    <p className="text-[10px] font-bold">
                      {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Editable Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">Payment Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => { setPayAmount(e.target.value); setError(null); }}
                  className="w-full input-premium pl-8 pr-4 py-2.5 font-display font-extrabold text-base text-ink-primary"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setPayAmount(String(bill.amount))}
                className="text-[10px] text-brand-500 hover:text-brand-600 font-semibold self-end mt-0.5"
              >
                Pay Full Outstanding (₹{bill.amount.toLocaleString('en-IN')})
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">Select Payment Method</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'upi', label: 'UPI / GooglePay / PhonePe', detail: 'Instant Settlement' },
                  { id: 'netbanking', label: 'Net Banking', detail: 'Direct from bank account' },
                  { id: 'debit', label: 'Debit Card', detail: 'Visa, Mastercard, RuPay' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left flex justify-between items-center transition-all',
                      paymentMethod === m.id
                        ? 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-500/10'
                        : 'border-canvas-200/60 dark:border-white/[0.03] hover:bg-canvas-100 dark:hover:bg-white/[0.01]'
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold text-ink-primary">{m.label}</p>
                      <p className="text-[9px] text-ink-disabled">{m.detail}</p>
                    </div>
                    {paymentMethod === m.id && (
                      <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-loss font-semibold">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-95 mt-2"
            >
              Pay Securely ₹{parseFloat(payAmount || '0').toLocaleString('en-IN')}
            </button>
          </form>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="animate-spin text-brand-500" size={36} />
            <div>
              <p className="text-sm font-bold text-ink-primary">Verifying Payment</p>
              <p className="text-xs text-ink-disabled mt-1 max-w-[200px] mx-auto">Connecting to bank servers via secure SSL channel...</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-profit bg-profit/5 px-3 py-1 rounded-full border border-profit/15 mt-2">
              <ShieldCheck size={12} /> SECURE 256-BIT ENCRYPTION
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="w-14 h-14 rounded-full bg-profit flex items-center justify-center text-white shadow-lg"
            >
              <Check size={30} strokeWidth={3} />
            </motion.div>
            
            <div>
              <p className="text-lg font-display font-extrabold text-ink-primary">Payment Successful!</p>
              <p className="text-xs text-ink-tertiary mt-1">₹{parseFloat(payAmount).toLocaleString('en-IN')} paid towards {bill.cardName}</p>
            </div>

            {/* Reward Points Box */}
            <div className="w-full bg-brand-50/30 dark:bg-brand-500/[0.04] border border-brand-500/10 rounded-2xl p-4 flex flex-col items-center gap-1 mt-2">
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">renocred cashback rewards</p>
              <p className="text-2xl font-display font-bold text-profit">+{pointsEarned.toLocaleString()}</p>
              <p className="text-[10px] text-ink-disabled">Reward Points credited to your ledger</p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 bg-ink-primary hover:bg-ink-secondary text-canvas-50 dark:text-canvas-200 font-semibold text-xs py-2.5 rounded-full transition-all active:scale-95"
            >
              Done & Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function BillTrackerPanel() {
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const userCards = useDashboardStore((s) => s.userCards);

  // Modal State
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  // Construct bills dynamically from active credit cards with outstanding balances
  const userBills: Bill[] = [];
  userCards.forEach((card) => {
    const account = creditAccounts.find((a) => a.cardId === card.id);
    if (account && account.currentBalance > 0) {
      const dateStr = account.paymentDueDate.includes('T')
        ? account.paymentDueDate.split('T')[0]
        : account.paymentDueDate;

      userBills.push({
        id: card.id,
        merchant: `${card.label || 'Credit Card'} Card Due`,
        amount: account.currentBalance / 100, // Rupees
        dueDate: dateStr,
        status: 'safe',
        category: 'Credit Card',
        emoji: '💳',
        cardName: card.label || 'Credit Card',
      });
    }
  });

  if (userBills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-canvas-200/60 dark:bg-canvas-300/20 flex items-center justify-center mb-5 shadow-ag-base text-ink-disabled text-2xl">
          💳
        </div>
        <p className="text-sm font-display font-bold text-ink-secondary mb-1">No upcoming bills</p>
        <p className="text-xs text-ink-tertiary max-w-[240px] leading-relaxed">
          When you have cards with outstanding balances, your bills will automatically show up here.
        </p>
      </div>
    );
  }

  const totalDue = userBills.reduce((s, b) => s + b.amount, 0);
  const urgentCount = userBills.filter((b) => b.status === 'urgent').length;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel-glass rounded-2xl shadow-ag-base p-4">
          <p className="text-xs text-ink-tertiary uppercase tracking-widest">Total Due</p>
          <p className="text-2xl font-display font-bold text-ink-primary mt-1">
            ₹{totalDue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className={cn(
          'panel-glass rounded-2xl shadow-ag-base p-4',
          urgentCount > 0 ? 'bg-loss/5 border border-loss/20 dark:bg-loss/10' : '',
        )}>
          <p className="text-xs text-ink-tertiary uppercase tracking-widest">Urgent</p>
          <p className={cn(
            'text-2xl font-display font-bold mt-1',
            urgentCount > 0 ? 'text-loss' : 'text-profit',
          )}>
            {urgentCount} bill{urgentCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bills list */}
      <div className="flex flex-col gap-2">
        {userBills.map((bill, i) => {
          const styles = BILL_STATUS_STYLES[bill.status];
          return (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'panel-glass rounded-2xl p-4 flex items-center gap-3',
                bill.status === 'urgent' ? 'border-loss/20' : bill.status === 'warning' ? 'border-caution/20' : 'border-profit/20'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-canvas-100 dark:bg-canvas-200/50 flex items-center justify-center text-lg flex-shrink-0 shadow-ag-base">
                {bill.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-primary truncate">{bill.merchant}</p>
                  <span className={cn('flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full', styles.badge)}>
                    {BILL_STATUS_LABELS[bill.status]}
                  </span>
                </div>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {bill.cardName}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-ink-primary whitespace-nowrap">
                  ₹{bill.amount.toLocaleString('en-IN')}
                </p>
                <button
                  type="button"
                  onClick={() => setPayingBill(bill)}
                  className="text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-3.5 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Pay Now
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bill payment modal */}
      <AnimatePresence>
        {payingBill && (
          <PayBillModal
            bill={payingBill}
            onClose={() => setPayingBill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SPEND TREND CHART
// ─────────────────────────────────────────────────────────────────────────────

function SpendTrendChart({ debits }: { debits: any[] }) {
  // Compute real data for the last 7 days
  const data = Array(7).fill(0);
  const now = new Date();
  // Strip time for accurate day difference
  now.setHours(0, 0, 0, 0);
  
  debits.forEach(t => {
    const d = new Date(t.date);
    d.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // if within last 7 days (0 to 6)
    if (diffDays >= 0 && diffDays < 7) {
      // index 6 is today, index 0 is 7 days ago
      const index = 6 - diffDays;
      data[index] += t.amount / 100;
    }
  });
  
  // If max is 0, give it a tiny value so chart still renders a flat line
  const max = Math.max(...data, 100);
  const min = 0;
  
  const width = 300;
  const height = 100;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * (height - 20) - 10;
    return `${x},${y}`;
  });
  
  const pathData = `M 0,${height} ` + points.map((p, i) => {
    if (i === 0) return `L ${p}`;
    const prev = points[i - 1].split(',');
    const curr = p.split(',');
    const cp1x = parseFloat(prev[0]) + (parseFloat(curr[0]) - parseFloat(prev[0])) / 2;
    return `C ${cp1x},${prev[1]} ${cp1x},${curr[1]} ${curr[0]},${curr[1]}`;
  }).join(' ');

  return (
    <div className="panel-glass rounded-2xl shadow-ag-base p-5">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary mb-1">Spend Trend</p>
          <p className="text-lg font-bold text-ink-primary">Last 7 Days</p>
        </div>
      </div>
      <div className="relative w-full h-[100px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--brand-500))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(var(--brand-500))" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <motion.path
            d={`${pathData} L ${width},${height} Z`}
            fill="url(#trendGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          
          <motion.path
            d={pathData.replace(`M 0,${height} L`, 'M')}
            fill="none"
            stroke="currentColor"
            className="text-brand-500"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min)) * (height - 20) - 10;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className="fill-white dark:fill-canvas-50 stroke-brand-500 cursor-pointer"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                whileHover={{ scale: 1.8 }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INSIGHTS PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function InsightsPanel() {
  const transactions = useDashboardStore((s) => s.transactions) || [];
  const rewards = useDashboardStore((s) => s.rewards) || { cycleEarnings: 0 };

  const debits = transactions.filter((t) => t.type === 'debit');
  const totalSpend = debits.reduce((acc, t) => acc + t.amount, 0);

  if (debits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-canvas-200/60 dark:bg-canvas-300/20 flex items-center justify-center mb-5 shadow-ag-base text-ink-disabled text-2xl">
          📊
        </div>
        <p className="text-sm font-display font-bold text-ink-secondary mb-1">No spend insights yet</p>
        <p className="text-xs text-ink-tertiary max-w-[245px] leading-relaxed">
          Perform a transaction or pay bills on your cards to view categories analysis and smart credit nudges.
        </p>
      </div>
    );
  }

  // Group by categories
  let diningSum = 0;
  let shoppingSum = 0;
  let travelSum = 0;
  let subSum = 0;
  let otherSum = 0;

  debits.forEach((t) => {
    if (t.category === 'dining') diningSum += t.amount;
    else if (t.category === 'shopping') shoppingSum += t.amount;
    else if (t.category === 'travel') travelSum += t.amount;
    else if (t.category === 'subscriptions') subSum += t.amount;
    else otherSum += t.amount;
  });

  const getPct = (sum: number) => {
    if (totalSpend === 0) return 0;
    return Math.round((sum / totalSpend) * 100);
  };

  const dynamicBreakdown = [
    { category: 'Dining',        amount: diningSum / 100, pct: getPct(diningSum), color: '#F97316' },
    { category: 'Shopping',      amount: shoppingSum / 100, pct: getPct(shoppingSum), color: '#EC4899' },
    { category: 'Travel',        amount: travelSum / 100, pct: getPct(travelSum), color: '#0EA5E9' },
    { category: 'Subscriptions', amount: subSum / 100, pct: getPct(subSum), color: '#8B5CF6' },
    { category: 'Other',         amount: otherSum / 100, pct: getPct(otherSum), color: '#9CA3AF' },
  ];

  const total = totalSpend / 100;

  // Generate dynamic nudges based on active spending categories
  const dynamicNudges = [];
  if (diningSum > 0) {
    dynamicNudges.push({
      emoji: '🍳',
      title: 'Dining Rewards Tip',
      desc: `You spent ₹${(diningSum/100).toLocaleString('en-IN')} on dining. A card like Swiggy HDFC can yield up to 5% cash back here.`,
    });
  }
  if (shoppingSum > 0) {
    dynamicNudges.push({
      emoji: '🛒',
      title: 'Shopping Rewards Tip',
      desc: `You spent ₹${(shoppingSum/100).toLocaleString('en-IN')} on online shopping. Consider Amazon Pay ICICI card for 5% cashback.`,
    });
  }
  if (travelSum > 0) {
    dynamicNudges.push({
      emoji: '✈️',
      title: 'Travel Rewards Tip',
      desc: `You spent ₹${(travelSum/100).toLocaleString('en-IN')} on travel. Axis Atlas rewards you with 3x Edge Miles.`,
    });
  }
  if (dynamicNudges.length === 0) {
    dynamicNudges.push({
      emoji: '🎯',
      title: 'Build your profile',
      desc: 'Add cards and simulate transactions to receive custom spending and rewards recommendations.',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Spend breakdown */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary mb-3">This Month's Spend</p>
        {/* Stacked bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex gap-px mb-3">
          {dynamicBreakdown.map((item) => (
            <motion.div
              key={item.category}
              style={{ backgroundColor: item.color }}
              initial={{ flex: 0 }}
              animate={{ flex: item.pct }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full"
            />
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {dynamicBreakdown.map((item) => (
            <div key={item.category} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <p className="text-sm text-ink-secondary flex-1">{item.category}</p>
              <p className="text-xs text-ink-tertiary">{item.pct}%</p>
              <p className="text-sm font-semibold text-ink-primary w-20 text-right">
                ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
          <div className="flex items-center pt-2 border-t border-canvas-200/60 dark:border-white/[0.04]">
            <p className="text-sm font-bold text-ink-primary flex-1">Total</p>
            <p className="text-sm font-bold text-ink-primary">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel-glass rounded-2xl shadow-ag-base p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-profit/10 dark:bg-profit/20 flex items-center justify-center flex-shrink-0">
            <TrendingDown size={16} className="text-profit" />
          </div>
          <div>
            <p className="text-xs text-ink-tertiary">vs last month</p>
            <p className="text-sm font-bold text-profit">0%</p>
          </div>
        </div>
        <div className="panel-glass rounded-2xl shadow-ag-base p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-brand-500" />
          </div>
          <div>
            <p className="text-xs text-ink-tertiary">Rewards earned</p>
            <p className="text-sm font-bold text-brand-500">₹{rewards.cycleEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <SpendTrendChart debits={debits} />



      {/* Smart nudges */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary mb-3">Smart Nudges</p>
        <div className="flex flex-col gap-3">
          {dynamicNudges.map((nudge, i) => (
            <motion.div
              key={nudge.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="panel-glass rounded-2xl shadow-ag-base p-4 flex items-start gap-3"
            >
              <span className="text-xl flex-shrink-0">{nudge.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-ink-primary">{nudge.title}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">{nudge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
