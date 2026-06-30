import './index.css';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TrendingUp,
  Gift,
  CreditCard,
  Zap,
  FileText,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Plus,
  X,
  Search,
  Trash2,
  Info,
  Target,
  Tag,
} from 'lucide-react';

import { DashboardLayout } from './components/layout/DashboardLayout';
import type { TabId } from './components/layout/Sidebar';

import { ActiveCard } from './features/cards/components/ActiveCard';
import { TransactionFeed } from './features/dashboard/components/TransactionFeed';
import { useDashboardStore } from './features/dashboard/store/dashboardStore';
import { cn, formatCents } from './lib/utils';

// Finix features
import { TaqdeerPanel } from './features/finix/components/TaqdeerPanel';
import { RecommenderPanel } from './features/finix/components/RecommenderPanel';
import { WalletOptimizerPanel, UpiSimulatorPanel } from './features/finix/components/WalletUpiPanels';
import { CibilPanel, BillTrackerPanel, InsightsPanel } from './features/finix/components/FinixPanels';
import { LoginScreen } from './features/dashboard/components/LoginScreen';
import { ProfileTab } from './features/dashboard/components/ProfileTab';
import { CARD_DATASET } from './features/finix/data/cardDataset';
import { BankLogo } from './features/cards/components/BankLogo';
import { CardBenefitsSheet } from './features/cards/components/CardBenefitsSheet';
import { PerksDashboard } from './features/finix/components/PerksDashboard';
import { BudgetingPanel } from './features/finix/components/BudgetingPanel';



// ─────────────────────────────────────────────────────────────────────────────
//  TIME-AWARE GREETING
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6)  return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET & INSIGHTS TAB TYPES
// ─────────────────────────────────────────────────────────────────────────────

type WalletTabId = 'optimizer' | 'upi' | 'bills';
type InsightsTabId = 'insights' | 'cibil' | 'budget';

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE CONTAINER — reusable wrapper for sub-pages
// ─────────────────────────────────────────────────────────────────────────────

function PageContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-ink-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-tertiary mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STAT PANEL — reusable dashboard metric card
// ─────────────────────────────────────────────────────────────────────────────

