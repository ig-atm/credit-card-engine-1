// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionCategory =
  | 'dining'
  | 'travel'
  | 'groceries'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'transport'
  | 'subscriptions'
  | 'other';

export type TransactionType = 'debit' | 'credit' | 'refund';

export interface Transaction {
  /** UUID — generated at creation */
  readonly id: string;
  /** Merchant display name */
  merchant: string;
  /**
   * Amount in cents. Positive = charge to account.
   * Negative = refund / credit.
   */
  amount: number;
  /** ISO-8601 date string */
  date: string;
  category: TransactionCategory;
  type: TransactionType;
  /** Optional card ID this transaction belongs to */
  cardId: string;
  /** Whether the transaction is still pending settlement */
  pending?: boolean;
  /** Reward points earned (if any) */
  rewardPoints?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  REWARDS DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type RewardTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'black';

export interface RewardsAccount {
  /** Total accumulated points */
  totalPoints: number;
  /** Points redeemed to date */
  redeemedPoints: number;
  /** Cash back earned this statement cycle (in cents) */
  cycleEarnings: number;
  /** Current tier */
  tier: RewardTier;
  /** Points needed to reach next tier */
  pointsToNextTier: number;
  /**
   * Multiplier map by category.
   * Key = TransactionCategory, value = multiplier (e.g. 3 = 3× points).
   */
  categoryMultipliers: Partial<Record<TransactionCategory, number>>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CREDIT ACCOUNT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CreditAccount {
  /** Linked card ID */
  cardId: string;
  /** Credit limit in cents */
  totalLimit: number;
  /** Current outstanding balance in cents */
  currentBalance: number;
  /** Minimum payment due in cents */
  minimumPaymentDue: number;
  /** Payment due date as ISO-8601 */
  paymentDueDate: string;
  /** Last payment amount in cents */
  lastPaymentAmount: number;
  /** Last payment date as ISO-8601 */
  lastPaymentDate: string | null;
  /** Annual Percentage Rate (e.g. 0.2499 for 24.99%) */
  apr: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BILL PAYMENT INPUT
// ─────────────────────────────────────────────────────────────────────────────

export interface PayBillInput {
  cardId: string;
  /** Amount in cents */
  amount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADD TRANSACTION INPUT
//  (Omit auto-generated fields so callers don't have to provide them)
// ─────────────────────────────────────────────────────────────────────────────

export type AddTransactionInput = Omit<Transaction, 'id' | 'rewardPoints'>;

export interface AppProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  salary: number;
  creditScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION & MILESTONE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'paused';
  cardId: string;
  category: string;
  hasPriceHike: boolean;
  previousAmount?: number;
  isFreeTrial: boolean;
  logo?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  rewardType: 'points' | 'fee_waiver' | 'cashback';
  rewardValue: string;
  dueDate: string;
  cardId: string;
}

export interface MerchantOffer {
  id: string;
  merchantName: string;
  description: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  category: string;
  validUntil: string;
  eligibleCardIds: string[];
}

export interface CategoryBudget {
  id: string;
  category: TransactionCategory;
  limitAmount: number;
  currentSpend: number;
  period: 'monthly' | 'weekly';
}

