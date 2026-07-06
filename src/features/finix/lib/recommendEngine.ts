/**
 * Card recommendation engine.
 *
 * Scoring aligned with backend/recommender.py from:
 * https://github.com/Adityasinha2289/credit-card-engine
 *
 * Core scoring approach:
 *   - CIBIL tier points  (up to 40)
 *   - Salary tier points (up to 30)
 *   - Category reward scoring (weighted by priority)
 *   - Fee, lounge, and bonus modifiers
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  annualIncome: number;          // INR
  cibilScore: number;            // 300–900
  topCategories: SpendCategory[]; // ordered by priority
  maxAnnualFee: number;          // INR, 0 = free only
  wantsLounge: boolean;
  /** Optional estimated monthly spend per category (INR) — used for spend tier scoring */
  monthlySpend?: Partial<Record<SpendCategory, number>>;
}

export interface RecommendedCard extends FinixCard {
  matchScore: number;
  matchPercent: number;
  eligibilityReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKEND-ALIGNED SCORING  (ported from recommender.py)
// ─────────────────────────────────────────────────────────────────────────────

/** CIBIL tier score — mirrors recommender.py:calculate_finix_score */
function cibilTierScore(cibil: number): number {
  if (cibil >= 750) return 40;
  if (cibil >= 650) return 25;
  return 10;
}

/** Salary tier score — mirrors recommender.py:calculate_finix_score */
function salaryTierScore(annualSalary: number): number {
  if (annualSalary >= 1_000_000) return 30; // 10L+
  if (annualSalary >= 500_000)  return 20;  // 5L+
  return 10;
}

/** Monthly spend tier score — mirrors recommender.py:calculate_finix_score */
function spendTierScore(monthlySpend: Partial<Record<SpendCategory, number>>): number {
  const total = Object.values(monthlySpend).reduce((s, v) => s + (v ?? 0), 0);
  if (total >= 20_000) return 30;
  if (total >= 10_000) return 20;
  return 10;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CARD SCORER
// ─────────────────────────────────────────────────────────────────────────────

function scoreCard(card: FinixCard, profile: UserProfile): number {
  // ── Hard eligibility gates ────────────────────────────────────────────────
  if (card.minIncome > profile.annualIncome) return -1;
  if (card.minCibil  > profile.cibilScore)   return -1;
  if (profile.maxAnnualFee > 0 && card.annualFee > profile.maxAnnualFee) return -1;

  let score = 0;

  // ── Backend-aligned base score ────────────────────────────────────────────
  score += cibilTierScore(profile.cibilScore);
  score += salaryTierScore(profile.annualIncome);
  if (profile.monthlySpend) {
    score += spendTierScore(profile.monthlySpend);
  } else {
    // Estimate spend tier from income (≈15% of annual income / 12)
    const estMonthlySpend = profile.annualIncome * 0.15 / 12;
    score += estMonthlySpend >= 20_000 ? 30 : estMonthlySpend >= 10_000 ? 20 : 10;
  }

  // ── Fee scoring (lower is better) ────────────────────────────────────────
  if (card.annualFee === 0)        score += 20;
  else if (card.annualFee <= 500)  score += 16;
  else if (card.annualFee <= 1000) score += 13;
  else if (card.annualFee <= 3000) score += 10;
  else if (card.annualFee <= 5000) score +=  7;
  else                              score +=  3;

  // Fee waiver bonus
  if (card.feeWaiverSpend && card.feeWaiverSpend <= profile.annualIncome * 0.25) {
    score += 8;
  }

  // ── Lounge scoring ────────────────────────────────────────────────────────
  if (profile.wantsLounge && card.loungeAccess && card.loungeAccess > 0) {
    score += Math.min(card.loungeAccess, 20); // up to 20 pts
  }

  // ── Category reward scoring (priority-weighted) ───────────────────────────
  // Top category = 5× weight, second = 4×, ... minimum 1×
  profile.topCategories.forEach((category, idx) => {
    const weight = Math.max(5 - idx, 1);
    const catReward = card.rewards?.find((r) => r.category === category);
    const rate = catReward ? catReward.rate : card.baseRewardRate;
    score += rate * weight;
  });

  // ── Base reward rate (overall quality) ───────────────────────────────────
  score += card.baseRewardRate * 2;

  // ── Welcome bonus ────────────────────────────────────────────────────────
  if (card.welcomeBonus) score += 5;

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export function recommendCards(profile: UserProfile, limit = 5): RecommendedCard[] {
  const scored = CARD_DATASET.map((card) => ({
    ...card,
    matchScore: scoreCard(card, profile),
    matchPercent: 0,
  }));

  const eligible = scored.filter((c) => c.matchScore >= 0);
  eligible.sort((a, b) => b.matchScore - a.matchScore);

  const maxScore = eligible[0]?.matchScore ?? 1;

  return eligible.slice(0, limit).map((c) => ({
    ...c,
    matchPercent: Math.round((c.matchScore / maxScore) * 100),
  }));
}


// ─────────────────────────────────────────────────────────────────────────────
//  CATEGORIES LIST  (used by RecommenderPanel step 3)
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES_LIST: { value: SpendCategory; label: string }[] = [
  { value: 'dining',        label: 'Dining & Food' },
  { value: 'shopping',      label: 'Online Shopping' },
  { value: 'travel',        label: 'Travel & Flights' },
  { value: 'groceries',     label: 'Groceries' },
  { value: 'fuel',          label: 'Fuel' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities',     label: 'Utilities & Bills' },
  { value: 'health',        label: 'Health & Medical' },
  { value: 'transport',     label: 'Cab & Transport' },
  { value: 'subscriptions', label: 'Subscriptions' },
];