function StatPanel({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  glowColor,
  children,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: typeof TrendingUp;
  iconBg: string;
  iconColor: string;
  glowColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'panel-glass rounded-2xl p-5 flex flex-col justify-between h-44',
        'cursor-pointer group',
      )}
      style={glowColor ? {
        boxShadow: `0 2px 12px 0 ${glowColor}`,
      } : undefined}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-secondary">{label}</p>
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          'transition-transform duration-300 group-hover:scale-110',
          iconBg,
        )}>
          <Icon size={17} strokeWidth={2.2} className={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-ink-primary tabular-nums tracking-tight">
          {value}
        </p>
        <p className="text-xs font-medium text-ink-tertiary mt-1">
          {subtext}
        </p>
        {children}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOME TAB
// ─────────────────────────────────────────────────────────────────────────────

function HomeTab() {
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const activeCardId   = useDashboardStore((s) => s.activeCardId);
  const setActiveCard  = useDashboardStore((s) => s.setActiveCard);
  const rewards        = useDashboardStore((s) => s.rewards);
  const userCards      = useDashboardStore((s) => s.userCards);
  const addUserCard    = useDashboardStore((s) => s.addUserCard);
  const deleteUserCard = useDashboardStore((s) => s.deleteUserCard);
  const profile        = useDashboardStore((s) => s.profile);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // State for card deletion
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deleteCardLabel, setDeleteCardLabel] = useState<string>('');

  // State for card benefits sheet
  const [benefitsCardId, setBenefitsCardId] = useState<string | null>(null);

  // Form Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardNameInput, setCardNameInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardCvvInput, setCardCvvInput] = useState('');
  const [cardLimitInput, setCardLimitInput] = useState('');
  const [formError, setFormError] = useState('');

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedTemplate(null);
    setCardNumber('');
    setCardNameInput('');
    setCardExpiryInput('');
    setCardCvvInput('');
    setCardLimitInput('');
    setFormError('');
    setSearchQuery('');
  };

  const activeCard     = userCards.find((c) => c.id === activeCardId) || userCards[0];
  const activeAccount  = creditAccounts.find((a) => a.cardId === activeCardId);
  const liveBalance    = activeAccount ? activeAccount.currentBalance : 0;
  const availablePoints = rewards.totalPoints - rewards.redeemedPoints;

  const availableCardsToAdd = CARD_DATASET.filter(
    (mc) => !userCards.some((uc) => uc.id === mc.id)
  );

  const filteredCardsToAdd = availableCardsToAdd.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-ink-tertiary text-xs font-semibold tracking-[0.2em] uppercase mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-gradient-brand">
          Your renocred Dashboard
        </h1>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left column: cards + stat panels + wallet optimizer */}
        <div className="flex flex-col gap-8">
          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {userCards.map((card) => {
              const account = creditAccounts.find((a) => a.cardId === card.id);
              const cardWithLiveCredit = {
                ...card,
                creditLimit:     account ? account.totalLimit : card.creditLimit,
                availableCredit: account
                  ? Math.max(0, account.totalLimit - account.currentBalance)
                  : card.availableCredit,
              };
              const isActive = activeCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => setActiveCard(card.id)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex flex-col gap-3 cursor-pointer transition-all duration-300 rounded-3xl p-3',
                    isActive
                      ? 'opacity-100 ring-2 ring-brand-500/50 ring-offset-2 ring-offset-canvas-100 dark:ring-offset-canvas-50 bg-surface/30'
                      : 'opacity-60 hover:opacity-85',
                  )}
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-tertiary flex items-center gap-1.5 truncate max-w-[120px]">
                      {card.label || 'Credit Card'}
                      {isActive && (
                        <motion.span
                          layoutId="card-active-dot"
                          className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0"
                        />
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {formatCents(cardWithLiveCredit.availableCredit)} avail.
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBenefitsCardId(card.id);
                        }}
                        className="text-ink-disabled hover:text-brand-500 p-1 rounded-full hover:bg-canvas-200 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center font-bold text-xs"
                        title="Card Benefits Info"
                        style={{ width: '22px', height: '22px' }}
                      >
                        <Info size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCardId(card.id);
                          setDeleteCardLabel(card.label || 'Credit Card');
                        }}
                        className="text-ink-disabled hover:text-loss p-1 rounded-full hover:bg-canvas-200 dark:hover:bg-white/[0.04] transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <ActiveCard card={cardWithLiveCredit} revealed={false} />
                </motion.div>
              );
            })}

            {/* Visual dashed Card Placeholder for adding cards */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className={cn(
                'flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 rounded-[2rem] p-6 h-56 border-2 border-dashed border-canvas-300 dark:border-white/[0.06] bg-canvas-50/20 dark:bg-white/[0.01] hover:border-brand-500/50 hover:bg-brand-500/[0.02]',
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-canvas-200 dark:bg-canvas-300/40 flex items-center justify-center text-ink-secondary">
                <Plus size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-ink-primary">Add Credit Card</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Link a card to optimize spends</p>
              </div>
            </motion.div>
          </div>

          {/* ── Stat panels ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatPanel
              label="Outstanding"
              value={formatCents(liveBalance)}
              subtext={activeCard ? `On ${activeCard.label} card` : 'No active card'}
              icon={TrendingUp}
              iconBg="bg-brand-50 dark:bg-brand-500/10"
              iconColor="text-brand-500"
            />

            <StatPanel
              label="Reward Points"
              value={availablePoints.toLocaleString()}
              subtext={`${rewards.tier.charAt(0).toUpperCase() + rewards.tier.slice(1)} tier`}
              icon={Gift}
              iconBg="bg-steel-50 dark:bg-steel-500/10"
              iconColor="text-steel-500"
            />

            {/* Insights teaser with animated gradient border */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'panel-glass rounded-2xl p-5 flex flex-col justify-between h-44',
                'cursor-pointer group relative overflow-hidden',
                'border-gradient-animated',
              )}
            >
              {/* Ambient glow blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/10 dark:bg-copper-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-700" />

              <div className="flex items-center justify-between relative z-10">
                <p className="text-sm font-semibold text-ink-secondary">Smart Insight</p>
                <div className="w-9 h-9 rounded-xl bg-copper-50 dark:bg-copper-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Sparkles size={17} strokeWidth={2.2} className="text-copper-500" />
                </div>
              </div>
              <div className="relative z-10 pt-2">
                <p className="text-sm font-medium text-ink-primary leading-snug">
                  Dining expenses down <span className="text-profit font-bold">15%</span> this week.
                  Great job managing your spend!
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Wallet Optimizer Section ─────────────────────────────── */}
          <div className="panel-glass rounded-3xl p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-display font-bold text-ink-primary">Wallet Optimizer</h2>
              <p className="text-xs text-ink-tertiary">Best card in your wallet for every spend category</p>
            </div>
            <WalletOptimizerPanel />
          </div>
        </div>

        {/* Right column: transaction feed */}
        <aside className="xl:sticky xl:top-24">
          <div className="panel-glass rounded-3xl p-5">
            <TransactionFeed limit={12} />
          </div>
        </aside>
      </div>

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
                            setCardNameInput(profile?.name || '');
                            setCardLimitInput(c.minIncome ? String(Math.floor(c.minIncome * 0.5)) : '150000');
                          }}
                          className="w-full p-3 rounded-2xl flex items-center gap-3 border border-canvas-200/40 dark:border-white/[0.03] hover:bg-canvas-200/50 dark:hover:bg-white/[0.02] text-left transition-all"
                        >
                          <BankLogo bank={c.bank} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink-primary truncate">{c.name}</p>
                            <p className="text-xs text-ink-tertiary">{c.bank} · {c.network}</p>
                          </div>
                          <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full">
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
                      className="text-xs font-bold text-brand-500 hover:text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full"
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
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between items-end mt-1 text-[9px] opacity-75">
                        <span className="uppercase truncate max-w-[180px]">{cardNameInput || 'CARDHOLDER NAME'}</span>
                        <span>{cardExpiryInput || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[11px] font-bold text-ink-secondary">Card Number (16 Digits)</label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="4111 1111 1111 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))}
                        className="input-premium py-2 px-3 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[11px] font-bold text-ink-secondary">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Atharva Mishra"
                        value={cardNameInput}
                        onChange={(e) => setCardNameInput(e.target.value)}
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
                          value={cardExpiryInput}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value.length < cardExpiryInput.length) {
                              setCardExpiryInput(value);
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
                            setCardExpiryInput(clean.slice(0, 5));
                          }}
                          className="input-premium py-2 px-3 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-[11px] font-bold text-ink-secondary">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvvInput}
                          onChange={(e) => setCardCvvInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                          className="input-premium py-2 px-3 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[11px] font-bold text-ink-secondary">Credit Limit (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 300000"
                          value={cardLimitInput}
                          onChange={(e) => setCardLimitInput(e.target.value)}
                          className="w-full input-premium py-2 pl-7 pr-3 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {formError && <p className="text-xs font-bold text-loss">{formError}</p>}

                  <button
                    onClick={() => {
                      if (cardNumber.length < 16) {
                        return setFormError('Card number must be exactly 16 digits.');
                      }
                      if (!cardNameInput.trim()) {
                        return setFormError('Cardholder name is required.');
                      }
                      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                      if (!expiryRegex.test(cardExpiryInput)) {
                        return setFormError('Expiry must be a valid MM/YY format (months 01-12).');
                      }
                      if (cardCvvInput.length < 3) {
                        return setFormError('CVV must be 3 digits.');
                      }
                      const limitNum = parseFloat(cardLimitInput);
                      if (isNaN(limitNum) || limitNum <= 0) {
                        return setFormError('Please enter a valid credit limit.');
                      }

                      addUserCard({
                        id: selectedTemplate.id,
                        pan: cardNumber,
                        cardholderName: cardNameInput.trim(),
                        expiry: cardExpiryInput,
                        network: selectedTemplate.network.toLowerCase() as any,
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

      {/* Delete Card Confirmation Modal */}
      <AnimatePresence>
        {deleteCardId && (() => {
          const cardToDelete = userCards.find((c) => c.id === deleteCardId);
          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteCardId(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            {/* Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-full max-w-[360px] bg-canvas-50 dark:bg-[#1a1d21] rounded-[2rem] overflow-hidden shadow-2xl border border-canvas-200/40 dark:border-white/[0.06]"
              style={{
                boxShadow: '0 0 80px rgba(220,38,38,0.08), 0 25px 60px rgba(0,0,0,0.3)',
              }}
            >
              {/* Mini card preview strip at top */}
              {cardToDelete && (
                <div
                  className="h-20 w-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${cardToDelete.gradientFrom} 0%, ${cardToDelete.gradientTo} 100%)`,
                  }}
                >
                  {/* Frosted overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                  {/* Noise texture */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      backgroundSize: '120px',
                    }}
                  />
                  {/* Card details on the strip */}
                  <div className="relative z-10 h-full flex items-center justify-between px-6">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Removing</p>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] mt-0.5">{deleteCardLabel}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Trash2 size={16} className="text-white/80" />
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6 pt-5">
                {/* Warning badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-ink-primary">Remove this card?</h3>
                  </div>
                </div>

                <p className="text-[13px] text-ink-secondary leading-relaxed">
                  This will permanently delete <strong className="text-ink-primary font-semibold">{deleteCardLabel}</strong> from your wallet, including all linked transactions and credit account data.
                </p>

                {/* Danger info box */}
                <div className="mt-4 bg-red-500/[0.06] dark:bg-red-500/[0.08] border border-red-500/10 dark:border-red-500/15 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <div className="w-1 h-full min-h-[32px] rounded-full bg-red-500/40 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                    This action cannot be undone. You will need to re-add and re-enter all card details if you change your mind.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteCardId(null)}
                    className="flex-1 py-3 bg-canvas-200/60 dark:bg-white/[0.06] text-ink-secondary rounded-2xl text-sm font-semibold hover:bg-canvas-300/60 dark:hover:bg-white/[0.10] transition-all active:scale-[0.97]"
                  >
                    Keep Card
                  </button>
                  <button
                    onClick={() => {
                      deleteUserCard(deleteCardId);
                      setDeleteCardId(null);
                    }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] text-white"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      boxShadow: '0 4px 16px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    Delete Card
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );})()}
      </AnimatePresence>

      {/* Card Benefits Detail Sheet */}
      <CardBenefitsSheet
        cardId={benefitsCardId}
        onClose={() => setBenefitsCardId(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANALYZE TAB
// ─────────────────────────────────────────────────────────────────────────────

function AnalyzeTab() {
  return (
    <PageContainer
      title="Card Analyzer"
      subtitle="Get personalized credit card recommendations for your profile"
    >
      <div className="panel-glass rounded-3xl p-6">
        <RecommenderPanel />
      </div>
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET TAB
// ─────────────────────────────────────────────────────────────────────────────

const WALLET_TABS: { id: WalletTabId; label: string; icon: typeof CreditCard }[] = [
  { id: 'optimizer', label: 'Optimizer', icon: CreditCard },
  { id: 'upi',       label: 'Pay',       icon: Zap        },
  { id: 'bills',     label: 'Bills',     icon: FileText   },
];

function WalletTab() {
  const [activeTab, setActiveTab] = useState<WalletTabId>('optimizer');

  const WALLET_TAB_INFO: Record<WalletTabId, { title: string; subtitle: string }> = {
    optimizer: { title: 'Wallet Optimizer',  subtitle: 'Best card for every spend category'     },
    upi:       { title: 'UPI Simulator',     subtitle: 'Find the optimal card for any payment'  },
    bills:     { title: 'Bill Tracker',      subtitle: 'Upcoming and overdue bills at a glance' },
  };

  return (
    <PageContainer
      title={WALLET_TAB_INFO[activeTab].title}
      subtitle={WALLET_TAB_INFO[activeTab].subtitle}
    >
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-canvas-200/60 dark:bg-canvas-300/30 rounded-2xl p-1 backdrop-blur-sm">
        {WALLET_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === id
                ? 'text-ink-primary'
                : 'text-ink-tertiary hover:text-ink-secondary',
            )}
          >
            {activeTab === id && (
              <motion.div
                layoutId="wallet-tab-bg"
                className="absolute inset-0 bg-surface dark:bg-surface-raised shadow-ag-base rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={14} />
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="panel-glass rounded-3xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'optimizer' && <WalletOptimizerPanel />}
            {activeTab === 'upi'       && <UpiSimulatorPanel />}
            {activeTab === 'bills'     && <BillTrackerPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INSIGHTS TAB
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHTS_TABS: { id: InsightsTabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'insights', label: 'Insights', icon: BarChart3   },
  { id: 'budget',   label: 'Budget',   icon: Target      },
  { id: 'cibil',    label: 'CIBIL',    icon: ShieldCheck },
];

function InsightsTab() {
  const [activeTab, setActiveTab] = useState<InsightsTabId>('insights');

  return (
    <PageContainer
      title={activeTab === 'insights' ? 'Spend Insights' : activeTab === 'budget' ? 'Category Budgets' : 'CIBIL Score'}
      subtitle={activeTab === 'insights' ? 'Smart analysis of your spending patterns' : activeTab === 'budget' ? 'Track your credit health and budgets' : 'Your credit health report'}
    >
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-canvas-200/60 dark:bg-canvas-300/30 rounded-2xl p-1 backdrop-blur-sm">
        {INSIGHTS_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === id
                ? 'text-ink-primary'
                : 'text-ink-tertiary hover:text-ink-secondary',
            )}
          >
            {activeTab === id && (
              <motion.div
                layoutId="insights-tab-bg"
                className="absolute inset-0 bg-surface dark:bg-surface-raised shadow-ag-base rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={14} />
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="panel-glass rounded-3xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'insights' && <InsightsPanel />}
            {activeTab === 'budget'   && <BudgetingPanel />}
            {activeTab === 'cibil'    && <CibilPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PERKS TAB
// ─────────────────────────────────────────────────────────────────────────────

type PerksTabId = 'rewards' | 'subscriptions' | 'offers';

const PERKS_TABS: { id: PerksTabId; label: string; icon: typeof Gift }[] = [
  { id: 'rewards',       label: 'Rewards & Milestones', icon: Gift },
  { id: 'subscriptions', label: 'Subscriptions',        icon: CreditCard },
  { id: 'offers',        label: 'Card Offers',          icon: Tag },
];

function PerksTab() {
  return (
    <PageContainer
      title="Perks & Rewards"
      subtitle="Milestone tracking & card benefits"
    >
      <PerksDashboard />
    </PageContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const profile = useDashboardStore((s) => s.profile);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (!profile) {
    return <LoginScreen />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isDark={isDark}
      onToggleTheme={() => setIsDark(!isDark)}
    >
      {activeTab === 'home'     && <HomeTab />}
      {activeTab === 'analyze'  && <AnalyzeTab />}
      {activeTab === 'wallet'   && <WalletTab />}
      {activeTab === 'perks'    && <PerksTab />}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'profile'  && <ProfileTab />}

      {/* ── Taqdeer AI Floating Chat ─────────────────────────────────── */}
      <TaqdeerPanel />
    </DashboardLayout>
  );
}
