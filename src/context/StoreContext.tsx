import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, getStoredToken, setStoredToken } from "../lib/api.ts";
import type {
  CartItem,
  OrderRecord,
  Product,
  ProductCategory,
  SavedOutfit,
  UserPreferences,
  UserProfile,
} from "../types/fashion.ts";

export type AppView =
  | "home"
  | "shop"
  | "stylist"
  | "outfit"
  | "color-match"
  | "profile";

interface StoreContextValue {
  products: Product[];
  loadingProducts: boolean;
  liveAiAvailable: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | "All";
  setSelectedCategory: (cat: ProductCategory | "All") => void;
  navigateToShop: (opts?: { category?: ProductCategory | "All"; query?: string }) => void;

  user: UserProfile | null;
  orders: OrderRecord[];
  wishlist: string[];
  cart: CartItem[];
  recentlyViewed: string[];
  savedOutfits: SavedOutfit[];
  compareIds: string[];
  budgetCap: number;
  setBudgetCap: (val: number) => void;

  selectedProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  addToCart: (product: Product, size?: string, color?: string, openDrawer?: boolean) => void;
  addMultipleToCart: (items: Product[]) => void;
  updateCartQuantity: (productId: string, selectedSize: string, delta: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  saveOutfit: (outfit: Omit<SavedOutfit, "id" | "createdAt">) => void;
  deleteSavedOutfit: (outfitId: string) => void;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  savePreferences: (prefs: UserPreferences) => Promise<void>;
  placeOrder: (shippingName: string, shippingAddress: string, paymentMethod: string) => Promise<OrderRecord>;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  cartSubtotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const LOCAL_STATE_KEY = "stylemate_guest_state";

function loadGuestState() {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      wishlist: string[];
      cart: CartItem[];
      recentlyViewed: string[];
      savedOutfits: SavedOutfit[];
      budgetCap: number;
    };
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [liveAiAvailable, setLiveAiAvailable] = useState(false);

  const [activeView, setActiveView] = useState<AppView>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "All">("All");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => loadGuestState()?.wishlist ?? []);
  const [cart, setCart] = useState<CartItem[]>(() => loadGuestState()?.cart ?? []);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(
    () => loadGuestState()?.recentlyViewed ?? []
  );
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(
    () => loadGuestState()?.savedOutfits ?? []
  );
  const [budgetCap, setBudgetCap] = useState<number>(
    () => loadGuestState()?.budgetCap ?? 3000
  );

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.fetchProducts(), api.fetchHealth()])
      .then(([prodData, health]) => {
        if (!active) return;
        setProducts(prodData.products);
        setLiveAiAvailable(health.liveAiAvailable);
      })
      .catch((err) => {
        console.error("Failed loading initial catalog:", err);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    if (getStoredToken()) {
      api
        .getMe()
        .then((res) => {
          if (!active) return;
          setUser(res.user);
          setOrders(res.orders);
          setWishlist(res.state.wishlist);
          setCart(res.state.cart);
          setRecentlyViewed(res.state.recentlyViewed);
          setSavedOutfits(res.state.savedOutfits);
          setBudgetCap(res.state.budgetCap || 3000);
        })
        .catch(() => {
          setStoredToken(null);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  // Persist guest or authenticated state
  useEffect(() => {
    const statePayload = {
      wishlist,
      cart,
      recentlyViewed,
      savedOutfits,
      budgetCap,
    };
    if (user && getStoredToken()) {
      api.saveState(statePayload).catch(() => {});
    } else {
      localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(statePayload));
    }
  }, [wishlist, cart, recentlyViewed, savedOutfits, budgetCap, user]);

  const navigateToShop = useCallback(
    (opts?: { category?: ProductCategory | "All"; query?: string }) => {
      if (opts?.category !== undefined) setSelectedCategory(opts.category);
      if (opts?.query !== undefined) setSearchQuery(opts.query);
      setActiveView("shop");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const openProductModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setRecentlyViewed((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 8));
  }, []);

  const closeProductModal = useCallback(() => setSelectedProduct(null), []);

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string, openDrawer = false) => {
      const chosenSize = size || product.sizes[0] || "One Size";
      const chosenColor = color || product.primaryColor;

      setCart((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === product.id && i.selectedSize === chosenSize
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            quantity: 1,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
          },
        ];
      });
      showToast(`Added ${product.name} to your bag`);
      if (openDrawer) setIsCartOpen(true);
    },
    [showToast]
  );

  const addMultipleToCart = useCallback(
    (items: Product[]) => {
      if (items.length === 0) return;
      setCart((prev) => {
        const next = [...prev];
        for (const product of items) {
          const chosenSize = product.sizes[0] || "One Size";
          const idx = next.findIndex(
            (i) => i.productId === product.id && i.selectedSize === chosenSize
          );
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          } else {
            next.push({
              productId: product.id,
              quantity: 1,
              selectedSize: chosenSize,
              selectedColor: product.primaryColor,
            });
          }
        }
        return next;
      });
      showToast(`Added ${items.length} outfit pieces to your bag`);
      setIsCartOpen(true);
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, selectedSize: string, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) =>
            item.productId === productId && item.selectedSize === selectedSize
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const removeFromCart = useCallback((productId: string, selectedSize: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.selectedSize === selectedSize)
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        showToast(exists ? "Removed from wishlist" : "Saved to wishlist");
        return exists ? prev.filter((id) => id !== productId) : [productId, ...prev];
      });
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    (productId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 3) {
          showToast("You can compare up to 3 products at a time");
          return prev;
        }
        showToast("Added to product comparison");
        return [...prev, productId];
      });
    },
    [showToast]
  );

  const saveOutfit = useCallback(
    (outfit: Omit<SavedOutfit, "id" | "createdAt">) => {
      const record: SavedOutfit = {
        ...outfit,
        id: `look_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSavedOutfits((prev) => [record, ...prev]);
      showToast("Saved outfit to your lookbook");
    },
    [showToast]
  );

  const deleteSavedOutfit = useCallback((outfitId: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== outfitId));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      setStoredToken(res.token);
      setUser(res.user);
      setOrders(res.orders);
      setWishlist(res.state.wishlist);
      if (res.state.cart.length > 0) setCart(res.state.cart);
      setRecentlyViewed(res.state.recentlyViewed);
      setSavedOutfits(res.state.savedOutfits);
      setBudgetCap(res.state.budgetCap || res.user.preferences.defaultBudget || 3000);
      showToast(`Welcome back, ${res.user.name.split(" ")[0]}`);
    },
    [showToast]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.signup(name, email, password);
      setStoredToken(res.token);
      setUser(res.user);
      setOrders(res.orders);
      showToast(`Welcome to TIVANA , ${res.user.name.split(" ")[0]}`);
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setStoredToken(null);
    setUser(null);
    setOrders([]);
    showToast("Signed out");
  }, [showToast]);

  const savePreferences = useCallback(
    async (prefs: UserPreferences) => {
      const res = await api.updatePreferences(prefs);
      setUser(res.user);
      setBudgetCap(prefs.defaultBudget);
      showToast("Style preferences saved");
    },
    [showToast]
  );

  const placeOrder = useCallback(
    async (shippingName: string, shippingAddress: string, paymentMethod: string) => {
      const res = await api.placeOrder({
        items: cart,
        shippingName,
        shippingAddress,
        paymentMethod,
      });
      setOrders((prev) => [res.order, ...prev]);
      setCart([]);
      showToast(`Order ${res.order.id} confirmed`);
      return res.order;
    },
    [cart, showToast]
  );

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const prod = productMap.get(item.productId);
        return sum + (prod ? prod.price * item.quantity : 0);
      }, 0),
    [cart, productMap]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        loadingProducts,
        liveAiAvailable,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        navigateToShop,
        user,
        orders,
        wishlist,
        cart,
        recentlyViewed,
        savedOutfits,
        compareIds,
        budgetCap,
        setBudgetCap,
        selectedProduct,
        openProductModal,
        closeProductModal,
        isCartOpen,
        setIsCartOpen,
        isCompareOpen,
        setIsCompareOpen,
        isChatOpen,
        setIsChatOpen,
        addToCart,
        addMultipleToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        toggleCompare,
        saveOutfit,
        deleteSavedOutfit,
        login,
        signup,
        logout,
        savePreferences,
        placeOrder,
        toastMessage,
        showToast,
        cartSubtotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
