import { PricingPackage } from '../types';

export const INITIAL_PACKAGES: PricingPackage[] = [
  {
    id: 'pkg-starter',
    collectionCode: 'A',
    name: 'Starter Package',
    price: 499,
    description: 'Perfect for couples wanting an essential, elegant digital presence to share event schedules and venue location.',
    badge: 'Essential',
    features: [
      'Access to Collection A Templates',
      'Event Countdown Timer',
      'Ceremony Schedule & Timings',
      'Google Maps Venue Navigation',
      'WhatsApp RSVP Button for Guests',
      'Responsive on iPhone & Android',
      'Delivered in 24 - 48 Hours',
      '1 Free Round of Detail Revisions'
    ],
    idealFor: 'Intimate weddings, single-day events & budget-conscious couples',
    deliveryTime: '24 - 48 Hours'
  },
  {
    id: 'pkg-classic',
    collectionCode: 'B',
    name: 'Classic Package',
    price: 799,
    description: 'Our most sought-after choice featuring couple stories, curated photo gallery, and background romantic soundtrack.',
    badge: 'Most Popular',
    isPopular: true,
    features: [
      'Access to Collection B Templates',
      'All Starter Features Included',
      'Couple Love Story & Timeline',
      'Curated Photo Highlights Gallery',
      'Autoplay Background Romantic Music',
      'Multi-Event Itinerary (Haldi, Sangeet, Reception)',
      'Direct WhatsApp & Call Host Integration',
      'Delivered in 24 Hours',
      '2 Rounds of Content Revisions'
    ],
    idealFor: 'Couples wanting rich visual storytelling with music and photos',
    deliveryTime: '24 Hours'
  },
  {
    id: 'pkg-premium',
    collectionCode: 'C',
    name: 'Royal Premium',
    price: 999,
    description: 'Elevated luxury design with refined animations, parallax scrolling, custom color palette, and calendar sync.',
    badge: 'Luxury Pick',
    features: [
      'Access to Collection C Templates',
      'All Classic Features Included',
      'High-Fashion Editorial Typography',
      'Smooth Parallax & Scroll Animations',
      'Add-to-Calendar (Google / Apple .ics)',
      'Dress Code & Color Palette Guide',
      'Dedicated Blessings / Wishes Box',
      'Priority 24-Hour Express Delivery',
      'Unlimited Detail Corrections'
    ],
    idealFor: 'Couples planning grand multi-event weddings who want premium aesthetics',
    deliveryTime: '24 Hours Priority'
  },
  {
    id: 'pkg-luxury',
    collectionCode: 'D',
    name: 'Luxury Haute',
    price: 1499,
    description: 'Cinematic full-screen video banners, personalized guest links, and multi-ceremony hospitality management.',
    badge: 'Cinematic',
    features: [
      'Access to Collection D Templates',
      'All Royal Premium Features',
      'Full-Screen Cinematic Video Hero',
      'Personalised Guest Greeting Links',
      'Hotel & Travel Guide for Outstation Guests',
      'Digital Shagun / UPI QR Code Integration',
      'Multi-Language Welcome Messages',
      'Dedicated Wedding Coordinator Support'
    ],
    idealFor: 'Destination weddings & high-fashion grand celebrations',
    deliveryTime: '12 - 24 Hours'
  },
  {
    id: 'pkg-bespoke',
    collectionCode: 'E',
    name: 'Bespoke Exclusive',
    price: 1999,
    description: 'The crowning jewel of digital wedding suites: interactive envelope animations, live streaming and VIP concierge.',
    badge: 'Bespoke Signature',
    features: [
      'Access to Collection E Templates',
      'Interactive Wax Seal & Envelope Opening',
      'Live Video Stream Embed (YouTube / Zoom)',
      'Audio Voice Guestbook for Family Blessings',
      'VIP Table Seating & Guest Access Control',
      'Lifetime Cloud Archival of Your Story',
      '12-Hour VIP Priority Turnaround'
    ],
    idealFor: 'Couples seeking the ultimate one-of-a-kind digital luxury experience',
    deliveryTime: '12 Hours VIP'
  }
];

