import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MessageCircle, X, ArrowLeft, ChevronDown, Share2, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Religion, WeddingTemplate } from '../../types';
import { COLLECTIONS, formatPrice, sortFeaturedMix } from '../../data/templates';
import { navigate } from '../../lib/router';
import { BrandLogo } from '../common/BrandLogo';
import { LiveStoryCard } from './LiveStoryCard';
import { TemplateFullscreen } from './TemplateFullscreen';
import { PeekingMan, onceFlag } from './Guide';
import { TemplatesWhatsApp } from './TemplatesWhatsApp';
import { shareLink } from '../../lib/share';

const WELCOME_KEY = 'velora_welcome_seen_v1';

type SortMode = 'best' | 'price-asc' | 'price-desc';
/** 'Others' = any other ceremony (Sikh, Jain, inter-faith, civil…): every design can be adapted, so all are shown. */
type ReligionFilter = Exclude<Religion, 'Universal'> | 'Others';

const PRICES = Array.from(new Set(Object.values(COLLECTIONS).map((c) => c.price))).sort((a, b) => a - b);
const RELIGIONS: ReligionFilter[] = ['Hindu', 'Muslim', 'Christian', 'Others'];

// Compact on phones so each filter row fits on one line (it still side-scrolls on very narrow screens).
const chip = (active: boolean) =>
  `shrink-0 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap border transition-colors ${
    active
      ? 'bg-[#34251D] text-[#F8F3EC] border-[#34251D] font-medium'
      : 'bg-white text-[#514338] border-[#C6A16B]/25 hover:border-[#C6A16B]'
  }`;

