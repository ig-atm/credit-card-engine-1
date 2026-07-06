import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Gift,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR — Premium fixed navigation
// ─────────────────────────────────────────────────────────────────────────────

export type TabId = 'home' | 'analyze' | 'wallet' | 'perks' | 'insights' | 'profile';

interface NavItem {
  id: TabId;
  label: string;
  Icon: typeof LayoutDashboard;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     label: 'Dashboard', Icon: LayoutDashboard, description: 'Overview & cards'      },
  { id: 'analyze',  label: 'Analyzer',  Icon: Search,          description: 'Card recommendations'  },
  { id: 'wallet',   label: 'Wallet',    Icon: Wallet,          description: 'Optimizer & payments'   },
  { id: 'perks',    label: 'Perks',     Icon: Gift,            description: 'Rewards & subscriptions'},
  { id: 'insights', label: 'Insights',  Icon: BarChart3,       description: 'Spend analysis & CIBIL' },
  { id: 'profile',  label: 'Profile',   Icon: User,            description: 'Settings & details'     },
];

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: SidebarProps) {
  const profile = useDashboardStore((s) => s.profile);
  const logout = useDashboardStore((s) => s.logout);

  return (
    <motion.aside
      className={cn(
        'fixed top-0 left-0 h-screen z-40 flex flex-col',
        'sidebar-glass shadow-ag-sidebar',
        'transition-[width] duration-300 ease-ag-smooth',
      )}
      style={{ width: collapsed ? 72 : 272 }}
      aria-label="Main navigation"
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 px-5 h-[72px] flex-shrink-0',
        'border-b border-canvas-200/50 dark:border-white/[0.04]',
      )}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-ag-glow-primary flex-shrink-0 overflow-hidden bg-black">
          <img src="/logo.jpg" alt="Renocred" className="w-full h-full object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-lg font-display font-bold text-ink-primary tracking-tight whitespace-nowrap">
                renocred
              </p>
              <p className="text-[10px] font-medium text-ink-disabled tracking-widest uppercase whitespace-nowrap">
                credit intelligence
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        <p className={cn(
          'text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-disabled px-3 mb-2',
          'transition-opacity duration-200',
          collapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100',
        )}>
          Navigation
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex items-center gap-3 rounded-xl transition-all duration-200',
                collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5',
                isActive
                  ? 'text-brand-500'
                  : 'text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200/50 dark:hover:bg-white/[0.03]',
              )}
            >
              {/* Active background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-y border-r border-brand-200/50 dark:border-brand-500/20 border-l-[3px] border-l-brand-500 dark:border-l-brand-400"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <item.Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.7}
                className={cn(
                  'relative z-10 flex-shrink-0 transition-colors duration-200',
                  isActive ? 'text-brand-500' : '',
                )}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 text-left overflow-hidden"
                  >
                    <p className={cn(
                      'text-sm font-semibold whitespace-nowrap',
                      isActive ? 'text-brand-600 dark:text-brand-500' : '',
                    )}>
                      {item.label}
                    </p>
                    <p className={cn(
                      'text-[10px] text-ink-disabled whitespace-nowrap',
                      isActive ? 'text-brand-400 dark:text-brand-600' : '',
                    )}>
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>


            </button>
          );
        })}
      </nav>

      {/* ── User Profile + Collapse Toggle ──────────────────────────────── */}
      <div className={cn(
        'flex flex-col gap-3 px-3 py-4 border-t border-canvas-200/50 dark:border-white/[0.04]',
        'flex-shrink-0',
      )}>
        {/* User card */}
        <div 
          onClick={() => onTabChange('profile')}
          className={cn(
            'flex items-center gap-3 rounded-xl cursor-pointer group',
            'transition-all duration-200 hover:bg-canvas-200/50 dark:hover:bg-white/[0.03]',
            collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2.5',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-canvas-200 dark:bg-canvas-300 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-brand-500/20 group-hover:ring-brand-500/40 transition-all duration-200">
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-ink-primary truncate group-hover:text-brand-500 transition-colors">
                    {profile?.name || "Atharva Kulkarni"}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); logout(); }} 
                    className="text-ink-disabled hover:text-loss transition-colors p-1 rounded-lg"
                    title="Logout"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-profit animate-ag-glow-pulse" />
                  <p className="text-[10px] font-medium text-ink-disabled">
                    {profile ? `CIBIL: ${profile.creditScore}` : "Premium Member"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center justify-center w-full rounded-lg py-2',
            'text-ink-disabled hover:text-ink-secondary',
            'hover:bg-canvas-200/50 dark:hover:bg-white/[0.03]',
            'transition-all duration-200',
          )}
        >
          {collapsed
            ? <ChevronRight size={16} strokeWidth={2} />
            : <ChevronLeft size={16} strokeWidth={2} />
          }
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;

