import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Star,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
  Utensils,
  ShoppingBag,
  Plane,
  ShoppingCart,
  Fuel,
  Film,
  Zap,
  HeartPulse,
  Car,
  Music,
  Tag,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import {
  recommendCards,
  CATEGORIES_LIST,
  type UserProfile,
  type RecommendedCard,
} from '../lib/recommendEngine';
import type { SpendCategory } from '../data/cardDataset';

function formatINR(val: number) {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

const BANK_APPLY_URLS: Record<string, string> = {
  'HDFC':    'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  'SBI':     'https://www.sbicard.com/en/apply-now.page',
  'ICICI':   'https://www.icicibank.com/card/credit-cards',
  'Axis':    'https://www.axisbank.com/retail/cards/credit-card',
  'Kotak':   'https://www.kotak.com/en/personal-banking/cards/credit-cards.html',
  'AMEX':    'https://www.americanexpress.com/in/credit-cards/',
  'RBL':     'https://www.rblbank.com/credit-cards',
  'IndusInd':'https://www.indusind.com/in/en/personal/cards/credit-card.html',
  'YES':     'https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards',
  'BOB':     'https://www.bankofbaroda.in/personal-banking/digital-products/cards/credit-cards',
  'HSBC':    'https://www.hsbc.co.in/credit-cards/',
  'Citi':    'https://www.online.citibank.co.in/products-services/credit-cards/credit-cards.htm',
  'SC':      'https://www.sc.com/in/credit-cards/',
  'IOB':     'https://www.iob.in/Credit-Card',
  'PNB':     'https://www.pnbcard.in/',
  'AU':      'https://www.aubank.in/personal-banking/credit-card',
  'Federal': 'https://www.federalbank.co.in/credit-card',
  'IDFC':    'https://www.idfcfirstbank.com/credit-card',
  'OneCard': 'https://www.getonecard.app/',
  'Uni':     'https://www.uni.cards/',
};

function getApplyUrl(bank: string): string | null {
  return BANK_APPLY_URLS[bank] || null;
}

const CATEGORY_ICONS: Record<string, any> = {
  dining: Utensils,
  shopping: ShoppingBag,
  travel: Plane,
  groceries: ShoppingCart,
  fuel: Fuel,
  entertainment: Film,
  utilities: Zap,
  health: HeartPulse,
  transport: Car,
  subscriptions: Music,
  other: Tag
};

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining & Food',
  shopping: 'Online Shopping',
  travel: 'Travel & Flights',
  groceries: 'Groceries',
  fuel: 'Fuel',
  entertainment: 'Entertainment',
  utilities: 'Utilities & Bills',
  health: 'Health & Medical',
  transport: 'Cab & Transport',
  subscriptions: 'Subscriptions',
  other: 'Other'
};

