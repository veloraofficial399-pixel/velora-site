import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeddingTemplate, DigitalInvitation, PricingPackage, CustomerEnquiry, SiteSettings } from '../types';
import { INITIAL_TEMPLATES } from '../data/templates';
import { INITIAL_INVITATIONS } from '../data/invitations';
import { INITIAL_PACKAGES } from '../data/packages';

interface StoreContextType {
  templates: WeddingTemplate[];
  invitations: DigitalInvitation[];
  packages: PricingPackage[];
  settings: SiteSettings;
  enquiries: CustomerEnquiry[];
  selectedPreviewTemplate: WeddingTemplate | null;
  openPreview: (template: WeddingTemplate) => void;
  closePreview: () => void;
  selectedOrderTemplate: WeddingTemplate | null;
  setSelectedOrderTemplate: (template: WeddingTemplate | null) => void;
  addEnquiry: (enquiry: Omit<CustomerEnquiry, 'id' | 'createdAt' | 'status'>) => CustomerEnquiry;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  updatePackagePrice: (id: string, newPrice: number) => void;
  addTemplate: (template: WeddingTemplate) => void;
  updateTemplate: (id: string, updated: Partial<WeddingTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getWhatsAppLink: (customMessage?: string) => string;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'VELORA',
  tagline: 'Every love story deserves its own design.',
  instagramHandle: '@velora__in_',
  // Configured business enquiry number
  whatsappNumber: '917025423395', 
  contactEmail: 'contact@velora.in',
  currencySymbol: '₹'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Templates state (12 curated templates)
  const [templates, setTemplates] = useState<WeddingTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('velora_templates_v5');
      return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  // Invitations state (6 curated types)
  const [invitations] = useState<DigitalInvitation[]>(() => {
    try {
      const saved = localStorage.getItem('velora_invitations_v2');
      return saved ? JSON.parse(saved) : INITIAL_INVITATIONS;
    } catch {
      return INITIAL_INVITATIONS;
    }
  });

  // Packages state
  const [packages, setPackages] = useState<PricingPackage[]>(() => {
    try {
      const saved = localStorage.getItem('velora_packages');
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('velora_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          whatsappNumber: '917025423395', // Use owner's configured business enquiry number
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Enquiries state
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(() => {
    try {
      const saved = localStorage.getItem('velora_enquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<WeddingTemplate | null>(null);
  const [selectedOrderTemplate, setSelectedOrderTemplate] = useState<WeddingTemplate | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('velora_templates_v5', JSON.stringify(templates));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem('velora_packages', JSON.stringify(packages));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem('velora_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('velora_enquiries', JSON.stringify(enquiries));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [enquiries]);

  const openPreview = (template: WeddingTemplate) => {
    setSelectedPreviewTemplate(template);
  };

  const closePreview = () => {
    setSelectedPreviewTemplate(null);
  };

  const addEnquiry = (data: Omit<CustomerEnquiry, 'id' | 'createdAt' | 'status'>): CustomerEnquiry => {
    const newEnquiry: CustomerEnquiry = {
      ...data,
      id: 'ENQ-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
    return newEnquiry;
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updatePackagePrice = (id: string, newPrice: number) => {
    setPackages(prev =>
      prev.map(pkg => (pkg.id === id ? { ...pkg, price: newPrice } : pkg))
    );
  };

  const addTemplate = (template: WeddingTemplate) => {
    setTemplates(prev => [template, ...prev]);
  };

  const updateTemplate = (id: string, updated: Partial<WeddingTemplate>) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getWhatsAppLink = (customMessage?: string): string => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const defaultMsg = `Hi Velora! I love your wedding websites and digital invitations. I would like to enquire about creating one for our upcoming celebration.`;
    const msg = customMessage || defaultMsg;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const resetToDefaults = () => {
    setTemplates(INITIAL_TEMPLATES);
    setPackages(INITIAL_PACKAGES);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('velora_templates');
    localStorage.removeItem('velora_templates_v4');
    localStorage.removeItem('velora_templates_v5');
    localStorage.removeItem('velora_packages');
    localStorage.removeItem('velora_settings');
  };

  return (
    <StoreContext.Provider
      value={{
        templates,
        invitations,
        packages,
        settings,
        enquiries,
        selectedPreviewTemplate,
        openPreview,
        closePreview,
        selectedOrderTemplate,
        setSelectedOrderTemplate,
        addEnquiry,
        updateSettings,
        updatePackagePrice,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getWhatsAppLink,
        resetToDefaults
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

