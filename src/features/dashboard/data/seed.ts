import type { CreditAccount, RewardsAccount, Transaction } from '../types/dashboard.types';

// ─────────────────────────────────────────────────────────────────────────────
//  NOTE ON DEMO DATA & SCALING:
//  The amounts in this seed file are represented in paise (1 Rupee = 100 Paise)
//  as is standard practice for handling currency values securely without floating
//  point rounding issues.
//  
//  For demo and visual layout purposes, these mock transactions and credit limits
//  are set to relatively high values (e.g. ₹10 Lakhs credit limits, ₹1.29 Lakhs
//  Apple Store purchases). This allows showcasing features like the wallet health,
//  utilization alerts, and reward accruals.
//  
//  ⚠️ IMPORTANT: If this dashboard is ever connected to live user databases/APIs, Ensure
//  the scale of transaction amounts and credit limits aligns with actual customer metrics
//  and local financial limits.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  SEED TRANSACTIONS
//  Realistic sample data spanning 30 days for two cards.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    merchant: 'Nobu Restaurant',
    amount: 1840000,           // ₹18,400.00
    date: '2026-06-25T19:34:00.000Z',
    category: 'dining',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 552,       // 3× dining
  },
  {
    id: 'txn-002',
    merchant: 'Emirates Airlines',
    amount: 14230000,          // ₹1,42,300.00
    date: '2026-06-22T11:15:00.000Z',
    category: 'travel',
    type: 'debit',
    cardId: 'card-002',
    pending: false,
    rewardPoints: 4269,      // 3× travel
  },
  {
    id: 'txn-003',
    merchant: 'Whole Foods Market',
    amount: 987000,            // ₹9,870.00
    date: '2026-06-21T09:12:00.000Z',
    category: 'groceries',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 197,       // 2× groceries
  },
  {
    id: 'txn-004',
    merchant: 'Netflix',
    amount: 179900,            // ₹1,799.00
    date: '2026-06-20T00:00:00.000Z',
    category: 'subscriptions',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 18,
  },
  {
    id: 'txn-005',
    merchant: 'Uber',
    amount: 234000,            // ₹2,340.00
    date: '2026-06-19T22:48:00.000Z',
    category: 'transport',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 23,
  },
  {
    id: 'txn-006',
    merchant: 'Spotify Premium',
    amount: 99900,             // ₹999.00
    date: '2026-06-18T00:00:00.000Z',
    category: 'subscriptions',
    type: 'debit',
    cardId: 'card-002',
    pending: false,
    rewardPoints: 10,
  },
  {
    id: 'txn-007',
    merchant: 'Zara',
    amount: 2350000,           // ₹23,500.00
    date: '2026-06-17T14:22:00.000Z',
    category: 'shopping',
    type: 'debit',
    cardId: 'card-002',
    pending: false,
    rewardPoints: 235,
  },
  {
    id: 'txn-008',
    merchant: 'Apple Store',
    amount: 12990000,          // ₹1,29,900.00
    date: '2026-06-15T17:05:00.000Z',
    category: 'shopping',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 1299,
  },
  {
    id: 'txn-009',
    merchant: 'Zara — Refund',
    amount: -500000,           // ₹5,000.00 refund
    date: '2026-06-14T10:30:00.000Z',
    category: 'shopping',
    type: 'refund',
    cardId: 'card-002',
    pending: false,
    rewardPoints: 0,
  },
  {
    id: 'txn-010',
    merchant: 'CrossFit Gym',
    amount: 850000,            // ₹8,500.00
    date: '2026-06-12T07:00:00.000Z',
    category: 'health',
    type: 'debit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 85,
  },
  {
    id: 'txn-011',
    merchant: 'Marriott Bonvoy — Bali',
    amount: 9800000,           // ₹98,000.00
    date: '2026-06-10T15:20:00.000Z',
    category: 'travel',
    type: 'debit',
    cardId: 'card-002',
    pending: false,
    rewardPoints: 2940,
  },
  {
    id: 'txn-012',
    merchant: 'Monthly Bill Payment',
    amount: -25000000,         // ₹2.5L credit
    date: '2026-06-05T12:00:00.000Z',
    category: 'other',
    type: 'credit',
    cardId: 'card-001',
    pending: false,
    rewardPoints: 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SEED CREDIT ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_CREDIT_ACCOUNTS: CreditAccount[] = [
  {
    cardId: 'card-001',
    totalLimit: 100000000,        // ₹10 Lakh Limit (1,000,000.00 Rupees in Paise)
    currentBalance: 38000000,      // ₹3.8 Lakh outstanding
    minimumPaymentDue: 380000,     // ₹3,800.00 minimum
    paymentDueDate: '2026-07-15T00:00:00.000Z',
    lastPaymentAmount: 25000000,   // ₹2.5L last payment
    lastPaymentDate: '2026-06-05T12:00:00.000Z',
    apr: 0.2199,
  },
  {
    cardId: 'card-002',
    totalLimit: 50000000,         // ₹5 Lakh Limit
    currentBalance: 22000000,      // ₹2.2 Lakh outstanding
    minimumPaymentDue: 220000,     // ₹2,200.00 minimum
    paymentDueDate: '2026-07-18T00:00:00.000Z',
    lastPaymentAmount: 10000000,   // ₹1L last payment
    lastPaymentDate: '2026-06-08T10:00:00.000Z',
    apr: 0.1999,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SEED REWARDS ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_REWARDS: RewardsAccount = {
  totalPoints: 9_628,
  redeemedPoints: 1_200,
  cycleEarnings: 6420,     // ₹6,420 cash back this cycle
  tier: 'gold',
  pointsToNextTier: 372,
  categoryMultipliers: {
    dining:        3,
    travel:        3,
    groceries:     2,
    subscriptions: 1,
    shopping:      1,
    transport:     1,
    health:        1,
    entertainment: 1,
    utilities:     1,
    other:         1,
  },
};
