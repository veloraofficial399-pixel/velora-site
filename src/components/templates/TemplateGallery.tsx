import React, { useMemo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { sortFeaturedMix } from '../../data/templates';
import { navigate } from '../../lib/router';
import { LiveStoryCard } from './LiveStoryCard';

/** Homepage teaser: each plan's best live designs, linking to the full /templates page. */
export const TemplateGallery: React.FC = () => {
  const { templates } = useStore();
  const featured = useMemo(() => sortFeaturedMix(templates).slice(0, 6), [templates]);

  return (
    <section id="templates" className="py-16 sm:py-24 bg-[#F8F3EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE5D8] border border-[#C6A16B]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A16B]" />
            <span className="text-xs font-serif uppercase tracking-[0.2em] text-[#34251D] font-medium">Live Designs</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#34251D] tracking-tight">
            {templates.length} Wedding Invitation Designs
          </h2>
          <p className="text-sm sm:text-base text-[#514338]/90 leading-relaxed">
            Every card below is the real invitation running live. Tap one to see it full screen.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-5">
          {featured.map((t) => (
            <LiveStoryCard key={t.id} template={t} priority onOpen={(tpl) => navigate(`/templates/${tpl.id}`)} />
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#34251D] text-[#F8F3EC] hover:bg-[#C6A16B] text-xs uppercase tracking-wider font-medium transition-colors shadow-sm"
          >
            View all {templates.length} designs
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
