/**
 * taqdeerEngine.ts
 * Smart client-side credit card reasoning engine.
 * Parses user questions regarding merchants, banks, lounge access, fees,
 * and credit score health, and cross-references with the user's actual wallet.
 */

import { CARD_DATASET, type FinixCard, type SpendCategory } from '../data/cardDataset';
import { detectCategory, POPULAR_MERCHANTS } from '../data/merchantMap';
import type { CardData } from '../../cards/types/card.types';

export interface TaqdeerMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  cards?: FinixCard[];
}

// Helper to normalize card names for matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Map spend category to user-friendly label
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
  other: 'General Spend',
};

// Map spend category to emojis
const CATEGORY_EMOJIS: Record<SpendCategory, string> = {
  dining: '🍳',
  travel: '✈️',
  groceries: '🛍️',
  shopping: '🛒',
  fuel: '⛽',
  entertainment: '🎬',
  utilities: '⚡',
  transport: '🚕',
  health: '💊',
  subscriptions: '🎵',
  other: '📌',
};

// ─────────────────────────────────────────────────────────────────────────────
//  INTENT REGISTRY PATTERN
// ─────────────────────────────────────────────────────────────────────────────

export interface IntentHandler {
  name: string;
  test: (lower: string, query: string, userCards: CardData[]) => boolean;
  handler: (
    query: string,
    userCards: CardData[],
    lower: string
  ) => { content: string; cards?: FinixCard[] };
}

