import React from 'react';
import { motion } from 'framer-motion';

/**
 * Remembers hints only for the current page load: every time the link is opened or the page is
 * refreshed, the welcome peek and the first-design tips show again (once each per load).
 */
const shown = new Set<string>();

export const onceFlag = {
  seen: (key: string) => shown.has(key),
  mark: (key: string) => {
    shown.add(key);
  },
};

/** Total time on screen: lean in, wave hi, slip back out. */
const PEEK_SECONDS = 6;
const T_IN = 0.08; // fully leaned in
const T_OUT = 0.9; // starts leaving (≈4.5s fully visible so the message can be read)

/**
 * Anime-style guide (illustration in public/guide, generated in Figma): he leans in from the screen edge
 * (right by default, or left — mirrored), waves hi from the wrist while bobbing his head, then slips back out.
 * The speech bubble pops beside his face while he's in.
 */
export const PeekingMan: React.FC<{
  onDone: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  /** extra classes for the fixed wrapper (position / z-index) */
  className?: string;
}> = ({ onDone, children, side = 'right', className = 'top-[58px] sm:top-[66px] z-40' }) => {
  const left = side === 'left';
  const m = left ? -1 : 1; // mirror factor for horizontal motion
  return (
    <div
      className={`pointer-events-none fixed ${left ? 'left-0 flex-row-reverse' : 'right-0'} flex items-start ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* speech bubble, next to his face (a tap closes it, so it never blocks the controls underneath) */}
      <motion.div
        onClick={onDone}
        className={`pointer-events-auto cursor-pointer relative mt-6 sm:mt-8 ${left ? '-ml-1 rounded-tl-sm' : '-mr-1 rounded-tr-sm'} w-[200px] sm:w-[230px] rounded-2xl bg-gradient-to-br from-[#3A2A20] to-[#231812] border border-[#C6A16B]/60 shadow-2xl shadow-black/30 px-3.5 py-2.5 z-10`}
        style={{ transformOrigin: left ? 'top left' : 'top right' }}
        initial={{ opacity: 0, scale: 0.4, x: 12 * m }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1.06, 1, 0.6], x: [12 * m, 12 * m, 0, 0, 16 * m] }}
        transition={{ duration: PEEK_SECONDS, times: [0, T_IN + 0.02, T_IN + 0.07, T_OUT - 0.01, T_OUT + 0.04], ease: 'easeOut' }}
      >
        {children}
        <span
          className={`absolute top-3 w-3 h-3 rotate-45 bg-[#2E2119] ${
            left ? '-left-[7px] border-b border-l' : '-right-[7px] border-t border-r'
          } border-[#C6A16B]/60`}
        />
      </motion.div>

      {/* the man: leans in from the edge (pivoting at his hidden shoulder) and back out */}
      <motion.div
        className="relative w-[104px] h-[181px] sm:w-[128px] sm:h-[223px] drop-shadow-xl"
        style={{
          originX: left ? 0 : 1,
          originY: 1,
          // soften where the illustration is cropped at the bottom
          WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 98%)',
          maskImage: 'linear-gradient(to bottom, #000 72%, transparent 98%)',
        }}
        initial={{ x: left ? '-110%' : '110%', rotate: 16 * m }}
        animate={{
          x: left ? ['-110%', '4%', '0%', '0%', '0%', '0%', '-110%'] : ['110%', '-4%', '0%', '0%', '0%', '0%', '110%'],
          rotate: [16, -7, -3, -6, -2, -4, 16].map((r) => r * m),
        }}
        transition={{
          duration: PEEK_SECONDS,
          times: [0, T_IN * 0.8, T_IN + 0.04, 0.4, 0.65, T_OUT, 1],
          ease: ['easeOut', 'easeInOut', 'easeInOut', 'easeInOut', 'linear', 'easeIn'],
        }}
        onAnimationComplete={onDone}
      >
        {/* mirrored when peeking from the left */}
        <div className="absolute inset-0" style={left ? { transform: 'scaleX(-1)' } : undefined}>
          <img src="/guide/body.webp" alt="" draggable={false} className="absolute inset-0 w-full h-full select-none" />
          {/* waving hand, rotating at the wrist */}
          <motion.img
            src="/guide/hand.webp"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full select-none"
            style={{ originX: 0.368, originY: 0.824 }}
            animate={{ rotate: [0, 0, -16, 10, -16, 10, -4, 0, -10, 6, 0, 0] }}
            transition={{ duration: PEEK_SECONDS, times: [0, T_IN, 0.15, 0.21, 0.27, 0.33, 0.39, 0.45, 0.62, 0.7, 0.78, 1], ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

/** A pointing hand that "taps" — used to show where to press. */
export const TapHand: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <motion.svg
    viewBox="0 0 48 48"
    className={className}
    style={style}
    aria-hidden="true"
    animate={{ y: [0, -7, 0], scale: [1, 1, 0.9, 1] }}
    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
  >
    <path
      d="M18 6a4 4 0 0 1 8 0v14.5l1.2-.3a4 4 0 0 1 4.7 2.6l.1.4.9-.2a4 4 0 0 1 4.6 3l.2.8a4 4 0 0 1 4.3 3.2l1 5.6c1 5.5-2.4 10.8-7.8 12.2l-5 1.3a11 11 0 0 1-11.5-4.1L9 33.5a4 4 0 0 1 6.3-5l2.7 3.4V6Z"
      fill="#FFFFFF"
      stroke="#231812"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </motion.svg>
);
