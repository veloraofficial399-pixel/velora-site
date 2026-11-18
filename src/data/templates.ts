import { CollectionTier, Religion, TemplateCategory, WeddingTemplate } from '../types';

/**
 * All live designs, grouped by collection (plan). Within each collection the
 * number in the code is the rank: 1 is the best design of that plan.
 * To add or reorder designs, edit the rows below; codes must stay unique.
 */
export const COLLECTIONS: Record<CollectionTier, { name: string; price: number }> = {
  A: { name: 'Starter Collection', price: 499 },
  B: { name: 'Classic Collection', price: 799 },
  C: { name: 'Royal Collection', price: 999 },
  D: { name: 'Luxury Haute Collection', price: 1499 },
  E: { name: 'Bespoke Exclusive Collection', price: 1999 },
};

// [code, couple names, live URL, religion]
const ROWS: [string, string, string, Religion][] = [
  ['A1', 'Afreen & Sameer', 'https://velora-demo-a1.pages.dev', 'Muslim'],
  ['A2', 'Vishnu & Lakshmi', 'https://velora-demo-a2.pages.dev', 'Hindu'],
  ['A3', 'Karthik & Nandhini', 'https://velora-demo-a3.pages.dev', 'Hindu'],
  ['A4', 'Divya & Nikhil', 'https://velora-demo-a4.pages.dev', 'Hindu'],
  ['A5', 'Fahad & Hiba', 'https://velora-demo-a5.pages.dev', 'Muslim'],
  ['A6', 'Aparna & Abhijith', 'https://velora-demo-a6.velora-official399.workers.dev', 'Hindu'],

  ['B1', 'Umesh & Neethu', 'https://velora-demo-b1.pages.dev', 'Hindu'],
  ['B2', 'Askar & Nasiba', 'https://velora-demo-b2.pages.dev', 'Muslim'],
  ['B3', 'Joel & Annie', 'https://velora-demo-b3.pages.dev', 'Christian'],
  ['B4', 'Sahla & Shihabudheen', 'https://velora-demo-b4.velora-official399.workers.dev', 'Muslim'],
  ['B5', 'Vikram & Ishita', 'https://velora-demo-b5.pages.dev', 'Hindu'],
  ['B6', 'Pranjal & Ananya', 'https://velora-demo-b6.pages.dev', 'Hindu'],

  ['C1', 'Jacob & Sneha', 'https://velora-demo-c1.pages.dev', 'Christian'],
  ['C2', 'Bestin & Mareena', 'https://velora-demo-c2.pages.dev', 'Christian'],
  ['C3', 'Nibin & Asha', 'https://velora-demo-c3.pages.dev', 'Christian'],
  ['C4', 'Vigneshwar & Nithyasri', 'https://velora-demo-c4.velora-official399.workers.dev', 'Hindu'],
  ['C5', 'Gokul & Greeshma', 'https://velora-demo-c5.pages.dev', 'Hindu'],
  ['C6', 'Karthikeyan & Harini', 'https://velora-demo-c6.pages.dev', 'Hindu'],

  ['D1', 'Arshad & Shifna', 'https://velora-demo-d1.pages.dev', 'Muslim'],
  ['D2', 'Ayesha & Sajjad', 'https://velora-demo-d2.velora-official399.workers.dev', 'Muslim'],
  ['D3', 'Aarav & Ananya', 'https://velora-demo-d3.pages.dev', 'Hindu'],
  ['D4', 'Imran & Mehnaz', 'https://velora-demo-d4.pages.dev', 'Muslim'],
  ['D5', 'Rohit & Ritika', 'https://velora-demo-d5.pages.dev', 'Hindu'],
  ['D6', 'Rohit & Tania', 'https://velora-demo-d6.velora-official399.workers.dev', 'Hindu'],

  ['E1', 'Siddharth & Lakshmi Priya', 'https://velora-demo-e1.pages.dev', 'Hindu'],
  ['E2', 'Nithin & Daya', 'https://velora-demo-e2.velora-official399.workers.dev', 'Christian'],
  ['E3', 'Kumaran & Thanusha', 'https://velora-demo-e3.velora-official399.workers.dev', 'Hindu'],
  ['E4', 'Akash & Sukanya', 'https://velora-demo-e4.velora-official399.workers.dev', 'Hindu'],
  ['E5', 'Nafeesa & Sofian', 'https://velora-demo-e5.velora-official399.workers.dev', 'Muslim'],
  ['E6', 'Naadham & Rishi', 'https://velora-demo-e6.velora-official399.workers.dev', 'Hindu'],
];

const RELIGION_CATEGORY: Record<Religion, TemplateCategory> = {
  Hindu: 'Hindu Wedding',
  Muslim: 'Muslim Wedding',
  Christian: 'Christian Wedding',
  Universal: 'Modern',
};

// Local review only: `VITE_DEMO_LOCAL=1 npm run dev` points the live iframes at the demo sites running on this Mac
// (ports 5101…5130, same order as ROWS). Without the variable (production) the real URLs above are used.
const LOCAL_DEMOS = (import.meta as any).env?.VITE_DEMO_LOCAL === '1';

export const INITIAL_TEMPLATES: WeddingTemplate[] = ROWS.map(([id, name, liveUrl, religion], i) => {
  const demoUrl = LOCAL_DEMOS ? `http://127.0.0.1:${5101 + i}/` : liveUrl;
  const collection = id[0] as CollectionTier;
  return {
    id,
    collection,
    collectionName: COLLECTIONS[collection].name,
    name,
    price: COLLECTIONS[collection].price,
    religion,
    category: [RELIGION_CATEGORY[religion]],
    demoUrl,
    features: [],
  };
});

/** Rank of a design inside its collection (A1 → 1). Unknown codes sort last. */
export const getRank = (t: WeddingTemplate): number => {
  const n = parseInt(t.id.replace(/^\D+/, ''), 10);
  return Number.isFinite(n) ? n : 99;
};

/**
 * "Best mix" order: each plan's #1 design first, then each plan's #2, and so on
 * (A1, B1, C1, D1, E1, A2, B2, …), so the first screen shows the best of every price.
 */
export const sortFeaturedMix = (templates: WeddingTemplate[]): WeddingTemplate[] =>
  [...templates].sort(
    (a, b) => getRank(a) - getRank(b) || a.collection.localeCompare(b.collection)
  );

export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
