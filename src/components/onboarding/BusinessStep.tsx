"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BusinessProfile, BusinessCategoryItem, BusinessCategoryGroup } from "@/domain";
import { businessService } from "@/services";
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
  const [groups, setGroups] = useState<BusinessCategoryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<BusinessCategoryItem | null>(null);

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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a business (e.g. dairy, mill, repair...)"
            className="w-full rounded-xl border border-[#ede3d8] bg-white pl-10 pr-4 py-2.5 text-sm text-[#241b16] placeholder-[#786d65]/60 focus:border-[#c75d3e] focus:outline-none focus:ring-1 focus:ring-[#c75d3e] shadow-2xs transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786d65]" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786d65] hover:text-[#1d1b18]"
            >
              <X size={14} />
            </button>
          )}
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
