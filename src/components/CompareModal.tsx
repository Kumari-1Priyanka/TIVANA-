import { ShoppingBag, Star, X } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

export function CompareModal() {
  const {
    products,
    compareIds,
    isCompareOpen,
    setIsCompareOpen,
    toggleCompare,
    addToCart,
  } = useStore();

  if (!isCompareOpen) return null;

  const items = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compare Fashion Products"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto border border-rose-900/15 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-rose-900/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
              Side-by-Side Comparison
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#1D1518]">
              Compare Selected Pieces ({items.length}/3)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCompareOpen(false)}
            aria-label="Close comparison"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6C5D63] hover:text-[#1D1518] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-[#6C5D63] py-10 text-center">
            Select up to 3 products using the scale icon on any product card to compare them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-rose-900/10 rounded-xl p-4 flex flex-col justify-between gap-4 bg-[#FDFBFA]"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#FAF3F5]">
                    <SafeFashionImage
                      imageKey={item.imageKey}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleCompare(item.id)}
                      aria-label="Remove from compare"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center text-[#1D1518] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#6C5D63]">
                      {item.brand}
                    </p>
                    <h3 className="text-sm font-semibold text-[#1D1518] mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-rose-900/10 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#6C5D63]">Price</span>
                      <span className="font-bold text-[#1D1518]">
                        ₹{item.price.toLocaleString("en-IN")} ({item.discountPercent}% off)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C5D63]">Rating</span>
                      <span className="font-semibold inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#B83B67]" fill="#B83B67" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C5D63]">Colours</span>
                      <span className="font-medium text-right">{item.colors.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C5D63]">Sizes</span>
                      <span className="font-medium text-right">{item.sizes.join(", ")}</span>
                    </div>
                    <p className="text-[#6C5D63] pt-1">{item.fabricCare}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  className="w-full py-2.5 rounded-lg bg-[#B83B67] text-white text-xs font-semibold hover:bg-[#9B2D54] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
