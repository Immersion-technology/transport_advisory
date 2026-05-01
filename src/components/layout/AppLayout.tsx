import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Auto-close the mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F5F7F2]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Animated backdrop for mobile drawer — fades in/out instead of popping */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen lg:ml-64">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {/* Subtle inner-page transition on route change inside the dashboard.
              Keyed on pathname so each navigation animates in cleanly without
              fighting the outer PageTransition wrapper. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
