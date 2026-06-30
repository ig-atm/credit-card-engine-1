import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Gift, CreditCard, Tag, ArrowRight, ShieldAlert, Plane, Hotel, Star, Sparkles, Percent, Calendar, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { cn, formatCents } from '../../../lib/utils';
import { BankLogo } from '../../cards/components/BankLogo';

const PARTNERS = [
  { id: 'vistara', name: 'Club Vistara', type: 'airline', ratio: 0.5, icon: Plane, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'marriott', name: 'Marriott Bonvoy', type: 'hotel', ratio: 1, icon: Hotel, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { id: 'singapore', name: 'KrisFlyer', type: 'airline', ratio: 0.4, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
];

export function PerksDashboard() {
  const rawOffers = useDashboardStore((s) => s.offers) || [];
  const rawMilestones = useDashboardStore((s) => s.milestones) || [];
  const rawSubscriptions = useDashboardStore((s) => s.subscriptions) || [];
  const userCards = useDashboardStore((s) => s.userCards) || [];
  const rewards = useDashboardStore((s) => s.rewards) || { totalPoints: 0, redeemedPoints: 0 };
  const transactions = useDashboardStore((s) => s.transactions) || [];
  
  // Strictly link to user's actual cards
  const milestones = rawMilestones.filter(m => userCards.some(c => c.id === m.cardId));
  const subscriptions = rawSubscriptions.filter(s => userCards.some(c => c.id === s.cardId));
  const offers = rawOffers.filter(o => o.eligibleCardIds?.some(id => userCards.some(c => c.id === id)));

  const availablePoints = (rewards.totalPoints || 0) - (rewards.redeemedPoints || 0);

  const [selectedPartner, setSelectedPartner] = useState(PARTNERS[0]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Aggregated data
  const monthlySubs = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
    .reduce((acc, s) => acc + s.amount, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* ── HERO METRICS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rewards Summary */}
        <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Star size={16} fill="currentColor" />
              </div>
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">Total Rewards</span>
            </div>
            <p className="text-4xl font-display font-bold text-ink-primary tracking-tight">
              {availablePoints.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-ink-tertiary mt-1">Available points</p>
          </div>
        </motion.div>

        {/* Offers Summary */}
        <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-profit/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-profit/10 flex items-center justify-center text-profit">
                <Tag size={16} />
              </div>
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">Active Deals</span>
            </div>
            <p className="text-4xl font-display font-bold text-ink-primary tracking-tight">
              {offers.length}
            </p>
            <p className="text-sm font-medium text-ink-tertiary mt-1">High-value merchant offers</p>
          </div>
        </motion.div>

        {/* Subscriptions Summary */}
        <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-copper-500/10 flex items-center justify-center text-copper-500">
                <CreditCard size={16} />
              </div>
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">Monthly Subs</span>
            </div>
            <p className="text-4xl font-display font-bold text-ink-primary tracking-tight">
              {formatCents(monthlySubs)}
            </p>
            <p className="text-sm font-medium text-ink-tertiary mt-1">Across all cards</p>
          </div>
        </motion.div>
      </div>

      {/* ── BENTO GRID LAYOUT ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN (Wider on Desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Active Milestones */}
          <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <Target size={16} className="text-brand-500" />
              Progress Milestones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map((m) => {
                const card = userCards.find(c => c.id === m.cardId);
                const recentSpend = transactions
                  .filter(t => t.type === 'debit' && t.cardId === m.cardId && !t.pending)
                  .reduce((sum, t) => sum + t.amount, 0);
                  
                const dynamicAmount = m.currentAmount + recentSpend;
                const progress = Math.min(100, (dynamicAmount / m.targetAmount) * 100);
                const isCompleted = progress >= 100;
                
                return (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 p-4 rounded-2xl relative overflow-hidden transition-colors",
                      isCompleted && "bg-brand-50/50 dark:bg-brand-500/5 border-brand-500/20"
                    )}
                  >
                    {isCompleted && (
                      <div className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                        <Sparkles size={10} />
                        ACHIEVED
                      </div>
                    )}
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-canvas-200 dark:bg-canvas-300 flex items-center justify-center shrink-0 shadow-inner">
                        {card ? <BankLogo bank={card.bank} /> : <Gift size={18} className="text-brand-500"/>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-primary leading-tight">{m.title}</p>
                        <p className="text-xs font-semibold text-brand-500 mt-0.5">{m.rewardValue}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-wider">
                        <span className="text-ink-secondary">{formatCents(dynamicAmount)}</span>
                        <span className="text-ink-tertiary">{formatCents(m.targetAmount)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-canvas-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full relative",
                            isCompleted ? "bg-brand-500" : "bg-gradient-to-r from-brand-400 to-brand-600"
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Hyper Local Offers */}
          <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <Tag size={16} className="text-profit" />
                Curated Card Offers
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.slice(0, 4).map((offer) => {
                return (
                  <motion.div
                    key={offer.id}
                    whileHover={{ y: -4 }}
                    className="bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    {offer.discountPercentage >= 15 && (
                      <div className="absolute top-0 right-0 bg-profit text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-xl z-10 flex items-center gap-1">
                        <Percent size={10} />
                        HOT
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-bold shadow-md shrink-0 text-sm">
                        {offer.merchantName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-primary leading-tight">{offer.merchantName}</p>
                        <p className="text-[10px] text-ink-tertiary uppercase tracking-wider mt-0.5">{offer.category}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-ink-secondary leading-snug mb-3">
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-ink-tertiary uppercase tracking-wider mt-auto pt-3 border-t border-canvas-200/50 dark:border-white/[0.04]">
                      <span className="flex items-center gap-1"><Calendar size={12}/> Ends {formatDate(offer.validUntil)}</span>
                      <span className="flex items-center gap-1 text-brand-500">Redeem <ExternalLink size={10}/></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* Transfer Calculator */}
          <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6">
            <h3 className="text-sm font-bold text-ink-primary mb-4 flex items-center gap-2">
              <Plane size={16} className="text-blue-500" />
              Transfer Value
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {PARTNERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPartner(p)}
                  className={cn(
                    "flex-1 px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                    selectedPartner.id === p.id 
                      ? "bg-brand-500 text-white shadow-md" 
                      : "bg-canvas-100 dark:bg-canvas-300 text-ink-secondary hover:bg-canvas-200 dark:hover:bg-canvas-400"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPartner.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn("rounded-2xl p-5 flex flex-col items-center justify-center text-center", selectedPartner.bg)}
              >
                <div className={cn("w-12 h-12 rounded-full bg-white dark:bg-black/20 flex items-center justify-center mb-3 shadow-sm", selectedPartner.color)}>
                  <selectedPartner.icon size={20} />
                </div>
                <p className="text-3xl font-display font-bold text-ink-primary">
                  {Math.floor(availablePoints * selectedPartner.ratio).toLocaleString()}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mt-1">
                  {selectedPartner.type === 'airline' ? 'Miles' : 'Points'}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Subscriptions Radar */}
          <motion.div variants={itemVariants} className="panel-glass rounded-3xl p-6 flex-1">
            <h3 className="text-sm font-bold text-ink-primary mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-copper-500" />
              Upcoming Renewals
            </h3>
            
            <div className="flex flex-col gap-3">
              {subscriptions.slice(0, 5).map((sub) => {
                const card = userCards.find(c => c.id === sub.cardId);
                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-2xl bg-canvas-100 dark:bg-white/[0.02] border border-canvas-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-ink-primary">{sub.name}</p>
                          {sub.hasPriceHike && <ShieldAlert size={12} className="text-red-500" />}
                        </div>
                        <p className="text-[10px] font-semibold text-ink-tertiary uppercase tracking-wider mt-0.5">
                          {formatDate(sub.nextBillingDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink-primary">{formatCents(sub.amount)}</p>
                      <p className="text-[9px] font-bold text-ink-tertiary uppercase tracking-wider">{sub.billingCycle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
