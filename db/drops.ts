// Seed catalogue. Times are relative to the moment the seed runs, so a fresh
// database always has something live, something upcoming and an archive.

export type SeedDrop = {
  number: number;
  slug: string;
  title: string;
  maker: string;
  origin: string;
  category: string;
  tagline: string;
  story: string;
  details: string[];
  price: number; // dollars
  editionSize: number;
  soldRatio: number; // 0..1 of the edition already sold at seed time
  limit?: number;
  image: string;
  tone: string;
  startsInHours: number; // negative = already started
  lengthHours: number;
  soldOutAfterMinutes?: number; // for the archive
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

export const seedDrops: SeedDrop[] = [
  // ——— Live now ———
  {
    number: 21,
    slug: "tide-vessel",
    title: "Tide Vessel",
    maker: "Studio Maré",
    origin: "Porto, Portugal",
    category: "Ceramics",
    tagline: "Wheel-thrown stoneware, glazed in salt ash.",
    story:
      "Each vessel is thrown by hand from a single 2 kg pull of stoneware and fired twice. The glaze is mixed from ash gathered on the Leça coastline, so no two surfaces break the same way. Studio Maré makes one kiln load a season — this is it.",
    details: ["Height 24 cm, Ø 14 cm", "Food-safe interior glaze", "Signed and numbered on the base", "Ships in a hand-folded linen wrap"],
    price: 185,
    editionSize: 120,
    soldRatio: 0.62,
    image: u("photo-1578749556568-bc2c40e68b61"),
    tone: "#d8cbb8",
    startsInHours: -5,
    lengthHours: 24 * 12,
  },
  {
    number: 22,
    slug: "meridian-01",
    title: "Meridian 01",
    maker: "Halden Watch Co.",
    origin: "Biel, Switzerland",
    category: "Timepieces",
    tagline: "A 38 mm field watch with a hand-brushed steel case.",
    story:
      "Halden's first automatic. A quiet, legible dial with lume applied by hand, a sapphire crystal and a movement regulated in five positions. The caseback is engraved with your edition number before it leaves the workshop.",
    details: ["38 mm 316L steel, 10 ATM", "Swiss automatic, 42 h reserve", "Sapphire crystal, anti-reflective", "Horween leather strap"],
    price: 640,
    editionSize: 300,
    soldRatio: 0.81,
    image: u("photo-1523275335684-37898b6baf30"),
    tone: "#cfd0cb",
    startsInHours: -26,
    lengthHours: 24 * 10,
  },
  {
    number: 23,
    slug: "no-9-fig-leaf",
    title: "Fig Leaf",
    maker: "Atelier Oriel",
    origin: "Grasse, France",
    category: "Fragrance",
    tagline: "Green fig, vetiver and warm cedar. 50 ml eau de parfum.",
    story:
      "Composed over two summers in Grasse from figs picked before sunrise. Macerated for eight weeks and bottled by hand in weighted glass. Once this batch is gone, the formula goes back in the drawer.",
    details: ["50 ml eau de parfum, 18% concentration", "Top: fig leaf, bergamot", "Heart: vetiver, iris", "Base: cedar, soft musk"],
    price: 148,
    editionSize: 400,
    soldRatio: 0.955,
    image: u("photo-1541643600914-78b084683601"),
    tone: "#d9d3c2",
    startsInHours: -2,
    lengthHours: 24 * 9,
  },
  {
    number: 24,
    slug: "fold-tote",
    title: "Fold Tote",
    maker: "Casa Velluto",
    origin: "Florence, Italy",
    category: "Leather",
    tagline: "One piece of vegetable-tanned leather, folded — not stitched.",
    story:
      "Cut from a single hide panel and shaped around a wooden form, the Fold Tote has only four seams. Vegetable tanning means it will darken with you. Casa Velluto has a small allocation of hides each quarter; this drop uses all of it.",
    details: ["Full-grain vegetable-tanned leather", "40 × 34 × 12 cm", "Unlined interior, one slip pocket", "Hand-burnished edges"],
    price: 420,
    editionSize: 80,
    soldRatio: 0.35,
    image: u("photo-1548036328-c9fa89d128fa"),
    tone: "#cdb9a3",
    startsInHours: -9,
    lengthHours: 24 * 14,
  },
  {
    number: 25,
    slug: "arc-lamp",
    title: "Arc Table Lamp",
    maker: "Nordvik Form",
    origin: "Copenhagen, Denmark",
    category: "Objects",
    tagline: "Spun aluminium shade on a solid oak base.",
    story:
      "A lamp designed around one gesture: the shade tilts in a single arc and stays exactly where you leave it. The base is turned from Danish oak offcuts, so each grain is different.",
    details: ["Height 42 cm", "Dimmable warm LED, 2700 K", "Solid oak base, oiled", "Braided fabric cable, 2 m"],
    price: 295,
    editionSize: 150,
    soldRatio: 0.2,
    image: u("photo-1507473885765-e6ed057f782c"),
    tone: "#d6d1c8",
    startsInHours: -1,
    lengthHours: 24 * 14,
  },

  // ——— Upcoming ———
  {
    number: 26,
    slug: "lowline-chair",
    title: "Lowline Lounge Chair",
    maker: "Nordvik Form",
    origin: "Copenhagen, Denmark",
    category: "Furniture",
    tagline: "A low, deep seat in ash and undyed wool.",
    story:
      "Built for long evenings: a generous seat 38 cm off the floor, joined with hidden wooden dowels and wrapped in undyed wool bouclé.",
    details: ["Solid ash frame", "Undyed wool bouclé", "W 72 × D 80 × H 70 cm", "Made to order in 6 weeks"],
    price: 1450,
    editionSize: 40,
    soldRatio: 0,
    image: u("photo-1567538096630-e0c55bd6374c"),
    tone: "#d3c8b8",
    startsInHours: 0.5,
    lengthHours: 24 * 12,
  },
  {
    number: 27,
    slug: "studio-cans",
    title: "Studio Cans",
    maker: "Resonant Audio",
    origin: "Berlin, Germany",
    category: "Sound",
    tagline: "Open-back headphones with walnut cups.",
    story:
      "Tuned in a Berlin mastering room for people who listen, not just hear. 50 mm drivers, replaceable everything, and walnut cups cut from a single board.",
    details: ["50 mm dynamic drivers", "Open-back, 32 Ω", "Walnut ear cups", "Detachable braided cable"],
    price: 390,
    editionSize: 250,
    soldRatio: 0,
    image: u("photo-1505740420928-5e560c06d30e"),
    tone: "#cbc6bd",
    startsInHours: 30,
    lengthHours: 24 * 10,
  },
  {
    number: 28,
    slug: "merino-crew",
    title: "Merino Crew",
    maker: "Holm & Hale",
    origin: "Donegal, Ireland",
    category: "Knitwear",
    tagline: "Heavyweight merino, knitted slowly on vintage frames.",
    story:
      "Knitted at a quarter of modern speed on 1960s frames, so the fabric stays dense and soft for decades. Dyed in small lots — this colour will not be repeated.",
    details: ["100% extra-fine merino", "12-gauge, 480 g", "Fully fashioned seams", "Colour: Peat"],
    price: 210,
    editionSize: 200,
    soldRatio: 0,
    image: u("photo-1434389677669-e08b4cac3105"),
    tone: "#cfc4b4",
    startsInHours: 24 * 4,
    lengthHours: 24 * 10,
  },
  {
    number: 29,
    slug: "pour-over-set",
    title: "Pour-Over Set",
    maker: "Studio Maré",
    origin: "Porto, Portugal",
    category: "Ceramics",
    tagline: "Dripper, carafe and two cups in speckled stoneware.",
    story: "Studio Maré's morning ritual, made in the same kiln as the Tide Vessel.",
    details: ["Dripper, 600 ml carafe, 2 cups", "Speckled stoneware", "Dishwasher safe", "Includes 40 paper filters"],
    price: 165,
    editionSize: 150,
    soldRatio: 0,
    image: u("photo-1495474472287-4d71bcdd2085"),
    tone: "#d7ccbd",
    startsInHours: 24 * 9,
    lengthHours: 24 * 10,
  },

  // ——— Archive (sold out) ———
  {
    number: 18,
    slug: "rangefinder-m",
    title: "Rangefinder M",
    maker: "Kōgen Optics",
    origin: "Osaka, Japan",
    category: "Cameras",
    tagline: "A restored 1970s rangefinder, re-skinned in black leather.",
    story: "Thirty cameras, each stripped, cleaned and recalibrated by one technician in Osaka.",
    details: ["Serviced 1970s body", "40 mm f/1.7 lens", "New light seals", "12-month warranty"],
    price: 520,
    editionSize: 30,
    soldRatio: 1,
    image: u("photo-1526170375885-4d8ecf77b99f"),
    tone: "#cdc7bc",
    startsInHours: -24 * 9,
    lengthHours: 24 * 5,
    soldOutAfterMinutes: 3,
  },
  {
    number: 19,
    slug: "keyhole-shades",
    title: "Keyhole Shades",
    maker: "Vista Lane",
    origin: "Cadore, Italy",
    category: "Eyewear",
    tagline: "Hand-polished acetate with mineral glass lenses.",
    story: "Cut from Mazzucchelli acetate blocks and polished in a tumbler for three days.",
    details: ["Mazzucchelli acetate", "Mineral glass, UV400", "Five-barrel hinges", "Leather case"],
    price: 240,
    editionSize: 180,
    soldRatio: 1,
    image: u("photo-1511499767150-a48a237f0083"),
    tone: "#d4cdbf",
    startsInHours: -24 * 6,
    lengthHours: 24 * 4,
    soldOutAfterMinutes: 47,
  },
  {
    number: 20,
    slug: "court-low",
    title: "Court Low",
    maker: "Pietra Shoes",
    origin: "Marche, Italy",
    category: "Footwear",
    tagline: "A clean leather court shoe on a stitched cupsole.",
    story: "Made in a family workshop that has stitched soles since 1958.",
    details: ["Calf leather upper", "Blake-stitched rubber cupsole", "Leather lining", "Made in Italy"],
    price: 330,
    editionSize: 220,
    soldRatio: 1,
    image: u("photo-1549298916-b41d501d3772"),
    tone: "#d2cbc0",
    startsInHours: -24 * 3,
    lengthHours: 24 * 4,
    soldOutAfterMinutes: 128,
  },
];
