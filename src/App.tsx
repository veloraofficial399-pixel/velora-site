import React, { useState, useEffect, lazy, Suspense } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { TemplateGallery } from './components/templates/TemplateGallery';
import { InvitationGallery } from './components/invitations/InvitationGallery';
import { PricingSection } from './components/pricing/PricingSection';
import { HowItWorksSection } from './components/home/HowItWorksSection';
import { AboutPage } from './components/about/AboutPage';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { ContactSection } from './components/contact/ContactSection';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { PageLoader } from './components/common/PageLoader';
import { TemplatesPage } from './components/templates/TemplatesPage';
import { matchTemplatesRoute, navigate, usePathname } from './lib/router';

// Owner-only panel: downloaded only when opened, so visitors get a smaller first load.
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const HomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>(undefined);

  // Smooth scroll to section ("templates" has its own shareable page)
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'templates') {
      navigate('/templates');
      return;
    }
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'templates', 'invitations', 'pricing', 'how-it-works', 'about', 'contact'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectForOrder = (templateId: string) => {
    setPreselectedTemplateId(templateId);
    handleNavigate('contact');
  };

  return (
    <div className="min-h-screen bg-[#F8F3EC] text-[#514338] selection:bg-[#C6A16B]/30 selection:text-[#34251D] flex flex-col font-sans">
      {/* Initial Minimal Brand Introduction */}
      <PageLoader onLoaded={() => {}} />

      {/* Sticky Luxury Navbar */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <Hero
          onExploreClick={() => handleNavigate('templates')}
          onCreateClick={() => handleNavigate('contact')}
        />

        {/* 1. WEDDING INVITATION DESIGNS (top 6 live, links to /templates) */}
        <TemplateGallery />

        {/* 2. DIGITAL INVITATIONS (Videos, PDFs, E-Cards) */}
        <InvitationGallery onSelectForOrder={handleSelectForOrder} />

        {/* 3. PACKAGES & PRICING (Starter ₹499, Classic ₹799, Royal ₹999) */}
        <PricingSection onSelectPackage={() => handleNavigate('contact')} />

        {/* 4. HOW IT WORKS (Simple 4-Step Process) */}
        <HowItWorksSection />

        {/* 5. ABOUT VELORA */}
        <AboutPage />

        {/* 6. CUSTOMER TESTIMONIALS */}
        <TestimonialsSection />

        {/* 7. SIMPLIFIED WHATSAPP CONTACT SECTION */}
        <ContactSection preselectedTemplateId={preselectedTemplateId} />
      </main>

      {/* FOOTER */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* OWNER CONTENT MANAGEMENT SYSTEM */}
      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminDashboard isOpen onClose={() => setIsAdminOpen(false)} />
        </Suspense>
      )}

      {/* FLOATING WHATSAPP BUTTON (Always 1-Tap Ready) */}
      <FloatingWhatsApp />
    </div>
  );
};

const AppContent: React.FC = () => {
  const path = usePathname();
  const templatesRoute = matchTemplatesRoute(path);

  // Returning home from /templates: start at the top of the page.
  useEffect(() => {
    if (!templatesRoute) window.scrollTo(0, 0);
  }, [!!templatesRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  return templatesRoute ? <TemplatesPage openCode={templatesRoute.code} /> : <HomePage />;
};

export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
