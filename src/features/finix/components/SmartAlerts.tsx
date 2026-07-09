import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Target,
  CreditCard,
  TrendingUp,
  X,
  Sparkles,
  Bell,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  ALERT TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SmartAlert {
  id: string;
  type: 'warning' | 'milestone' | 'tip' | 'insight';
  title: string;
  message: string;
  icon: typeof AlertTriangle;
  targetTab?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ALERT GENERATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function generateAlerts(state: {
  subscriptions: any[];
  milestones: any[];
  transactions: any[];
  userCards: any[];
  rewards: any;
  budgets: any[];
}): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Subscription price hikes
  (state.subscriptions || [])
    .filter((s: any) => s.hasPriceHike && s.status === 'active')
    .forEach((s: any) => {
      const increase = s.previousAmount
        ? `₹${((s.amount - s.previousAmount) / 100).toFixed(0)}`
        : '';
      alerts.push({
        id: `hike-${s.id}`,
        type: 'warning',
        title: `${s.name} Price Hike`,
        message: `${s.name} increased by ${increase}/month. Review if this subscription is still worth it.`,
        icon: AlertTriangle,
        targetTab: 'perks',
      });
    });

  // 2. Milestones almost reached (>80% progress)
  (state.milestones || []).forEach((m: any) => {
    const pct = m.targetAmount > 0 ? m.currentAmount / m.targetAmount : 0;
    if (pct >= 0.8 && pct < 1) {
      const remaining = ((m.targetAmount - m.currentAmount) / 100).toLocaleString('en-IN');
      alerts.push({
        id: `mile-${m.id}`,
        type: 'milestone',
        title: `Almost There: ${m.title}`,
        message: `You're ₹${remaining} away from unlocking "${m.rewardValue}". Keep going!`,
        icon: Target,
        targetTab: 'perks',
      });
    }
  });

  // 3. Budget alerts (over 90% of limit)
  (state.budgets || []).forEach((b: any) => {
    if (b.limitAmount > 0 && b.currentSpend / b.limitAmount >= 0.9) {
      const pct = Math.round((b.currentSpend / b.limitAmount) * 100);
      alerts.push({
        id: `budget-${b.id}`,
        type: 'warning',
        title: `${b.category.charAt(0).toUpperCase() + b.category.slice(1)} Budget Alert`,
        message: `You've used ${pct}% of your ${b.category} budget this month. Consider slowing down.`,
        icon: TrendingUp,
        targetTab: 'analyze',
      });
    }
  });

  // 4. Reward tier insight
  if (state.rewards && state.rewards.pointsToNextTier > 0) {
    const pts = state.rewards.pointsToNextTier;
    const currentTier = state.rewards.tier;
    alerts.push({
      id: 'tier-up',
      type: 'tip',
      title: 'Tier Upgrade Available',
      message: `Earn ${pts.toLocaleString()} more points to upgrade from ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} tier. Use your dining cards for 3x multiplier!`,
      icon: Sparkles,
      targetTab: 'perks',
    });
  }

  // 5. Multiple cards tip
  if ((state.userCards || []).length >= 2) {
    alerts.push({
      id: 'multi-card',
      type: 'insight',
      title: 'Optimize Your Wallet',
      message: `You have ${state.userCards.length} cards. Check the Wallet Optimizer to always use the best card for each category.`,
      icon: CreditCard,
      targetTab: 'wallet',
    });
  }

  return alerts;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLE MAP
// ─────────────────────────────────────────────────────────────────────────────

const ALERT_STYLES: Record<SmartAlert['type'], { bg: string; iconBg: string; iconColor: string; border: string }> = {
  warning:   { bg: 'bg-amber-500/[0.04]',  iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-500',  border: 'border-amber-500/10' },
  milestone: { bg: 'bg-brand-500/[0.04]',   iconBg: 'bg-brand-500/10',  iconColor: 'text-brand-500',  border: 'border-brand-500/10' },
  tip:       { bg: 'bg-purple-500/[0.04]',  iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', border: 'border-purple-500/10' },
  insight:   { bg: 'bg-blue-500/[0.04]',    iconBg: 'bg-blue-500/10',   iconColor: 'text-blue-500',   border: 'border-blue-500/10' },
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SmartAlerts() {
  const subscriptions = useDashboardStore((s) => s.subscriptions) || [];
  const milestones    = useDashboardStore((s) => s.milestones) || [];
  const transactions  = useDashboardStore((s) => s.transactions) || [];
  const userCards     = useDashboardStore((s) => s.userCards) || [];
  const rewards       = useDashboardStore((s) => s.rewards);
  const budgets       = useDashboardStore((s) => s.budgets) || [];

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const allAlerts = generateAlerts({ subscriptions, milestones, transactions, userCards, rewards, budgets });
  const visibleAlerts = allAlerts.filter((a) => !dismissed.has(a.id));

  // Adjust index if an alert is dismissed and we are out of bounds

  useEffect(() => {
    if (currentIndex >= visibleAlerts.length) {
      setCurrentIndex(Math.max(0, visibleAlerts.length - 1));
    }
  }, [visibleAlerts.length, currentIndex]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (visibleAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAlerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibleAlerts.length]);

  if (visibleAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-canvas-200 dark:bg-white/[0.04] flex items-center justify-center">
          <Bell size={18} className="text-ink-disabled" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-primary">All caught up!</p>
          <p className="text-xs text-ink-tertiary mt-0.5">No new alerts to show.</p>
        </div>
      </div>
    );
  }

  const currentAlert = visibleAlerts[currentIndex];
  if (!currentAlert) return null;

  const style = ALERT_STYLES[currentAlert.type];
  const Icon = currentAlert.icon;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-brand-500" />
          <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Smart Alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {visibleAlerts.length > 1 && (
            <div className="flex gap-1 items-center">
              {visibleAlerts.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentIndex ? "bg-brand-500" : "bg-canvas-300 dark:bg-white/10"
                  )}
                />
              ))}
            </div>
          )}
          <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full ml-1">
            {visibleAlerts.length}
          </span>
        </div>
      </div>
      
      <div className="relative flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={cn("flex items-start gap-3 w-full", currentAlert.targetTab && "cursor-pointer hover:opacity-80 transition-opacity")}
            onClick={() => {
              if (currentAlert.targetTab) {
                window.dispatchEvent(new CustomEvent('NAVIGATE_TAB', { detail: currentAlert.targetTab }));
              }
            }}
          >
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', style.iconBg)}>
              <Icon size={14} className={style.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink-primary leading-tight line-clamp-2">{currentAlert.title}</p>
              <p className="text-[11px] text-ink-secondary leading-snug mt-1 line-clamp-3">{currentAlert.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDismissed((prev) => new Set(prev).add(currentAlert.id));
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-ink-disabled hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04] flex-shrink-0 transition-colors -mr-1"
            >
              <X size={12} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
