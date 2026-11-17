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
  ['A1', 'Erfana & Sukail', 'https://erfana-sukail.vercel.app', 'Muslim'],
  ['A2', 'Vandana & Sharan', 'https://vandana-sharan.vercel.app', 'Hindu'],
  ['A3', 'Madhav & Vaishnavi', 'https://madhav-vaishnavi-pi.vercel.app', 'Hindu'],
  ['A4', 'Surya & Jayesh', 'https://surya-jayesh-nu.vercel.app', 'Hindu'],
  ['A5', 'Shamil & Kamarunnisa', 'https://shamil-kamarunnisa.vercel.app', 'Muslim'],
  ['A6', 'Sruthy & Ashwin', 'https://sruthy-ashwin-wedding.vercel.app', 'Hindu'],

  ['B1', 'Umesh & Neethu', 'https://umesh-neethu-seven.vercel.app', 'Hindu'],
  ['B2', 'Askar & Sufair', 'https://askar-sufair.vercel.app', 'Muslim'],
  ['B3', 'Alex & Jamie (Iris)', 'https://alex-jamie-iris.vercel.app', 'Christian'],
  ['B4', 'Riza & Nizamudheen', 'https://riza-nizamudheen.vercel.app', 'Muslim'],
  ['B5', 'Simran & Shubham', 'https://simran-shubham.vercel.app', 'Hindu'],
  ['B6', 'Mridula & Monjyoti', 'https://mridu-mon.vercel.app', 'Hindu'],

  ['C1', 'Alex & Jamie (Magnolia)', 'https://alex-jamie-magnolia.vercel.app', 'Christian'],
  ['C2', 'Bestin & Mareena', 'https://bestin-mareena-nine.vercel.app', 'Christian'],
  ['C3', 'Nibin & Asha', 'https://nibin-asha-topaz.vercel.app', 'Christian'],
  ['C4', 'Sivaroshan & Kirushika', 'https://sivaroshan-kirushika-kappa.vercel.app', 'Hindu'],
  ['C5', 'Gokul & Greeshma', 'https://gokul-greshma-pied.vercel.app', 'Hindu'],
  ['C6', 'Sudharshan & Shrisha', 'https://sudharshan-shrisha.vercel.app', 'Hindu'],

  ['D1', 'Imthiyas & Rinshi', 'https://imthiyas-rinshi-tau.vercel.app', 'Muslim'],
  ['D2', 'Sajjad Ali & Ayisha', 'https://sajjadali-ayisha-silk.vercel.app', 'Muslim'],
  ['D3', 'Aarav & Ananya', 'https://aarav-ananya-seven.vercel.app', 'Hindu'],
  ['D4', 'Mahera & Arman', 'https://mahera-arman.vercel.app', 'Muslim'],
  ['D5', 'Ritika & Rohit', 'https://ritika-rohit.vercel.app', 'Hindu'],
  ['D6', 'Rohit & Tania', 'https://rohit-tania.vercel.app', 'Hindu'],

  ['E1', 'Ramkumar & Priyadarshini', 'https://ramkumar-priyadarshini.vercel.app', 'Hindu'],
  ['E2', 'Nithin & Daya', 'https://nithin-daya-sigma.vercel.app', 'Christian'],
  ['E3', 'Esvaran & Ashwieni', 'https://esvaran-ashwieni.vercel.app', 'Hindu'],
  ['E4', 'Akash & Sukanya', 'https://akash-sukanya-flame.vercel.app', 'Hindu'],
  ['E5', 'Nafeesa & Sofian', 'https://nafeesa-sofian-rosy.vercel.app', 'Muslim'],
  ['E6', 'Naadham & Rishi', 'https://naadham-rishi-two.vercel.app', 'Hindu'],
];

const RELIGION_CATEGORY: Record<Religion, TemplateCategory> = {
  Hindu: 'Hindu Wedding',
  Muslim: 'Muslim Wedding',
  Christian: 'Christian Wedding',
  Universal: 'Modern',
};

export const INITIAL_TEMPLATES: WeddingTemplate[] = ROWS.map(([id, name, demoUrl, religion]) => {
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
