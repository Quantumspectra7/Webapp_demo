/**
 * GramVest Production Voice Service
 *
 * Provides:
 * 1. Web Speech Recognition wrapper (Speech-to-Text) with multilingual support (EN, HI, PA).
 * 2. Natural language business intent matcher against the existing 6-sector GramVest taxonomy.
 * 3. Web Speech Synthesis wrapper (Text-to-Speech) with playback controls and interruption.
 *
 * No external heavy dependencies. Works natively in modern browsers.
 */

import { BUSINESS_TAXONOMY_GROUPS } from "@/data/onboardingData";
import { BusinessCategoryItem } from "@/domain";

// Supported GramVest App Languages
export type VoiceLanguage = "EN" | "PA" | "HI";

/**
 * Returns BCP-47 language tag for Web Speech APIs
 */
export function getSpeechRecognitionLocale(lang: VoiceLanguage): string {
  switch (lang) {
    case "HI":
      return "hi-IN";
    case "PA":
      return "pa-IN";
    case "EN":
    default:
      return "en-IN";
  }
}

/**
 * Check if Speech Recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Check if Speech Synthesis is supported in the current browser
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.speechSynthesis !== "undefined";
}

/**
 * Creates a SpeechRecognition instance with proper locale and error handlers
 */
export function createSpeechRecognizer(
  lang: VoiceLanguage,
  callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string, errorType: "permission" | "no-speech" | "unsupported" | "other") => void;
    onEnd: () => void;
    onStart: () => void;
  }
) {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError(
      "Speech recognition is not supported in this browser. You can continue using text.",
      "unsupported"
    );
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = getSpeechRecognitionLocale(lang);
  recognition.maxAlternatives = 3;

  let hasSpoken = false;

  recognition.onstart = () => {
    hasSpoken = false;
    callbacks.onStart();
  };

  recognition.onresult = (event: any) => {
    let interim = "";
    let final = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const item = event.results[i];
      const text = item[0]?.transcript || "";
      if (item.isFinal) {
        final += text;
      } else {
        interim += text;
      }
    }

    const currentText = (final || interim).trim();
    if (currentText) {
      hasSpoken = true;
      callbacks.onResult(currentText, !!final);
    }
  };

  recognition.onerror = (event: any) => {
    const err = event.error;
    if (err === "not-allowed" || err === "permission-denied") {
      callbacks.onError(
        "Microphone access is blocked. Please allow microphone permissions and try again.",
        "permission"
      );
    } else if (err === "no-speech") {
      callbacks.onError(
        "No speech was detected. Please try speaking again.",
        "no-speech"
      );
    } else if (err === "network") {
      callbacks.onError(
        "Network connection issue for voice service. You can continue using text.",
        "other"
      );
    } else {
      callbacks.onError(
        "Voice recognition could not complete. Try again or use text search.",
        "other"
      );
    }
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return recognition;
}

// ============================================================================
// TAXONOMY INTENT MATCHER
// ============================================================================

export interface VoiceBusinessMatchResult {
  confidence: "high" | "medium" | "none";
  matchedItem: BusinessCategoryItem | null;
  alternativeMatches: BusinessCategoryItem[];
  userTranscript: string;
  matchedKeywords: string[];
}

/**
 * Multilingual keyword taxonomy mapped strictly to existing DB_gramvest business IDs
 */
interface KeywordRule {
  businessId: string;
  keywords: string[];
  exactPhrases: string[];
}

