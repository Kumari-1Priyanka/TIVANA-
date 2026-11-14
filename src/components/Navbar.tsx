import { useState } from "react";
import { Heart, Menu, Scale, Search, ShoppingBag, User, X } from "lucide-react";
import { useStore, type AppView } from "../context/StoreContext.tsx";

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "stylist", label: "AI Stylist" },
  { id: "outfit", label: "Outfit Builder" },
  { id: "color-match", label: "Colour Match" },
];

export function Navbar() {
  const {
    activeView,
    setActiveView,
    navigateToShop,
    wishlist,
    cartCount,
    compareIds,
    setIsCartOpen,
    setIsCompareOpen,
    user,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBFA]/95 backdrop-blur-md border-b border-rose-900/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav("home")}
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1518] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B83B67]"
        >
          TIVANA 
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6C5D63]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? "text-[#B83B67] font-semibold"
                    : "hover:text-[#1D1518]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-[#B83B67]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Essential shopping utilities + primary account action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigateToShop({ query: "" })}
            aria-label="Search fashion catalogue"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#1D1518] hover:bg-[#FAF3F5] transition-colors cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>

          {compareIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              aria-label={`Compare ${compareIds.length} items`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 h-10 rounded-lg text-xs font-medium text-[#1D1518] hover:bg-[#FAF3F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-[#B83B67]" strokeWidth={1.75} />
              <span className="tabular-nums">{compareIds.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNav("profile")}
            aria-label={`Wishlist (${wishlist.length} items)`}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#1D1518] hover:bg-[#FAF3F5] transition-colors cursor-pointer"
          >
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B83B67] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping bag (${cartCount} items)`}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#1D1518] hover:bg-[#FAF3F5] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B83B67] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav("profile")}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#B83B67] text-white hover:bg-[#9B2D54] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{user ? user.name.split(" ")[0] : "Sign In"}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#1D1518] hover:bg-[#FAF3F5] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-900/10 bg-[#FDFBFA] px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === item.id
                  ? "bg-[#FAEBF0] text-[#B83B67] font-semibold"
                  : "text-[#1D1518] hover:bg-[#FAF3F5]"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-rose-900/10 flex items-center gap-2">
            {compareIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCompareOpen(true);
                }}
                className="flex-1 py-2.5 px-3 text-xs font-medium border border-rose-900/15 rounded-lg text-[#1D1518]"
              >
                Compare ({compareIds.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNav("profile")}
              className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg bg-[#B83B67] text-white"
            >
              {user ? `${user.name.split(" ")[0]} · Account` : "Sign In / Profile"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
