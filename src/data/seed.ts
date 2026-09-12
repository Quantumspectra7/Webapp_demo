import { BusinessCategory, VentureLocation } from "@/domain";

export interface PunjabDistrict {
  id: string;
  name: string;
  blocks: {
    id: string;
    name: string;
    villages: string[];
  }[];
}

export const PUNJAB_GEOGRAPHY: PunjabDistrict[] = [
  {
    id: "ludhiana",
    name: "Ludhiana",
    blocks: [
      {
        id: "jagraon",
        name: "Jagraon",
        villages: ["Sidhwan Bet", "Malak", "Aligarh", "Kothe Sher Jang", "Gureh", "Swaddi Khas"],
      },
      {
        id: "khanna",
        name: "Khanna",
        villages: ["Alour", "Bhadla", "Bhari", "Daha", "Ikolaha", "Rahoun"],
      },
      {
        id: "samrala",
        name: "Samrala",
        villages: ["Bondli", "Ghagwal", "Khattra", "Ottalan", "Sarwarpur"],
      },
      {
        id: "dehlon",
        name: "Dehlon",
        villages: ["Bhartala", "Buthari", "Dhandra", "Lehra", "Sayyan"],
      },
    ],
  },
  {
    id: "jalandhar",
    name: "Jalandhar",
    blocks: [
      {
        id: "nakodar",
        name: "Nakodar",
        villages: ["Mehatpur", "Shankar", "Uggi", "Mallian", "Shahpur"],
      },
      {
        id: "phillaur",
        name: "Phillaur",
        villages: ["Apra", "Bara Pind", "Dosanjh Kalan", "Landra", "Moron"],
      },
      {
        id: "shahkot",
        name: "Shahkot",
        villages: ["Bajwa Kalan", "Danewal", "Kotla Suraj Mal", "Malsian"],
      },
    ],
  },
  {
    id: "sangrur",
    name: "Sangrur",
    blocks: [
      {
        id: "dhuri",
        name: "Dhuri",
        villages: ["Babbanpur", "Bhalwan", "Kakarwal", "Ladda", "Ranike"],
      },
      {
        id: "malerkotla",
        name: "Malerkotla",
        villages: ["Amargarh", "Bhadaur", "Jupinder", "Kup Kalan"],
      },
      {
        id: "sunam",
        name: "Sunam",
        villages: ["Bakshiwala", "Chhajli", "Jakhepal", "Mehlan"],
      },
    ],
  },
  {
    id: "moga",
    name: "Moga",
    blocks: [
      {
        id: "nihal-singh-wala",
        name: "Nihal Singh Wala",
        villages: ["Bilaspur", "Himmatpura", "Manuke", "Patto Hira Singh"],
      },
      {
        id: "bagha-purana",
        name: "Bagha Purana",
        villages: ["Alamwala", "Budhsinghwala", "Gholia Kalan", "Rode"],
      },
    ],
  },
];

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: "biz-dairy-processing",
    title: "Dairy Processing & Milk Chilling Unit",
    slug: "dairy-chilling",
    description:
      "Bulk milk chilling (BMC) and packaging unit aggregating milk from 20-30 local dairy farmers, chilling to 4°C, and supplying bulk consumers and bottled fresh milk.",
    typicalInvestmentRange: [600000, 1200000],
    unitOfProduction: "Liters / day",
    benchmarkGrossMarginPct: 22.5,
    primaryMachinery: [
      "1,000L Bulk Milk Cooler (BMC)",
      "Automatic Milk Collection Station (AMCS)",
      "Electronic MilkoTester",
      "15 kVA Generator Backup",
    ],
    applicableSchemes: ["PMEGP (35% Subsidy)", "AIF (3% Subvention)", "MUDRA Tarun", "NABARD DEDS"],
  },
  {
    id: "biz-mustard-expeller",
    title: "Mustard Oil Expeller & Cold-Press Mill",
    slug: "mustard-oil-mill",
    description:
      "Cold-press kachi ghani mustard oil extraction unit utilizing regional sarson harvest with by-product cattle feed cake (khal).",
    typicalInvestmentRange: [500000, 950000],
    unitOfProduction: "Quintals / month",
    benchmarkGrossMarginPct: 26.0,
    primaryMachinery: [
      "6-Bolt Heavy Duty Mustard Expeller",
      "Filter Press Machine",
      "Seed Cleaner & Destoner",
      "Weighing & Pouch Sealer",
    ],
    applicableSchemes: ["PMEGP", "AIF", "PMFME (35% Subsidy)"],
  },
  {
    id: "biz-cattle-feed",
    title: "Compounded Cattle Feed Manufacturing Unit",
    slug: "cattle-feed",
    description:
      "Formulation and pelletization of balanced nutritional cattle feed for milch animals using local maize, bran, and mineral mixes.",
    typicalInvestmentRange: [800000, 1500000],
    unitOfProduction: "Bags (50kg) / day",
    benchmarkGrossMarginPct: 18.5,
    primaryMachinery: ["Hammer Mill Grinder", "Ribbon Mixer", "Pellet Mill", "Bag Stitcher"],
    applicableSchemes: ["PMEGP", "AIF", "MUDRA"],
  },
  {
    id: "biz-honey-processing",
    title: "Apiary & Scientific Honey Processing Unit",
    slug: "honey-processing",
    description:
      "Aggregation, moisture reduction, filtration, and bottling of raw floral honey from migratory beekeepers across Punjab.",
    typicalInvestmentRange: [450000, 850000],
    unitOfProduction: "Kg / month",
    benchmarkGrossMarginPct: 32.0,
    primaryMachinery: ["Honey Heating & Moisture Extractor", "Filter Sieve", "Semi-Auto Bottling Unit"],
    applicableSchemes: ["National Beekeeping Mission", "PMEGP", "KVIC Gramodyog"],
  },
];
