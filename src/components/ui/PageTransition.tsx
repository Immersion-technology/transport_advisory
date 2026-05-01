import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { PageLoader } from './Spinner';

// Module-level flag — true after the first Suspense fallback has rendered.
// Subsequent fallbacks use the lightweight progress bar instead of the
// full-screen logo loader, so in-app navigations feel instant.
let hasMounted = false;

/**
 * Minimalist route transition — 220ms fade with a 6px translate-up. Keyed off
 * `pathname`, wrapped in `AnimatePresence` so the outgoing page animates out
 * while the incoming one animates in. Respects `prefers-reduced-motion` (the
 * CSS rule in `index.css` clamps animation duration globally for those users).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Thin top-of-page progress bar shown while a lazily-loaded route chunk is
 * downloading. Used for in-app navigations — the user keeps the previous page
 * on screen until the next one is ready, with this 2px bar as the only visible
 * "loading" cue.
 */
function RouteProgressBar() {
  const [active, setActive] = useState(false);

  // The bar is mounted by Suspense's fallback. We start hidden and reveal after
  // 80ms so quick in-cache loads don't flash a bar that disappears immediately.
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[60] h-[2px]"
      style={{ contain: 'layout paint size' }}
    >
      <motion.div
        initial={{ scaleX: 0, transformOrigin: '0 0' }}
        animate={{ scaleX: active ? 0.85 : 0.05 }}
        transition={{ duration: active ? 1.2 : 0.15, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-emerald-400 via-[#0A3828] to-emerald-500"
      />
    </div>
  );
}

/**
 * Suspense fallback used by the app shell. Renders the full-screen `PageLoader`
 * during the very first chunk load (cold visit), then switches to the
 * lightweight `RouteProgressBar` for every subsequent in-app navigation.
 */
export function RouteFallback() {
  // useState lazy initializer captures the value at the moment this fallback
  // first renders, even though the module-level flag flips immediately after.
  const [isInitial] = useState(() => !hasMounted);
  useEffect(() => {
    hasMounted = true;
  }, []);
  return isInitial ? <PageLoader /> : <RouteProgressBar />;
}
