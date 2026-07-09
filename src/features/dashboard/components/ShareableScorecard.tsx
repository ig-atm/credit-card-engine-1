import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Download, X,
  CheckCircle2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../store/dashboardStore';
import { CARD_DATASET } from '../../finix/data/cardDataset';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

function getCreditGrade(score: number): { grade: string; label: string; color: string; bg: string } {
  if (score >= 800) return { grade: 'A+', label: 'Exceptional', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  if (score >= 750) return { grade: 'A',  label: 'Excellent',   color: '#6366f1', bg: 'rgba(99,102,241,0.12)' };
  if (score >= 700) return { grade: 'B+', label: 'Good',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (score >= 650) return { grade: 'B',  label: 'Fair',        color: '#f97316', bg: 'rgba(249,115,22,0.12)' };
  return              { grade: 'C',  label: 'Needs Work',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   };
}

function getTier(points: number): { label: string; icon: string } {
  if (points >= 100000) return { label: 'Platinum', icon: '💎' };
  if (points >= 50000)  return { label: 'Gold',     icon: '🥇' };
  if (points >= 20000)  return { label: 'Silver',   icon: '🥈' };
  return                       { label: 'Bronze',   icon: '🥉' };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCORECARD CARD (the actual shareable visual)
// ─────────────────────────────────────────────────────────────────────────────

function ScorecardCanvas({ captureRef }: { captureRef: React.RefObject<HTMLDivElement> }) {
  const profile       = useDashboardStore((s) => s.profile);
  const rewards       = useDashboardStore((s) => s.rewards);
  const userCards     = useDashboardStore((s) => s.userCards);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const transactions  = useDashboardStore((s) => s.transactions);

  if (!profile) return null;

  const availablePoints = rewards.totalPoints - rewards.redeemedPoints;
  const tier            = getTier(availablePoints);
  const grade           = getCreditGrade(profile.creditScore);
  const totalLimit      = creditAccounts.reduce((s, a) => s + a.totalLimit / 100, 0);
  const totalBalance    = creditAccounts.reduce((s, a) => s + a.currentBalance / 100, 0);
  const utilization     = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const monthlySpend    = transactions
    .filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount > 0;
    })
    .reduce((s, t) => s + t.amount / 100, 0);
  const topCategory = (() => {
    const counts: Record<string, number> = {};
    transactions.filter((t) => t.amount > 0).forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? 'shopping';
  })();

  const cardCount  = userCards.length;
  const firstName  = profile.name.split(' ')[0];
  const now        = new Date();
  const dateStr    = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const stats = [
    { label: 'Reward Points', value: availablePoints.toLocaleString(), icon: '⭐' },
    { label: 'Credit Score',  value: profile.creditScore.toString(),   icon: '🛡️' },
    { label: 'Utilization',   value: `${utilization}%`,                icon: '📊' },
    { label: 'Cards',         value: cardCount.toString(),             icon: '💳' },
    { label: 'Month Spend',   value: formatINR(monthlySpend),          icon: '💰' },
    { label: 'Top Category',  value: topCategory.charAt(0).toUpperCase() + topCategory.slice(1), icon: '🎯' },
  ];

  return (
    <div
      ref={captureRef}
      style={{
        width: '480px',
        minHeight: '640px',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 40%, #0a0f1a 100%)',
        borderRadius: '28px',
        padding: '36px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: -80, right: -60, width: 280, height: 280,
        borderRadius: '50%', background: 'rgba(99,102,241,0.07)', filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(16,185,129,0.05)', filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={profile.avatar}
            alt={profile.name}
            style={{ width: 52, height: 52, borderRadius: '50%', background: '#1c1c28', border: '2px solid rgba(255,255,255,0.1)' }}
            crossOrigin="anonymous"
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f8f8ff', letterSpacing: '-0.3px' }}>{firstName}'s</div>
            <div style={{ fontSize: 12, color: 'rgba(248,248,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Credit Scorecard</div>
          </div>
        </div>
        {/* Tier Badge */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 40, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>{tier.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8f8ff' }}>{tier.label}</span>
        </div>
      </div>

      {/* Credit Grade Hero */}
      <div style={{
        background: grade.bg, border: `1px solid ${grade.color}22`,
        borderRadius: 20, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `${grade.color}18`, border: `3px solid ${grade.color}44`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{grade.grade}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(248,248,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Credit Health</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f8f8ff', letterSpacing: '-0.5px', lineHeight: 1 }}>{profile.creditScore}</div>
          <div style={{ fontSize: 14, color: grade.color, fontWeight: 600, marginTop: 4 }}>{grade.label}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(248,248,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Annual Income</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f8f8ff' }}>{formatINR(profile.salary)}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24,
      }}>
        {stats.map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '14px 12px',
          }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f8f8ff', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'rgba(248,248,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Card Portfolio Dots */}
      {userCards.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: 'rgba(248,248,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Card Portfolio</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {userCards.slice(0, 3).map((card) => {
              const dc = CARD_DATASET.find((c) => c.id === card.id);
              return (
                <div key={card.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    width: 32, height: 22, borderRadius: 6,
                    background: dc ? `linear-gradient(135deg, ${dc.gradientFrom}, ${dc.gradientTo})` : '#333',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f8f8ff', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</span>
                  {dc && <span style={{ fontSize: 11, color: 'rgba(248,248,255,0.4)', flexShrink: 0 }}>{dc.network}</span>}
                </div>
              );
            })}
            {userCards.length > 3 && (
              <div style={{ fontSize: 11, color: 'rgba(248,248,255,0.35)', paddingLeft: 4 }}>+{userCards.length - 3} more cards</div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'white', fontWeight: 900 }}>R</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(248,248,255,0.6)' }}>RenoCred</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(248,248,255,0.25)' }}>{dateStr}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHAREABLE SCORECARD (modal trigger + actions)
// ─────────────────────────────────────────────────────────────────────────────

export function ShareableScorecard() {
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null!);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `renocred-scorecard-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Capture failed', e);
    } finally {
      setCapturing(false);
    }
  };

  const handleCopyImage = async () => {
    if (!captureRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback: just download
          handleDownload();
        }
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl font-bold text-sm transition-all"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          color: 'white',
        }}
      >
        <Share2 size={16} />
        Share My Scorecard
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative flex flex-col items-center gap-6 max-h-[92vh] overflow-y-auto py-6"
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-0 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
              >
                <X size={16} />
              </button>

              {/* Scorecard */}
              <div className="overflow-hidden rounded-[28px] shadow-2xl" style={{ transform: 'translateZ(0)' }}>
                <ScorecardCanvas captureRef={captureRef} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full max-w-[480px]">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  disabled={capturing}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                >
                  <Download size={16} />
                  {capturing ? 'Saving…' : 'Download PNG'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCopyImage}
                  disabled={capturing}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm border transition-all disabled:opacity-50',
                    copied
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-white/[0.05] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08]',
                  )}
                >
                  {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Share2 size={16} /> Copy Image</>}
                </motion.button>
              </div>

              <p className="text-xs text-white/25 text-center max-w-[360px]">
                Your scorecard is generated locally — no data leaves your device.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
