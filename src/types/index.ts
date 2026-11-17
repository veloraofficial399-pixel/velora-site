export type TemplateCategory =
  | 'All'
  | 'Traditional'
  | 'Minimal'
  | 'Floral'
  | 'Luxury'
  | 'Modern'
  | 'Muslim Wedding'
  | 'Christian Wedding'
  | 'Hindu Wedding';

export type CollectionTier = 'A' | 'B' | 'C' | 'D' | 'E';

export type Religion = 'Hindu' | 'Muslim' | 'Christian' | 'Universal';

export interface WeddingTemplate {
  id: string; // Design code shown to clients, e.g. 'A1' (number = rank within its collection, 1 = best)
  collection: CollectionTier;
  collectionName: string;
  name: string; // Couple names e.g. "Erfana & Sukail" — used for search/admin only, never shown on cards
  price: number;
  religion?: Religion;
  category: TemplateCategory[];
  description?: string;
  demoUrl: string;
  coverImage?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  features: string[];
  themeColor?: string;
  sampleDetails?: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    venueName: string;
    city: string;
    storySnippet: string;
    events: { title: string; time: string; location: string }[];
  };
}

export type InvitationCategory =
  | 'All'
  | 'Wedding Invitations'
  | 'Engagement Invitations'
  | 'Save the Date'
  | 'Reception Invitations'
  | 'Birthday Invitations'
  | 'Nikah Invitations';

export interface DigitalInvitation {
  id: string;
  title: string;
  category: Exclude<InvitationCategory, 'All'>;
  style: string;
  format: 'Vertical Video (Reels/Stories)' | 'Interactive PDF' | 'Animated E-Card' | 'Luxury Image';
  price: number;
  description: string;
  previewImage: string;
  customisationOptions: string[];
  isPopular?: boolean;
}

export interface PricingPackage {
  id: string;
  collectionCode: CollectionTier;
  name: string;
  price: number;
  badge?: string;
  description: string;
  features: string[];
  idealFor: string;
  deliveryTime: string;
  isPopular?: boolean;
}

export interface CustomerEnquiry {
  id: string;
  name: string;
  whatsapp: string;
  eventType: string;
  eventDate: string;
  selectedPackage: string;
  templateId?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'booked';
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  instagramHandle: string;
  whatsappNumber: string;
  contactEmail: string;
  currencySymbol: string;
}

