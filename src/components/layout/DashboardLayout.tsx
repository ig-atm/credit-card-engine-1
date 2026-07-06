import { useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sidebar, type TabId } from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD LAYOUT — Root wrapper with Sidebar + TopNav + Content
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function DashboardLayout({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const profile = useDashboardStore((s) => s.profile);

  // ── Responsive detection ──────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setSidebarCollapsed(true);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <div className="bg-mesh min-h-screen w-full">
      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      )}

      {/* ── Mobile Sidebar Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-screen"
            >
              <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  onTabChange(tab);
                  setMobileMenuOpen(false);
                }}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-[margin-left] duration-300 ease-ag-smooth',
        )}
        style={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 272,
        }}
      >
        {/* Top Nav */}
        {isMobile ? (
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 h-14 topnav-glass">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-canvas-200/70 dark:hover:bg-white/[0.04] transition-all"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <motion.p
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base font-display font-bold text-ink-primary"
            >
              renocred
            </motion.p>
            <button 
              onClick={() => onTabChange('profile')}
              className="w-9 h-9 rounded-full bg-canvas-200 dark:bg-canvas-300 overflow-hidden ring-1 ring-canvas-300 dark:ring-white/[0.06] hover:ring-brand-500/50 transition-all cursor-pointer"
            >
              <img
                src={profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Atharva&backgroundColor=f8f9fa"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </header>
        ) : (
          <TopNav
            activeTab={activeTab}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onTabChange={onTabChange}
          />
        )}

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

