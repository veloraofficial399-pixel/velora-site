import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

/** Ready-to-send message, so a visitor only has to press send. */
const MESSAGE =
  `Hi VELORA! 👋\n\n` +
  `I'm looking at your wedding invitation designs and would love some help choosing one 💍\n\n` +
  `Could you please share the details?`;

/** Lines for the little bubble beside the button, one per appearance. */
const HINTS: [string, string][] = [
  ['Need help choosing?', 'Chat with us'],
  ['Found one you like?', 'Send us its code'],
  ['Any questions?', 'Ask us on WhatsApp'],
];

const FIRST_AT_MS = 13000; // after the ~10s welcome guide
const SHOW_MS = 5500; // how long the bubble stays
const GAP_MS = 20000; // at least this long between two bubbles
const SCROLL_SCREENS = 1.5; // …and at least this much browsing (in screen heights) since the last one

/**
 * Kept for the whole page load (the button unmounts while a design is open full screen),
 * so the bubble doesn't start over when the visitor comes back to the grid.
 */
const session = { shown: 0, lastAt: 0, scrollAt: 0, clicked: false, started: 0 };

/**
 * Floating WhatsApp button (bottom-right of /templates): one tap opens a chat with VELORA with the message
 * already typed. A small bubble beside it appears a few times while the visitor browses: first after the
 * welcome guide, then again after they have scrolled through more cards. Never after they tap the button.
 */
export const TemplatesWhatsApp: React.FC = () => {
  const { getWhatsAppLink } = useStore();
  const [hint, setHint] = useState<[string, string] | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!session.started) session.started = Date.now();

    const canShow = () => !session.clicked && session.shown < HINTS.length;
    const show = () => {
      if (!canShow()) return;
      setHint(HINTS[session.shown]);
      session.shown += 1;
      session.lastAt = Date.now();
      session.scrollAt = window.scrollY;
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setHint(null), SHOW_MS);
    };

    // First bubble: a little after the page opens (only once per page load).
    const first =
      session.shown === 0 ? setTimeout(show, Math.max(1500, FIRST_AT_MS - (Date.now() - session.started))) : undefined;

    // Again while browsing: enough time has passed and they've scrolled through more designs.
    const onScroll = () => {
      if (!canShow() || session.shown === 0) return;
      if (Date.now() - session.lastAt < GAP_MS) return;
      if (Math.abs(window.scrollY - session.scrollAt) < window.innerHeight * SCROLL_SCREENS) return;
      show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="fixed right-4 sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 z-40 flex items-center gap-2">
      <AnimatePresence>
        {hint && (
          <motion.span
            key={hint[0]}
            initial={{ opacity: 0, x: 10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="pointer-events-none px-3 py-1.5 rounded-2xl rounded-br-md bg-white/95 backdrop-blur-sm border border-[#C6A16B]/40 shadow-lg text-[12px] sm:text-[13px] text-[#34251D] whitespace-nowrap"
          >
            <strong className="font-semibold">{hint[0]}</strong> {hint[1]}
          </motion.span>
        )}
      </AnimatePresence>

      <a
        href={getWhatsAppLink(MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with VELORA on WhatsApp"
        onClick={() => {
          session.clicked = true;
          setHint(null);
        }}
        className="relative flex w-12 h-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] ring-[1.5px] ring-white/90 hover:scale-105 active:scale-95 transition-transform"
      >
        {/* slow, soft glow so it's noticed without being loud */}
        <motion.span
          className="absolute inset-0 rounded-full bg-[#25D366]"
          aria-hidden="true"
          animate={{ scale: [1, 1.45], opacity: [0.35, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeOut' }}
        />
        <WhatsAppIcon className="relative w-6 h-6" />
      </a>
    </div>
  );
};