interface TemplatesPageProps {
  /** Design code from the URL (/templates/B2), opened full screen. */
  openCode: string | null;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ openCode }) => {
  const { templates, getWhatsAppLink } = useStore();
  const [price, setPrice] = useState<number | null>(null);
  const [religion, setReligion] = useState<ReligionFilter | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('best');
  const [scrolled, setScrolled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  // True when the full-screen view was opened from this page (so Back can just close it).
  const openedHere = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => window.scrollY > 120 && setScrolled(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Once per page load: the man peeks in, says hi and explains how the page works (he leaves by himself).
  useEffect(() => {
    if (openCode || onceFlag.seen(WELCOME_KEY)) return;
    ['/guide/body.webp', '/guide/hand.webp'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const show = setTimeout(() => setShowWelcome(true), 900);
    return () => clearTimeout(show);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissWelcome = () => {
    setShowWelcome(false);
    onceFlag.mark(WELCOME_KEY);
  };

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = templates.filter((t) => {
      if (price !== null && t.price !== price) return false;
      if (religion && religion !== 'Others' && t.religion !== religion && t.religion !== 'Universal') return false;
      if (!q) return true;
      return [t.id, t.name, t.religion ?? '', t.collectionName, String(t.price)].some((s) =>
        s.toLowerCase().includes(q)
      );
    });
    if (sort === 'best') return sortFeaturedMix(filtered);
    const dir = sort === 'price-asc' ? 1 : -1;
    return sortFeaturedMix(filtered).sort((a, b) => dir * (a.price - b.price));
  }, [templates, price, religion, query, sort]);

  const openTemplate = templates.find((t) => t.id === openCode) ?? null;
  // Browse within the visible list; fall back to the full list if the open design is filtered out.
  const browseList = openTemplate && visible.some((t) => t.id === openTemplate.id) ? visible : sortFeaturedMix(templates);

  const open = (t: WeddingTemplate) => {
    if (showWelcome) dismissWelcome();
    openedHere.current = true;
    navigate(`/templates/${t.id}`);
  };
  const change = useCallback((t: WeddingTemplate) => navigate(`/templates/${t.id}`, { replace: true }), []);
  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      navigate('/templates', { replace: true });
    }
  }, []);

  // Header "Share" (WhatsApp is the floating button bottom-right): send this page to family.
  const [copied, setCopied] = useState(false);
  const sharePage = async () => {
    const result = await shareLink(
      `${window.location.origin}/templates`,
      'VELORA · live wedding invitation designs',
      'Have a look at these wedding invitation designs from VELORA — each one is live, tap to try it:'
    );
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const hasFilters = price !== null || religion !== null || query !== '' || sort !== 'best';
  const clearFilters = () => {
    setPrice(null);
    setReligion(null);
    setQuery('');
    setSort('best');
  };

  return (
    <div className="min-h-screen bg-[#F8F3EC] text-[#514338] font-sans">
      {/* Slim header */}
      <header className="sticky top-0 z-40 bg-[#F8F3EC]/95 backdrop-blur-md border-b border-[#C6A16B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} aria-label="VELORA home">
            <BrandLogo size="sm" />
          </button>
          <button
            type="button"
            onClick={sharePage}
            aria-label="Share these designs"
            className="btn-shine btn-glow-dark relative overflow-hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs uppercase tracking-wider font-medium bg-[#34251D] text-[#F8F3EC] hover:bg-[#C6A16B] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C6A16B]" /> : <Share2 className="w-3.5 h-3.5 text-[#C6A16B]" />}
            {copied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-16">
        {/* Title */}
        <div className="mb-3 sm:mb-6 sm:text-center">
          <h1 className="font-serif text-2xl sm:text-4xl text-[#34251D] leading-tight">Choose your wedding invitation</h1>
          <p className="text-xs sm:text-sm text-[#7E6F64] mt-1">
            {templates.length} live designs · tap any design to see it full screen
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4 sm:mb-8 sm:max-w-3xl sm:mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7E6F64] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code (e.g. B3), religion…"
                aria-label="Search designs"
                className="w-full pl-9 pr-3 py-2 rounded-full text-sm bg-white border border-[#C6A16B]/30 text-[#34251D] placeholder:text-[#7E6F64]/70 focus:outline-none focus:ring-1 focus:ring-[#C6A16B]"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="Sort designs"
              className="py-2 pl-3 pr-8 rounded-full text-xs bg-white border border-[#C6A16B]/30 text-[#34251D] focus:outline-none focus:ring-1 focus:ring-[#C6A16B]"
            >
              <option value="best">Signature first</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
            <button type="button" onClick={() => setPrice(null)} className={chip(price === null)}>
              All prices
            </button>
            {PRICES.map((p) => (
              <button key={p} type="button" onClick={() => setPrice(price === p ? null : p)} className={chip(price === p)}>
                {formatPrice(p)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
            <button type="button" onClick={() => setReligion(null)} className={chip(religion === null)}>
              All weddings
            </button>
            {RELIGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReligion(religion === r ? null : r)}
                className={chip(religion === r)}
              >
                {r}
              </button>
            ))}
          </div>

          {religion && (
            <p className="text-[11px] sm:text-xs text-[#7E6F64] bg-[#EFE5D8]/70 border border-[#C6A16B]/20 rounded-xl px-3 py-2 sm:text-center">
              {religion === 'Others'
                ? 'Sikh, Jain, inter-faith or civil wedding? Every design below can be adapted for your ceremony.'
                : `Showing designs made for ${religion} weddings. Liked another one? Any design can be adapted for your ceremony.`}
            </p>
          )}

          {hasFilters && (
            <div className="flex items-center justify-between sm:justify-center sm:gap-4 text-xs text-[#7E6F64] pt-1">
              <span>
                {visible.length} {visible.length === 1 ? 'design' : 'designs'}
              </span>
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-[#34251D] underline underline-offset-2">
                <X className="w-3 h-3" />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Grid of live designs */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-5">
            {visible.map((t, i) => (
              <LiveStoryCard key={t.id} template={t} onOpen={open} priority={i < 6} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <p className="font-serif text-xl text-[#34251D]">No designs match these filters</p>
            <button type="button" onClick={clearFilters} className={chip(true) + ' px-5 py-2'}>
              Clear filters
            </button>
          </div>
        )}

        {/* Closing CTA */}
        <div className="mt-12 sm:mt-16 text-center space-y-4">
          <p className="font-serif text-xl sm:text-2xl text-[#34251D]">Liked a design? Send us its code.</p>
          <a
            href={getWhatsAppLink('Hi Velora! I would like help choosing a wedding invitation design.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#34251D] text-[#F8F3EC] hover:bg-[#C6A16B] text-xs uppercase tracking-wider font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#C6A16B]" />
            Message us on WhatsApp
          </a>
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-[#7E6F64] hover:text-[#34251D]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Visit velora.in
            </button>
          </div>
        </div>
      </main>

      {/* First-visit hint: there are more designs below */}
      {/* "More below" hint: no pill, just a soft fade with text and a flowing arrow */}
      <AnimatePresence>
        {!scrolled && !openTemplate && visible.length > 4 && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
            className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center pt-12 pb-3 bg-gradient-to-t from-[#F8F3EC] via-[#F8F3EC]/85 to-transparent"
          >
            <span className="font-serif text-base sm:text-lg text-[#34251D] tracking-wide">
              Scroll to see all {visible.length} designs
            </span>
            <span className="relative h-7 w-5 mt-0.5" aria-hidden="true">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-0 top-0"
                  animate={{ y: [0, 12], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
                >
                  <ChevronDown className="w-5 h-5 text-[#C6A16B]" strokeWidth={2.5} />
                </motion.span>
              ))}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Welcome on every page load: a man peeks in from the top-right edge, says hi, and slips back out.
          Stays ~10s so the message can be read comfortably; tapping the bubble closes it sooner. */}
      {showWelcome && !openTemplate && (
        <PeekingMan onDone={dismissWelcome} seconds={10}>
          <p className="font-serif text-[15px] sm:text-base text-[#E4C78F] leading-tight whitespace-nowrap">Welcome to VELORA ✨</p>
          <p className="text-[11px] sm:text-xs text-[#EFE5D8]/90 leading-snug mt-0.5">
            Every card is live. <strong className="text-white">Tap a design</strong> to try it, then{' '}
            <strong className="text-[#E4C78F]">Book This Design</strong>.
          </p>
        </PeekingMan>
      )}

      {/* WhatsApp chat button (hidden in the full-screen view, which has its own Book button) */}
      {!openTemplate && <TemplatesWhatsApp />}

      {openTemplate && (
        <TemplateFullscreen template={openTemplate} list={browseList} onChange={change} onClose={close} />
      )}
    </div>
  );
};