const TAXONOMY_RULES: KeywordRule[] = [
  {
    businessId: "biz-dairy-processing",
    keywords: [
      // English
      "dairy", "milk", "chilling", "bmc", "paneer", "ghee", "curd", "butter", "livestock", "cow", "buffalo", "cooler", "dairies", "verka", "nestle",
      // Hindi (Devanagari + Romanized)
      "डेयरी", "दूध", "चिलिंग", "पनीर", "घी", "दही", "खोया", "मलाई", "doodh", "dudh", "chilar", "dhoodh", "doodha", "gau", "bhains",
      // Punjabi (Gurmukhi + Romanized)
      "ਡੇਅਰੀ", "ਦੁੱਧ", "ਚਿਲਿੰਗ", "ਪਨੀਰ", "ਘਿਓ", "ਦਹੀਂ", "ਮੱਖਣ", "dudha", "chillar"
    ],
    exactPhrases: [
      "dairy business", "dairy farming", "milk chilling", "milk plant", "paneer factory", "bulk milk cooler",
      "dairy processing", "doodh ka business", "dairy ka kaam", "doodh dairy", "dairy shuru", "doodh chilling",
      "dairy ka business", "milk chilling plant",
      "ਡੇਅਰੀ ਦਾ ਕੰਮ", "ਦੁੱਧ ਦਾ ਕਾਰੋਬਾਰ", "ਡੇਅਰੀ ਫਾਰਮਿੰਗ", "ਡੇਅਰੀ ਦਾ ਕਾਰੋਬਾਰ", "ਡੇਅਰੀ ਸ਼ੁਰੂ"
    ],
  },
  {
    businessId: "biz-flour-mill",
    keywords: [
      // English
      "flour", "mill", "atta", "chakki", "dal", "pulse", "grain", "wheat", "grinding", "stone chakki", "besan", "pulses", "gram", "flours",
      // Hindi (Devanagari + Romanized)
      "आटा", "चक्की", "मिल", "दाल", "गेहूं", "पिसाई", "चना", "दालन", "दलहन", "pisaai", "gehu", "gehun", "chana", "pisan",
      // Punjabi (Gurmukhi + Romanized)
      "ਆਟਾ", "ਚੱਕੀ", "ਮਿੱਲ", "ਦਾਲ", "ਕਣਕ", "ਪਿਸਾਈ", "kanak", "kanank"
    ],
    exactPhrases: [
      "flour mill", "atta chakki", "dal mill", "chakki unit", "commercial chakki", "wheat grinding",
      "atta mill", "atta chakki lagani", "dal processing", "grain milling", "open a flour mill",
      "ਆਟਾ ਚੱਕੀ", "ਦਾਲ ਮਿੱਲ", "ਕਣਕ ਪਿਸਾਈ", "ਆਟਾ ਮਿੱਲ"
    ],
  },
  {
    businessId: "biz-farm-equipment",
    keywords: [
      // English
      "tractor", "equipment", "machinery", "custom hiring", "rental", "rent", "seeder", "super seeder", "laser leveler", "baler", "reaper", "chc", "implements", "farm machinery", "tiller", "rotavator", "drone",
      // Hindi (Devanagari + Romanized)
      "ट्रैक्टर", "किराया", "किराए", "कृषि", "उपकरण", "मशीनरी", "कस्टम हायरिंग", "लेवलर", "सीडर", "kiraya", "kheti", "upkaran", "kiraye", "kisan",
      // Punjabi (Gurmukhi + Romanized)
      "ਟਰੈਕਟਰ", "ਖੇਤੀ ਸੰਦ", "ਮਸ਼ੀਨਰੀ", "ਕਸਟਮ ਹਾਇਰਿੰਗ", "ਕਿਰਾਇਆ", "ਕਿਰਾਏ", "ਸੰਦ", "ਸੁਪਰ ਸੀਡਰ", "ਲੇਜ਼ਰ"
    ],
    exactPhrases: [
      "tractor rental", "farm equipment", "custom hiring", "rent tractor", "agriculture machinery", "chc unit",
      "agricultural equipment", "equipment to farmers",
      "kheti machine", "tractor kiraye", "tractor implement", "super seeder",
      "ਖੇਤੀ ਸੰਦ ਕਿਰਾਏ", "ਟਰੈਕਟਰ ਦਾ ਕੰਮ", "ਟਰੈਕਟਰ ਕਿਰਾਇਆ"
    ],
  },
  {
    businessId: "biz-spice-processing",
    keywords: [
      // English
      "spice", "spices", "masala", "pulverizer", "turmeric", "chilli", "coriander", "powder", "condiments", "grinding", "haldi", "mirch", "jeera",
      // Hindi (Devanagari + Romanized)
      "मसाला", "मसाले", "हल्दी", "मिर्च", "धनिया", "पाउडर", "जीरा", "पिसाई", "गरम मसाला", "pisaai", "masale",
      // Punjabi (Gurmukhi + Romanized)
      "ਮਸਾਲਾ", "ਮਸਾਲੇ", "ਹਲਦੀ", "ਮਿਰਚ", "ਧਨੀਆ", "ਪੀਸਣ"
    ],
    exactPhrases: [
      "spice processing", "masala factory", "spice grinding", "haldi mirch", "masala unit", "turmeric processing",
      "मसाला उद्योग", "मसाले की चक्की", "ਹਲਦੀ ਮਿਰਚ ਪੀਸਣ", "ਮਸਾਲਾ ਫੈਕਟਰੀ"
    ],
  },
  {
    businessId: "biz-bakery",
    keywords: [
      // English
      "bakery", "bread", "rusk", "biscuit", "biscuits", "bun", "cake", "confectionery", "oven", "baking", "cookies",
      // Hindi (Devanagari + Romanized)
      "बेकरी", "ब्रेड", "रस्क", "बिस्कुट", "पाव", "केक", "ओवन", "बिस्कुट फैक्ट्री", "double roti", "dabal roti",
      // Punjabi (Gurmukhi + Romanized)
      "ਬੇਕਰੀ", "ਬਰੈੱਡ", "ਰਸਕ", "ਬਿਸਕੁਟ", "ਕੇਕ"
    ],
    exactPhrases: [
      "bakery unit", "commercial bakery", "bread factory", "rusk biscuit", "biscuit factory", "bakery shop",
      "बेकरी का काम", "ਬੇਕਰੀ ਦਾ ਕੰਮ", "ਰਸਕ ਬਿਸਕੁਟ"
    ],
  },
  {
    businessId: "biz-cold-storage",
    keywords: [
      // English
      "cold storage", "cold store", "cold room", "vegetable", "fruit", "potato", "kinnow", "storage", "warehouse", "preservation",
      // Hindi (Devanagari + Romanized)
      "कोल्ड स्टोरेज", "कोल्ड स्टोर", "सब्जी", "फल", "आलू", "भंडारण", "aaloo", "sabzi", "godown",
      // Punjabi (Gurmukhi + Romanized)
      "ਕੋਲਡ ਸਟੋਰੇਜ", "ਕੋਲਡ ਸਟੋਰ", "ਸਬਜ਼ੀ", "ਫਲ", "ਆਲੂ"
    ],
    exactPhrases: [
      "cold storage", "cold store", "vegetable storage", "potato storage", "mini cold room",
      "कोल्ड स्टोर", "ਕੋਲਡ ਸਟੋਰ"
    ],
  },
];

