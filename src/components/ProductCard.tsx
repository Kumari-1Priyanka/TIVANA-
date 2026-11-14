import { Heart, Plus, Scale, Star } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { Product } from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const SWATCH_MAP: Record<string, string> = {
  Pink: "#E8B4C6",
  "Soft Pink": "#F2C6D4",
  Blush: "#EAB8C7",
  White: "#FAF8F6",
  Ivory: "#F3EDE2",
  Black: "#201B1E",
  Blue: "#365B8C",
  Indigo: "#27416B",
  "Dark Indigo": "#1F314F",
  Beige: "#D8C5AD",
  Taupe: "#B39B8D",
  Brown: "#8A5638",
  Tan: "#B67D52",
  Silver: "#C4C9CE",
  Gold: "#D4A373",
  "Rose Gold": "#D89A9E",
  Champagne: "#EAD6C0",
  Wine: "#6B263B",
  Sage: "#9CAF9C",
  Navy: "#23314A",
  Charcoal: "#3C383B",
  "Sky Blue": "#9AC0DC",
  Khaki: "#BBA788",
  "Pearl White": "#F6F2EC",
  Tortoiseshell: "#7D4829",
};

export function ProductCard({ product }: { product: Product }) {
  const {
    wishlist,
    compareIds,
    toggleWishlist,
    toggleCompare,
    addToCart,
    openProductModal,
  } = useStore();

  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  return (
    <article className="group flex flex-col bg-white border border-rose-900/10 rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Image area (~70% of card visual presence) */}
      <div className="relative aspect-[3/4] bg-[#FAF3F5] overflow-hidden">
        <button
          type="button"
          onClick={() => openProductModal(product)}
          className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B83B67]"
          aria-label={`View details for ${product.name}`}
        >
          <SafeFashionImage
            imageKey={product.imageKey}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        {/* Action affordances */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              isWishlisted
                ? "bg-[#B83B67] border-[#B83B67] text-white"
                : "bg-white/95 border-rose-900/10 text-[#1D1518] hover:text-[#B83B67]"
            }`}
          >
            <Heart
              className="w-4 h-4"
              strokeWidth={1.75}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              isCompared
                ? "bg-[#1D1518] border-[#1D1518] text-white"
                : "bg-white/95 border-rose-900/10 text-[#1D1518] hover:text-[#B83B67]"
            }`}
          >
            <Scale className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product)}
          className="absolute bottom-3 right-3 h-9 px-3.5 rounded-lg bg-white/95 text-[#1D1518] border border-rose-900/15 text-xs font-semibold flex items-center gap-1.5 opacity-95 hover:bg-[#B83B67] hover:text-white hover:border-[#B83B67] transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Add</span>
        </button>
      </div>

      {/* Metadata & Pricing */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#6C5D63]">
            <span className="uppercase tracking-wider font-medium truncate">
              {product.brand}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums shrink-0 text-[#1D1518] font-medium">
              <Star className="w-3 h-3 text-[#B83B67]" fill="#B83B67" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => openProductModal(product)}
            className="mt-1 text-left text-[15px] font-semibold text-[#1D1518] hover:text-[#B83B67] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[15px] font-bold text-[#1D1518]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#6C5D63] line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-[#B83B67]">
              {product.discountPercent}% off
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0" aria-label="Available colours">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                title={color}
                className="w-3 h-3 rounded-full border border-black/15"
                style={{ backgroundColor: SWATCH_MAP[color] || "#E8B4C6" }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
