import { motion } from 'framer-motion';
import { Target, ShieldCheck, HeartPulse } from 'lucide-react';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { cn, formatCents } from '../../../lib/utils';

export function BudgetingPanel() {
  const budgets = useDashboardStore((s) => s.budgets) || [];
  const creditAccounts = useDashboardStore((s) => s.creditAccounts) || [];
  const transactions = useDashboardStore((s) => s.transactions) || [];

  // Calculate overall credit utilization
  const totalLimit = creditAccounts.reduce((acc, a) => acc + a.totalLimit, 0);
  const totalBalance = creditAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  // Gamified Health Score
  let healthScore = 100;
  if (utilization > 30) healthScore -= (utilization - 30) * 1.5;
  if (utilization > 50) healthScore -= 20;
  if (healthScore < 0) healthScore = 0;
  
  let healthColor = 'text-profit';
  let healthBg = 'bg-profit/10';
  let healthText = 'Excellent';
  if (healthScore < 70) {
    healthColor = 'text-copper-500';
    healthBg = 'bg-copper-500/10';
    healthText = 'Good';
  }
  if (healthScore < 40) {
    healthColor = 'text-red-500';
    healthBg = 'bg-red-500/10';
    healthText = 'Needs Attention';
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Gamified Health Score */}
      <div className="panel-glass rounded-3xl p-6 relative overflow-hidden border-gradient-animated">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-canvas-200 dark:border-white/5 flex items-center justify-center relative shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="44" cy="44" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-canvas-200 dark:text-white/5 translate-x-1 translate-y-1" />
                <circle cx="44" cy="44" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * healthScore) / 100} className={cn("transition-all duration-1000 ease-out translate-x-1 translate-y-1", healthColor)} strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-display font-bold text-ink-primary">{Math.round(healthScore)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-ink-primary flex items-center justify-center md:justify-start gap-2 mb-1">
              <HeartPulse size={18} className={healthColor} />
              Credit Health Score
            </h3>
            <p className="text-sm text-ink-tertiary mb-3">
              Your credit utilization is at <span className="font-semibold text-ink-primary">{utilization.toFixed(1)}%</span>.
              Keeping it under 30% improves your score!
            </p>
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", healthBg, healthColor)}>
              <ShieldCheck size={12} />
              {healthText}
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div>
        <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
          <Target size={16} className="text-brand-500" />
          Category Budgets
        </h3>
        
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => {
            // Sync budget progress with actual recent spend in this category
            const recentSpend = transactions
              .filter(t => t.type === 'debit' && t.category === budget.category && !t.pending)
              .reduce((sum, t) => sum + t.amount, 0);
              
            const dynamicSpend = budget.currentSpend + recentSpend;
            const progress = Math.min(100, (dynamicSpend / budget.limitAmount) * 100);
            const isNearLimit = progress > 85;
            const isOverLimit = progress >= 100;
            
            let barColor = 'bg-brand-500';
            if (isNearLimit) barColor = 'bg-copper-500';
            if (isOverLimit) barColor = 'bg-red-500';

            return (
              <motion.div
                key={budget.id}
                whileHover={{ scale: 1.01 }}
                className="panel-glass p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-canvas-200 dark:bg-white/[0.04] flex items-center justify-center text-ink-secondary capitalize">
                      {budget.category.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-primary capitalize">{budget.category}</p>
                      <p className="text-[10px] text-ink-tertiary uppercase tracking-wider">{budget.period}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink-primary">{formatCents(dynamicSpend)}</p>
                    <p className="text-[10px] text-ink-tertiary font-medium">of {formatCents(budget.limitAmount)}</p>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-canvas-200 dark:bg-white/5 rounded-full overflow-hidden mt-1 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", barColor)}
                  />
                </div>
                
                {isNearLimit && !isOverLimit && (
                  <p className="text-[10px] text-copper-500 font-semibold mt-1">
                    Approaching your limit!
                  </p>
                )}
                {isOverLimit && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    You have exceeded your budget.
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
