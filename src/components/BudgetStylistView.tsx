import { useEffect, useState, type FormEvent } from "react";
import { ArrowRightLeft, Bookmark, Check, ShoppingBag, Wand2 } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { api } from "../lib/api.ts";
import type {
  BudgetStylistRequest,
  BudgetStylistResponse,
  GenderTarget,
  Product,
} from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const OCCASIONS = [
  "College Party",
  "Casual Day Out",
  "Office / Formal",
  "Date Night",
  "College Farewell",
  "Birthday",
  "Wedding / Festive",
];

const STYLES = [
  "Casual & Trendy",
  "Minimalist Chic",
  "Streetwear",
  "Classic Formal",
  "Bohemian",
];

const COLOR_CHOICES = ["Pink", "White", "Black", "Blue", "Beige", "Brown", "Silver", "Gold"];

export function BudgetStylistView() {
  const { user, addMultipleToCart, addToCart, saveOutfit, openProductModal } = useStore();

  const [budget, setBudget] = useState<number>(user?.preferences.defaultBudget ?? 2000);
  const [gender, setGender] = useState<GenderTarget>(user?.preferences.preferredGender ?? "Women");
  const [occasion, setOccasion] = useState("College Party");
  const [style, setStyle] = useState(user?.preferences.favoriteStyle ?? "Casual & Trendy");
  const [preferredColors, setPreferredColors] = useState<string[]>(
    user?.preferences.favoriteColors ?? ["Pink", "Blue", "White"]
  );
  const [clothingType, setClothingType] =
    useState<BudgetStylistRequest["clothingType"]>("Full Outfit");
  const [includeFootwear, setIncludeFootwear] = useState(true);
  const [includeWatch, setIncludeWatch] = useState(true);
  const [includeBag, setIncludeBag] = useState(false);
  const [includeJewellery, setIncludeJewellery] = useState(false);
  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BudgetStylistResponse | null>(null);

  const toggleColor = (c: string) => {
    setPreferredColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const generateOutfit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runBudgetStylist({
        budget,
        gender,
        occasion,
        style,
        preferredColors,
        clothingType,
        includeFootwear,
        includeWatch,
        includeBag,
        includeJewellery,
        instructions,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate outfit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateOutfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    generateOutfit();
  };

  const handleSwapAlternative = (index: number, alt: Product) => {
    if (!result) return;
    const currentItem = result.items[index];
    const newTotal = result.totalPrice - currentItem.product.price + alt.price;
    if (newTotal > result.budget) return;

    const updatedItems = [...result.items];
    const nextAlts = [
      currentItem.product,
      ...currentItem.alternatives.filter((a) => a.id !== alt.id),
    ];
    updatedItems[index] = {
      product: alt,
      reason: `Swapped in to match your ₹${result.budget.toLocaleString("en-IN")} budget while preserving ${alt.primaryColor.toLowerCase()} harmony.`,
      alternatives: nextAlts,
    };

    setResult({
      ...result,
      totalPrice: newTotal,
      remainingBudget: Math.max(0, result.budget - newTotal),
      items: updatedItems,
    });
  };

  const utilizationPct = result
    ? Math.min(100, Math.round((result.totalPrice / Math.max(1, result.budget)) * 100))
    : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="pb-6 border-b border-rose-900/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
            AI Budget Shopping Assistant
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1D1518] mt-1">
            Style Within Your Budget
          </h1>
          <p className="text-sm text-[#6C5D63] mt-1 max-w-2xl">
            Enter your target spend, occasion, and preferences. TIVANA  selects complete
            coordinated outfits guaranteed never to exceed your total budget.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1500, 2000, 2500, 3500].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBudget(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tabular-nums border cursor-pointer ${
                budget === preset
                  ? "bg-[#B83B67] border-[#B83B67] text-white"
                  : "bg-white border-rose-900/15 text-[#1D1518] hover:bg-[#FAF3F5]"
              }`}
            >
              ₹{preset.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-rose-900/10 rounded-2xl p-6 space-y-5"
        >
          {/* Budget */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="budget-input" className="text-xs font-semibold uppercase tracking-wider text-[#1D1518]">
                Total Shopping Budget (₹)
              </label>
              <span className="text-base font-bold text-[#B83B67] tabular-nums">
                ₹{budget.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="budget-input"
              type="number"
              min={500}
              max={25000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Math.max(500, Number(e.target.value) || 500))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm font-semibold text-[#1D1518] tabular-nums focus:outline-none focus:border-[#B83B67]"
            />
            <input
              type="range"
              min={800}
              max={6000}
              step={100}
              value={Math.min(6000, budget)}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-2 accent-[#B83B67] cursor-pointer"
            />
          </div>

          {/* Gender & Clothing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF3F5] rounded-xl">
                {(["Women", "Men", "Unisex"] as GenderTarget[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                      gender === g
                        ? "bg-white text-[#B83B67] shadow-sm"
                        : "text-[#6C5D63] hover:text-[#1D1518]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="clothing-type" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Clothing Format
              </label>
              <select
                id="clothing-type"
                value={clothingType}
                onChange={(e) =>
                  setClothingType(e.target.value as BudgetStylistRequest["clothingType"])
                }
                className="w-full px-3 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518] cursor-pointer"
              >
                <option value="Full Outfit">Top + Bottom + Add-ons</option>
                <option value="Dress + Accessories">Dress + Accessories</option>
                <option value="Top + Bottom">Top + Bottom Focus</option>
              </select>
            </div>
          </div>

          {/* Occasion & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="occasion-select" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Occasion
              </label>
              <select
                id="occasion-select"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518] cursor-pointer"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="style-select" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Fashion Style
              </label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518] cursor-pointer"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Colours */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
              Preferred Colours
            </span>
            <div className="flex flex-wrap gap-2">
              {COLOR_CHOICES.map((color) => {
                const active = preferredColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? "bg-[#FAEBF0] border-[#B83B67] text-[#B83B67] font-semibold"
                        : "bg-white border-rose-900/15 text-[#6C5D63] hover:text-[#1D1518]"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Preferences */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
              Include in Outfit
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Footwear", checked: includeFootwear, set: setIncludeFootwear },
                { label: "Watch", checked: includeWatch, set: setIncludeWatch },
                { label: "Handbag", checked: includeBag, set: setIncludeBag },
                { label: "Jewellery", checked: includeJewellery, set: setIncludeJewellery },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => opt.set(!opt.checked)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
                    opt.checked
                      ? "bg-[#FAF3F5] border-[#B83B67]/50 text-[#1D1518]"
                      : "bg-white border-rose-900/10 text-[#6C5D63]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.checked && <Check className="w-3.5 h-3.5 text-[#B83B67]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Instructions */}
          <div>
            <label htmlFor="extra-notes" className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
              Additional Styling Notes (Optional)
            </label>
            <textarea
              id="extra-notes"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Comfortable sneakers for walking, pastel pink accents..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm text-[#1D1518] focus:outline-none focus:border-[#B83B67]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>{loading ? "Curating Outfit..." : "Generate Budget Outfit"}</span>
          </button>
        </form>

        {/* Right Recommendations Panel */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-900">
              {error}
            </div>
          )}

          {result && (
            <>
              {/* Budget Summary Banner */}
              <div className="bg-[#FAF3F5] border border-rose-900/10 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
                    {result.engineSource === "live-ai"
                      ? "Generated with Live Gemini AI"
                      : "Generated with Smart Catalog Engine"}
                  </span>
                  <span className="text-xs font-medium text-[#6C5D63] tabular-nums">
                    Under Budget · ₹{result.remainingBudget.toLocaleString("en-IN")} saved
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#1D1518]">
                    {result.headline}
                  </h2>
                  <p className="text-sm text-[#6C5D63] mt-1 leading-relaxed">
                    {result.styleSummary} {result.colorHarmonyNote}
                  </p>
                </div>

                {/* Budget Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-sm tabular-nums">
                    <span className="font-semibold text-[#1D1518]">
                      Total Outfit Price: ₹{result.totalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[#6C5D63]">
                      Budget Cap: ₹{result.budget.toLocaleString("en-IN")} ({utilizationPct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white border border-rose-900/10 overflow-hidden">
                    <div
                      className="h-full bg-[#B83B67] rounded-full transition-all duration-300"
                      style={{ width: `${utilizationPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => addMultipleToCart(result.items.map((i) => i.product))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B83B67] text-white text-xs font-semibold hover:bg-[#9B2D54] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Add Entire Outfit (₹{result.totalPrice.toLocaleString("en-IN")})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      saveOutfit({
                        name: result.headline,
                        occasion,
                        style,
                        productIds: result.items.map((i) => i.product.id),
                        totalPrice: result.totalPrice,
                        notes: result.styleSummary,
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-900/15 text-[#1D1518] text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save Outfit</span>
                  </button>
                </div>
              </div>

              {/* Individual Recommended Pieces */}
              <div className="space-y-4">
                {result.items.map((piece, idx) => (
                  <div
                    key={`${piece.product.id}-${idx}`}
                    className="bg-white border border-rose-900/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => openProductModal(piece.product)}
                      className="w-full sm:w-32 h-40 rounded-xl overflow-hidden bg-[#FAF3F5] shrink-0 cursor-pointer"
                    >
                      <SafeFashionImage
                        imageKey={piece.product.imageKey}
                        alt={piece.product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-[#6C5D63] font-medium">
                              {piece.product.slot} · {piece.product.brand}
                            </p>
                            <button
                              type="button"
                              onClick={() => openProductModal(piece.product)}
                              className="text-base font-semibold text-[#1D1518] hover:text-[#B83B67] text-left cursor-pointer"
                            >
                              {piece.product.name}
                            </button>
                          </div>
                          <span className="text-lg font-bold text-[#1D1518] tabular-nums shrink-0">
                            ₹{piece.product.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-[#6C5D63] leading-relaxed">
                          {piece.reason}
                        </p>
                      </div>

                      {/* Alternatives & Quick Add */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-900/10">
                        <div className="flex flex-wrap items-center gap-2">
                          {piece.alternatives.length > 0 && (
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6C5D63] inline-flex items-center gap-1">
                              <ArrowRightLeft className="w-3 h-3" /> Swap:
                            </span>
                          )}
                          {piece.alternatives.map((alt) => (
                            <button
                              key={alt.id}
                              type="button"
                              onClick={() => handleSwapAlternative(idx, alt)}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF3F5] hover:bg-[#FAEBF0] text-xs font-medium text-[#1D1518] transition-colors tabular-nums cursor-pointer"
                            >
                              {alt.name.split(" ").slice(0, 3).join(" ")} (₹{alt.price})
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(piece.product)}
                          className="px-3 py-1.5 rounded-lg border border-rose-900/15 text-xs font-semibold text-[#1D1518] hover:bg-[#B83B67] hover:text-white hover:border-[#B83B67] transition-colors cursor-pointer"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