const INTENT_REGISTRY: IntentHandler[] = [
  // 1. GREETING & GENERAL HELP
  {
    name: 'greeting',
    test: (lower) => /^(hi|hello|hey|greetings|help|who are you|what can you do|taqdeer)/i.test(lower),
    handler: () => ({
      content: `👋 **Hey! I'm Taqdeer, your Credit Intelligence Assistant!** 🤖

I am connected to your wallet and can analyze 130+ cards to help you maximize savings. Ask me questions like:
• 🍳 *"Which card should I use at Swiggy?"*
• ✈️ *"Which cards offer airport lounge access?"*
• 💳 *"What is my wallet health score?"*
• 💰 *"Show me lifetime free credit cards"*
• 📈 *"How do I improve my CIBIL score?"*

What can I optimize for you today?`,
    }),
  },
  // 2. DETECT CIBIL SCORE / CREDIT HEALTH
  {
    name: 'cibil_health',
    test: (lower) => /\b(cibil|credit score|improve score|credit rating|my score|utilization|usage)\b/i.test(lower),
    handler: (_query, userCards) => {
      let utilizationMsg = "";
      if (userCards.length > 0) {
        const totalLimit = userCards.reduce((sum, c) => sum + c.creditLimit, 0) / 100;
        const totalAvail = userCards.reduce((sum, c) => sum + c.availableCredit, 0) / 100;
        const totalBalance = Math.max(0, totalLimit - totalAvail);
        const utilPct = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

        utilizationMsg = `\n\n📊 **Your Real-time Utilization Stats:**
• Total Wallet Limit: **₹${totalLimit.toLocaleString('en-IN')}**
• Total Outstanding: **₹${totalBalance.toLocaleString('en-IN')}**
• Current Utilization: **${utilPct}%** ${utilPct > 30 ? '⚠️ *(High! Keep below 30% to avoid CIBIL drops)*' : '🟢 *(Healthy! Below 30% target)*'}`;
      }

      return {
        content: `📈 **CIBIL Credit Score Optimization Guide**

Your CIBIL score is evaluated based on these key factors:
1. **Payment History (35%)** — Pay card bills on time. Even one late payment can drop your score by 50+ points.
2. **Credit Utilization Ratio (30%)** — The percentage of your credit limit you actually use. Always keep this **under 30%**.
3. **Credit History Age (15%)** — Older credit lines raise your score. Do not close your oldest active card.
4. **Credit Mix (15%)** — A healthy mix of secured (loans) and unsecured (cards) debt.
5. **New Inquiries (5%)** — Multiple credit searches within a short period trigger hard inquiries.${utilizationMsg}

💡 **Tip:** Pay outstanding balances 3-5 days before the bill generation date so that a lower balance is reported to credit bureaus!`,
      };
    },
  },
  // 3. WALLET HEALTH ANALYZER
  {
    name: 'wallet_health',
    test: (lower) => /\b(wallet health|wallet score|wallet status|optimize wallet|my wallet|wallet analysis)\b/i.test(lower),
    handler: (_query, userCards) => {
      if (userCards.length === 0) {
        return {
          content: `📊 **Your Wallet Health Score: 0/100**

⚠️ **Your wallet is currently empty!**
Please add one or more credit cards on the **Dashboard** home screen to evaluate your spending coverage and reward multipliers.`,
        };
      }

      const categoriesToTest: SpendCategory[] = ['dining', 'travel', 'shopping', 'groceries', 'fuel', 'utilities'];
      const coverageDetails: string[] = [];
      let coveredCount = 0;

      categoriesToTest.forEach((cat) => {
        let maxRate = 0;
        userCards.forEach((uc) => {
          const datasetCard = CARD_DATASET.find((dc) => dc.id === uc.id);
          if (datasetCard) {
            const rate = datasetCard.rewards?.find((r) => r.category === cat)?.rate ?? datasetCard.baseRewardRate;
            if (rate > maxRate) maxRate = rate;
          } else {
            if (1 > maxRate) maxRate = 1;
          }
        });

        const emoji = CATEGORY_EMOJIS[cat];
        const label = CATEGORY_LABELS[cat];
        if (maxRate >= 3) {
          coveredCount += 2;
          coverageDetails.push(`• 🟢 **${label} ${emoji}**: Excellent coverage (Max multiplier: **${maxRate}%**).`);
        } else if (maxRate >= 1.5) {
          coveredCount += 1.2;
          coverageDetails.push(`• 🟡 **${label} ${emoji}**: Average coverage (Max multiplier: **${maxRate}%**). Consider upgrading.`);
        } else {
          coverageDetails.push(`• 🔴 **${label} ${emoji}**: Poor coverage (Max multiplier: **${maxRate}%**). You are missing out on cashback!`);
        }
      });

      const finalScore = Math.min(100, Math.round((coveredCount / 12) * 100));

      const suggestions: string[] = [];
      if (!userCards.some(c => c.id.includes('fuel'))) {
        suggestions.push('• **ICICI HPCL Super Saver** (4% back on Fuel + surcharge waivers)');
      }
      if (!userCards.some(c => c.id.includes('amazon') || c.id.includes('shopping'))) {
        suggestions.push('• **Amazon Pay ICICI** (5% back on shopping for Prime members)');
      }
      if (!userCards.some(c => c.id.includes('black') || c.id.includes('diners'))) {
        suggestions.push('• **HDFC Diners Club Black** (Premium dining/travel multiplier up to 10%)');
      }

      return {
        content: `📊 **Your Wallet Health Score: ${finalScore}/100**

Here is the breakdown of your reward category coverage:
${coverageDetails.join('\n')}

${suggestions.length > 0 ? `🚀 **How to improve your score:**\nAdd one of these cards to fill the gaps in your rewards coverage:\n${suggestions.join('\n')}` : '🎉 **Outstanding!** Your wallet has excellent reward coverage across all key spending categories!'}`,
      };
    },
  },
  // 4. AIRPORT LOUNGE ACCESS / TRAVEL
  {
    name: 'lounge_access',
    test: (lower) => /\b(lounge|airport|flight|travel|trip|airline)\b/i.test(lower),
    handler: (_query, userCards) => {
      const userLoungeCards = userCards
        .map((uc) => {
          const dc = CARD_DATASET.find((c) => c.id === uc.id);
          return { label: uc.label || dc?.name, visits: dc?.loungeAccess ?? 0 };
        })
        .filter((c) => c.visits > 0);

      const topLoungeCards = CARD_DATASET.filter((c) => (c.loungeAccess ?? 0) >= 8)
        .sort((a, b) => (b.loungeAccess ?? 0) - (a.loungeAccess ?? 0))
        .slice(0, 3);

      let userCardsMsg = "";
      if (userLoungeCards.length > 0) {
        userCardsMsg = `💳 **Lounge access in your wallet:**\n${userLoungeCards.map((c) => `• **${c.label}**: ${c.visits} complimentary visits/year`).join('\n')}\n\n`;
      } else {
        userCardsMsg = `💳 **Lounge access in your wallet:**\n• ❌ None of your active cards offer complimentary airport lounge access.\n\n`;
      }

      return {
        content: `✈️ **Airport Lounge Access Analysis**

${userCardsMsg}🏆 **Top cards in the market for lounge access:**
${topLoungeCards.map((c) => `• **${c.bank} ${c.name}**: ${c.loungeAccess} visits/year (Annual Fee: ₹${c.annualFee})`).join('\n')}

💡 *Note: Most cards require a minimum spend of ₹10,000 to ₹35,000 in the previous calendar quarter to unlock complimentary lounge access visits.*`,
        cards: topLoungeCards,
      };
    },
  },
  // 5. LIFETIME FREE CARDS / ANNUAL FEES
  {
    name: 'free_cards',
    test: (lower) => /\b(free|annual fee|charges|lifetime free|waiver|no fee)\b/i.test(lower),
    handler: () => {
      const freeCards = CARD_DATASET.filter((c) => c.annualFee === 0).slice(0, 4);

      return {
        content: `💰 **Lifetime Free & Fee Waiver Recommendations**

Avoid annual maintenance charges! Here are the top **Lifetime Free** credit cards (No annual fees ever):
${freeCards.map((c) => `• **${c.bank} ${c.name}**: Base reward rate ${c.baseRewardRate}% (Highlights: ${c.highlights.slice(0, 2).join(', ')})`).join('\n')}

💡 **How Fee Waivers Work:**
Most premium credit cards waive the annual fee if you cross a specific spend milestone. For example:
• **Axis Atlas**: Annual fee ₹5,000 waived on spending ₹3 Lakhs/year.
• **Indian Bank Select**: Annual fee ₹500 waived on spending ₹50,000/year.`,
        cards: freeCards,
      };
    },
  },
  // 6. CHECK FOR SPECIFIC CARD/BANK IN QUERY
  {
    name: 'specific_card',
    test: (lower) => {
      const queryNormalized = normalizeText(lower);
      return CARD_DATASET.some((c) => {
        const cardNormalized = normalizeText(c.name);
        const bankNormalized = normalizeText(c.bank);
        return queryNormalized.includes(cardNormalized) || 
          (queryNormalized.includes(bankNormalized) && queryNormalized.includes(normalizeText(c.name.replace(c.bank, ''))));
      });
    },
    handler: (_query, userCards, lower) => {
      const queryNormalized = normalizeText(lower);
      const foundCard = CARD_DATASET.find((c) => {
        const cardNormalized = normalizeText(c.name);
        const bankNormalized = normalizeText(c.bank);
        return queryNormalized.includes(cardNormalized) || 
          (queryNormalized.includes(bankNormalized) && queryNormalized.includes(normalizeText(c.name.replace(c.bank, ''))));
      })!;

      const userHasIt = userCards.some((uc) => uc.id === foundCard.id);
      return {
        content: `🃏 **Card Analysis: ${foundCard.bank} ${foundCard.name}**
${userHasIt ? '🟢 *You have this card linked in your wallet!*' : '⚪ *This card is not in your wallet.*'}

• **Annual Fee**: ${foundCard.annualFee === 0 ? 'Lifetime Free' : `₹${foundCard.annualFee}`}
• **Lounge Access**: ${foundCard.loungeAccess ? `${foundCard.loungeAccess} visits/year` : 'Not available'}
• **Base Reward Rate**: ${foundCard.baseRewardRate}%
• **Welcome Bonus**: ${foundCard.welcomeBonus || 'None'}
• **Highlights**: ${foundCard.highlights.join(', ')}

📊 **Rewards Rates**:
${foundCard.rewards.map((r) => `• ${CATEGORY_EMOJIS[r.category] || '📌'} ${CATEGORY_LABELS[r.category]}: **${r.rate}%**`).join('\n')}

${userHasIt ? '' : `💡 *Cross-reference this card with your profile in the **Analyzer** tab to see if you are eligible!*`}`,
        cards: [foundCard],
      };
    },
  },
  // 7. CHECK FOR BANK NAME ALONE
  {
    name: 'specific_bank',
    test: (lower) => {
      const banks = ['hdfc', 'sbi', 'icici', 'axis', 'yes bank', 'yes', 'indusind', 'canara', 'rbl', 'kotak', 'au', 'bob', 'pnb'];
      return banks.some((b) => lower.includes(b));
    },
    handler: (_query, _userCards, lower) => {
      const banks = ['hdfc', 'sbi', 'icici', 'axis', 'yes bank', 'yes', 'indusind', 'canara', 'rbl', 'kotak', 'au', 'bob', 'pnb'];
      const matchedBank = banks.find((b) => lower.includes(b))!;
      const bankNorm = matchedBank === 'yes' ? 'yes bank' : matchedBank;
      const bankCards = CARD_DATASET.filter((c) => c.bank.toLowerCase().includes(bankNorm)).slice(0, 3);
      if (bankCards.length > 0) {
        return {
          content: `🏦 **Top credit cards offered by ${bankCards[0].bank}:**

${bankCards.map((c, i) => `${i + 1}. **${c.name}** (Fee: ₹${c.annualFee})
   • Base rate: ${c.baseRewardRate}% | Lounge: ${c.loungeAccess ? `${c.loungeAccess}/yr` : 'No'}
   • Benefits: ${c.highlights.slice(0, 2).join(', ')}`).join('\n\n')}

💡 *Compare these cards inside the **Analyzer** tab to view personalized reward scores based on your credit eligibility.*`,
          cards: bankCards,
        };
      }
      return { content: `I couldn't find any cards for that bank.` };
    },
  },
];

