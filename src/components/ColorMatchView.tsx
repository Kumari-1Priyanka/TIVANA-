import { useEffect, useState, type FormEvent } from "react";
import { Palette, Plus } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { api } from "../lib/api.ts";
import type { ColorMatchResponse, GenderTarget } from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const COLOR_PALETTE = [
  { name: "Black", hex: "#1E1B1E" },
  { name: "White", hex: "#FAF8F6" },
  { name: "Pink", hex: "#E8B4C6" },
  { name: "Blue", hex: "#365B8C" },
  { name: "Beige", hex: "#D8C5AD" },
];

const PRESET_EXAMPLES = [
  { label: "Black Shirt", garmentType: "Shirt", garmentColor: "Black", gender: "Men" as GenderTarget },
  { label: "White Top", garmentType: "Top", garmentColor: "White", gender: "Women" as GenderTarget },
  { label: "Pink Dress", garmentType: "Dress", garmentColor: "Pink", gender: "Women" as GenderTarget },
  { label: "Blue Jeans", garmentType: "Jeans", garmentColor: "Blue", gender: "Unisex" as GenderTarget },
];

export function ColorMatchView() {
  const { addToCart, openProductModal } = useStore();

  const [garmentType, setGarmentType] = useState("Shirt");
  const [garmentColor, setGarmentColor] = useState("Black");
  const [gender, setGender] = useState<GenderTarget>("Women");
  const [occasion, setOccasion] = useState("Casual Day Out");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorMatchResponse | null>(null);

  const fetchMatch = async (
    gType = garmentType,
    gColor = garmentColor,
    gGender = gender,
    gOccasion = occasion
  ) => {
    setLoading(true);
    try {
      const res = await api.runColorMatch({
        garmentType: gType,
        garmentColor: gColor,
        gender: gGender,
        occasion: gOccasion,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch("Dress", "Pink", "Women", "Date Night");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchMatch();
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="pb-6 border-b border-rose-900/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
            AI Colour Matching Engine
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1D1518] mt-1">
            Harmonize Every Shade
          </h1>
          <p className="text-sm text-[#6C5D63] mt-1 max-w-2xl">
            Pick any garment colour in your closet and discover matched footwear, watches, handbags,
            and jewellery curated by colour theory.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setGarmentType(preset.garmentType);
                setGarmentColor(preset.garmentColor);
                setGender(preset.gender);
                fetchMatch(preset.garmentType, preset.garmentColor, preset.gender, occasion);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#FAF3F5] hover:bg-[#FAEBF0] text-xs font-semibold text-[#1D1518] border border-rose-900/10 cursor-pointer"
            >
              Try: {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-rose-900/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-end"
      >
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
            Clothing Colour
          </label>
          <div className="flex items-center gap-2.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setGarmentColor(c.name)}
                title={c.name}
                aria-label={`Select ${c.name}`}
                className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                  garmentColor === c.name
                    ? "border-[#B83B67] scale-110"
                    : "border-black/15 hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="garment-type" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
            Base Garment
          </label>
          <select
            id="garment-type"
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
          >
            <option>Shirt</option>
            <option>Top</option>
            <option>Dress</option>
            <option>Jeans</option>
            <option>Trousers</option>
            <option>Skirt</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="match-gender" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
            Style For
          </label>
          <select
            id="match-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as GenderTarget)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
          >
            <option value="Women">Women</option>
            <option value="Men">Men</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="match-occasion" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
            Occasion
          </label>
          <select
            id="match-occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
          >
            <option>Casual Day Out</option>
            <option>Date Night</option>
            <option>Office / Formal</option>
            <option>College Party</option>
            <option>College Farewell</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Palette className="w-4 h-4" />
            <span>{loading ? "Matching..." : "Match Colours"}</span>
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="bg-[#FAF3F5] border border-rose-900/10 rounded-2xl p-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#B83B67]">
                {result.baseSummary} ·{" "}
                {result.engineSource === "live-ai" ? "Live Gemini Colour Theory" : "Colour Harmony Engine"}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#1D1518]">
              {result.paletteTitle}
            </h2>
            <p className="text-sm text-[#6C5D63] leading-relaxed max-w-3xl">
              {result.harmonyPrinciple}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.groups.map((group) => (
              <div
                key={group.slotLabel}
                className="bg-white border border-rose-900/10 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#1D1518]">
                      {group.slotLabel}
                    </h3>
                    <p className="text-xs text-[#6C5D63] mt-0.5">
                      Best tones: {group.recommendedColors.join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {group.hexSwatches.map((hex, i) => (
                      <span
                        key={`${hex}-${i}`}
                        className="w-5 h-5 rounded-full border border-black/15"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#6C5D63] leading-relaxed">{group.rationale}</p>

                <div className="space-y-2.5 pt-2 border-t border-rose-900/10">
                  {group.products.length === 0 ? (
                    <p className="text-xs text-[#6C5D63]">
                      Pair with neutral {group.recommendedColors[0]} accents from your wardrobe.
                    </p>
                  ) : (
                    group.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#FAF3F5] transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => openProductModal(prod)}
                          className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF3F5] shrink-0">
                            <SafeFashionImage
                              imageKey={prod.imageKey}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1D1518] truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-[#6C5D63] tabular-nums">
                              {prod.primaryColor} · ₹{prod.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => addToCart(prod)}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF3F5] hover:bg-[#B83B67] text-[#1D1518] hover:text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
