import { useMemo, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { GenderTarget, ProductCategory } from "../types/fashion.ts";
import { ProductCard } from "./ProductCard.tsx";

const CATEGORY_TABS: (ProductCategory | "All")[] = [
  "All",
  "Women's Fashion",
  "Men's Fashion",
  "Footwear",
  "Watches",
  "Bags",
  "Accessories",
  "Jewellery",
];

const COLOR_OPTIONS = ["All", "Pink", "White", "Black", "Blue", "Beige", "Brown", "Silver", "Gold"];

export function ShopView() {
  const {
    products,
    loadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    recentlyViewed,
  } = useStore();

  const [genderFilter, setGenderFilter] = useState<GenderTarget | "All">("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating" | "discount">("featured");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
        if (genderFilter !== "All" && p.gender !== genderFilter && p.gender !== "Unisex") {
          return false;
        }
        if (
          colorFilter !== "All" &&
          p.primaryColor.toLowerCase() !== colorFilter.toLowerCase() &&
          !p.colors.some((c) => c.toLowerCase().includes(colorFilter.toLowerCase()))
        ) {
          return false;
        }
        if (p.price > maxPrice) return false;
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.brand.toLowerCase().includes(q) &&
          !p.category.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !p.primaryColor.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "discount") return b.discountPercent - b.discountPercent;
        return Number(b.isTrending) - Number(a.isTrending) || b.rating - a.rating;
      });
  }, [products, selectedCategory, genderFilter, colorFilter, maxPrice, searchQuery, sortBy]);

  const recentProducts = useMemo(
    () =>
      recentlyViewed
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .slice(0, 4),
    [recentlyViewed, products]
  );

  const resetFilters = () => {
    setSelectedCategory("All");
    setGenderFilter("All");
    setColorFilter("All");
    setMaxPrice(1500);
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-rose-900/10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
            Curated Fashion Catalogue
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1D1518] mt-1">
            Shop StyleMate Collection
          </h1>
          <p className="text-sm text-[#6C5D63] mt-1 tabular-nums">
            Showing {filteredProducts.length} of {products.length} curated pieces
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-rose-900/15 rounded-xl px-3 py-2 w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6C5D63] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, colours..."
              className="w-full bg-transparent pl-2.5 text-sm text-[#1D1518] focus:outline-none"
            />
          </div>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white border border-rose-900/15 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1D1518] focus:outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#B83B67] text-white"
                : "bg-[#FAF3F5] text-[#6C5D63] hover:text-[#1D1518]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FAF3F5] border border-rose-900/10 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#B83B67] shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1D1518]">
            Gender
          </span>
          <div className="flex items-center gap-1 ml-2">
            {(["All", "Women", "Men"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                  genderFilter === g
                    ? "bg-white text-[#B83B67] font-semibold shadow-sm"
                    : "text-[#6C5D63] hover:text-[#1D1518]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1D1518]">Max Price</span>
            <span className="font-semibold text-[#B83B67] tabular-nums">
              Up to ₹{maxPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min={199}
            max={1500}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[#B83B67] cursor-pointer"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <label htmlFor="color-filter" className="text-xs font-semibold text-[#1D1518] shrink-0">
            Colour
          </label>
          <select
            id="color-filter"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="w-full bg-white border border-rose-900/15 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1D1518]"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#6C5D63] hover:text-[#1D1518] hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-xl bg-[#FAF3F5] border border-rose-900/10" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF3F5] border border-rose-900/10 rounded-2xl px-4">
          <p className="font-display text-2xl font-semibold text-[#1D1518]">
            No matching pieces found
          </p>
          <p className="text-sm text-[#6C5D63] mt-2">
            Try raising your max price filter or clearing your search keywords.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Recently Viewed Strip */}
      {recentProducts.length > 0 && (
        <section className="pt-8 border-t border-rose-900/10">
          <h2 className="font-display text-2xl font-semibold text-[#1D1518] mb-5">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