/**
 * Matches a user's spoken voice transcript to GramVest's verified business taxonomy.
 */
export function matchBusinessFromVoice(transcript: string): VoiceBusinessMatchResult {
  const cleanTranscript = transcript.toLowerCase().trim();
  const allItems = BUSINESS_TAXONOMY_GROUPS.flatMap((g) => g.items);

  if (!cleanTranscript) {
    return {
      confidence: "none",
      matchedItem: null,
      alternativeMatches: [],
      userTranscript: transcript,
      matchedKeywords: [],
    };
  }

  // Score each taxonomy rule
  const scores: {
    businessId: string;
    score: number;
    matchedKeywords: string[];
  }[] = [];

  for (const rule of TAXONOMY_RULES) {
    let score = 0;
    const matched: string[] = [];

    // Exact phrase match gives major boost (+3)
    for (const phrase of rule.exactPhrases) {
      if (cleanTranscript.includes(phrase.toLowerCase())) {
        score += 3;
        matched.push(phrase);
      }
    }

    // Individual keyword matches (+1 each)
    for (const kw of rule.keywords) {
      const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, "i");
      if (regex.test(cleanTranscript) || cleanTranscript.includes(kw.toLowerCase())) {
        score += 1;
        if (!matched.includes(kw)) {
          matched.push(kw);
        }
      }
    }

    if (score > 0) {
      scores.push({
        businessId: rule.businessId,
        score,
        matchedKeywords: matched,
      });
    }
  }

  // Sort by highest score descending
  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    // Also perform fallback substring check on actual category item names
    for (const item of allItems) {
      const nameParts = item.name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length > 3 && cleanTranscript.includes(part)) {
          return {
            confidence: "medium",
            matchedItem: item,
            alternativeMatches: allItems.filter((i) => i.id !== item.id).slice(0, 2),
            userTranscript: transcript,
            matchedKeywords: [part],
          };
        }
      }
    }

    return {
      confidence: "none",
      matchedItem: null,
      alternativeMatches: [],
      userTranscript: transcript,
      matchedKeywords: [],
    };
  }

  const topMatch = scores[0];
  const matchedItem = allItems.find((i) => i.id === topMatch.businessId) || null;

  // Confidence assessment:
  // - score >= 2 or exact phrase match = High confidence
  // - score is close to 2nd match = Medium confidence
  const secondMatch = scores[1];
  const isAmbiguous = secondMatch && secondMatch.score >= topMatch.score - 1;

  if (topMatch.score >= 2 && !isAmbiguous && matchedItem) {
    return {
      confidence: "high",
      matchedItem,
      alternativeMatches: scores.slice(1, 3).map((s) => allItems.find((i) => i.id === s.businessId)!).filter(Boolean),
      userTranscript: transcript,
      matchedKeywords: topMatch.matchedKeywords,
    };
  }

  // Medium confidence match
  const alternatives = scores
    .map((s) => allItems.find((i) => i.id === s.businessId)!)
    .filter(Boolean);

  return {
    confidence: "medium",
    matchedItem,
    alternativeMatches: alternatives,
    userTranscript: transcript,
    matchedKeywords: topMatch.matchedKeywords,
  };
}

