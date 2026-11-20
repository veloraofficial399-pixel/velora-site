import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { ChevronUp, ChevronDown, X, ExternalLink, Info, Crown, Sparkles, Hand, Clock, Wand2, Share2, Pointer, Link2, Check } from 'lucide-react';
import { WeddingTemplate } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPrice, getRank } from '../../data/templates';
import { previewPoster } from './LiveStoryCard';
import { onceFlag, PeekingMan } from './Guide';

const TIPS_KEY = 'velora_fullscreen_tips_seen_v1';
const GUIDE_KEY = 'velora_fullscreen_guide_seen_v1';

/** VELORA's key promises, shown in every design's details. */
const PROMISES = [
  { icon: Clock, title: 'Ready within hours', text: 'Your final invitation is delivered within hours.' },
  { icon: Wand2, title: 'Fully customisable', text: 'Text, colours, photos, music, sections — we change anything you need.' },
  { icon: Sparkles, title: 'Made for every faith', text: 'Adapted for Hindu, Muslim, Christian or any ceremony.' },
  { icon: Share2, title: 'One link for every guest', text: 'Opens instantly on any phone. Share on WhatsApp & Instagram.' },
];

interface TemplateFullscreenProps {
  template: WeddingTemplate;
  /** The list being browsed (already filtered and sorted), for previous / next. */
  list: WeddingTemplate[];
  onChange: (template: WeddingTemplate) => void;
  onClose: () => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.23-4.25 9.47-9.47 9.47zm8.06-17.53A11.32 11.32 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.69L.55 23.63l6.05-1.59a11.36 11.36 0 0 0 5.43 1.38h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.06z" />
  </svg>
);

/** Slide transitions between designs: the next one rises from below, the previous one drops from above. */
const slide = {
  enter: (dir: number) => ({ y: dir >= 0 ? '100%' : '-100%', opacity: 0.6 }),
  center: { y: '0%', opacity: 1 },
  exit: (dir: number) => ({ y: dir >= 0 ? '-30%' : '30%', opacity: 0, scale: 0.94 }),
};

/**
 * Full-screen, real experience of one design: the live, interactive invitation.
 * Floating ▲ ▼ buttons on the right (or ↑ ↓ keys) move to the previous / next design with a slide animation.
 * Only one live site is loaded at a time.
 */
