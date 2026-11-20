import React, { useEffect, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { WeddingTemplate } from '../../types';
import { formatPrice, getRank } from '../../data/templates';

/** The real site is rendered at this phone viewport (fallback only), then scaled down to the card. */
export const PHONE_WIDTH = 390;
export const PHONE_HEIGHT = 693; // 9:16 story

// ?v= changes with every build (previews are cached for a week, and codes can be renumbered between deploys).
export const previewVideo = (t: WeddingTemplate) => `/previews/${t.id}.mp4?v=${__BUILD_ID__}`;
export const previewPoster = (t: WeddingTemplate) => `/previews/${t.id}.jpg?v=${__BUILD_ID__}`;

/**
 * Apple devices (every iPhone/iPad browser, and Safari on Mac). Some of them won't play a video unless the
 * server sends it in pieces (byte ranges), which our hosting doesn't do. If a card's video hasn't started
 * on one of these after a few seconds, it is downloaded whole and played from memory instead.
 */
const IS_APPLE_WEBKIT = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const macSafari = /Safari/.test(ua) && /Macintosh/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  return iOS || macSafari;
})();
const STALL_MS = 4000;

interface LiveStoryCardProps {
  template: WeddingTemplate;
  onOpen: (template: WeddingTemplate) => void;
  /** First screen of cards: start downloading the video immediately. */
  priority?: boolean;
}

/**
 * Story-sized card that plays a short loop of the invitation opening and scrolling a little
 * (recorded by scripts/record-previews.mjs). If a design has no recording yet, the live
 * site is shown instead. Tapping opens the real, interactive site full screen.
 */
export const LiveStoryCard: React.FC<LiveStoryCardProps> = ({ template, onOpen, priority = false }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(priority);
  const [isVisible, setIsVisible] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [scale, setScale] = useState(0);
  // Apple fallback: play from a downloaded copy (blob) instead of streaming.
  const [useBlob, setUseBlob] = useState(false);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [inRange, setInRange] = useState(priority); // within ~800px of the screen right now
  const isSignature = getRank(template) === 1;

  // Load when close to the screen; only play while actually on screen.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        setInRange(e.isIntersecting);
        if (e.isIntersecting) setIsNear(true);
      },
      { rootMargin: '800px 0px' }
    );
    const seen = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.15 });
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  // Play only while on screen; each time a card comes into view it starts from the closed invitation.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible, isNear, blobSrc]);

  // Apple only: if the video hasn't started a few seconds after the card is on screen, switch to the downloaded copy.
  useEffect(() => {
    if (!IS_APPLE_WEBKIT || useBlob || noVideo || !isVisible || !isNear) return;
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v && v.readyState < 2 /* no frame to show yet */) setUseBlob(true);
    }, STALL_MS);
    return () => clearTimeout(timer);
  }, [isVisible, isNear, useBlob, noVideo]);

  // Download the copy while the card is near the screen; free the memory again when it is scrolled far away.
  useEffect(() => {
    if (!useBlob) return;
    if (!inRange) {
      setBlobSrc((cur) => {
        if (cur) URL.revokeObjectURL(cur);
        return null;
      });
      return;
    }
    if (blobSrc) return;
    const ctrl = new AbortController();
    fetch(previewVideo(template), { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => setBlobSrc(URL.createObjectURL(b.type ? b : new Blob([b], { type: 'video/mp4' }))))
      .catch((e) => {
        if (e?.name !== 'AbortError') setNoVideo(true);
      });
    return () => ctrl.abort();
  }, [useBlob, inRange, blobSrc, template]);

  // Free the downloaded copy when the card goes away.
  const blobRef = useRef<string | null>(null);
  blobRef.current = blobSrc;
  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  // Fallback only: scale the live site to the card width.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !noVideo) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PHONE_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, [noVideo]);

  return (
    <button
      type="button"
      onClick={() => onOpen(template)}
      aria-label={`Open design ${template.id}${isSignature ? ' (Signature)' : ''}, ${formatPrice(template.price)}`}
      className={`group relative block w-full text-left rounded-[18px] sm:rounded-[22px] p-[3px] shadow-luxury hover:shadow-luxury-hover transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A16B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F3EC] ${
        isSignature ? 'bg-gradient-to-br from-[#E4C78F] via-[#C6A16B] to-[#8A6A3A]' : 'bg-[#34251D]'
      }`}
    >
      <div ref={frameRef} className="relative w-full aspect-[9/16] overflow-hidden rounded-[15px] sm:rounded-[19px] bg-[#EFE5D8]">
        {!noVideo ? (
          <video
            ref={videoRef}
            src={!isNear ? undefined : useBlob ? blobSrc ?? undefined : previewVideo(template)}
            poster={previewPoster(template)}
            muted
            loop
            playsInline
            preload={priority ? 'auto' : 'metadata'}
            onError={() => {
              if (useBlob && !blobSrc) return; // switching to the downloaded copy
              if (IS_APPLE_WEBKIT && !useBlob) setUseBlob(true); // Apple: try the downloaded copy first
              else setNoVideo(true);
            }}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          isNear &&
          scale > 0 && (
            <iframe
              src={template.demoUrl}
              title={`Design ${template.id}`}
              tabIndex={-1}
              aria-hidden="true"
              sandbox="allow-scripts allow-same-origin"
              style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
              className="absolute top-0 left-0 border-0 pointer-events-none"
            />
          )
        )}

        {/* Soft shades so badges stay readable over any design */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

        {/* Design code (a small crown marks each plan's best design) */}
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34251D]/90 text-[#F8F3EC] text-[11px] sm:text-xs font-semibold tracking-wider backdrop-blur-sm border border-white/15">
          {isSignature ? (
            <Crown className="w-3 h-3 text-[#E4C78F]" aria-hidden="true" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          )}
          {template.id}
        </span>

        {/* Price tag */}
        <span className="absolute top-2 right-0 pl-2.5 pr-2 py-0.5 rounded-l-full bg-[#8B1E2D] text-white text-[11px] sm:text-xs font-semibold shadow-md">
          {formatPrice(template.price)}
        </span>
      </div>
    </button>
  );
};
