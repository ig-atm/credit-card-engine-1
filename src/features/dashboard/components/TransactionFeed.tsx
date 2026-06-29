import { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, Minus } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { useShallow } from 'zustand/shallow';
import { useDashboardStore } from '../store/dashboardStore';
import type { AddTransactionInput, TransactionCategory } from '../types/dashboard.types';
import { TransactionRow } from './TransactionRow';
import { CATEGORY_STYLES } from '../../cards/components/CategoryIcon';

// ─────────────────────────────────────────────────────────────────────────────
//  QUICK-ADD FORM
//  A minimal inline form that slides down from the header when triggered.
// ─────────────────────────────────────────────────────────────────────────────

import { parseSmsText, SMS_SAMPLES } from '../lib/smsParser';

interface QuickAddFormProps {
  onClose:   () => void;
  activeCardId: string;
}

const CATEGORIES = Object.entries(CATEGORY_STYLES).map(([key, val]) => ({
  value: key as TransactionCategory,
  label: val.label,
}));

function QuickAddForm({ onClose, activeCardId }: QuickAddFormProps) {
  const addTransaction = useDashboardStore((s) => s.addTransaction);
  const userCards = useDashboardStore((s) => s.userCards);
  const formId = useId();

  // Tab State
  const [tab, setTab] = useState<'manual' | 'sms'>('manual');

  // Manual Form State
  const [merchant, setMerchant]   = useState('');
  const [amount,   setAmount]     = useState('');
  const [category, setCategory]   = useState<TransactionCategory>('other');

  // SMS Parser State
  const [smsText, setSmsText] = useState('');
  const [parsedData, setParsedData] = useState<any | null>(null);

  // Error/Success messages
  const [error,    setError]      = useState<string | null>(null);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!merchant.trim()) { setError('Merchant name is required.'); return; }
    if (isNaN(parsed) || parsed <= 0) { setError('Enter a valid positive amount.'); return; }

    const input: AddTransactionInput = {
      merchant:  merchant.trim(),
      amount:    Math.round(parsed * 100),       // convert dollars → cents
      date:      new Date().toISOString(),
      category,
      type:      'debit',
      cardId:    activeCardId,
      pending:   false,
    };
    addTransaction(input);
    onClose();
  }

  function handleParseSms() {
    setError(null);
    if (!smsText.trim()) {
      setError('Please paste a transaction SMS text first.');
      return;
    }
    const result = parseSmsText(smsText, userCards);
    if (!result) {
      setError('Could not automatically parse transaction details. Please check the text format or add manually.');
      setParsedData(null);
      return;
    }
    setParsedData({
      merchant: result.merchant,
      amount: String(result.amount / 100),
      category: result.category,
      cardId: result.cardId || activeCardId,
      date: result.date,
    });
  }

  function handleSmsConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!parsedData) return;
    const parsedAmt = parseFloat(parsedData.amount);
    if (!parsedData.merchant.trim()) { setError('Merchant name is required.'); return; }
    if (isNaN(parsedAmt) || parsedAmt <= 0) { setError('Enter a valid amount.'); return; }

    const input: AddTransactionInput = {
      merchant: parsedData.merchant.trim(),
      amount: Math.round(parsedAmt * 100),
      date: parsedData.date || new Date().toISOString(),
      category: parsedData.category,
      type: 'debit',
      cardId: parsedData.cardId || activeCardId,
      pending: false,
    };
    addTransaction(input);
    onClose();
  }

  return (
    <motion.div
      key="quick-add-form"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{    height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <div className="glass-surface rounded-2xl shadow-ag-card p-4 mb-3 flex flex-col gap-3">
        {/* Toggle tabs */}
        <div className="flex bg-canvas-200/50 dark:bg-white/[0.03] p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => { setTab('manual'); setError(null); }}
            className={cn(
              'flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all',
              tab === 'manual'
                ? 'bg-surface dark:bg-surface-raised text-brand-500 shadow-sm'
                : 'text-ink-tertiary hover:text-ink-secondary'
            )}
          >
            Manual Add
          </button>
          <button
            type="button"
            onClick={() => { setTab('sms'); setError(null); }}
            className={cn(
              'flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all',
              tab === 'sms'
                ? 'bg-surface dark:bg-surface-raised text-brand-500 shadow-sm'
                : 'text-ink-tertiary hover:text-ink-secondary'
            )}
          >
            Paste SMS
          </button>

        </div>

        {tab === 'manual' ? (
          <form
            id={formId}
            onSubmit={handleManualSubmit}
            className="flex flex-col gap-3"
            noValidate
          >
            <div className="flex items-center gap-2">
              {/* Merchant */}
              <input
                id={`${formId}-merchant`}
                type="text"
                placeholder="Merchant name"
                value={merchant}
                onChange={(e) => { setMerchant(e.target.value); setError(null); }}
                className={cn('flex-1 input-premium text-sm')}
                autoFocus
                autoComplete="off"
                aria-label="Merchant name"
              />
              {/* Amount */}
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">₹</span>
                <input
                  id={`${formId}-amount`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(null); }}
                  className={cn(
                    'w-full input-premium pl-6 text-sm font-semibold',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                  )}
                  aria-label="Amount in rupees"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
              {CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cn(
                    'text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150',
                    category === value
                      ? 'bg-brand-500 text-white shadow-ag-glow-primary'
                      : 'bg-canvas-200 dark:bg-white/[0.04] text-ink-secondary hover:bg-canvas-300 dark:hover:bg-white/[0.08]',
                  )}
                  aria-pressed={category === value}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-canvas-200/40 dark:border-white/[0.03] pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  'text-xs font-semibold text-white px-4 py-1.5 rounded-full',
                  'bg-brand-500 hover:bg-brand-600 shadow-ag-glow-primary',
                  'transition-all duration-150 active:scale-95',
                )}
              >
                Add Transaction
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            {!parsedData ? (
              <>
                <textarea
                  placeholder="Paste transaction alert SMS here (e.g. 'Rs.850.00 debited from A/C XX4242 at ZOMATO...')"
                  value={smsText}
                  onChange={(e) => { setSmsText(e.target.value); setError(null); }}
                  rows={3}
                  className="w-full text-xs input-premium resize-none"
                  autoFocus
                />
                
                {/* Sample SMS list */}
                <div>
                  <p className="text-[9px] font-bold text-ink-disabled uppercase tracking-wider mb-1">Click to try a sample SMS:</p>
                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                    {SMS_SAMPLES.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setSmsText(sample); setError(null); }}
                        className="text-left text-[10px] text-ink-tertiary hover:text-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 px-2 py-1 rounded border border-canvas-200/50 dark:border-white/[0.02] truncate transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-canvas-200/40 dark:border-white/[0.03] pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleParseSms}
                    className="text-xs font-semibold text-white px-4 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 shadow-ag-glow-primary transition-all active:scale-95"
                  >
                    Auto Parse SMS
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSmsConfirm} className="flex flex-col gap-3">
                <div className="bg-brand-50/50 dark:bg-brand-500/[0.02] border border-brand-500/10 rounded-xl p-3 mb-1">
                  <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Parsed Transaction Details</p>
                  <p className="text-[9px] text-ink-disabled truncate mt-0.5">Original SMS: "{smsText}"</p>
                </div>

                <div className="flex gap-2">
                  {/* Merchant (Parsed/Editable) */}
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ink-secondary">Merchant</label>
                    <input
                      type="text"
                      value={parsedData.merchant}
                      onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                      className="input-premium py-1.5 text-xs font-semibold"
                    />
                  </div>
                  {/* Amount (Parsed/Editable) */}
                  <div className="w-24 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ink-secondary">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={parsedData.amount}
                      onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                      className="input-premium py-1.5 text-xs font-bold text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Category */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ink-secondary">Category</label>
                    <select
                      value={parsedData.category}
                      onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                      className="input-premium py-1.5 text-xs bg-canvas-50 dark:bg-canvas-200"
                    >
                      {CATEGORIES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Card Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ink-secondary">Matched Card</label>
                    <select
                      value={parsedData.cardId}
                      onChange={(e) => setParsedData({ ...parsedData, cardId: e.target.value })}
                      className="input-premium py-1.5 text-xs bg-canvas-50 dark:bg-canvas-200"
                    >
                      {userCards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label || 'Credit Card'} (..{c.pan.slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-canvas-200/40 dark:border-white/[0.03] pt-2">
                  <button
                    type="button"
                    onClick={() => setParsedData(null)}
                    className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Re-paste
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-white px-4 py-1.5 rounded-full bg-profit hover:bg-green-600 shadow-ag-glow-primary transition-all active:scale-95"
                  >
                    Confirm & Add
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -4 }}
              className="text-xs text-loss font-semibold mt-1"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
      aria-label="No transactions"
    >
      <div className="w-16 h-16 rounded-2xl bg-canvas-200/60 dark:bg-canvas-300/20 flex items-center justify-center mb-5 shadow-ag-base">
        <ChevronRight size={24} className="text-ink-disabled" />
      </div>
      <p className="text-sm font-display font-bold text-ink-secondary mb-1">No transactions yet</p>
      <p className="text-xs text-ink-tertiary max-w-[220px] leading-relaxed">
        Add your first transaction using the button above to start tracking.
      </p>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION FEED — Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface TransactionFeedProps {
  /** Max transactions to display. Defaults to 12. */
  limit?: number;
  /** Optional extra wrapper class */
  className?: string;
}

export function TransactionFeed({ limit = 12, className }: TransactionFeedProps) {
  // Bug fix: filter by activeCardId so only relevant transactions show
  const allTransactions = useDashboardStore(
    useShallow((s) => s.transactions),
  );
  const activeCardId = useDashboardStore((s) => s.activeCardId);
  const [showForm, setShowForm] = useState(false);

  // Filter to the active card, then cap at limit
  const transactions = allTransactions
    .filter((t) => !t.cardId || t.cardId === activeCardId)
    .slice(0, limit);

  // Track which IDs were present on previous render so we can mark new ones
  const prevIdsRef = useRef<Set<string>>(new Set(transactions.map((t) => t.id)));
  const newIdRef   = useRef<string | null>(null);

  // Detect the most recently added transaction
  const currentIds = new Set(transactions.map((t) => t.id));
  let foundNew = false;
  for (const id of currentIds) {
    if (!prevIdsRef.current.has(id)) {
      newIdRef.current = id;
      foundNew = true;
    }
  }
  // Bug fix: clear newId if not found this render (it was from a prior render)
  if (!foundNew && newIdRef.current && currentIds.has(newIdRef.current)) {
    // keep it for exactly one render, then clear via setTimeout
    const idToClear = newIdRef.current;
    setTimeout(() => {
      if (newIdRef.current === idToClear) newIdRef.current = null;
    }, 600);
  }
  prevIdsRef.current = currentIds;

  return (
    <section
      className={cn('flex flex-col gap-0', className)}
      aria-label="Recent Transactions"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-display font-bold text-ink-primary tracking-tight">
            Recent Activity
          </h2>
          <p className="text-[11px] text-ink-disabled font-medium mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            {' '}· active card
          </p>
        </div>

        <button
          id="add-transaction-btn"
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-label={showForm ? 'Close add transaction form' : 'Add transaction'}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-zinc-200/20 dark:border-white/10 shadow-ag-base text-brand-500 hover:bg-zinc-50 hover:text-brand-600 transition-all duration-200"
        >
          {showForm ? (
            <Minus size={14} strokeWidth={3} />
          ) : (
            <Plus size={14} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* ── Quick-add form (animated) ───────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showForm && (
          <QuickAddForm
            key="quick-add"
            onClose={() => setShowForm(false)}
            activeCardId={activeCardId}
          />
        )}
      </AnimatePresence>

      {/* ── List ───────────────────────────────────────────────────── */}
      <div className="relative mt-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 pb-6 -mr-2 scroll-shadow-bottom">
        <motion.ul
          className="flex flex-col gap-2"
          role="list"
          /*
           * layout="position" on the container ensures the ul itself doesn't
           * jump when its height changes (e.g. when form opens/closes).
           */
          layout="position"
        >
          <AnimatePresence initial={true} mode="popLayout">
            {transactions.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              transactions.map((txn, i) => (
                <TransactionRow
                  key={txn.id}
                  transaction={txn}
                  index={i}
                  isNew={txn.id === newIdRef.current}
                />
              ))
            )}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

export default TransactionFeed;
