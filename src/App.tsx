import { StoreProvider, useStore } from "./context/StoreContext.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { HomeView } from "./components/HomeView.tsx";
import { ShopView } from "./components/ShopView.tsx";
import { BudgetStylistView } from "./components/BudgetStylistView.tsx";
import { OutfitGeneratorView } from "./components/OutfitGeneratorView.tsx";
import { ColorMatchView } from "./components/ColorMatchView.tsx";
import { ProfileView } from "./components/ProfileView.tsx";
import { ProductDetailModal } from "./components/ProductDetailModal.tsx";
import { CartDrawer } from "./components/CartDrawer.tsx";
import { CompareModal } from "./components/CompareModal.tsx";
import { FashionChatbot } from "./components/FashionChatbot.tsx";

function StyleMateShell() {
  const { activeView, setActiveView, navigateToShop, toastMessage } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBFA] text-[#1D1518]">
      <Navbar />

      <main className="flex-1">
        {activeView === "home" && <HomeView />}
        {activeView === "shop" && <ShopView />}
        {activeView === "stylist" && <BudgetStylistView />}
        {activeView === "outfit" && <OutfitGeneratorView />}
        {activeView === "color-match" && <ColorMatchView />}
        {activeView === "profile" && <ProfileView />}
      </main>

      <footer className="border-t border-rose-900/10 bg-[#FAF3F5] mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <p className="font-serif text-xl font-semibold text-[#1D1518]">TIVANA </p>
            <p className="text-xs text-[#6C5D63] leading-relaxed">
              Your personal AI fashion stylist and curated wardrobe destination. Thoughtful
              outfits tailored strictly to your budget and taste.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1D1518]">
              AI Stylist Tools
            </p>
            <ul className="space-y-1.5 text-xs text-[#6C5D63]">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("stylist")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Budget Shopping Assistant
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("outfit")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Complete Outfit Generator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("color-match")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Colour Matching Engine
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1D1518]">
              Departments
            </p>
            <ul className="space-y-1.5 text-xs text-[#6C5D63]">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToShop({ category: "Women's Fashion", query: "" })}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Women&apos;s Fashion
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToShop({ category: "Men's Fashion", query: "" })}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Men&apos;s Fashion
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToShop({ category: "Footwear", query: "" })}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Footwear &amp; Accessories
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1D1518]">
              Account
            </p>
            <ul className="space-y-1.5 text-xs text-[#6C5D63]">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("profile")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Profile &amp; Preferences
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("profile")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Wishlist &amp; Saved Looks
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView("profile")}
                  className="hover:text-[#B83B67] cursor-pointer"
                >
                  Shopping History
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-rose-900/10 py-4 text-center text-xs text-[#6C5D63]">
          © {new Date().getFullYear()} TIVANA · Curated Personal Styling &amp; Fashion Store
        </div>
      </footer>

      <ProductDetailModal />
      <CartDrawer />
      <CompareModal />
      <FashionChatbot />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-[#1D1518] text-white text-xs font-semibold shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StyleMateShell />
    </StoreProvider>
  );
}
