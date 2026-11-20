import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { onceFlag } from './Guide';

const HINT_KEY = 'velora_templates_whatsapp_hint_v1';

/** Ready-to-send message, so a visitor only has to press send. */
const MESSAGE =
  `Hi VELORA! 👋\n\n` +
  `I'm looking at your wedding invitation designs and would love some help choosing one 💍\n\n` +
  `Could you please share the details?`;

/**
 * Floating WhatsApp button (bottom-right of /templates): one tap opens a chat with VELORA with the message
 * already typed. Once per page load, after the welcome guide has left, a small "Need help choosing?" label
 * slides out beside it for a few seconds.
 */
export const TemplatesWhatsApp: React.FC = () => {
  const { getWhatsAppLink } = useStore();
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (onceFlag.seen(HINT_KEY)) return;
    const show = setTimeout(() => {
      onceFlag.mark(HINT_KEY);
      setHint(true);
    }, 13000); // after the ~10s welcome
    const hide = setTimeout(() => setHint(false), 19000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div className="fixed right-4 sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 z-40 flex items-center gap-2.5">
      <AnimatePresence>
        {hint && (
          <motion.span
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            className="pointer-events-none px-3.5 py-2 rounded-2xl rounded-br-md bg-white border border-[#C6A16B]/40 shadow-xl text-[12px] sm:text-[13px] text-[#34251D] whitespace-nowrap"
          >
            <strong className="font-semibold">Need help choosing?</strong> Chat with us
          </motion.span>
        )}
      </AnimatePresence>

      <a
        href={getWhatsAppLink(MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with VELORA on WhatsApp"
        onClick={() => setHint(false)}
        className="relative flex w-14 h-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] ring-2 ring-white hover:scale-105 active:scale-95 transition-transform"
      >
        {/* soft pulse so it is noticed without being loud */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" aria-hidden="true" />
        <WhatsAppIcon className="relative w-7 h-7" />
      </a>
    </div>
  );
};
