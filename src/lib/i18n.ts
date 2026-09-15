export type SupportedLanguage = "EN" | "PA" | "HI";

export interface Translations {
  // Navigation
  dashboard: string;
  market: string;
  opportunity: string;
  risks: string;
  feasibility: string;
  money: string;
  financing: string;
  advisor: string;
  whatIf: string;
  report: string;

  // Header and common
  appName: string;
  tagline: string;
  ruralDecisionEngine: string;
  editAnalysis: string;
  detectLiveLocation: string;
  radius5km: string;
  radius10km: string;
  ownCapital: string;
  projectCost: string;
  monthlyProfit: string;
  breakEven: string;
  viabilityScore: string;
  bankableVerdict: string;

  // Market
  marketTitle: string;
  marketSubtitle: string;
  nearbyCompetitors: string;
  distanceKm: string;
  mandiHubs: string;
  priceSignals: string;
  verifiedSource: string;

  // Advisor
  aiAdvisorTitle: string;
  aiAdvisorSubtitle: string;
  askAdvisorPlaceholder: string;
  askButton: string;
  poweredByGemini: string;

  // Actions
  downloadDPR: string;
  applyScheme: string;
  reRunOnboarding: string;
}

export const DICTIONARY: Record<SupportedLanguage, Translations> = {
  EN: {
    dashboard: "Dashboard",
    market: "Market Intelligence",
    opportunity: "Opportunity",
    risks: "Risks & SWOT",
    feasibility: "Viability Score",
    money: "Money & CaPEx",
    financing: "Financing & Schemes",
    advisor: "AI Business Advisor",
    whatIf: "Stress Test / What-If",
    report: "Bank Feasibility DPR",

    appName: "GramVest",
    tagline: "Hyper-Local Rural Business Feasibility Engine",
    ruralDecisionEngine: "Rural Decision Engine",
    editAnalysis: "Edit Analysis",
    detectLiveLocation: "Detect Live Location",
    radius5km: "5 km Catchment",
    radius10km: "10 km Regional",
    ownCapital: "Own Capital",
    projectCost: "Project Cost",
    monthlyProfit: "Monthly Net Profit",
    breakEven: "Break-Even",
    viabilityScore: "Viability Score",
    bankableVerdict: "Bankable Feasibility",

    marketTitle: "Local Market & Competitor Radar",
    marketSubtitle: "Geospatial catchment intelligence evaluating real verified competitors, reachable households, and mandi trade links.",
    nearbyCompetitors: "Nearby Verified Competitors",
    distanceKm: "Distance",
    mandiHubs: "Mandi & Wholesale Hubs",
    priceSignals: "Live Price Signals",
    verifiedSource: "Punjab MSME Registry / Mandi Board",

    aiAdvisorTitle: "AI Financial & Agricultural Advisor",
    aiAdvisorSubtitle: "Live agro-economic insights and bank loan guidance powered by Gemini 3.6.",
    askAdvisorPlaceholder: "Ask anything about machinery, subsidies, power costs, or market off-take...",
    askButton: "Ask Advisor",
    poweredByGemini: "Powered by Google Gemini 3.6 AI",

    downloadDPR: "Download Bank-Ready DPR",
    applyScheme: "Apply for 35% Subsidy",
    reRunOnboarding: "Re-run Onboarding",
  },

  PA: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    market: "ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ",
    opportunity: "ਵਪਾਰਕ ਮੌਕਾ",
    risks: "ਜੋਖਮ ਅਤੇ SWOT",
    feasibility: "ਵਿਵਹਾਰਕਤਾ ਸਕੋਰ",
    money: "ਪੂੰਜੀ ਅਤੇ ਲਾਗਤ",
    financing: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਤੇ ਲੋਨ",
    advisor: "ਏਆਈ ਕਾਰੋਬਾਰੀ ਸਲਾਹਕਾਰ",
    whatIf: "ਤਣਾਅ ਟੈਸਟ / ਵਟ-ਇਫ",
    report: "ਬੈਂਕ ਪ੍ਰੋਜੈਕਟ ਰਿਪੋਰਟ",

    appName: "ਗ੍ਰਾਮਵੈਸਟ",
    tagline: "ਪੰਜਾਬ ਦੇ ਪੇਂਡੂ ਉੱਦਮੀਆਂ ਲਈ ਕਾਰੋਬਾਰੀ ਫੈਸਲਾ ਇੰਜਣ",
    ruralDecisionEngine: "ਪੇਂਡੂ ਫੈਸਲਾ ਇੰਜਣ",
    editAnalysis: "ਵਿਸ਼ਲੇਸ਼ਣ ਬਦਲੋ",
    detectLiveLocation: "ਲਾਈਵ ਲੋਕੇਸ਼ਨ ਲੱਭੋ",
    radius5km: "5 ਕਿ.ਮੀ. ਖੇਤਰ",
    radius10km: "10 ਕਿ.ਮੀ. ਖੇਤਰ",
    ownCapital: "ਆਪਣੀ ਪੂੰਜੀ",
    projectCost: "ਕੁੱਲ ਪ੍ਰੋਜੈਕਟ ਲਾਗਤ",
    monthlyProfit: "ਮਹੀਨਾਵਾਰ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ",
    breakEven: "ਬ੍ਰੇਕ-ਈਵਨ ਸਮਾਂ",
    viabilityScore: "ਵਿਵਹਾਰਕਤਾ ਸਕੋਰ",
    bankableVerdict: "ਬੈਂਕ ਲੋਨ ਲਈ ਯੋਗ",

    marketTitle: "ਸਥਾਨਕ ਬਾਜ਼ਾਰ ਅਤੇ ਪ੍ਰਤੀਯੋਗੀ ਰਾਡਾਰ",
    marketSubtitle: "ਪੰਜਾਬ ਸਰਕਾਰੀ ਰਜਿਸਟਰੀਆਂ ਤੋਂ ਅਸਲ ਉੱਦਮਾਂ, ਮੰਡੀਆਂ ਅਤੇ ਕੀਮਤਾਂ ਦਾ ਭੂਗੋਲਿਕ ਵਿਸ਼ਲੇਸ਼ਣ।",
    nearbyCompetitors: "ਨੇੜਲੇ ਪ੍ਰਮਾਣਿਤ ਮੁਕਾਬਲੇਬਾਜ਼",
    distanceKm: "ਦੂਰੀ",
    mandiHubs: "ਮੰਡੀਆਂ ਅਤੇ ਥੋਕ ਕੇਂਦਰ",
    priceSignals: "ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ",
    verifiedSource: "ਪੰਜਾਬ ਉਦਯੋਗ ਵਿਭਾਗ ਰਜਿਸਟਰੀ",

    aiAdvisorTitle: "ਏਆਈ ਵਿੱਤੀ ਅਤੇ ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ",
    aiAdvisorSubtitle: "ਗੂਗਲ ਜੇਮਿਨੀ 3.6 ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਸਹੀ ਬੈਂਕਿੰਗ ਅਤੇ ਉਦਯੋਗਿਕ ਸਲਾਹ।",
    askAdvisorPlaceholder: "ਮਸ਼ੀਨਰੀ, ਸਬਸਿਡੀਆਂ ਜਾਂ ਮੰਡੀ ਦੀ ਵਿਕਰੀ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ...",
    askButton: "ਸਲਾਹ ਲਵੋ",
    poweredByGemini: "Google Gemini 3.6 ਏਆਈ ਦੁਆਰਾ ਸੰਚਾਲਿਤ",

    downloadDPR: "ਬੈਂਕ DPR ਡਾਊਨਲੋਡ ਕਰੋ",
    applyScheme: "35% ਸਬਸਿਡੀ ਅਪਲਾਈ ਕਰੋ",
    reRunOnboarding: "ਦੁਬਾਰਾ ਸ਼ੁਰੂ ਕਰੋ",
  },

  HI: {
    dashboard: "डैशबोर्ड",
    market: "बाज़ार विश्लेषण",
    opportunity: "व्यापारिक अवसर",
    risks: "जोखिम और SWOT",
    feasibility: "व्यावहारिकता स्कोर",
    money: "पूंजी और लागत",
    financing: "वित्तीय योजनाएं व ऋण",
    advisor: "एआई वित्तीय सलाहकार",
    whatIf: "स्ट्रेस टेस्ट / वाट-इफ",
    report: "बैंक प्रोजेक्ट रिपोर्ट",

    appName: "ग्रामवेस्ट",
    tagline: "ग्रामीण उद्यमियों के लिए वास्तविक व्यावसायिक निर्णय प्रणाली",
    ruralDecisionEngine: "ग्रामीण निर्णय इंजन",
    editAnalysis: "विश्लेषण बदलें",
    detectLiveLocation: "लाइव लोकेशन खोजें",
    radius5km: "5 किमी दायरा",
    radius10km: "10 किमी दायरा",
    ownCapital: "स्वयं की पूंजी",
    projectCost: "कुल परियोजना लागत",
    monthlyProfit: "मासिक शुद्ध लाभ",
    breakEven: "ब्रेक-इवन अवधि",
    viabilityScore: "व्यावहारिकता स्कोर",
    bankableVerdict: "बैंक ऋण योग्य",

    marketTitle: "स्थानीय बाज़ार और प्रतिस्पर्धी रडार",
    marketSubtitle: "सरकारी उद्योग रजिस्टरी से सत्यापित व्यवसायों, मंडियों और मूल्य संकेतों का वास्तविक विश्लेषण।",
    nearbyCompetitors: "समीप के सत्यापित प्रतिस्पर्धी",
    distanceKm: "दूरी",
    mandiHubs: "मंडी और थोक व्यापार केंद्र",
    priceSignals: "ताज़ा मंडी भाव",
    verifiedSource: "पंजाब एमएसएमई उद्योग रजिस्टर",

    aiAdvisorTitle: "एआई वित्तीय एवं कृषि सलाहकार",
    aiAdvisorSubtitle: "गूगल जेमिनी 3.6 द्वारा संचालित सटीक बैंकिंग और व्यावसायिक मार्गदर्शन।",
    askAdvisorPlaceholder: "मशीनरी, सब्सिडी, बिजली खर्च या बाज़ार मांग के बारे में पूछें...",
    askButton: "सलाह प्राप्त करें",
    poweredByGemini: "Google Gemini 3.6 एआई द्वारा संचालित",

    downloadDPR: "बैंक DPR डाउनलोड करें",
    applyScheme: "35% सब्सिडी लागू करें",
    reRunOnboarding: "पुनः प्रारंभ करें",
  },
};

export const getTranslation = (lang: SupportedLanguage = "EN"): Translations => {
  return DICTIONARY[lang] || DICTIONARY.EN;
};