export async function generateTaqdeerResponse(
  query: string,
  userCards: CardData[] = [],
): Promise<{ content: string; cards?: FinixCard[] }> {
  const lower = query.toLowerCase().trim();

  // 0. TRY PYTHON BACKEND (BITEXT DATASET INTENT ENGINE)
  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userCards })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.intent !== "unknown") {
        return { content: data.content };
      }
      // If the backend didn't find a match, it will continue to the local engine below!
    }
  } catch (error) {
    console.warn("Taqdeer AI Backend not reachable, falling back to local engine.");
  }

  // Match query against intent registry
  const matchedIntent = INTENT_REGISTRY.find((intent) => intent.test(lower, query, userCards));

  if (matchedIntent) {
    return matchedIntent.handler(query, userCards, lower);
  }

  // 8. SPECIFIC MERCHANT OR GENERAL SPEND OPTIMIZATION (FALLBACK)
  const merchant = extractMerchant(lower);
  const category = merchant
    ? detectCategory(merchant)
    : detectCategory(lower);

  const emoji = CATEGORY_EMOJIS[category] || '🍳';
  const displayCategory = CATEGORY_LABELS[category] || 'General spend';

  // Find best card in user's wallet
  let bestUserCard: CardData | null = null;
  let maxUserRate = -1;

  userCards.forEach((uc) => {
    const dc = CARD_DATASET.find((c) => c.id === uc.id);
    if (dc) {
      const rate = dc.rewards?.find((r) => r.category === category)?.rate ?? dc.baseRewardRate;
      if (rate > maxUserRate) {
        maxUserRate = rate;
        bestUserCard = uc;
      }
    } else {
      if (1 > maxUserRate) {
        maxUserRate = 1;
        bestUserCard = uc;
      }
    }
  });

  // Find absolute best card globally
  const bestGlobalCard = getBestCardForCategory(category);
  const maxGlobalRate = getCardRewardForCategory(bestGlobalCard, category);

  const runners = CARD_DATASET
    .filter((c) => c.id !== bestGlobalCard.id)
    .sort((a, b) => getCardRewardForCategory(b, category) - getCardRewardForCategory(a, category))
    .slice(0, 2);

  const merchantStr = merchant || displayCategory;

  let walletAdvice = "";
  if (userCards.length === 0) {
    walletAdvice = `💡 **Wallet Recommendation:** Add cards to your wallet to analyze which one is best for ${merchantStr}.`;
  } else if (bestUserCard) {
    const uc = bestUserCard as CardData;
    const isOptimal = maxUserRate >= maxGlobalRate;
    walletAdvice = `💳 **In Your Wallet:**
You should pay with **${uc.label || uc.id}** which gives you **${maxUserRate}%** rewards.
${isOptimal ? '🟢 *This is the absolute best reward rate available for this transaction!*' : `🟡 *Optimization opportunity:* You are earning ${maxUserRate}%, but you could earn **${maxGlobalRate}%** with **${bestGlobalCard.bank} ${bestGlobalCard.name}**.`}`;
  }

  return {
    content: `🏆 **Spend Optimization for ${merchantStr} (${displayCategory} ${emoji})**

${walletAdvice}

🔥 **Top Cards in the Market for ${displayCategory}:**
1. **${bestGlobalCard.bank} ${bestGlobalCard.name}** — **${maxGlobalRate}%** rewards
${runners.map((c, i) => `${i + 2}. **${c.bank} ${c.name}** — **${getCardRewardForCategory(c, category)}%** rewards`).join('\n')}

💡 *Swipe your optimal card to maximize statement cashback and reward multipliers!*`,
    cards: [bestGlobalCard, ...runners],
  };
}

// Helper to look up best card globally for a category
function getBestCardForCategory(category: SpendCategory): FinixCard {
  let best = CARD_DATASET[0];
  let bestRate = 0;

  for (const card of CARD_DATASET) {
    const catReward = card.rewards?.find((r) => r.category === category);
    const rate = catReward ? catReward.rate : (card.baseRewardRate || 0.5);
    if (rate > bestRate) {
      bestRate = rate;
      best = card;
    }
  }

  return best;
}

function getCardRewardForCategory(card: FinixCard, category: SpendCategory): number {
  const catReward = card.rewards?.find((r) => r.category === category);
  return catReward ? catReward.rate : (card.baseRewardRate || 0.5);
}

function extractMerchant(query: string): string | null {
  const lower = query.toLowerCase();
  for (const m of POPULAR_MERCHANTS) {
    if (lower.includes(m.name.toLowerCase())) return m.name;
  }
  return null;
}

