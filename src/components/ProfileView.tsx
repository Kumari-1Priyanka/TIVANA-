import { useState, type FormEvent } from "react";
import { Check, LogOut, Package, ShoppingBag, Trash2, User } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { GenderTarget, UserPreferences } from "../types/fashion.ts";
import { ProductCard } from "./ProductCard.tsx";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const COLOR_OPTIONS = ["Pink", "White", "Black", "Blue", "Beige", "Brown", "Silver", "Gold"];

export function ProfileView() {
  const {
    products,
    user,
    orders,
    wishlist,
    recentlyViewed,
    savedOutfits,
    login,
    signup,
    logout,
    savePreferences,
    addMultipleToCart,
    deleteSavedOutfit,
    openProductModal,
  } = useStore();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "wishlist" | "outfits" | "orders" | "preferences" | "recent"
  >("wishlist");

  const [prefsForm, setPrefsForm] = useState<UserPreferences>(
    user?.preferences ?? {
      defaultBudget: 2500,
      preferredGender: "Women",
      favoriteStyle: "Minimalist Chic",
      favoriteColors: ["Pink", "White", "Beige"],
      topSize: "M",
      footwearSize: "UK 6",
    }
  );
  const [prefsSaved, setPrefsSaved] = useState(false);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const recentProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePrefsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await savePreferences(prefsForm);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const togglePrefColor = (color: string) => {
    setPrefsForm((prev) => ({
      ...prev,
      favoriteColors: prev.favoriteColors.includes(color)
        ? prev.favoriteColors.filter((c) => c !== color)
        : [...prev.favoriteColors, color],
    }));
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Profile / Auth Header */}
      <div className="bg-[#FAF3F5] border border-rose-900/10 rounded-2xl p-6 sm:p-8">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#B83B67] text-white flex items-center justify-center font-serif text-2xl font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
                  StyleMate Member
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#1D1518]">
                  {user.name}
                </h1>
                <p className="text-sm text-[#6C5D63]">
                  {user.email} · Default Budget ₹{user.preferences.defaultBudget.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-900/15 text-xs font-semibold text-[#1D1518] hover:bg-rose-50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B83B67]">
                Personal Wardrobe Account
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1D1518]">
                {authMode === "login" ? "Sign in to TIVANA " : "Create Your Style Profile"}
              </h1>
              <p className="text-sm text-[#6C5D63] leading-relaxed max-w-lg">
                Sync your wishlist, saved AI outfits, style preferences, and complete order history
                across every visit.
              </p>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              className="lg:col-span-6 bg-white border border-rose-900/10 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-2 p-1 bg-[#FAF3F5] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                    authMode === "login"
                      ? "bg-white text-[#1D1518] shadow-sm"
                      : "text-[#6C5D63]"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                    authMode === "signup"
                      ? "bg-white text-[#1D1518] shadow-sm"
                      : "text-[#6C5D63]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm focus:outline-none focus:border-[#B83B67]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm focus:outline-none focus:border-[#B83B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm focus:outline-none focus:border-[#B83B67]"
                />
              </div>

              {authError && (
                <p className="text-xs font-medium text-rose-700 bg-rose-50 px-3 py-2 rounded-lg">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login to Account"
                  : "Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-rose-900/10 pb-3">
        {[
          { id: "wishlist", label: `Wishlist (${wishlistProducts.length})` },
          { id: "outfits", label: `Saved Outfits (${savedOutfits.length})` },
          { id: "orders", label: `Shopping History (${orders.length})` },
          { id: "recent", label: `Recently Viewed (${recentProducts.length})` },
          { id: "preferences", label: "Style Preferences" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#B83B67] text-white"
                : "bg-[#FAF3F5] text-[#6C5D63] hover:text-[#1D1518]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-white border border-rose-900/10 rounded-2xl">
              <p className="font-display text-xl font-semibold text-[#1D1518]">
                Your wishlist is empty
              </p>
              <p className="text-sm text-[#6C5D63] mt-1">
                Tap the heart icon on any fashion piece to save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Outfits Tab */}
      {activeTab === "outfits" && (
        <div className="space-y-4">
          {savedOutfits.length === 0 ? (
            <div className="p-12 text-center bg-white border border-rose-900/10 rounded-2xl">
              <p className="font-display text-xl font-semibold text-[#1D1518]">
                No saved outfits yet
              </p>
              <p className="text-sm text-[#6C5D63] mt-1">
                Save curated combinations from the AI Budget Stylist or Outfit Builder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedOutfits.map((outfit) => {
                const items = outfit.productIds
                  .map((id) => products.find((p) => p.id === id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                return (
                  <div
                    key={outfit.id}
                    className="bg-white border border-rose-900/10 rounded-2xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-[#B83B67] font-semibold">
                            {outfit.occasion} · {outfit.style}
                          </p>
                          <h3 className="font-display text-xl font-semibold text-[#1D1518]">
                            {outfit.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSavedOutfit(outfit.id)}
                          aria-label="Delete saved outfit"
                          className="p-2 rounded-lg text-[#6C5D63] hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#6C5D63]">{outfit.notes}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openProductModal(item)}
                            className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF3F5] text-left hover:bg-[#FAEBF0] cursor-pointer"
                          >
                            <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0">
                              <SafeFashionImage
                                imageKey={item.imageKey}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#1D1518] truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-[#6C5D63] tabular-nums">
                                ₹{item.price}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rose-900/10 flex items-center justify-between">
                      <span className="text-base font-bold text-[#1D1518] tabular-nums">
                        Total: ₹{outfit.totalPrice.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => addMultipleToCart(items)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B83B67] text-white text-xs font-semibold hover:bg-[#9B2D54] cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Look to Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-rose-900/10 rounded-2xl">
              <Package className="w-8 h-8 text-[#B83B67]/60 mx-auto mb-2" />
              <p className="font-display text-xl font-semibold text-[#1D1518]">
                No orders placed yet
              </p>
              <p className="text-sm text-[#6C5D63] mt-1">
                Your completed checkouts and receipts will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-rose-900/10 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-900/10">
                  <div>
                    <p className="text-sm font-bold text-[#1D1518] tabular-nums">
                      Order {order.id}
                    </p>
                    <p className="text-xs text-[#6C5D63]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.paymentMethod} · {order.status}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#1D1518] tabular-nums">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${order.id}-${item.productId}-${idx}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF3F5]"
                    >
                      <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0">
                        <SafeFashionImage
                          imageKey={item.imageKey}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1518] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#6C5D63] tabular-nums">
                          {item.selectedSize} · Qty {item.quantity} · ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recently Viewed Tab */}
      {activeTab === "recent" && (
        <div>
          {recentProducts.length === 0 ? (
            <div className="p-12 text-center bg-white border border-rose-900/10 rounded-2xl">
              <p className="font-display text-xl font-semibold text-[#1D1518]">
                No recently viewed items
              </p>
              <p className="text-sm text-[#6C5D63] mt-1">
                Open any product card to view details and track your browsing history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <form
          onSubmit={handlePrefsSubmit}
          className="bg-white border border-rose-900/10 rounded-2xl p-6 max-w-2xl space-y-5"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#B83B67]" />
            <h2 className="font-display text-2xl font-semibold text-[#1D1518]">
              Saved Styling Preferences
            </h2>
          </div>

          {!user && (
            <p className="text-xs text-[#6C5D63] bg-[#FAF3F5] p-3 rounded-xl">
              Sign in above to persist your preferences to your StyleMate profile across sessions.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                Default Shopping Budget (₹)
              </label>
              <input
                type="number"
                min={500}
                max={20000}
                value={prefsForm.defaultBudget}
                onChange={(e) =>
                  setPrefsForm({ ...prefsForm, defaultBudget: Number(e.target.value) || 2500 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 text-sm font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                Preferred Category
              </label>
              <select
                value={prefsForm.preferredGender}
                onChange={(e) =>
                  setPrefsForm({
                    ...prefsForm,
                    preferredGender: e.target.value as GenderTarget,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                Signature Style
              </label>
              <select
                value={prefsForm.favoriteStyle}
                onChange={(e) => setPrefsForm({ ...prefsForm, favoriteStyle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
              >
                <option>Minimalist Chic</option>
                <option>Casual &amp; Trendy</option>
                <option>Streetwear</option>
                <option>Classic Formal</option>
                <option>Bohemian</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Top Size
                </label>
                <select
                  value={prefsForm.topSize}
                  onChange={(e) => setPrefsForm({ ...prefsForm, topSize: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
                >
                  {["XS", "S", "M", "L", "XL"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D1518] mb-1">
                  Shoe Size
                </label>
                <select
                  value={prefsForm.footwearSize}
                  onChange={(e) => setPrefsForm({ ...prefsForm, footwearSize: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-rose-900/15 bg-white text-sm"
                >
                  {["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1D1518] mb-2">
              Preferred Colour Palette
            </span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const active = prefsForm.favoriteColors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => togglePrefColor(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                      active
                        ? "bg-[#FAEBF0] border-[#B83B67] text-[#B83B67] font-semibold"
                        : "bg-white border-rose-900/15 text-[#6C5D63]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!user}
              className="px-5 py-2.5 rounded-xl bg-[#B83B67] text-white text-sm font-semibold hover:bg-[#9B2D54] disabled:opacity-50 cursor-pointer"
            >
              Save Preferences
            </button>
            {prefsSaved && (
              <span className="text-xs font-semibold text-[#B83B67] inline-flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved to Profile
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
