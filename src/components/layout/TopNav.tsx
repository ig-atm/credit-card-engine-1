import { motion } from 'framer-motion';
import { Bell, Moon, Sun } from 'lucide-react';
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
}

export function TopNav({ activeTab, isDark, onToggleTheme }: TopNavProps) {
  const { title, subtitle } = TAB_TITLES[activeTab];
  const profile = useDashboardStore((s) => s.profile);

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
        <button
          className={cn(
            'relative w-9 h-9 rounded-full flex items-center justify-center',
            'text-ink-tertiary hover:text-ink-secondary',
            'hover:bg-canvas-200/70 dark:hover:bg-white/[0.04]',
            'transition-all duration-200',
          )}
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.8} />
          {/* Badge dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-loss border-2 border-canvas-100 dark:border-canvas-50" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center',
            'text-ink-tertiary hover:text-brand-500',
            'hover:bg-canvas-200/70 dark:hover:bg-white/[0.04]',
            'transition-all duration-200',
          )}
          aria-label="Toggle theme"
        >
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </motion.div>
        </button>

        {/* Mobile-only profile avatar (visible < lg) */}
        <div className="lg:hidden w-9 h-9 rounded-full bg-canvas-200 dark:bg-canvas-300 overflow-hidden ring-1 ring-canvas-300 dark:ring-white/[0.06]">
          <img
            src={profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}

export default TopNav;