export const TemplateFullscreen: React.FC<TemplateFullscreenProps> = ({ template: t, list, onChange, onClose }) => {
  const { getWhatsAppLink, setSelectedOrderTemplate } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [dir, setDir] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const sheetDrag = useDragControls();
  const [showLiveHint, setShowLiveHint] = useState(true);
  const [tip, setTip] = useState<'none' | 'next' | 'book'>('none');
  const isSignature = getRank(t) === 1;

  const index = list.findIndex((x) => x.id === t.id);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  const navigated = React.useRef(false);
  const go = (target: WeddingTemplate | null, direction: number) => {
    if (!target) return;
    navigated.current = true;
    setDir(direction);
    setShowDetails(false);
    if (tip === 'next') setTip('none');
    onChange(target);
  };

  useEffect(() => {
    setLoaded(false);
    setShowLiveHint(true);
    const timer = setTimeout(() => setShowLiveHint(false), 5000);
    return () => clearTimeout(timer);
  }, [t.id]);

  // Hide the "tap to open" hint as soon as the client taps into the invitation (focus moves into the iframe).
  useEffect(() => {
    const onBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') setShowLiveHint(false);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  // The ▼ arrow glides downward for the first few seconds on the first design opened.
  const [nudgeArrow, setNudgeArrow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setNudgeArrow(false), 11000);
    return () => clearTimeout(timer);
  }, []);

  // On every design after the first: remind about booking ~2s after it opens.
  const lastDesign = React.useRef(t.id);
  useEffect(() => {
    if (lastDesign.current === t.id) return; // the first design has its own tip sequence
    lastDesign.current = t.id;
    const show = setTimeout(() => setTip((cur) => (cur === 'none' ? 'book' : cur)), 2000);
    const hide = setTimeout(() => setTip((cur) => (cur === 'book' ? 'none' : cur)), 5800);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [t.id]);

  // Once per page load, on the first design opened: the guide peeks in from the top-left and explains.
  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    if (onceFlag.seen(GUIDE_KEY)) return;
    const timer = setTimeout(() => {
      onceFlag.mark(GUIDE_KEY);
      setShowGuide(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Once per page load: 1) bubble beside the ▼ "next design" button, 2) bubble pointing at "Book This Design".
  useEffect(() => {
    if (onceFlag.seen(TIPS_KEY)) return;
    const timers = [
      setTimeout(() => {
        onceFlag.mark(TIPS_KEY); // marked when shown (effects may run twice in development)
        if (!navigated.current) setTip((cur) => (cur === 'none' ? 'next' : cur));
      }, 7400), // after the guide has said his line
      setTimeout(() => setTip((cur) => (cur === 'next' || cur === 'none' ? 'book' : cur)), 11200),
      setTimeout(() => setTip((cur) => (cur === 'book' ? 'none' : cur)), 14800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Lock page scroll and wire up the keyboard while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetails) setShowDetails(false);
        else onClose();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(next, 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(prev, -1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }); // re-bind each render so the handler always sees the current design

  // Stop the invitation's music whenever the client leaves: unload the live site while the page is hidden
  // (switched to WhatsApp, locked the phone, went back…) and load it fresh when they return.
  const [suspended, setSuspended] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stopLiveSite = () => {
    try {
      if (iframeRef.current) iframeRef.current.src = 'about:blank';
    } catch {
      /* ignore */
    }
    setSuspended(true);
    setLoaded(false);
  };
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopLiveSite();
      else setSuspended(false);
    };
    const onPageHide = () => stopLiveSite();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      // closing the viewer: make sure nothing keeps playing
      try {
        if (iframeRef.current) iframeRef.current.src = 'about:blank';
      } catch {
        /* ignore */
      }
    };
  }, []);
  useEffect(() => setSuspended(false), [t.id]);

  const handleBook = () => {
    stopLiveSite(); // silence the invitation before switching to WhatsApp
    setSelectedOrderTemplate(t);
    const msg =
      `Hi VELORA! 👋✨\n\n` +
      `I'd love to begin with design *${t.id}* for our wedding invitation 💍\n\n` +
      `Please share the details needed to get started. Excited to see it come to life! 🌸`;
    window.open(getWhatsAppLink(msg), '_blank');
  };

  // Share this design (partner, family): the phone's share sheet, or copy the link on computers.
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = `${window.location.origin}/templates/${t.id}`;
    const title = `VELORA wedding invitation · design ${t.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} (${formatPrice(t.price)}) — see it live:`, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return; // closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const navBtn =
    'p-2 rounded-full bg-white/10 text-[#F8F3EC] hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors';
  const sideBtn =
    'w-11 h-11 rounded-full flex items-center justify-center bg-[#231812]/80 backdrop-blur-md border border-[#C6A16B]/50 text-[#E4C78F] shadow-xl shadow-black/30 active:scale-90 transition-transform disabled:opacity-25 disabled:active:scale-100';

  const bookButton = (extra = '') => (
    <button
      type="button"
      onClick={handleBook}
      className={`btn-shine btn-glow relative overflow-hidden flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D9B97F] to-[#C6A16B] hover:from-[#E4C78F] hover:to-[#d6b37f] text-[#231812] uppercase tracking-wider font-bold shadow-lg shadow-black/30 transition-colors ${extra}`}
    >
      <WhatsAppIcon className="w-4 h-4" />
      Book This Design
    </button>
  );

  const details = (
    <div className="space-y-4 text-[#EFE5D8]">
      <div className="flex flex-wrap items-center gap-2">
        {isSignature && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C6A16B]/20 text-[#E4C78F] text-[11px] font-semibold uppercase tracking-wider">
            <Crown className="w-3 h-3" /> Best in plan
          </span>
        )}
        <span className="px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-[#C6A16B]/15 text-[#C6A16B]">
          {t.collectionName}
        </span>
      </div>

      {/* Our key promises */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#C6A16B] mb-2.5">Why couples choose VELORA</p>
        <ul className="space-y-2.5">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-2.5">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-[#C6A16B]/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#E4C78F]" />
              </span>
              <span className="text-[13px] leading-snug">
                <strong className="text-white font-semibold">{title}</strong>
                <span className="block text-[11.5px] text-[#EFE5D8]/70">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#C6A16B] mb-1.5">How booking works</p>
        <ol className="space-y-1 text-xs text-[#EFE5D8]/85">
          <li><span className="text-[#C6A16B] font-semibold mr-2">1</span>Tap “Book This Design” — opens WhatsApp</li>
          <li><span className="text-[#C6A16B] font-semibold mr-2">2</span>Send your names, dates, venues & photos</li>
          <li><span className="text-[#C6A16B] font-semibold mr-2">3</span>Receive your invitation link within hours</li>
        </ol>
      </div>
    </div>
  );

  /** Bubble that points at the Book button the first time; it floats up and fades away. */
  const bookTip = (
    <AnimatePresence>
      {tip === 'book' && !showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -28, scale: 0.95 }}
          transition={{ type: 'spring', damping: 18, stiffness: 240 }}
          className="pointer-events-none absolute bottom-full right-3 md:right-auto md:left-1/2 md:-translate-x-1/2 mb-3 z-20"
        >
          <div className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-br from-[#3A2A20] to-[#231812] border border-[#C6A16B]/60 text-[#F8F3EC] text-xs font-semibold shadow-2xl shadow-black/40 whitespace-nowrap">
            <span className="text-[#E4C78F]">✨ Love this design?</span> Tap here to book it
            <span className="absolute -bottom-[7px] right-10 md:right-auto md:left-1/2 md:-translate-x-1/2 w-3 h-3 bg-[#231812] border-r border-b border-[#C6A16B]/60 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#1C130E] flex flex-col md:flex-row md:items-center md:justify-center md:gap-10 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Design ${t.id}`}
    >
      {showGuide && (
        <PeekingMan side="left" className="top-[52px] md:top-10 z-[70]" onDone={() => setShowGuide(false)}>
          <p className="font-serif text-[15px] sm:text-base text-[#E4C78F] leading-tight whitespace-nowrap">Experience it live ✨</p>
          <p className="text-[11px] sm:text-xs text-[#EFE5D8]/90 leading-snug mt-0.5">
            <strong className="text-white">Tap the invitation</strong> to open it, then scroll to explore — just like your guests will.
          </p>
        </PeekingMan>
      )}

      {/* Top bar (mobile) */}
      <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2 bg-[#1C130E] text-[#F8F3EC]">
        <button type="button" onClick={onClose} className={navBtn} aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl tracking-wide">{t.id}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#8B1E2D] text-white text-xs font-semibold">{formatPrice(t.price)}</span>
          {isSignature && <Crown className="w-4 h-4 text-[#C6A16B]" aria-label="Best in plan" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#EFE5D8]/60 tabular-nums">
            {index + 1}/{list.length}
          </span>
          <button type="button" onClick={handleShare} className={navBtn} aria-label={`Share design ${t.id}`}>
            {copied ? <Check className="w-5 h-5 text-[#E4C78F]" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* "Link copied" toast (when the phone/computer has no share sheet) */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="status"
            className="pointer-events-none fixed inset-x-0 top-14 md:top-6 z-[80] flex justify-center px-4"
          >
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#231812] border border-[#C6A16B]/60 text-[#F8F3EC] text-xs font-semibold whitespace-nowrap shadow-2xl shadow-black/40">
              <Link2 className="w-3.5 h-3.5 text-[#E4C78F]" />
              Link copied · send it to your family
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live, interactive site: full screen on mobile, phone frame on laptop */}
      <div className="relative flex-1 min-h-0 w-full md:flex-none md:w-[390px] md:h-[min(844px,calc(100vh-4rem))] md:rounded-[36px] md:border-[6px] md:border-[#34251D] md:shadow-2xl overflow-hidden bg-[#1C130E]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={t.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ y: { type: 'spring', damping: 30, stiffness: 260 }, opacity: { duration: 0.3 }, scale: { duration: 0.35 } }}
            className="absolute inset-0 bg-[#EFE5D8]"
          >
            {/* the closed invitation shows instantly while the live site loads */}
            {!loaded && (
              <>
                <img src={previewPoster(t)} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <div hidden={suspended} className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-[11px] tracking-wider flex items-center gap-2 whitespace-nowrap">
                  <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Opening live invitation…
                </div>
              </>
            )}
            {suspended && (
              <button
                type="button"
                onClick={() => setSuspended(false)}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/30"
                aria-label="Continue exploring this invitation"
              >
                <span className="px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-[#E4C78F]/40 text-white text-[13px] font-semibold">
                  ▶ Continue exploring
                </span>
              </button>
            )}
            {!suspended && (
            <iframe
              ref={iframeRef}
              src={t.demoUrl}
              title={`Design ${t.id} — live`}
              onLoad={() => setLoaded(true)}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              className="absolute inset-0 w-full h-full border-0 bg-transparent"
            />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ▲ ▼ on the right edge: previous / next design */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <button type="button" onClick={() => go(prev, -1)} disabled={!prev} className={sideBtn} aria-label="Previous design">
            <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="relative">
            {/* first-time bubble pointing at the next button */}
            <AnimatePresence>
              {tip === 'next' && next && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 240 }}
                  style={{ transformOrigin: 'right center' }}
                  className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 w-max max-w-[200px] rounded-2xl rounded-r-md bg-gradient-to-br from-[#3A2A20] to-[#231812] border border-[#C6A16B]/60 shadow-2xl shadow-black/40 px-3.5 py-2"
                >
                  <p className="text-[#E4C78F] text-xs font-semibold">Next design</p>
                  <p className="text-[#F8F3EC]/85 text-[11px] leading-snug">Tap here to see the next one</p>
                  <span className="absolute top-1/2 -translate-y-1/2 -right-[7px] w-3 h-3 rotate-45 bg-[#2B1F18] border-t border-r border-[#C6A16B]/60" />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() => go(next, 1)}
              disabled={!next}
              className={sideBtn}
              aria-label="Next design"
              animate={tip === 'next' ? { boxShadow: ['0 0 0 0 rgba(228,199,143,0.7)', '0 0 0 14px rgba(228,199,143,0)'] } : {}}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            >
              <motion.span
                className="flex"
                animate={nudgeArrow && next ? { y: [0, 5, 0] } : { y: 0 }}
                transition={nudgeArrow && next ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* "Tap to open" hint at the bottom: dark-gold pill with a tapping hand and a soft glow */}
        <AnimatePresence>
          {showLiveHint && loaded && !showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="pointer-events-none absolute bottom-4 inset-x-0 z-10 flex justify-center px-4"
            >
              <div className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-black/55 backdrop-blur-md border border-[#E4C78F]/35 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                {/* gold pointer with a soft tap ripple */}
                <span className="relative flex w-8 h-8 items-center justify-center">
                  <motion.span
                    className="absolute inset-0 rounded-full border border-[#E4C78F]"
                    animate={{ scale: [0.7, 1.35], opacity: [0.8, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.span
                    className="relative flex w-8 h-8 items-center justify-center rounded-full bg-[#E4C78F]"
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Pointer className="w-4 h-4 text-[#231812]" strokeWidth={2.4} />
                  </motion.span>
                </span>
                <span className="text-[13px] font-semibold text-white whitespace-nowrap">Tap to open</span>
                <span className="w-px h-4 bg-white/25" aria-hidden="true" />
                <span className="text-[13px] text-white/75 whitespace-nowrap">Scroll to explore</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile details sheet over the site; tap the dimmed area or swipe down to close */}
        <AnimatePresence>
          {showDetails && (
            <>
              <motion.button
                type="button"
                aria-label="Close details"
                onClick={() => setShowDetails(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden absolute inset-0 z-30 bg-black/55 backdrop-blur-[2px] cursor-default"
              />
              <motion.div
                className="md:hidden absolute z-30 inset-x-0 bottom-0 max-h-[80%] overflow-y-auto overscroll-contain rounded-t-3xl bg-[#2A1D16] border-t border-[#C6A16B]/30 px-5 pt-2 pb-5 shadow-2xl"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                drag="y"
                dragListener={false}
                dragControls={sheetDrag}
                style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 500) setShowDetails(false);
                }}
              >
                {/* drag handle: swipe down here to close (the rest of the sheet scrolls) */}
                <div
                  className="flex justify-center pt-1 pb-3 -mx-5 cursor-grab"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => sheetDrag.start(e)}
                >
                  <span className="w-10 h-1.5 rounded-full bg-white/25" />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#C6A16B]">Design</p>
                    <div className="flex items-center gap-2.5 mt-0.5">
                      <h2 className="font-serif text-4xl leading-none text-white">{t.id}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8B1E2D] text-white text-sm font-semibold">{formatPrice(t.price)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowDetails(false)} className={navBtn} aria-label="Close details">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {details}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop details panel */}
      <aside className="hidden md:flex flex-col w-80 max-w-[30vw] text-[#F8F3EC] gap-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C6A16B]">Design</p>
            <h2 className="font-serif text-5xl leading-none mt-1">{t.id}</h2>
          </div>
          <button type="button" onClick={onClose} className={navBtn} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <span className="self-start px-3 py-1 rounded-full bg-[#8B1E2D] text-white text-base font-semibold">{formatPrice(t.price)}</span>
        {details}
        <div className="space-y-2.5">
          <div className="relative">
            {bookTip}
            {bookButton('w-full py-3.5 text-sm')}
          </div>
          <a
            href={t.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/20 text-[#EFE5D8] hover:bg-white/10 text-xs uppercase tracking-wider transition-colors"
          >
            Open in new tab
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/20 text-[#EFE5D8] hover:bg-white/10 text-xs uppercase tracking-wider transition-colors"
          >
            {copied ? 'Link copied' : 'Share this design'}
            {copied ? <Check className="w-3.5 h-3.5 text-[#E4C78F]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-xs text-[#EFE5D8]/50">
          {index + 1} of {list.length} · use ▲ ▼ or the ↑ ↓ keys to browse
        </p>
      </aside>

      {/* Bottom bar (mobile) */}
      <div className="md:hidden relative z-10 bg-[#1C130E] text-[#F8F3EC] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {bookTip}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className={`flex items-center gap-1.5 px-3.5 py-3 rounded-full text-xs uppercase tracking-wider border transition-colors ${
              showDetails ? 'bg-white/15 border-white/30' : 'border-white/20'
            }`}
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronDown className="w-4 h-4 text-[#C6A16B]" /> : <Info className="w-4 h-4 text-[#C6A16B]" />}
            {showDetails ? 'Hide' : 'Details'}
          </button>
          {bookButton('flex-1 py-3 text-xs')}
        </div>
      </div>
    </div>
  );
};
