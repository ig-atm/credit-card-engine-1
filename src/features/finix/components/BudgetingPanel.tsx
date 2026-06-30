import { motion } from 'framer-motion';
import { Target, ShieldCheck, HeartPulse, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { cn, formatCents } from '../../../lib/utils';
import type { TransactionCategory } from '../../dashboard/types/dashboard.types';
import { useState } from 'react';

export function BudgetingPanel() {
  const budgets = useDashboardStore((s) => s.budgets) || [];
  const creditAccounts = useDashboardStore((s) => s.creditAccounts) || [];
  const transactions = useDashboardStore((s) => s.transactions) || [];
  const addBudget = useDashboardStore((s) => s.addBudget);
  const deleteBudget = useDashboardStore((s) => s.deleteBudget);
  const updateBudgetLimit = useDashboardStore((s) => s.updateBudgetLimit);

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [customCategory, setCustomCategory] = useState<TransactionCategory>('other');
  const [customAmountStr, setCustomAmountStr] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editAmountStr, setEditAmountStr] = useState('');

  const PRESET_BUDGETS: { category: TransactionCategory; label: string; defaultLimit: number }[] = [
    { category: 'groceries', label: 'Groceries', defaultLimit: 2000000 }, // ₹20k
    { category: 'dining', label: 'Dining out', defaultLimit: 1000000 },
    { category: 'shopping', label: 'Shopping', defaultLimit: 1500000 },
    { category: 'travel', label: 'Travel', defaultLimit: 3000000 },
    { category: 'entertainment', label: 'Entertainment', defaultLimit: 500000 },
  ];

  const handleAddBudget = (category: TransactionCategory, limitAmount: number) => {
    addBudget({
      id: `budget-${Date.now()}`,
      category,
      limitAmount,
      currentSpend: 0,
      period: 'monthly'
    });
    setShowAddBudget(false);
    setIsCustomBudget(false);
    setCustomAmountStr('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = Math.floor(parseFloat(customAmountStr) * 100);
    if (!isNaN(amountInCents) && amountInCents > 0) {
      handleAddBudget(customCategory, amountInCents);
    }
  };

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
            <div className="w-24 h-24 relative flex items-center justify-center rounded-full shadow-inner">
              <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-canvas-200 dark:text-white/5" />
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * healthScore) / 100} className={cn("transition-all duration-1000 ease-out", healthColor)} strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center relative z-10">
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <Target size={16} className="text-brand-500" />
            Category Budgets
          </h3>
          <button 
            onClick={() => setShowAddBudget(true)}
            className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
          >
            + Add Budget
          </button>
        </div>
        
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
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink-primary">{formatCents(dynamicSpend)}</p>
                      {editingBudgetId === budget.id ? (
                        <input
                          type="number"
                          value={editAmountStr}
                          onChange={(e) => setEditAmountStr(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const amt = parseFloat(editAmountStr);
                              if (!isNaN(amt) && amt > 0) {
                                updateBudgetLimit(budget.id, Math.floor(amt * 100));
                              }
                              setEditingBudgetId(null);
                            } else if (e.key === 'Escape') {
                              setEditingBudgetId(null);
                            }
                          }}
                          onBlur={() => {
                            const amt = parseFloat(editAmountStr);
                            if (!isNaN(amt) && amt > 0) {
                              updateBudgetLimit(budget.id, Math.floor(amt * 100));
                            }
                            setEditingBudgetId(null);
                          }}
                          autoFocus
                          className="w-20 text-[10px] py-0.5 px-1 mt-0.5 bg-canvas-200 dark:bg-canvas-300 rounded outline-none border border-brand-500/50 text-ink-primary text-right"
                        />
                      ) : (
                        <p className="text-[10px] text-ink-tertiary font-medium">of {formatCents(budget.limitAmount)}</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === budget.id ? null : budget.id)}
                        className="p-1.5 rounded-full text-ink-tertiary hover:bg-canvas-200 dark:hover:bg-white/5 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {activeMenuId === budget.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full mt-1 w-32 bg-canvas-50 dark:bg-canvas-300 rounded-xl shadow-ag-modal border border-canvas-200/50 dark:border-white/10 z-50 overflow-hidden flex flex-col"
                          >
                            <button
                              onClick={() => {
                                setEditAmountStr(String(budget.limitAmount / 100));
                                setEditingBudgetId(budget.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-semibold text-ink-primary hover:bg-canvas-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={13} /> Edit Limit
                            </button>
                            <button
                              onClick={() => {
                                deleteBudget(budget.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-semibold text-loss hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </div>
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

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-ink-primary">Add a Budget</h3>
              <button 
                onClick={() => {
                  setShowAddBudget(false);
                  setIsCustomBudget(false);
                }} 
                className="w-8 h-8 rounded-full bg-canvas-100 dark:bg-white/5 flex items-center justify-center text-ink-tertiary hover:text-ink-primary"
              >
                ✕
              </button>
            </div>

            {isCustomBudget ? (
              <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-ink-primary">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as TransactionCategory)}
                    className="w-full bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 rounded-xl px-4 py-3 text-ink-primary text-sm focus:outline-none focus:border-brand-500/50 transition-colors capitalize"
                  >
                    {['dining', 'travel', 'groceries', 'entertainment', 'utilities', 'shopping', 'health', 'transport', 'subscriptions', 'other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-ink-primary">Limit Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 5000"
                    value={customAmountStr}
                    onChange={(e) => setCustomAmountStr(e.target.value)}
                    required
                    className="w-full bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 rounded-xl px-4 py-3 text-ink-primary text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomBudget(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-ink-secondary bg-canvas-100 dark:bg-white/5 hover:bg-canvas-200 dark:hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
                  >
                    Add Budget
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-ink-secondary mb-2">Popular Options:</p>
              {PRESET_BUDGETS.map((preset) => (
                <button
                  key={preset.category}
                  onClick={() => handleAddBudget(preset.category, preset.defaultLimit)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 hover:border-brand-500/30 transition-all text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-ink-primary">{preset.label}</p>
                    <p className="text-xs text-ink-tertiary">Default Limit: {formatCents(preset.defaultLimit)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                    +
                  </div>
                </button>
              ))}

                <button
                  onClick={() => setIsCustomBudget(true)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 hover:border-brand-500/30 transition-all text-left mt-2"
                >
                  <div>
                    <p className="text-sm font-bold text-ink-primary">Other (Custom)</p>
                    <p className="text-xs text-ink-tertiary">Set your own category and limit</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-canvas-200 dark:bg-white/10 flex items-center justify-center text-ink-secondary">
                    →
                  </div>
                </button>
            </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
