import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Search, X, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CARD_DATASET, type SpendCategory } from '../data/cardDataset';
import { BankLogo } from '../../cards/components/BankLogo';
import { POPULAR_MERCHANTS, detectCategory } from '../data/merchantMap';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { CardData } from '../../cards/types/card.types';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getRewardRateForCard(cardId: string, category: SpendCategory): number {
  // If it's one of the seed cards
  if (cardId === 'card-001') {
    if (category === 'dining') return 3;
    if (category === 'groceries') return 2;
    return 1;
  }
  if (cardId === 'card-002') {
    if (category === 'travel') return 3;
    if (category === 'subscriptions') return 1;
    return 0.5;
  }

  // Otherwise, look it up in the master dataset
  const datasetCard = CARD_DATASET.find((c) => c.id === cardId);
  if (datasetCard) {
    const r = datasetCard.rewards?.find((x) => x.category === category);
    return r ? r.rate : (datasetCard.baseRewardRate || 0.5);
  }

  return 0.5; // default fallback
}

function getBestCardForCategory(category: SpendCategory, userCards: CardData[]) {
  if (!userCards || userCards.length === 0) return null;
  let best = userCards[0];
  let bestRate = -1;

  for (const card of userCards) {
    const rate = getRewardRateForCard(card.id, category);
    if (rate > bestRate) {
      bestRate = rate;
      best = card;
    }
  }

  return { card: best, rate: bestRate };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CATEGORY WALLET OPTIMIZER
// ─────────────────────────────────────────────────────────────────────────────

const WALLET_CATEGORIES: SpendCategory[] = [
  'dining', 'travel', 'groceries', 'shopping', 'fuel', 'entertainment', 'utilities', 'transport',
];

const CATEGORY_LABELS: Record<SpendCategory, string> = {
  dining: 'Dining',
  travel: 'Travel',
  groceries: 'Groceries',
  shopping: 'Shopping',
  fuel: 'Fuel',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  transport: 'Transport',
  health: 'Health',
  subscriptions: 'Subscriptions',
  other: 'Other',
};

// Monochromatic design mappings like CRED uses, replacing standard emojis
const CATEGORY_ICONS: Record<SpendCategory, string> = {
  dining: '🍳', travel: '✈️', groceries: '🛍️', shopping: '🛒',
  fuel: '⛽', entertainment: '🎬', utilities: '⚡', transport: '🚕',
  health: '💊', subscriptions: '🎵', other: '📌',
};

function WalletOptimizerTab() {
  const userCards = useDashboardStore((s) => s.userCards);
  const addUserCard = useDashboardStore((s) => s.addUserCard);
  const profile = useDashboardStore((s) => s.profile);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Form Inputs consolidated into a single form state object
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardLimit: '',
  });
  const [formError, setFormError] = useState('');

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedTemplate(null);
    setForm({
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardLimit: '',
    });
    setFormError('');
    setSearchQuery('');
  };

  // Filter available cards to add (exclude cards user already has)
  const availableCardsToAdd = CARD_DATASET.filter(
    (c) => !userCards.some((uc) => uc.id === c.id)
  );

  const filteredCardsToAdd = availableCardsToAdd.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bank || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-ink-tertiary">Get recommended cards from your wallet for each category</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-bold text-brand-500 hover:text-brand-650 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
        >
          <Plus size={12} /> Add Card
        </button>
      </div>

      {userCards.length === 0 ? (
        <div className="text-center py-10 text-ink-tertiary border-2 border-dashed border-canvas-300 dark:border-white/[0.06] rounded-2xl bg-canvas-50/20 dark:bg-white/[0.01]">
          <p className="text-sm font-bold text-ink-primary">Your Wallet is Empty</p>
          <p className="text-xs text-ink-tertiary mt-1">Add cards to optimize your category spending.</p>
        </div>
      ) : (
        WALLET_CATEGORIES.map((cat) => {
          const result = getBestCardForCategory(cat, userCards);
          if (!result) return null;
          const { card, rate } = result;

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 panel-glass rounded-2xl shadow-ag-base p-4"
            >
              {/* Category icon */}
              <div className="w-10 h-10 rounded-xl bg-canvas-100 dark:bg-canvas-200/50 flex items-center justify-center text-lg flex-shrink-0">
                {CATEGORY_ICONS[cat]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-primary">{CATEGORY_LABELS[cat]}</p>
                <p className="text-xs text-ink-tertiary truncate">{card.label || 'Credit Card'}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-profit">{rate}%</p>
                <p className="text-[10px] text-ink-disabled">rewards</p>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Dynamic Searchable Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-glow-primary border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {!selectedTemplate ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-bold text-ink-primary">Add Card to Wallet</h3>
                    <button
                      onClick={handleCloseModal}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                      type="text"
                      placeholder="Search cards by bank or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full input-premium pl-10 py-2 text-sm"
                    />
                  </div>

                  {/* Scrollable List */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                    {filteredCardsToAdd.length === 0 ? (
                      <p className="text-sm text-ink-tertiary text-center py-8">No cards found matching search</p>
                    ) : (
                      filteredCardsToAdd.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedTemplate(c);
                            setForm({
                              cardNumber: '',
                              cardName: profile?.name || '',
                              cardExpiry: '',
                              cardLimit: c.minIncome ? String(Math.floor(c.minIncome * 0.5)) : '150000',
                            });
                          }}
                          className="w-full text-left p-3.5 rounded-2xl border border-canvas-200/40 dark:border-white/[0.03] hover:border-brand-500/20 bg-surface dark:bg-surface-muted/20 flex items-center gap-3 transition-all hover:scale-[1.01]"
                        >
                          <BankLogo bank={c.bank} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-ink-primary truncate">{c.name}</p>
                            <p className="text-xs text-ink-tertiary">{c.bank} · Fee: ₹{c.annualFee}</p>
                          </div>
                          <span className="text-[10px] font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                            Select
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-base font-display font-bold text-ink-primary">Enter Card Details</h3>
                      <p className="text-xs text-ink-tertiary">{selectedTemplate.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setFormError('');
                      }}
                      className="text-xs font-bold text-brand-500 hover:text-brand-650 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full"
                    >
                      Back
                    </button>
                  </div>

                  {/* Visual Card Preview */}
                  <div
                    className="h-28 rounded-2xl p-4 flex flex-col justify-between text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${selectedTemplate.gradientFrom}, ${selectedTemplate.gradientTo})` }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold uppercase tracking-wider">{selectedTemplate.name}</p>
                      <p className="text-[10px] font-semibold opacity-80">{selectedTemplate.network}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs tracking-widest">
                        {selectedTemplate.first4Digits || '••••'} •••• •••• {form.cardNumber ? form.cardNumber : '••••'}
                      </p>
                      <div className="flex justify-between items-end mt-1 text-[9px] opacity-75">
                        <span className="uppercase truncate max-w-[180px]">{form.cardName || 'CARDHOLDER NAME'}</span>
                        <span>{form.cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[11px] font-bold text-ink-secondary">Card Number (Last 4 Digits)</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4242"
                        value={form.cardNumber}
                        onChange={(e) => setForm(prev => ({ ...prev, cardNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                        className="input-premium py-2 px-3 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[11px] font-bold text-ink-secondary">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aditya Sinha"
                        value={form.cardName}
                        onChange={(e) => setForm(prev => ({ ...prev, cardName: e.target.value }))}
                        className="input-premium py-2 px-3 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[11px] font-bold text-ink-secondary">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="08/30"
                          value={form.cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value.length < form.cardExpiry.length) {
                              setForm(prev => ({ ...prev, cardExpiry: value }));
                              return;
                            }
                            let clean = value.replace(/[^0-9]/g, '');
                            if (clean.length > 0) {
                              const firstDigit = parseInt(clean[0], 10);
                              if (firstDigit > 1) {
                                clean = '0' + clean;
                              }
                            }
                            if (clean.length >= 2) {
                              let month = parseInt(clean.slice(0, 2), 10);
                              if (month > 12) {
                                clean = '12' + clean.slice(2);
                              } else if (month === 0) {
                                clean = '01' + clean.slice(2);
                              }
                              clean = clean.slice(0, 2) + '/' + clean.slice(2, 4);
                            }
                            setForm(prev => ({ ...prev, cardExpiry: clean.slice(0, 5) }));
                          }}
                          className="input-premium py-2 px-3 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[11px] font-bold text-ink-secondary">Credit Limit (INR)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">₹</span>
                          <input
                            type="number"
                            placeholder="e.g. 300000"
                            value={form.cardLimit}
                            onChange={(e) => setForm(prev => ({ ...prev, cardLimit: e.target.value }))}
                            className="w-full input-premium py-2 pl-7 pr-3 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {formError && <p className="text-xs font-bold text-loss">{formError}</p>}

                  <button
                    onClick={() => {
                      if (form.cardNumber.length < 4) {
                        return setFormError('Card number must be exactly 4 digits.');
                      }
                      if (!form.cardName.trim()) {
                        return setFormError('Cardholder name is required.');
                      }
                      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                      if (!expiryRegex.test(form.cardExpiry)) {
                        return setFormError('Expiry must be a valid MM/YY format (months 01-12).');
                      }
                      const [expMonthStr, expYearStr] = form.cardExpiry.split('/');
                      const expMonth = parseInt(expMonthStr, 10);
                      const expYear = 2000 + parseInt(expYearStr, 10);
                      const now = new Date();
                      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                        alert('your card is already expired');
                        return;
                      }
                      const limitNum = parseFloat(form.cardLimit);
                      if (isNaN(limitNum) || limitNum <= 0) {
                        return setFormError('Please enter a valid credit limit.');
                      }

                      addUserCard({
                        id: selectedTemplate.id,
                        pan: form.cardNumber,
                        cardholderName: form.cardName.trim(),
                        expiry: form.cardExpiry,
                        network: (selectedTemplate.network || 'visa').toLowerCase() as any,
                        bank: selectedTemplate.bank,
                        status: 'active',
                        availableCredit: limitNum * 100,
                        creditLimit: limitNum * 100,
                        label: selectedTemplate.name,
                        gradientFrom: selectedTemplate.gradientFrom,
                        gradientTo: selectedTemplate.gradientTo,
                      });
                      handleCloseModal();
                    }}
                    className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-ag-glow-primary transition-all active:scale-95"
                  >
                    Confirm & Link Card
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPI SIMULATOR TAB
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentResult {
  merchant: string;
  amount: number;
  category: SpendCategory;
  bestCardName: string;
  bestCardBank: string;
  rewardRate: number;
  rewardPoints: number;
  rewardValue: number;
  gradientFrom: string;
  gradientTo: string;
}

function UpiSimulatorTab() {
  const userCards = useDashboardStore((s) => s.userCards);

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [paid, setPaid] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!merchant.trim() || isNaN(amt) || amt <= 0) return;

    const category = detectCategory(merchant);
    const optimized = getBestCardForCategory(category, userCards);
    if (!optimized) return;

    const { card, rate } = optimized;
    const rewardPoints = Math.floor((amt / 100) * rate);

    const datasetCard = CARD_DATASET.find((c) => c.id === card.id);
    const bestCardName = datasetCard ? datasetCard.name : (card.label || 'Credit Card');
    const bestCardBank = datasetCard ? datasetCard.bank : (card.id === 'card-001' ? 'Signature' : card.id === 'card-002' ? 'Platinum' : 'RenoCred');

    setResult({
      merchant: merchant.trim(),
      amount: amt,
      category,
      bestCardName,
      bestCardBank,
      rewardRate: rate,
      rewardPoints,
      rewardValue: rewardPoints,
      gradientFrom: card.gradientFrom,
      gradientTo: card.gradientTo,
    });
    setPaid(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Quick merchant buttons */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary mb-2">Popular Merchants</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_MERCHANTS.slice(0, 8).map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => setMerchant(m.name)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150',
                merchant === m.name
                  ? 'bg-brand-500 text-white'
                  : 'bg-canvas-200/70 dark:bg-white/[0.04] text-ink-secondary hover:bg-canvas-300 dark:hover:bg-white/[0.08]'
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Merchant name"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="flex-1 px-4 py-3 bg-canvas-100 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="relative w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 pl-7 bg-canvas-100 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!merchant.trim() || !amount}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all active:scale-95',
            merchant.trim() && amount
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-ag-glow-primary active:scale-95'
              : 'bg-canvas-200 dark:bg-white/[0.03] text-ink-disabled cursor-not-allowed'
          )}
        >
          <Zap size={15} /> Find Best Card
        </button>
      </form>

      {/* Result */}
      <AnimatePresence>
        {result && !paid && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="panel-glass rounded-2xl shadow-ag-card p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-10 rounded-xl shadow-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${result.gradientFrom}, ${result.gradientTo})` }}
              />
              <div className="flex-1">
                <p className="text-xs text-ink-tertiary uppercase tracking-widest">Best card for {result.merchant}</p>
                <p className="text-base font-bold text-ink-primary">{result.bestCardBank} {result.bestCardName}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center bg-canvas-100 dark:bg-canvas-200/50 rounded-xl p-3">
                <p className="text-base font-bold text-profit">{result.rewardRate}%</p>
                <p className="text-[10px] text-ink-disabled">Reward Rate</p>
              </div>
              <div className="text-center bg-canvas-100 dark:bg-canvas-200/50 rounded-xl p-3">
                <p className="text-base font-bold text-ink-primary">{result.rewardPoints.toLocaleString()}</p>
                <p className="text-[10px] text-ink-disabled">Points Earned</p>
              </div>
              <div className="text-center bg-canvas-100 dark:bg-canvas-200/50 rounded-xl p-3">
                <p className="text-base font-bold text-brand-500 dark:text-brand-400">₹{Math.floor(result.amount * result.rewardRate / 100)}</p>
                <p className="text-[10px] text-ink-disabled">Saved</p>
              </div>
            </div>

            <button
              onClick={() => setPaid(true)}
              className="w-full bg-profit hover:bg-green-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 size={16} /> Pay ₹{result.amount.toLocaleString('en-IN')} with this card
            </button>
          </motion.div>
        )}

        {paid && (
          <motion.div
            key="paid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-profit/10 dark:bg-profit/5 border border-profit/20 rounded-2xl p-5 text-center flex flex-col items-center gap-2"
          >
            <CheckCircle2 size={32} className="text-profit" />
            <p className="font-bold text-ink-primary">Payment simulated!</p>
            <p className="text-sm text-ink-tertiary">
              You earned <strong className="text-brand-500 dark:text-brand-400">{result?.rewardPoints.toLocaleString()} points</strong> on this transaction.
            </p>
            <button
              onClick={() => {
                setResult(null);
                setPaid(false);
                setMerchant('');
                setAmount('');
              }}
              className="text-xs text-ink-tertiary hover:text-ink-secondary mt-2 transition-colors"
            >
              Simulate another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTED WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────

export function WalletOptimizerPanel() {
  return <WalletOptimizerTab />;
}

export function UpiSimulatorPanel() {
  return <UpiSimulatorTab />;
}