// ─────────────────────────────────────────────────────────────────────────────
//  RESULT CARD WITH DYNAMIC ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  card,
  rank,
  income,
  cibil,
  categories,
  wantsLounge
}: {
  card: RecommendedCard;
  rank: number;
  income: number;
  cibil: number;
  categories: SpendCategory[];
  wantsLounge: boolean;
}) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.35 }}
      className="panel-glass rounded-2xl shadow-ag-card p-5 flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-start gap-3">
        {/* Color chip */}
        <div
          className="w-12 h-9 rounded-xl flex-shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-ink-primary truncate">{card.name}</p>
            {rank === 0 && (
              <span className="flex items-center gap-1 bg-caution/10 text-caution text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0">
                <Star size={8} fill="currentColor" /> Best Match
              </span>
            )}
          </div>
          <p className="text-xs text-ink-tertiary mt-0.5">{card.bank} · {card.network}</p>
        </div>
        {/* Match % */}
        <div className="flex-shrink-0 text-right">
          <p className="text-base font-bold text-brand-500">{card.matchPercent}%</p>
          <p className="text-[10px] text-ink-disabled">match</p>
        </div>
      </div>

      {/* Match bar */}
      <div className="w-full h-1.5 bg-canvas-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${card.matchPercent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: rank * 0.1 }}
        />
      </div>

      {/* Key info */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-canvas-100 dark:bg-canvas-200/50 rounded-xl">
          <p className="text-[10px] text-ink-disabled uppercase tracking-wider">Annual Fee</p>
          <p className="text-xs font-bold text-ink-primary mt-0.5">
            {card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee}`}
          </p>
        </div>
        <div className="text-center p-2 bg-canvas-100 dark:bg-canvas-200/50 rounded-xl">
          <p className="text-[10px] text-ink-disabled uppercase tracking-wider">Welcome Bonus</p>
          <p className="text-xs font-bold text-ink-primary mt-0.5 truncate" title={card.welcomeBonus || 'None'}>
            {card.welcomeBonus || 'None'}
          </p>
        </div>
        <div className="text-center p-2 bg-canvas-100 dark:bg-canvas-200/50 rounded-xl">
          <p className="text-[10px] text-ink-disabled uppercase tracking-wider">Lounge Access</p>
          <p className="text-xs font-bold text-ink-primary mt-0.5">
            {card.loungeAccess && card.loungeAccess > 0 ? `${card.loungeAccess}/yr` : 'No'}
          </p>
        </div>
      </div>

      {/* Accordion Toggle */}
      <button
        onClick={() => setShowWhy((v) => !v)}
        className="flex items-center justify-between text-xs font-bold text-ink-secondary hover:text-ink-primary transition-colors bg-canvas-100 dark:bg-canvas-200/30 px-3.5 py-2.5 rounded-xl border border-canvas-200/60 dark:border-white/[0.03] mt-1"
      >
        <span>Why this card?</span>
        {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {showWhy && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden bg-brand-500/[0.01] border border-brand-500/10 dark:border-brand-500/5 rounded-xl p-3.5 mt-0.5 flex flex-col gap-2.5 text-xs leading-relaxed text-ink-secondary"
          >
            {/* Eligibility checks */}
            <div className="flex flex-col gap-1.5 pb-2 border-b border-canvas-200/40 dark:border-white/[0.03]">
              <p className="font-semibold text-ink-primary">Profile Requirements Match:</p>
              <div className="flex items-center justify-between">
                <span>CIBIL Score (Req: {card.minCibil || 700}+, Your: {cibil})</span>
                <span className={cn('font-bold', cibil >= (card.minCibil || 700) ? 'text-profit' : 'text-loss')}>
                  {cibil >= (card.minCibil || 700) ? 'Eligible' : 'Low Score'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Income (Req: {formatINR(card.minIncome || 0)}+, Your: {formatINR(income)})</span>
                <span className={cn('font-bold', income >= (card.minIncome || 0) ? 'text-profit' : 'text-loss')}>
                  {income >= (card.minIncome || 0) ? 'Eligible' : 'Below Minimum'}
                </span>
              </div>
            </div>

            {/* Spend Reward Fit */}
            <div>
              <p className="font-semibold text-ink-primary mb-1">Spend Category Benefits:</p>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => {
                  const reward = card.rewards.find((r) => r.category === cat);
                  const rate = reward ? reward.rate : card.baseRewardRate;
                  return (
                    <div key={cat} className="flex justify-between items-center text-[11px]">
                      <span>{CATEGORY_LABELS[cat] || cat}</span>
                      <span className="font-bold text-profit">{rate}% rewards</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Surcharges & Highlights */}
            {card.highlights && card.highlights.length > 0 && (
              <div className="pt-2 border-t border-canvas-200/40 dark:border-white/[0.03]">
                <p className="font-semibold text-ink-primary mb-1">Key Highlights:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {card.highlights.map((h, idx) => (
                    <span key={idx} className="bg-canvas-200/60 dark:bg-white/[0.03] text-ink-tertiary px-2 py-0.5 rounded text-[10px] font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Travel / Lounge Fit */}
            {wantsLounge && card.loungeAccess && card.loungeAccess > 0 && (
              <div className="bg-profit/5 border border-profit/20 rounded-lg p-2 flex items-center gap-2 mt-1 text-profit font-semibold">
                <Star size={12} fill="currentColor" /> Meets your lounge access requirement!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Now Button */}
      {getApplyUrl(card.bank) && (
        <a
          href={getApplyUrl(card.bank)!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full btn-primary py-2.5 flex items-center justify-center gap-2 shadow-ag-glow-primary active:scale-[0.98]"
        >
          Apply Now <ExternalLink size={14} />
        </a>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function RecommenderPanel() {
  const profile = useDashboardStore((s) => s.profile);
  const userSalary = profile?.salary || 1500000;
  const userCibil = profile?.creditScore || 750;

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [wantsLounge, setWantsLounge] = useState(false);
  const [results, setResults] = useState<RecommendedCard[]>([]);

  // Blog modal state
  const [showBlog, setShowBlog] = useState(false);

  const toggleCategory = useCallback((cat: SpendCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].slice(0, 4)
    );
  }, []);

  function handleSubmit() {
    const userProfile: UserProfile = {
      annualIncome: userSalary,
      cibilScore: userCibil,
      topCategories: categories,
      maxAnnualFee: 0, // no limit
      wantsLounge,
    };
    setResults(recommendCards(userProfile));
    setStep(1);
  }

  function reset() {
    setStep(0);
    setCategories([]);
    setWantsLounge(false);
    setResults([]);
  }

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {/* STEP 0 — Categories & Preferences */}
        {step === 0 && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5 text-left"
          >
            {/* Onboarding Summary Profile Banner */}
            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Analyzing For Profile</p>
                <p className="text-sm font-semibold text-ink-primary mt-0.5">
                  Income: {formatINR(userSalary)}/yr · Credit Score: {userCibil}
                </p>
              </div>
              <button 
                onClick={() => setShowBlog(true)}
                type="button"
                className="text-xs font-bold text-brand-500 hover:text-brand-650 bg-brand-500/10 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 flex-shrink-0"
              >
                <BookOpen size={12} /> CIBIL Guide
              </button>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-ink-primary">Where do you spend most?</h3>
              <p className="text-sm text-ink-tertiary mt-1">Pick up to 4 categories (priority order matters).</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES_LIST.map(({ value, label }) => {
                const isSelected = categories.includes(value);
                const rank = categories.indexOf(value);
                const IconComponent = CATEGORY_ICONS[value] || Tag;

                return (
                  <button
                    key={value}
                    onClick={() => toggleCategory(value)}
                    className={cn(
                      'p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 border text-left',
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-brand-500/20'
                        : 'bg-surface/85 dark:bg-surface/40 hover:bg-canvas-200/50 dark:hover:bg-white/[0.02] border-canvas-200/60 dark:border-white/[0.04] text-ink-secondary'
                    )}
                  >
                    <IconComponent
                      size={18}
                      className={cn(
                        'flex-shrink-0 transition-colors',
                        isSelected ? 'text-brand-500' : 'text-ink-tertiary'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-snug truncate">{label}</p>
                      {isSelected && (
                        <p className="text-[10px] text-brand-400 font-bold mt-0.5">Priority #{rank + 1}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preferences */}
            <div className="flex flex-col gap-3 pt-2 border-t border-canvas-200/60 dark:border-white/[0.04]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">I want lounge access</p>
                  <p className="text-xs text-ink-tertiary">Airport lounge visits</p>
                </div>
                <button
                  onClick={() => setWantsLounge((v) => !v)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                    wantsLounge ? 'bg-brand-500' : 'bg-canvas-300'
                  )}
                >
                  <motion.div
                    animate={{ x: wantsLounge ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-5 h-5 rounded-full bg-white shadow absolute top-0.5"
                  />
                </button>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={categories.length === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-full transition-all duration-150 active:scale-95 mt-2',
                categories.length > 0
                  ? 'btn-primary shadow-ag-glow-primary'
                  : 'bg-canvas-200 text-ink-disabled cursor-not-allowed'
              )}
            >
              Find My Cards <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* STEP 1 — Results */}
        {step === 1 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-ink-primary">Your Matches</h3>
                <p className="text-sm text-ink-tertiary">{results.length} cards ranked for your profile</p>
              </div>
              <button
                onClick={reset}
                className="text-xs font-semibold text-brand-500 hover:text-brand-650 bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full transition-colors"
              >
                Redo
              </button>
            </div>
            {results.map((card, i) => (
              <ResultCard
                key={card.id}
                card={card}
                rank={i}
                income={userSalary}
                cibil={userCibil}
                categories={categories}
                wantsLounge={wantsLounge}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credit Blog Modal */}
      <AnimatePresence>
        {showBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 border-b border-canvas-200/50 dark:border-white/[0.04] pb-3">
                <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="text-brand-500" size={18} /> Credit Health Guide
                </h3>
                <button
                  onClick={() => setShowBlog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Blog Content */}
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-ink-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>. A higher score represents lower risk to credit card issuers and loan providers, unlocking premium card approvals, higher limits, and lower interest rates.
                  </p>
                </div>

                <div className="bg-canvas-100 dark:bg-canvas-200/50 rounded-2xl p-4 border border-canvas-200/40">
                  <h5 className="font-bold text-ink-primary text-xs uppercase tracking-wider mb-2">CIBIL Score Ranges</h5>
                  <ul className="flex flex-col gap-1.5 text-xs">
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-loss">Below 650: Poor</span>
                      <span className="text-ink-tertiary">Difficult to get approved</span>
                    </li>
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-caution">650 - 699: Average</span>
                      <span className="text-ink-tertiary">Limited/Entry-level cards only</span>
                    </li>
                    <li className="flex justify-between border-b border-canvas-200/60 pb-1">
                      <span className="font-semibold text-brand-500">700 - 749: Good</span>
                      <span className="text-ink-tertiary">Easy approval for standard cards</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-profit">750 - 900: Excellent</span>
                      <span className="text-ink-tertiary">Qualifies for premium, high-reward cards</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-ink-primary text-base">How to Check Your Score</h4>
                  <p className="mt-1">
                    You can pull your official credit report directly from CIBIL (www.cibil.com) or download apps that offer free soft pulls (like RenoCred, Experian, or CRIF). Free soft checks do not hurt your credit rating.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-ink-primary text-base">5 Rules to Build an Excellent Credit Score</h4>
                  <ol className="list-decimal pl-4 flex flex-col gap-2 mt-2">
                    <li>
                      <strong>Pay All Bills on Time:</strong> Repayment history accounts for 35% of your score. Even a single delay of 30 days can drop your score significantly.
                    </li>
                    <li>
                      <strong>Keep Credit Utilization Low:</strong> Try not to spend more than 30% of your total credit limit on any card. If your limit is ₹1 Lakh, keep outstanding balances below ₹30,000.
                    </li>
                    <li>
                      <strong>Maintain a Healthy Credit Age:</strong> Keep your oldest credit card active. The longer your history, the more reliable you appear to lenders.
                    </li>
                    <li>
                      <strong>Mix Secure and Unsecure Debt:</strong> A healthy combination of unsecured credit (like credit cards) and secured credit (like home/car loans) benefits your rating.
                    </li>
                    <li>
                      <strong>Avoid Spamming Applications:</strong> Every card or loan application triggers a "hard inquiry". Multiple inquiries in a short window signal credit-hunger and drop your score.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-canvas-200/50 dark:border-white/[0.04] text-center">
                <button
                  onClick={() => setShowBlog(false)}
                  className="btn-primary active:scale-95"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecommenderPanel;
