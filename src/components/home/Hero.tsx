import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Heart, Volume2, VolumeX, ArrowRight, Play, Pause, Check, Smartphone, Layers, ExternalLink } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onCreateClick: () => void;
  onPreviewSample?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onCreateClick,
}) => {
  const { templates } = useStore();
  const [phoneMode, setPhoneMode] = useState<'video' | 'live'>('video');
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Guarantee seamless video autoplay on all mobile devices (iOS Safari & Android Chrome)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mobile browsers require muted & playsInline explicitly on DOM element
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    let isMounted = true;

    const attemptPlay = () => {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isMounted) setIsVideoPlaying(true);
          })
          .catch((err) => {
            console.warn('Mobile browser paused video (waiting for first gesture):', err);
            if (isMounted) setIsVideoPlaying(false);

            // If mobile OS blocks autoplay (e.g. Low Power Mode), resume on first touch or scroll
            const resumeOnGesture = () => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().then(() => {
                  if (isMounted) setIsVideoPlaying(true);
                }).catch(() => {});
              }
              window.removeEventListener('touchstart', resumeOnGesture);
              window.removeEventListener('touchend', resumeOnGesture);
              window.removeEventListener('scroll', resumeOnGesture);
              window.removeEventListener('click', resumeOnGesture);
            };

            window.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true });
            window.addEventListener('touchend', resumeOnGesture, { once: true, passive: true });
            window.addEventListener('scroll', resumeOnGesture, { once: true, passive: true });
            window.addEventListener('click', resumeOnGesture, { once: true });
          });
      }
    };

    attemptPlay();

    return () => {
      isMounted = false;
    };
  }, [phoneMode]);

  const toggleVideoPlayback = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !isVideoMuted;
      videoRef.current.muted = newMuted;
      setIsVideoMuted(newMuted);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const currentLiveTemplate = templates[activeTemplateIndex] || templates[0];

  return (
    <section id="home" className="relative min-h-[95vh] lg:min-h-screen pt-28 pb-16 sm:pb-24 flex items-center overflow-hidden bg-gradient-to-b from-[#F8F3EC] via-[#F8F3EC] to-[#EFE5D8]/40">
      {/* Background Soft Lighting & Champagne Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C6A16B]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#EFE5D8]/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Decorative Petals & Sparkles */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[8%] hidden xl:block opacity-60 pointer-events-none"
      >
        <div className="w-12 h-12 rounded-full border border-[#C6A16B]/30 flex items-center justify-center bg-[#F8F3EC]/80 shadow-sm">
          <Sparkles className="w-5 h-5 text-[#C6A16B]" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-28 left-[14%] hidden xl:block opacity-60 pointer-events-none"
      >
        <div className="w-10 h-10 rounded-full border border-[#C6A16B]/25 flex items-center justify-center bg-[#F8F3EC]/80 shadow-sm">
          <Heart className="w-4 h-4 text-[#C6A16B]" />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Brand Headline, Description, CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-7">
            {/* Tagline Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C6A16B]/40 bg-[#EFE5D8]/60 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#C6A16B] animate-pulse" />
              <span className="text-xs font-serif uppercase tracking-[0.24em] text-[#34251D] font-medium">
                VELORA • Wedding Websites & Digital Invitations
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-4xl sm:text-6xl xl:text-7xl font-normal text-[#34251D] leading-[1.12] tracking-tight"
            >
              Your Love Story,{' '}
              <span className="italic font-light text-[#C6A16B] block sm:inline">
                Beautifully Told.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-base sm:text-lg text-[#514338]/90 max-w-2xl mx-auto lg:mx-0 font-sans font-normal leading-relaxed"
            >
              Discover elegant wedding websites and digital invitations, thoughtfully designed to celebrate your special moments. Crafted by Velora with live Google Maps directions, romantic music, and instant WhatsApp RSVP.
            </motion.p>

            {/* Highlights row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs uppercase tracking-wider text-[#7E6F64]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Ready within hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>Starting from ₹499</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6A16B]" />
                <span>30+ Live Collections</span>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3"
            >
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#34251D] text-[#F8F3EC] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#C6A16B] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
              >
                <span>Explore Templates</span>
                <ArrowRight className="w-4 h-4 text-[#C6A16B] group-hover:text-[#F8F3EC] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={onCreateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#C6A16B] text-[#34251D] hover:bg-[#EFE5D8]/70 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C6A16B]" />
                <span>Create Your Invitation</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Realistic Smartphone Mockup Displaying Velora Video Showcase or Live Running Templates */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[320px] sm:max-w-[340px]"
            >
              {/* Mode Switcher Tabs above Phone */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPhoneMode('video')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-serif uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                    phoneMode === 'video'
                      ? 'bg-[#34251D] text-[#F8F3EC] shadow-md border border-[#C6A16B]/50 font-medium'
                      : 'bg-[#EFE5D8]/80 text-[#514338] hover:bg-[#EFE5D8] border border-[#C6A16B]/20'
                  }`}
                >
                  <Play className="w-3 h-3 text-[#C6A16B] fill-current" />
                  <span>Velora Reel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneMode('live')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-serif uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                    phoneMode === 'live'
                      ? 'bg-[#34251D] text-[#F8F3EC] shadow-md border border-[#C6A16B]/50 font-medium'
                      : 'bg-[#EFE5D8]/80 text-[#514338] hover:bg-[#EFE5D8] border border-[#C6A16B]/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Run Live Web</span>
                </button>
              </div>

              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#C6A16B]/30 to-[#EFE5D8]/50 rounded-[50px] blur-2xl opacity-70 -z-10" />

              {/* Realistic Smartphone Chassis */}
              <div className="relative rounded-[46px] p-3 bg-gradient-to-b from-[#4A3B32] via-[#2A1E17] to-[#1E140E] shadow-2xl ring-1 ring-white/10">
                {/* Dynamic Island / Speaker Notch (visible in live template mode) */}
                {phoneMode === 'live' && (
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end pr-2 pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-white/10 mr-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>
                )}

                {/* Smartphone Screen Glass */}
                <div className="relative rounded-[36px] overflow-hidden bg-black aspect-[9/19] flex flex-col text-[#34251D] select-none shadow-inner border border-white/20">
                  {phoneMode === 'video' ? (
                    /* Video Showcase Mode */
                    <div
                      className="relative w-full h-full bg-[#1A120B] overflow-hidden flex items-center justify-center group/video cursor-pointer"
                      onClick={() => toggleVideoPlayback()}
                    >
                      <video
                        ref={videoRef}
                        src="/videos/velora-phone-showcase.mp4"
                        poster="/videos/velora-phone-thumb.jpg"
                        autoPlay
                        loop
                        muted
                        playsInline
                        // @ts-ignore
                        webkit-playsinline="true"
                        preload="auto"
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        className="w-full h-full object-cover select-none"
                      />

                      {/* Prominent Golden Play Button when Video is Stopped on Mobile */}
                      {!isVideoPlaying && (
                        <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/75 backdrop-blur-md border border-[#C6A16B] text-white flex items-center justify-center shadow-2xl z-30 pointer-events-none animate-pulse">
                          <Play className="w-7 h-7 text-[#C6A16B] fill-current ml-1" />
                        </div>
                      )}

                      {/* Video overlay controls */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoPlayback(e);
                          }}
                          className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-95"
                          title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                          aria-label={isVideoPlaying ? 'Pause' : 'Play'}
                        >
                          {isVideoPlaying ? <Pause className="w-3.5 h-3.5 text-[#C6A16B]" /> : <Play className="w-3.5 h-3.5 text-[#C6A16B] fill-current" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute(e);
                          }}
                          className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 text-[10px] uppercase font-serif tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-red-300" /> : <Volume2 className="w-3.5 h-3.5 text-[#C6A16B]" />}
                          <span>{isVideoMuted ? 'Muted' : 'Sound On'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Live Running Template Website Mode */
                    <div className="relative w-full h-full bg-[#F8F3EC] flex flex-col">
                      {/* Top Header inside phone */}
                      <div className="pt-8 px-4 pb-2 bg-[#EFE5D8] flex items-center justify-between text-[11px] border-b border-[#C6A16B]/20">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="font-semibold text-[#34251D] truncate">
                            {currentLiveTemplate.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-serif font-bold text-[#C6A16B] shrink-0">
                          ₹{currentLiveTemplate.price}
                        </span>
                      </div>

                      {/* Actual Live Website Running in Iframe */}
                      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
                        <iframe
                          src={currentLiveTemplate.demoUrl}
                          title={currentLiveTemplate.name}
                          className="w-full h-full border-0 select-auto"
                          loading="lazy"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Quick Switcher Chips below phone */}
              {phoneMode === 'live' ? (
                <div className="mt-3 w-full">
                  <div className="text-[10px] uppercase tracking-widest text-[#7E6F64] font-serif text-center mb-1.5">
                    Switch Live Template:
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {templates.slice(0, 4).map((t, idx) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTemplateIndex(idx)}
                        className={`px-2.5 py-1 rounded-full text-[10px] transition-all ${
                          activeTemplateIndex === idx
                            ? 'bg-[#34251D] text-[#F8F3EC] font-semibold shadow-sm'
                            : 'bg-white/90 text-[#514338] border border-[#C6A16B]/25 hover:bg-white'
                        }`}
                      >
                        {t.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Bottom indicator for video mode */
                <div className="mt-3 text-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-serif text-[#7E6F64]">
                    Official Velora Showcase Reel
                  </span>
                </div>
              )}

              {/* Floating Brand Badge */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md py-1.5 px-3 rounded-2xl shadow-lg border border-[#C6A16B]/30 flex items-center gap-1.5 z-20">
                <span className="text-[#C6A16B] text-xs">★★★★★</span>
                <span className="text-[10px] font-medium text-[#34251D] tracking-wide">
                  Velora Verified
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
