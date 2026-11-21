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
  ['A2', 'Adil & Rinsha', 'https://velora-demo-n01.velorain.workers.dev', 'Muslim'],
  ['A3', 'Vishnu & Lakshmi', 'https://velora-demo-a2.pages.dev', 'Hindu'],
  ['A4', 'Ameen & Nida', 'https://velora-demo-n09.velorain.workers.dev', 'Muslim'],
  ['A5', 'Karthik & Nandhini', 'https://velora-demo-a3.pages.dev', 'Hindu'],
  ['A6', 'Adnan & Hanan', 'https://velora-demo-n07.velorain.workers.dev', 'Muslim'],
  ['A7', 'Divya & Nikhil', 'https://velora-demo-a4.pages.dev', 'Hindu'],
  ['A8', 'Fahad & Hiba', 'https://velora-demo-a5.pages.dev', 'Muslim'],
  ['A9', 'Aparna & Abhijith', 'https://velora-demo-a6.velorain.workers.dev', 'Hindu'],

  ['B1', 'Umesh & Neethu', 'https://velora-demo-b1.pages.dev', 'Hindu'],
  ['B2', 'Basil & Sana', 'https://velora-demo-n05.velorain.workers.dev', 'Muslim'],
  ['B3', 'Askar & Nasiba', 'https://velora-demo-b2.pages.dev', 'Muslim'],
  ['B4', 'Meera & Rahul', 'https://velora-demo-n18.velorain.workers.dev', 'Hindu'],
  ['B5', 'Najiya & Faiz', 'https://velora-demo-n12.velorain.workers.dev', 'Muslim'],
  ['B6', 'Sreerag & Anagha', 'https://velora-demo-n17.velorain.workers.dev', 'Hindu'],
  ['B7', 'Joel & Annie', 'https://velora-demo-b3.pages.dev', 'Christian'],
  ['B8', 'Sahla & Shihabudheen', 'https://velora-demo-b4.velorain.workers.dev', 'Muslim'],
  ['B9', 'Vikram & Ishita', 'https://velora-demo-b5.pages.dev', 'Hindu'],
  ['B10', 'Pranjal & Ananya', 'https://velora-demo-b6.pages.dev', 'Hindu'],

  ['C1', 'Varun & Devika', 'https://velora-demo-n02.velorain.workers.dev', 'Hindu'],
  ['C2', 'Jacob & Sneha', 'https://velora-demo-c1.pages.dev', 'Christian'],
  ['C3', 'Pradeep & Sahana', 'https://velora-demo-n11.velorain.workers.dev', 'Hindu'],
  ['C4', 'Rida & Zayan', 'https://velora-demo-n14.velorain.workers.dev', 'Muslim'],
  ['C5', 'Bestin & Mareena', 'https://velora-demo-c2.pages.dev', 'Christian'],
  ['C6', 'Nibin & Asha', 'https://velora-demo-c3.pages.dev', 'Christian'],
  ['C7', 'Zainab & Sadiq', 'https://velora-demo-n16.velorain.workers.dev', 'Muslim'],
  ['C8', 'Vigneshwar & Nithyasri', 'https://velora-demo-c4.velorain.workers.dev', 'Hindu'],
  ['C9', 'Gokul & Greeshma', 'https://velora-demo-c5.pages.dev', 'Hindu'],
  ['C10', 'Karthikeyan & Harini', 'https://velora-demo-c6.pages.dev', 'Hindu'],

  ['D1', 'Abhiram & Kaveri', 'https://velora-demo-n10.velorain.workers.dev', 'Hindu'],
  ['D2', 'Arshad & Shifna', 'https://velora-demo-d1.pages.dev', 'Muslim'],
  ['D3', 'Sanjay & Athira', 'https://velora-demo-n03.velorain.workers.dev', 'Hindu'],
  ['D4', 'Edwin & Merin', 'https://velora-demo-n13.velorain.workers.dev', 'Christian'],
  ['D5', 'Ayesha & Sajjad', 'https://velora-demo-d2.velorain.workers.dev', 'Muslim'],
  ['D6', 'Aarav & Ananya', 'https://velora-demo-d3.pages.dev', 'Hindu'],
  ['D7', 'Imran & Mehnaz', 'https://velora-demo-d4.pages.dev', 'Muslim'],
  ['D8', 'Rohit & Ritika', 'https://velora-demo-d5.pages.dev', 'Hindu'],
  ['D9', 'Rohit & Tania', 'https://velora-demo-d6.velorain.workers.dev', 'Hindu'],
  ['D10', 'Rayan & Mehreen', 'https://velora-demo-n08.velorain.workers.dev', 'Muslim'],

  ['E1', 'Farhan & Aaliya', 'https://velora-demo-n04.velorain.workers.dev', 'Muslim'],
  ['E2', 'Anisa & Zahid', 'https://velora-demo-n15.velorain.workers.dev', 'Muslim'],
  ['E3', 'Siddharth & Lakshmi Priya', 'https://velora-demo-e1.pages.dev', 'Hindu'],
  ['E4', 'Daksh & Avni', 'https://velora-demo-n06.velorain.workers.dev', 'Hindu'],
  ['E5', 'Nithin & Daya', 'https://velora-demo-e2.velorain.workers.dev', 'Christian'],
  ['E6', 'Kumaran & Thanusha', 'https://velora-demo-e3.velorain.workers.dev', 'Hindu'],
  ['E7', 'Akash & Sukanya', 'https://velora-demo-e4.velorain.workers.dev', 'Hindu'],
  ['E8', 'Nafeesa & Sofian', 'https://velora-demo-e5.velorain.workers.dev', 'Muslim'],
  ['E9', 'Naadham & Rishi', 'https://velora-demo-e6.velorain.workers.dev', 'Hindu'],
];

const RELIGION_CATEGORY: Record<Religion, TemplateCategory> = {
  Hindu: 'Hindu Wedding',
  Muslim: 'Muslim Wedding',
  Christian: 'Christian Wedding',
  Universal: 'Modern',
};

// Local review only: `VITE_DEMO_LOCAL=1 npm run dev` points the live iframes at the demo sites running on this Mac.
// Ports come from the demo name in the URL: velora-demo-a1…e6 → 5101…5130, velora-demo-n01…n12 → 5131…5142.
// Without the variable (production) the real URLs above are used.
const LOCAL_DEMOS = (import.meta as any).env?.VITE_DEMO_LOCAL === '1';
const localPort = (url: string): number => {
  const m = url.match(/velora-demo-([a-z])(\d+)/);
  if (!m) return 5100;
  const n = parseInt(m[2], 10);
  return m[1] === 'n' ? 5130 + n : 5100 + ('abcde'.indexOf(m[1]) * 6) + n;
};

export const INITIAL_TEMPLATES: WeddingTemplate[] = ROWS.map(([id, name, liveUrl, religion]) => {
  const demoUrl = LOCAL_DEMOS ? `http://127.0.0.1:${localPort(liveUrl)}/` : liveUrl;
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
