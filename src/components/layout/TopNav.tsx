import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TabId } from './Sidebar';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  TOP NAV — Sticky header for main content area
// ─────────────────────────────────────────────────────────────────────────────

const TAB_TITLES: Record<TabId, { title: string; subtitle: string }> = {
  home:     { title: 'Dashboard',      subtitle: 'Your financial overview at a glance'      },
  analyze:  { title: 'Card Analyzer',  subtitle: 'Personalized credit card recommendations' },
  wallet:   { title: 'Wallet',         subtitle: 'Optimize payments & track bills'           },
  insights: { title: 'Insights',       subtitle: 'Spend analysis & credit health'            },
  perks:    { title: 'Perks & Rewards',subtitle: 'Milestone tracking & card benefits'        },
  profile:  { title: 'Profile Settings', subtitle: 'Manage your credit profile and preferences' },
};

interface TopNavProps {
  activeTab: TabId;
  isDark: boolean;
  onToggleTheme: () => void;
  onTabChange?: (tab: TabId) => void;
}

export function TopNav({ activeTab, isDark: _isDark, onToggleTheme: _onToggleTheme, onTabChange }: TopNavProps) {
  const { title, subtitle } = TAB_TITLES[activeTab];
  const profile = useDashboardStore((s) => s.profile);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const NOTIFICATIONS = [
    { id: 1, title: 'Budget Alert', desc: 'You reached 85% of your Dining budget.', time: '2 hours ago', unread: true },
    { id: 2, title: 'Upcoming Renewal', desc: 'Netflix will renew tomorrow for ₹649.', time: '5 hours ago', unread: true },
    { id: 3, title: 'Milestone Unlocked', desc: 'You unlocked 5,000 bonus points on Amex.', time: '1 day ago', unread: false },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-4',
        'px-6 lg:px-8 h-16',
        'topnav-glass',
      )}
    >
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-lg font-display font-bold text-ink-primary tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-ink-tertiary hidden sm:block">{subtitle}</p>
        </motion.div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              'relative w-9 h-9 rounded-full flex items-center justify-center',
              'text-ink-tertiary hover:text-ink-secondary',
              'hover:bg-canvas-200/70 dark:hover:bg-white/[0.04]',
              showNotifications && 'bg-canvas-200/70 dark:bg-white/[0.04] text-ink-primary',
              'transition-all duration-200',
            )}
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.8} />
            {/* Badge dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-canvas-100 dark:border-canvas-50" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-80 panel-glass bg-canvas-50/95 dark:bg-canvas-300/95 rounded-2xl shadow-ag-modal border border-canvas-200/50 dark:border-white/5 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-canvas-200/50 dark:border-white/5 flex justify-between items-center bg-canvas-100/50 dark:bg-black/10">
                  <h3 className="font-bold text-ink-primary text-sm">Notifications</h3>
                  <button className="text-xs font-semibold text-brand-500 hover:text-brand-600">Mark all as read</button>
                </div>
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map(notif => (
                    <button key={notif.id} className="text-left p-4 hover:bg-canvas-100 dark:hover:bg-white/[0.02] transition-colors border-b border-canvas-200/30 dark:border-white/5 last:border-0 relative">
                      {notif.unread && <span className="absolute left-3 top-5 w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      <div className={cn("pl-4", !notif.unread && "opacity-70")}>
                        <h4 className="text-sm font-bold text-ink-primary mb-1">{notif.title}</h4>
                        <p className="text-xs text-ink-secondary leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[10px] text-ink-tertiary uppercase tracking-wider font-semibold">{notif.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile-only profile avatar (visible < lg) */}
        <button
          onClick={() => onTabChange && onTabChange('profile')}
          className="lg:hidden w-9 h-9 rounded-full bg-canvas-200 dark:bg-canvas-300 overflow-hidden ring-1 ring-canvas-300 dark:ring-white/[0.06] hover:ring-brand-500/50 transition-all cursor-pointer"
        >
          <img
            src={profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}

export default TopNav;