// ============================================================================
// TEXT-TO-SPEECH (TTS) SYNTHESIZER
// ============================================================================

class GramVestSpeechSynthesizer {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;

  public isSpeaking(): boolean {
    if (typeof window === "undefined" || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking || this.isSpeakingState;
  }

  public stop(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    this.currentUtterance = null;
    this.isSpeakingState = false;
  }

  public pause(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.pause();
    } catch {}
  }

  public resume(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.resume();
    } catch {}
  }

  /**
   * Cleans text for natural speech playback (removes markdown tables, code, asterisks)
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[*#_`~]/g, "") // remove markdown styling
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // replace markdown links with label
      .replace(/₹/g, "rupees ") // replace rupee symbol with spoken word
      .replace(/(\d+),(\d+)/g, "$1$2") // remove commas from numbers for cleaner reader
      .replace(/\s+/g, " ")
      .trim();
  }

  public speak(
    text: string,
    lang: VoiceLanguage = "EN",
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      options?.onError?.("Speech synthesis not supported");
      return;
    }

    // Always stop any existing playback before starting new speech
    this.stop();

    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    // Use a reasonable slice for voice responses (short & natural as requested in prompt)
    const voiceText = cleaned.length > 500 ? cleaned.slice(0, 500) + "." : cleaned;

    const utterance = new SpeechSynthesisUtterance(voiceText);
    utterance.rate = 0.95; // comfortable natural pacing
    utterance.pitch = 1.0;
    utterance.lang = getSpeechRecognitionLocale(lang);

    // Pick best available voice if matching locale
    try {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang === utterance.lang) ||
        voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN"));
      if (preferred) {
        utterance.voice = preferred;
      }
    } catch {}

    utterance.onstart = () => {
      this.isSpeakingState = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    this.currentUtterance = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeakingState = false;
      options?.onError?.(e);
    }
  }
}

export const speechSynthesizer = new GramVestSpeechSynthesizer();
