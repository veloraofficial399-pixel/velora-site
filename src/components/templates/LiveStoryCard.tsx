import React, { useEffect, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { WeddingTemplate } from '../../types';
import { formatPrice, getRank } from '../../data/templates';

/** The real site is rendered at this phone viewport (fallback only), then scaled down to the card. */
export const PHONE_WIDTH = 390;
export const PHONE_HEIGHT = 693; // 9:16 story

export const previewVideo = (t: WeddingTemplate) => `/previews/${t.id}.mp4`;
export const previewPoster = (t: WeddingTemplate) => `/previews/${t.id}.jpg`;

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
  const isSignature = getRank(template) === 1;

  // Load when close to the screen; only play while actually on screen.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setIsNear(true), { rootMargin: '800px 0px' });
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
  }, [isVisible, isNear]);

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
            src={isNear ? previewVideo(template) : undefined}
            poster={previewPoster(template)}
            muted
            loop
            playsInline
            preload={priority ? 'auto' : 'metadata'}
            onError={() => setNoVideo(true)}
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
