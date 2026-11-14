import { useEffect, useState } from "react";
import { Heart, Scale, ShoppingBag, Star, X } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

export function ProductDetailModal() {
  const {
    selectedProduct,
    closeProductModal,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
  } = useStore();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes[0] || "One Size");
      setSelectedColor(selectedProduct.colors[0] || selectedProduct.primaryColor);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.includes(selectedProduct.id);
  const isCompared = compareIds.includes(selectedProduct.id);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={selectedProduct.name}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-rose-900/15 shadow-2xl relative">
        <button
          type="button"
          onClick={closeProductModal}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 border border-rose-900/15 flex items-center justify-center text-[#1D1518] hover:text-[#B83B67] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Image Gallery */}
          <div className="md:col-span-6 bg-[#FAF3F5] min-h-[340px] md:min-h-[500px]">
            <SafeFashionImage
              imageKey={selectedProduct.imageKey}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#B83B67]">
                  {selectedProduct.brand} · {selectedProduct.category}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1D1518] mt-1">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#6C5D63] tabular-nums">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1D1518]">
                    <Star className="w-3.5 h-3.5 text-[#B83B67]" fill="#B83B67" />
                    {selectedProduct.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{selectedProduct.reviewCount} verified reviews</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 tabular-nums pt-1">
                <span className="text-2xl font-bold text-[#1D1518]">
                  ₹{selectedProduct.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-[#6C5D63] line-through">
                  ₹{selectedProduct.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-[#B83B67]">
                  {selectedProduct.discountPercent}% OFF
                </span>
              </div>

              <p className="text-sm text-[#6C5D63] leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Colour Variant Selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
                  Colour: <span className="text-[#B83B67]">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                        selectedColor === color
                          ? "bg-[#FAEBF0] border-[#B83B67] text-[#B83B67] font-semibold"
                          : "bg-white border-rose-900/15 text-[#1D1518]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D1518] mb-2">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#1D1518] border-[#1D1518] text-white"
                          : "bg-white border-rose-900/15 text-[#1D1518] hover:border-[#B83B67]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-rose-900/10 text-xs text-[#6C5D63] space-y-1">
                <p>
                  <strong className="text-[#1D1518]">Fabric &amp; Care:</strong>{" "}
                  {selectedProduct.fabricCare}
                </p>
                <p>
                  <strong className="text-[#1D1518]">Occasions:</strong>{" "}
                  {selectedProduct.occasions.join(" · ")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(selectedProduct, selectedSize, selectedColor, true);
                  closeProductModal();
                }}
                className="flex-1 py-3 px-5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                aria-label="Toggle wishlist"
                className={`w-12 h-12 rounded-xl border flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? "bg-[#FAEBF0] border-[#B83B67] text-[#B83B67]"
                    : "bg-white border-rose-900/15 text-[#1D1518]"
                }`}
              >
                <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(selectedProduct.id)}
                aria-label="Toggle compare"
                className={`w-12 h-12 rounded-xl border flex items-center justify-center cursor-pointer ${
                  isCompared
                    ? "bg-[#1D1518] border-[#1D1518] text-white"
                    : "bg-white border-rose-900/15 text-[#1D1518]"
                }`}
              >
                <Scale className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
