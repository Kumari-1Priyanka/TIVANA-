import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Palette, Search, ShoppingBag, Sparkles, Wand2 } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { ProductCategory } from "../types/fashion.ts";
import { ProductCard } from "./ProductCard.tsx";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const CATEGORIES: {
  name: ProductCategory;
  subtitle: string;
  imageKey: "womens_dresses" | "mens_shirts" | "sneakers" | "watches" | "handbags" | "jewellery" | "sunglasses";
}[] = [
  { name: "Women's Fashion", subtitle: "Tops, dresses & denim", imageKey: "womens_dresses" },
  { name: "Men's Fashion", subtitle: "Linen shirts & chinos", imageKey: "mens_shirts" },
  { name: "Footwear", subtitle: "Sneakers, heels & loafers", imageKey: "sneakers" },
  { name: "Watches", subtitle: "Rose gold & dress dials", imageKey: "watches" },
  { name: "Bags", subtitle: "Totes & crossbody satchels", imageKey: "handbags" },
  { name: "Jewellery", subtitle: "Silver & pearl layers", imageKey: "jewellery" },
  { name: "Accessories", subtitle: "Acetate eyewear", imageKey: "sunglasses" },
];

export function HomeView() {
  const {
    products,
    setActiveView,
    navigateToShop,
    addMultipleToCart,
    openProductModal,
  } = useStore();

  const [heroSearch, setHeroSearch] = useState("");
  const [collectionTab, setCollectionTab] = useState<"trending" | "new" | "budget">("trending");

  const displayedProducts = useMemo(() => {
    if (collectionTab === "trending") {
      return products.filter((p) => p.isTrending).slice(0, 6);
    }
    if (collectionTab === "new") {
      return products.filter((p) => p.isNewArrival).slice(0, 6);
    }
    return products.filter((p) => p.price <= 699).slice(0, 6);
  }, [products, collectionTab]);

  // Popular Outfit Combinations derived directly from authoritative product data
  const popularLooks = useMemo(() => {
    const find = (ids: string[]) =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const collegeParty = find(["sm-w-top-01", "sm-u-bot-01", "sm-f-snk-01", "sm-wt-01"]);
    const crispMens = find(["sm-m-top-01", "sm-m-bot-01", "sm-f-snk-01", "sm-wt-03"]);
    const eveningRose = find(["sm-w-dress-01", "sm-f-heel-01", "sm-jw-01", "sm-bg-03"]);

    return [
      {
        title: "College Party Casual Under ₹2,000",
        occasion: "College Party · Casual & Trendy",
        description:
          "Blush ribbed crop top paired with vintage indigo denim, crisp white court sneakers, and a rose-gold dial watch.",
        items: collegeParty,
        lookbookKey: "lookbook_outfit" as const,
      },
      {
        title: "Monochrome Campus & Evening Edit",
        occasion: "Date Night · Smart Casual",
        description:
          "Jet-black tailored linen shirt grounded with mid-wash jeans, pure white sneakers, and a slim formal silver watch.",
        items: crispMens,
        lookbookKey: "mens_shirts" as const,
      },
      {
        title: "Dusty Rose Farewell & Dinner Look",
        occasion: "College Farewell · Minimalist Chic",
        description:
          "Pleated dusty rose midi slip dress elevated by satin block heels, sterling pearl drops, and an ivory mini bag.",
        items: eveningRose,
        lookbookKey: "womens_dresses" as const,
      },
    ];
  }, [products]);

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    navigateToShop({ category: "All", query: heroSearch.trim() });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Storefront Split Hero */}
      <section className="bg-gradient-to-br from-[#FDFBFA] via-[#FAF3F5] to-[#F7E8EE] border-b border-rose-900/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Copy & Instant Search */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B83B67]">
                Personal AI Fashion Stylist & Marketplace
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.08] tracking-tight text-[#1D1518]">
                Your Personal AI Fashion Stylist
              </h1>

              <p className="text-base sm:text-lg text-[#6C5D63] leading-relaxed max-w-xl">
                Curate complete outfits, discover harmonious colour pairings, and shop editorial
                pieces tailored strictly to your budget and occasion.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="flex items-center bg-white border border-rose-900/15 rounded-xl p-1.5 shadow-sm max-w-xl"
              >
                <Search className="w-4 h-4 text-[#6C5D63] ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search blush tops, white sneakers, watches..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1D1518] placeholder:text-[#6C5D63]/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1D1518] text-white text-xs font-semibold hover:bg-[#34262B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Primary CTA + Secondary Route */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveView("stylist")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Plan Outfit by Budget</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToShop({ category: "All", query: "" })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-rose-900/15 text-[#1D1518] text-sm font-semibold hover:bg-[#FAF3F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Browse Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Editorial Visual */}
            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[380px] rounded-2xl overflow-hidden border border-rose-900/10 bg-[#FAF3F5]">
                <SafeFashionImage
                  imageKey="hero_editorial"
                  alt="TIVANA  contemporary blush silk and ivory tailored editorial look"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/75 via-black/35 to-transparent text-white flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-rose-100">
                      Featured Budget Formula
                    </p>
                    <p className="font-serif text-lg font-medium">
                      4-Piece College Party Edit · ₹1,896 Total
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("outfit")}
                    className="px-3.5 py-2 rounded-lg bg-white/95 text-[#1D1518] text-xs font-semibold hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Build Look
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Capability Strip below Hero Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-rose-900/10">
            <button
              type="button"
              onClick={() => setActiveView("stylist")}
              className="text-left p-4 rounded-xl bg-white/80 border border-rose-900/10 hover:bg-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[#B83B67] text-xs font-semibold uppercase tracking-wider">
                <Wand2 className="w-4 h-4" />
                <span>Budget Stylist</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#1D1518]">
                Zero Over-Budget Guarantee
              </p>
              <p className="mt-0.5 text-xs text-[#6C5D63]">
                Complete outfits strictly within your rupee cap.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("outfit")}
              className="text-left p-4 rounded-xl bg-white/80 border border-rose-900/10 hover:bg-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[#B83B67] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Outfit Builder</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#1D1518]">
                9-Slot Wardrobe Composer
              </p>
              <p className="mt-0.5 text-xs text-[#6C5D63]">
                Mix tops, denim, watches, bags &amp; eyewear.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("color-match")}
              className="text-left p-4 rounded-xl bg-white/80 border border-rose-900/10 hover:bg-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[#B83B67] text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                <span>Colour Engine</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#1D1518]">
                Instant Shade Harmony
              </p>
              <p className="mt-0.5 text-xs text-[#6C5D63]">
                Match shoes, watches &amp; bags to any garment.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigateToShop({ category: "All", query: "" })}
              className="text-left p-4 rounded-xl bg-white/80 border border-rose-900/10 hover:bg-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-[#B83B67] text-xs font-semibold uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4" />
                <span>Curated Store</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#1D1518]">
                30+ Boutique Essentials
              </p>
              <p className="mt-0.5 text-xs text-[#6C5D63]">
                Live budget tracker, wishlist &amp; comparisons.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
              Curated Departments
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1D1518] mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateToShop({ category: "All", query: "" })}
            className="text-sm font-semibold text-[#B83B67] hover:text-[#9B2D54] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => navigateToShop({ category: cat.name, query: "" })}
              className="group text-left bg-white border border-rose-900/10 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-[#FAF3F5] overflow-hidden">
                <SafeFashionImage
                  imageKey={cat.imageKey}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-[#1D1518] truncate">{cat.name}</p>
                <p className="text-[11px] text-[#6C5D63] truncate mt-0.5">{cat.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Trending / New Arrivals / Budget-Friendly Tabs */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
              Editorial Selection
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1D1518] mt-1">
              Featured Collections
            </h2>
          </div>

          {/* Interactive segmented filter tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#FAF3F5] border border-rose-900/10 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCollectionTab("trending")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                collectionTab === "trending"
                  ? "bg-white text-[#1D1518] shadow-sm"
                  : "text-[#6C5D63] hover:text-[#1D1518]"
              }`}
            >
              Trending Now
            </button>
            <button
              type="button"
              onClick={() => setCollectionTab("new")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                collectionTab === "new"
                  ? "bg-white text-[#1D1518] shadow-sm"
                  : "text-[#6C5D63] hover:text-[#1D1518]"
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setCollectionTab("budget")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                collectionTab === "budget"
                  ? "bg-white text-[#1D1518] shadow-sm"
                  : "text-[#6C5D63] hover:text-[#1D1518]"
              }`}
            >
              Under ₹699
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Popular Outfit Combinations & Featured AI Recommendations */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
              AI Stylist Lookbook
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1D1518] mt-1">
              Popular Outfit Combinations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveView("outfit")}
            className="text-sm font-semibold text-[#B83B67] hover:text-[#9B2D54] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Customize in Outfit Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {popularLooks.map((look) => {
            const total = look.items.reduce((sum, item) => sum + item.price, 0);
            return (
              <div
                key={look.title}
                className="bg-white border border-rose-900/10 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#FAF3F5] overflow-hidden">
                    <SafeFashionImage
                      imageKey={look.lookbookKey}
                      alt={look.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-[#6C5D63] font-medium">{look.occasion}</p>
                    <h3 className="font-display text-xl font-semibold text-[#1D1518]">
                      {look.title}
                    </h3>
                    <p className="text-sm text-[#6C5D63] leading-relaxed">
                      {look.description}
                    </p>

                    <div className="pt-2 border-t border-rose-900/10 space-y-2">
                      {look.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openProductModal(item)}
                          className="w-full flex items-center justify-between gap-2 text-xs hover:text-[#B83B67] transition-colors cursor-pointer"
                        >
                          <span className="text-[#1D1518] truncate text-left">{item.name}</span>
                          <span className="font-semibold text-[#1D1518] tabular-nums shrink-0">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-[#FAF3F5] border-t border-rose-900/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#6C5D63]">Complete Look Total</p>
                    <p className="text-lg font-bold text-[#1D1518] tabular-nums">
                      ₹{total.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMultipleToCart(look.items)}
                    className="px-4 py-2 rounded-lg bg-[#B83B67] text-white text-xs font-semibold hover:bg-[#9B2D54] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Add Complete Look
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
