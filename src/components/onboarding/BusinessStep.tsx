"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { BusinessProfile, BusinessCategoryItem, BusinessCategoryGroup } from "@/domain";
import { businessService } from "@/services";
import { useApp } from "@/context/AppContext";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  matchBusinessFromVoice,
  VoiceBusinessMatchResult,
} from "@/lib/voiceService";
import {
  Briefcase,
  Search,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Milk,
  Utensils,
  Store,
  Wrench,
  Hammer,
  Tractor,
  Layers,
  X,
  Building2,
  Users,
  Mic,
  MicOff,
  AlertCircle,
  Volume2,
  RefreshCw,
} from "lucide-react";

interface BusinessStepProps {
  initialBusiness: BusinessProfile;
  onConfirmBusiness: (business: BusinessProfile) => void;
}

const CUSTOMER_TYPES = [
  "Local households",
  "Farmers & Growers",
  "Retailers & Kiranas",
  "Wholesalers",
  "Institutions & Schools",
  "Restaurants & Dhabas",
  "Mixed / General Public",
];

export const BusinessStep: React.FC<BusinessStepProps> = ({
  initialBusiness,
  onConfirmBusiness,
}) => {
  const { language } = useApp();
  const [groups, setGroups] = useState<BusinessCategoryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<BusinessCategoryItem | null>(null);

  // Voice Search States
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "matching" | "matched">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceMatchResult, setVoiceMatchResult] = useState<VoiceBusinessMatchResult | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Detail fields
  const [scale, setScale] = useState<"small" | "medium">(initialBusiness.scale || "small");
  const [customDescription, setCustomDescription] = useState(
    initialBusiness.businessDescription || ""
  );
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(
    initialBusiness.targetCustomers || ["Local households"]
  );

  // Custom Business Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(initialBusiness.categoryId === null);

  useEffect(() => {
    businessService.getBusinessCategoryGroups().then((res) => {
      setGroups(res);
      // If initialBusiness exists, find matching item
      if (initialBusiness.categoryId) {
        const found = res.flatMap((g) => g.items).find((i) => i.id === initialBusiness.categoryId);
        if (found) {
          setSelectedItem(found);
        }
      } else if (initialBusiness.customBusinessName) {
        setIsCustomActive(true);
        setCustomName(initialBusiness.customBusinessName);
      } else {
        // Default to first item (Dairy)
        const defaultItem = res[0]?.items[0] || null;
        setSelectedItem(defaultItem);
      }
    });
  }, []);

  // Filter items by selected group and search
  const filteredItems = useMemo(() => {
    let items = groups.flatMap((g) => g.items);
    if (selectedGroup !== "all") {
      const g = groups.find((grp) => grp.id === selectedGroup);
      items = g ? g.items : items;
    }

    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.shortDescription.toLowerCase().includes(q) ||
        (i.suggestedBuyers && i.suggestedBuyers.some((b) => b.toLowerCase().includes(q)))
    );
  }, [groups, selectedGroup, searchQuery]);

  const handleSelectItem = (item: BusinessCategoryItem) => {
    setSelectedItem(item);
    setIsCustomActive(false);
    setCustomDescription(item.shortDescription);
    if (item.suggestedBuyers && item.suggestedBuyers.length > 0) {
      setSelectedCustomers([item.suggestedBuyers[0]]);
    }
  };

  const handleSaveCustomBusiness = () => {
    if (!customName.trim()) return;
    setIsCustomActive(true);
    setSelectedItem(null);
    setCustomDescription(customDesc.trim() || "Independent commercial enterprise in Punjab.");
    setShowCustomModal(false);
  };

  const handleToggleCustomer = (cType: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(cType) ? prev.filter((c) => c !== cType) : [...prev, cType]
    );
  };

  // Stop listening
  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // Cancel voice search completely
  const cancelVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setVoiceState("idle");
    setLiveTranscript("");
    setVoiceError(null);
    setVoiceMatchResult(null);
  };

  // Process voice transcript with intent matcher
  const processVoiceTranscript = (transcript: string) => {
    const text = transcript.trim();
    if (!text) {
      setVoiceState("idle");
      setVoiceError("No speech detected. Try saying e.g. 'I want to open a dairy chilling plant' or 'atta chakki'.");
      return;
    }

    setVoiceState("matching");
    setSearchQuery(text);

    // Run semantic taxonomy intent matcher against verified DB_gramvest categories
    const match = matchBusinessFromVoice(text);
    setVoiceMatchResult(match);
    setVoiceState("matched");
  };

  // Toggle voice search
  const handleToggleVoiceSearch = () => {
    if (voiceState === "listening") {
      stopVoiceSearch();
      return;
    }

    setVoiceError(null);
    setVoiceMatchResult(null);
    setLiveTranscript("");

    if (!isSpeechRecognitionSupported()) {
      setVoiceError("Speech recognition is not supported in this browser. You can continue using text search.");
      return;
    }

    let latestTranscript = "";

    const recognizer = createSpeechRecognizer(language, {
      onStart: () => {
        setVoiceState("listening");
      },
      onResult: (transcript, isFinal) => {
        latestTranscript = transcript;
        setLiveTranscript(transcript);
        if (isFinal) {
          processVoiceTranscript(transcript);
        }
      },
      onError: (errMessage) => {
        setVoiceState("idle");
        setVoiceError(errMessage);
      },
      onEnd: () => {
        setVoiceState((prev) => {
          if (prev === "listening") {
            if (latestTranscript.trim()) {
              processVoiceTranscript(latestTranscript);
              return "matching";
            }
            return "idle";
          }
          return prev;
        });
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        console.warn("Speech recognizer start error", e);
      }
    }
  };

  // Cleanup recognizer on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleConfirm = () => {
    if (isCustomActive) {
      onConfirmBusiness({
        categoryId: null,
        categoryName: customName.trim() || "Custom Enterprise",
        customBusinessName: customName.trim() || "Custom Enterprise",
        businessDescription: customDescription.trim() || customDesc.trim(),
        scale,
        targetCustomers: selectedCustomers,
      });
    } else if (selectedItem) {
      onConfirmBusiness({
        categoryId: selectedItem.id,
        categoryName: selectedItem.name,
        businessDescription: customDescription.trim() || selectedItem.shortDescription,
        scale,
        targetCustomers: selectedCustomers,
      });
    }
  };

  // Group icon mapper
  const getGroupIcon = (iconName: string) => {
    switch (iconName) {
      case "Milk":
        return <Milk size={16} />;
      case "Utensils":
        return <Utensils size={16} />;
      case "Store":
        return <Store size={16} />;
      case "Wrench":
        return <Wrench size={16} />;
      case "Hammer":
        return <Hammer size={16} />;
      case "Tractor":
        return <Tractor size={16} />;
      default:
        return <Briefcase size={16} />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <Briefcase size={13} />
          <span>Step 2 of 5</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          What do you want to build?
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-2xl">
          Choose the business you are considering. You can also describe your idea if it doesn’t
          fit a predefined category.
        </p>
      </div>

      {/* Controls Bar: Search + Group Filters + Custom Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-3">
        {/* Search Input with Native Voice Mic Button */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or tap mic to speak..."
            className="w-full rounded-xl border border-[#ede3d8] bg-white pl-10 pr-20 py-2.5 text-sm text-[#241b16] placeholder-[#786d65]/60 focus:border-[#c75d3e] focus:outline-none focus:ring-1 focus:ring-[#c75d3e] shadow-2xs transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786d65]" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-[#786d65] hover:text-[#1d1b18] rounded-md transition-colors cursor-pointer"
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleVoiceSearch}
              title={voiceState === "listening" ? "Stop listening" : "Search by voice (English, Hindi, Punjabi)"}
              aria-label={voiceState === "listening" ? "Stop listening" : "Search business by voice"}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                voiceState === "listening"
                  ? "bg-red-500 text-white shadow-xs animate-pulse ring-2 ring-red-400/50"
                  : "text-[#786d65] hover:text-[#c75d3e] hover:bg-[#fcedea]"
              }`}
            >
              {voiceState === "listening" ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <MicOff size={14} />
                </>
              ) : (
                <Mic size={15} />
              )}
            </button>
          </div>
        </div>

        {/* Custom Business Trigger */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#786d65] hidden sm:inline">Can’t find your business?</span>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#c75d3e] bg-white hover:bg-[#c75d3e]/5 text-xs font-bold text-[#c75d3e] shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Describe my own business</span>
          </button>
        </div>
      </div>

      {/* Voice Status & Live Transcription Feedback */}
      {voiceState === "listening" && (
        <div className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-[#fff2ee] border border-[#c75d3e]/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-bold text-[#c75d3e] shrink-0">Listening...</span>
            <span className="text-[#382f29] italic truncate">
              {liveTranscript ? `“${liveTranscript}”` : "Speak now (e.g. 'I want to start a dairy business' or 'atta chakki')..."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={stopVoiceSearch}
              className="px-2.5 py-1 rounded-lg bg-[#c75d3e] text-white text-[11px] font-bold hover:bg-[#b34f32] cursor-pointer shadow-2xs"
            >
              Done
            </button>
            <button
              type="button"
              onClick={cancelVoiceSearch}
              className="px-2.5 py-1 rounded-lg border border-[#ede3d8] bg-white text-[#786d65] text-[11px] font-medium hover:bg-[#faf4ee] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {voiceState === "matching" && (
        <div className="mb-5 p-3 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex items-center gap-2 text-xs text-[#786d65] animate-in fade-in">
          <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce delay-200"></div>
          <span>Analyzing speech intent against GramVest business categories...</span>
        </div>
      )}

      {voiceError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#fdf3f1] border border-[#f5d9d4] flex items-center justify-between gap-2 text-xs text-[#b54a2f] animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceError(null)}
            className="text-[11px] font-bold underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Voice Match Confirmation Card (High Confidence) */}
      {voiceMatchResult && voiceMatchResult.confidence === "high" && voiceMatchResult.matchedItem && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#c75d3e] shadow-warm-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#fcedea] text-[#c75d3e]">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#c75d3e]">
                Possible Match Found
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setVoiceMatchResult(null); setVoiceState("idle"); }}
              className="text-xs text-[#786d65] hover:text-[#241b16] font-medium"
            >
              Dismiss
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf4ee] border border-[#ede3d8]">
            <p className="text-[11px] text-[#786d65]">
              You said: <strong className="text-[#241b16]">“{voiceMatchResult.userTranscript}”</strong>
            </p>
            <h4 className="font-serif font-bold text-base text-[#241b16] mt-1">
              {voiceMatchResult.matchedItem.name}
            </h4>
            <p className="text-xs text-[#786d65] mt-0.5 leading-relaxed">
              {voiceMatchResult.matchedItem.shortDescription}
            </p>
            {voiceMatchResult.matchedItem.suggestedBuyers && (
              <p className="text-[11px] text-[#3a6b4c] font-medium mt-1.5">
                Key demand: {voiceMatchResult.matchedItem.suggestedBuyers.slice(0, 3).join(", ")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (voiceMatchResult.matchedItem) {
                  handleSelectItem(voiceMatchResult.matchedItem);
                  setVoiceMatchResult(null);
                  setVoiceState("idle");
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold shadow-warm-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Use this business</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceMatchResult(null);
                setVoiceState("idle");
                handleToggleVoiceSearch();
              }}
              className="px-3.5 py-2 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-semibold text-[#786d65] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Search again</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Match Ambiguous Card (Medium Confidence) */}
      {voiceMatchResult && voiceMatchResult.confidence === "medium" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <AlertCircle size={16} />
              </span>
              <span className="text-xs font-bold text-[#241b16]">
                I’m not completely sure which business you mean.
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setVoiceMatchResult(null); setVoiceState("idle"); }}
              className="text-xs text-[#786d65] hover:text-[#241b16]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-[#786d65]">
            You said: <strong className="text-[#241b16]">“{voiceMatchResult.userTranscript}”</strong>. Did you mean one of these?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {voiceMatchResult.alternativeMatches.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#ede3d8] bg-[#faf4ee] hover:border-[#c75d3e]/50 flex items-center justify-between gap-2 transition-all"
              >
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#241b16] truncate">{item.name}</p>
                  <p className="text-[11px] text-[#786d65] line-clamp-1">{item.shortDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectItem(item);
                    setVoiceMatchResult(null);
                    setVoiceState("idle");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#c75d3e] text-white text-[11px] font-bold shrink-0 hover:bg-[#bd5537] cursor-pointer shadow-2xs"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setVoiceMatchResult(null);
                setVoiceState("idle");
                handleToggleVoiceSearch();
              }}
              className="text-xs font-bold text-[#c75d3e] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Search again</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Match Unsupported Card */}
      {voiceMatchResult && voiceMatchResult.confidence === "none" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-[#c75d3e]" />
              <span className="font-bold text-xs text-[#241b16]">
                Business not currently supported
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setVoiceMatchResult(null); setVoiceState("idle"); }}
              className="text-xs text-[#786d65] hover:text-[#241b16]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-[#786d65] leading-relaxed">
            You said: <strong className="text-[#241b16]">“{voiceMatchResult.userTranscript}”</strong>.
            GramVest currently models hyper-local market intelligence for 6 core rural enterprises:
            Dairy & Bulk Milk Chilling, Commercial Chakki Flour & Dal Mill, Farm Equipment & Custom Hiring (CHC), Spice Processing, Bakery, and Fruit/Vegetable Cold Storage.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setCustomName(voiceMatchResult.userTranscript);
                setShowCustomModal(true);
                setVoiceMatchResult(null);
                setVoiceState("idle");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Describe as Custom Business
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceMatchResult(null);
                setVoiceState("idle");
                handleToggleVoiceSearch();
              }}
              className="px-3.5 py-2 rounded-xl border border-[#ede3d8] bg-white text-xs font-semibold text-[#786d65] hover:bg-[#faf4ee] cursor-pointer"
            >
              Try Voice Search Again
            </button>
          </div>
        </div>
      )}

      {/* Category Group Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedGroup("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedGroup === "all"
              ? "bg-[#241b16] text-white shadow-2xs"
              : "bg-white border border-[#ede3d8] text-[#786d65] hover:text-[#1d1b18]"
          }`}
        >
          All Categories ({groups.flatMap((g) => g.items).length})
        </button>

        {groups.map((grp) => (
          <button
            key={grp.id}
            type="button"
            onClick={() => setSelectedGroup(grp.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedGroup === grp.id
                ? "bg-[#c75d3e] text-white shadow-2xs"
                : "bg-white border border-[#ede3d8] text-[#786d65] hover:text-[#1d1b18]"
            }`}
          >
            {getGroupIcon(grp.iconName)}
            <span>{grp.name}</span>
          </button>
        ))}
      </div>

      {/* Main Grid + Configuration Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Category Cards Browser */}
        <div className="lg:col-span-7">
          {/* Custom Business Card if selected */}
          {isCustomActive && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50/80 border-2 border-[#c75d3e] shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c75d3e] bg-amber-100 px-2 py-0.5 rounded-md">
                  Custom Enterprise
                </span>
                <h3 className="text-lg font-bold text-[#241b16] mt-1.5">{customName}</h3>
                <p className="text-xs text-[#786d65] mt-1">{customDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="text-xs font-bold text-[#c75d3e] hover:underline"
              >
                Edit
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = !isCustomActive && selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                    isSelected
                      ? "bg-white border-2 border-[#c75d3e] shadow-md ring-2 ring-[#c75d3e]/20"
                      : "bg-white hover:bg-[#faf4ee] border-[#ede3d8] shadow-2xs hover:border-[#c75d3e]/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65]">
                        {groups.find((g) => g.id === item.groupId)?.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-[#c75d3e] shrink-0" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#241b16] leading-snug">{item.name}</h4>
                    <p className="text-xs text-[#786d65] mt-1.5 line-clamp-2">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#ede3d8] flex items-center justify-between text-[11px] text-[#786d65]">
                    <span className="font-semibold text-[#3a6b4c]">
                      ~{item.benchmarkMarginPct}% Margin
                    </span>
                    <span>{item.defaultUnit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#ede3d8] p-6">
              <p className="text-sm font-bold text-[#241b16]">No matching business found</p>
              <p className="text-xs text-[#786d65] mt-1">
                You don’t have to pick a standard category. Describe your business directly!
              </p>
              <button
                type="button"
                onClick={() => {
                  setCustomName(searchQuery);
                  setShowCustomModal(true);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c75d3e] text-white text-xs font-bold shadow-sm"
              >
                <PlusCircle size={14} />
                <span>Create &quot;{searchQuery}&quot; as Custom Business</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Business Detail & Scale Configuration */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ede3d8] p-5 shadow-2xs flex flex-col gap-4">
          <div className="border-b border-[#ede3d8] pb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c75d3e]">
              Active Selection
            </span>
            <h3 className="text-lg font-bold text-[#241b16] mt-0.5">
              {isCustomActive ? customName : selectedItem?.name || "Select a Business"}
            </h3>
          </div>

          {/* Scale Selector */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
              Typical Operating Scale
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setScale("small")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  scale === "small"
                    ? "bg-[#c75d3e] text-white border-[#c75d3e] shadow-2xs"
                    : "bg-[#faf4ee] border-[#ede3d8] text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                Small Scale
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  Micro setup / Local focus
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScale("medium")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  scale === "medium"
                    ? "bg-[#c75d3e] text-white border-[#c75d3e] shadow-2xs"
                    : "bg-[#faf4ee] border-[#ede3d8] text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                Medium Scale
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  Commercial cluster scale
                </span>
              </button>
            </div>
          </div>

          {/* Optional: Describe your version */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
              Describe your specific version (Optional)
            </label>
            <textarea
              rows={2}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g. Neighborhood collection & chilling hub with daily delivery..."
              className="w-full rounded-xl border border-[#ede3d8] bg-[#faf4ee]/50 p-3 text-xs text-[#241b16] placeholder-[#786d65]/60 focus:border-[#c75d3e] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c75d3e]"
            />
          </div>

          {/* Optional: Target Customers */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
              Expected Customers (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOMER_TYPES.map((c) => {
                const active = selectedCustomers.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleCustomer(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      active
                        ? "bg-[#3a6b4c] text-white border-[#3a6b4c]"
                        : "bg-white text-[#786d65] border-[#ede3d8] hover:border-[#786d65]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-2 w-full py-3 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm Business</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Custom Business Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ede3d8] p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede3d8]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#c75d3e]" />
                <h3 className="text-lg font-bold text-[#241b16]">Describe Your Own Business</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-[#786d65] hover:text-[#1d1b18]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65] mb-1">
                  Business Name or Concept
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Small neighborhood dairy collection and chilling unit"
                  className="w-full rounded-xl border border-[#ede3d8] p-2.5 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65] mb-1">
                  Brief Description & Activities
                </label>
                <textarea
                  rows={3}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe your planned machinery, products, or service offerings..."
                  className="w-full rounded-xl border border-[#ede3d8] p-2.5 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#ede3d8] text-xs font-semibold text-[#786d65] hover:text-[#1d1b18]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={handleSaveCustomBusiness}
                  className="px-5 py-2 rounded-xl bg-[#c75d3e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Use This Business
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
