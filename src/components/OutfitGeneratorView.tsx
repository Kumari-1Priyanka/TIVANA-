import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Bookmark, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { api } from "../lib/api.ts";
import type {
  GenderTarget,
  OutfitGeneratorResponse,
  OutfitSlot,
  Product,
} from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const SLOT_CONFIG: { slot: OutfitSlot; label: string }[] = [
  { slot: "top", label: "Tops & Shirts" },
  { slot: "bottom", label: "Jeans & Trousers" },
  { slot: "dress", label: "Dresses" },
  { slot: "skirt", label: "Skirts" },
  { slot: "footwear", label: "Shoes & Sneakers" },
  { slot: "watch", label: "Watches" },
  { slot: "handbag", label: "Handbags" },
  { slot: "jewellery", label: "Jewellery" },
  { slot: "sunglasses", label: "Sunglasses" },
];

export function OutfitGeneratorView() {
  const { products, addMultipleToCart, saveOutfit, openProductModal } = useStore();

  const [gender, setGender] = useState<GenderTarget>("Women");
  const [occasion, setOccasion] = useState("Date Night");
  const [style, setStyle] = useState("Minimalist Chic");
  const [budget, setBudget] = useState(3500);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutfitGeneratorResponse | null>(null);

  const productsBySlot = useMemo(() => {
    const map = new Map<OutfitSlot, Product[]>();
    for (const { slot } of SLOT_CONFIG) {
      map.set(
        slot,
        products.filter(
          (p) => p.slot === slot && (gender === "Unisex" || p.gender === gender || p.gender === "Unisex")
        )
      );
    }
    return map;
  }, [products, gender]);

  const runGenerator = async (overrideSlots?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await api.runOutfitGenerator({
        selectedSlots: overrideSlots ?? selectedSlots,
        gender,
        occasion,
        style,
        budget,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0 && !result) {
      runGenerator({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const handleSlotSelect = (slot: OutfitSlot, productId: string) => {
    setSelectedSlots((prev) => {
      const next = { ...prev };
      if (!productId) {
        delete next[slot];
      } else {
        next[slot] = productId;
        if (slot === "dress") {
          delete next.top;
          delete next.bottom;
        }
        if (slot === "top" || slot === "bottom") {
          delete next.dress;
        }
      }
      return next;
    });
  };

  const handleSwapPiece = (slot: OutfitSlot, alt: Product) => {
    if (!result) return;
    const nextPieces = result.pieces.map((p) =>
      p.slot === slot
        ? {
            ...p,
            product: alt,
            reason: `Swapped to ${alt.name} for custom ${alt.primaryColor.toLowerCase()} pairing.`,
            alternatives: [p.product, ...p.alternatives.filter((a) => a.id !== alt.id)],
          }
        : p
    );
    setResult({
      ...result,
      pieces: nextPieces,
      totalPrice: nextPieces.reduce((sum, p) => sum + p.product.price, 0),
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="pb-6 border-b border-rose-900/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
            AI Complete Outfit Generator
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1D1518] mt-1">
            Compose Your Complete Look
          </h1>
          <p className="text-sm text-[#6C5D63] mt-1 max-w-2xl">
            Lock any anchor pieces across 9 wardrobe categories and let TIVANA complete the
            remaining ensemble with colour and style rationale.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedSlots({});
            runGenerator({});
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-900/15 bg-white text-xs font-semibold text-[#1D1518] hover:bg-[#FAF3F5] cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Locked Pieces</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 9-Slot Configurator */}
        <div className="lg:col-span-5 bg-white border border-rose-900/10 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Wardrobe
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as GenderTarget);
                  setSelectedSlots({});
                }}
                className="w-full px-3 py-2 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Target Budget (₹)
              </label>
              <input
                type="number"
                min={1000}
                max={15000}
                step={250}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 3500)}
                className="w-full px-3 py-2 rounded-xl border border-rose-900/15 text-sm font-semibold tabular-nums text-[#1D1518]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
              >
                <option>Date Night</option>
                <option>College Party</option>
                <option>College Farewell</option>
                <option>Office / Formal</option>
                <option>Birthday</option>
                <option>Casual Day Out</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-1.5">
                Aesthetic
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-900/15 bg-white text-sm text-[#1D1518]"
              >
                <option>Minimalist Chic</option>
                <option>Casual &amp; Trendy</option>
                <option>Classic Formal</option>
                <option>Streetwear</option>
                <option>Bohemian</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-rose-900/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6C5D63]">
              Pin Specific Pieces (Optional)
            </p>
            {SLOT_CONFIG.map(({ slot, label }) => {
              const options = productsBySlot.get(slot) ?? [];
              if (options.length === 0) return null;
              return (
                <div key={slot} className="flex items-center justify-between gap-3">
                  <label
                    htmlFor={`slot-${slot}`}
                    className="text-xs font-semibold text-[#1D1518] w-32 shrink-0"
                  >
                    {label}
                  </label>
                  <select
                    id={`slot-${slot}`}
                    value={selectedSlots[slot] ?? ""}
                    onChange={(e) => handleSlotSelect(slot, e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-rose-900/15 bg-white text-xs text-[#1D1518] truncate cursor-pointer"
                  >
                    <option value="">AI Auto-Select</option>
                    {options.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => runGenerator()}
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Composing Complete Look..." : "Generate Complete Outfit"}</span>
          </button>
        </div>

        {/* Right: Outfit Showcase & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              <div className="bg-[#FAF3F5] border border-rose-900/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                  <div className="md:col-span-5 min-h-[260px] bg-white">
                    <SafeFashionImage
                      imageKey={
                        result.pieces.some((p) => p.slot === "dress")
                          ? "womens_dresses"
                          : gender === "Men"
                          ? "mens_shirts"
                          : "lookbook_outfit"
                      }
                      alt={result.outfitTitle}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="md:col-span-7 p-6 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[#B83B67]">
                          {result.engineSource === "live-ai"
                            ? "Live Gemini Stylist"
                            : "Smart Catalog Composer"}
                        </span>
                        <span className="text-[#6C5D63] tabular-nums">
                          {result.pieces.length} Coordinated Pieces
                        </span>
                      </div>

                      <h2 className="font-display text-2xl font-semibold text-[#1D1518]">
                        {result.outfitTitle}
                      </h2>

                      <div className="space-y-2 text-sm text-[#6C5D63]">
                        <p>
                          <strong className="text-[#1D1518]">Colour Harmony:</strong>{" "}
                          {result.colorExplanation}
                        </p>
                        <p>
                          <strong className="text-[#1D1518]">Style Direction:</strong>{" "}
                          {result.styleExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-rose-900/10 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#6C5D63]">Complete Outfit Total</p>
                        <p className="text-2xl font-bold text-[#1D1518] tabular-nums">
                          ₹{result.totalPrice.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            saveOutfit({
                              name: result.outfitTitle,
                              occasion,
                              style,
                              productIds: result.pieces.map((p) => p.product.id),
                              totalPrice: result.totalPrice,
                              notes: result.colorExplanation,
                            })
                          }
                          className="p-2.5 rounded-xl bg-white border border-rose-900/15 text-[#1D1518] hover:text-[#B83B67] cursor-pointer"
                          aria-label="Save outfit to profile"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => addMultipleToCart(result.pieces.map((p) => p.product))}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B83B67] text-white text-xs font-semibold hover:bg-[#9B2D54] cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add All to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Piece-by-Piece Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.pieces.map((piece) => (
                  <div
                    key={piece.slot}
                    className="bg-white border border-rose-900/10 rounded-2xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex gap-3.5">
                      <button
                        type="button"
                        onClick={() => openProductModal(piece.product)}
                        className="w-20 h-24 rounded-xl overflow-hidden bg-[#FAF3F5] shrink-0 cursor-pointer"
                      >
                        <SafeFashionImage
                          imageKey={piece.product.imageKey}
                          alt={piece.product.name}
                          className="w-full h-full object-cover"
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#B83B67]">
                          {piece.slot}
                        </p>
                        <button
                          type="button"
                          onClick={() => openProductModal(piece.product)}
                          className="text-sm font-semibold text-[#1D1518] hover:text-[#B83B67] text-left line-clamp-1 cursor-pointer"
                        >
                          {piece.product.name}
                        </button>
                        <p className="text-sm font-bold text-[#1D1518] tabular-nums mt-0.5">
                          ₹{piece.product.price.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-[#6C5D63] mt-1 line-clamp-2">{piece.reason}</p>
                      </div>
                    </div>

                    {piece.alternatives.length > 0 && (
                      <div className="pt-2 border-t border-rose-900/10 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[#6C5D63] inline-flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Swap:
                        </span>
                        {piece.alternatives.map((alt) => (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => handleSwapPiece(piece.slot, alt)}
                            className="px-2 py-1 rounded-md bg-[#FAF3F5] hover:bg-[#FAEBF0] text-[11px] font-medium text-[#1D1518] tabular-nums cursor-pointer"
                          >
                            {alt.primaryColor} · ₹{alt.price}
                          </button>
                        ))}
                      </div>
                    )}
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
