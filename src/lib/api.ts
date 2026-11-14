import type {
  BudgetStylistRequest,
  BudgetStylistResponse,
  CartItem,
  ColorMatchRequest,
  ColorMatchResponse,
  OrderRecord,
  OutfitGeneratorRequest,
  OutfitGeneratorResponse,
  Product,
  SavedOutfit,
  UserPreferences,
  UserProfile,
} from "../types/fashion.ts";

const TOKEN_KEY = "stylemate_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

export interface PersistedUserState {
  wishlist: string[];
  cart: CartItem[];
  recentlyViewed: string[];
  savedOutfits: SavedOutfit[];
  budgetCap: number;
}

export const api = {
  fetchHealth: () => apiFetch<{ ok: boolean; liveAiAvailable: boolean }>("/api/health"),
  fetchProducts: () => apiFetch<{ products: Product[] }>("/api/products"),

  signup: (name: string, email: string, password: string) =>
    apiFetch<{
      user: UserProfile;
      token: string;
      state: PersistedUserState;
      orders: OrderRecord[];
    }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{
      user: UserProfile;
      token: string;
      state: PersistedUserState;
      orders: OrderRecord[];
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  getMe: () =>
    apiFetch<{
      user: UserProfile;
      state: PersistedUserState;
      orders: OrderRecord[];
    }>("/api/auth/me"),

  updatePreferences: (preferences: UserPreferences) =>
    apiFetch<{ user: UserProfile }>("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    }),

  saveState: (state: PersistedUserState) =>
    apiFetch<{ ok: boolean }>("/api/user/state", {
      method: "PUT",
      body: JSON.stringify(state),
    }),

  placeOrder: (payload: {
    items: CartItem[];
    shippingName: string;
    shippingAddress: string;
    paymentMethod: string;
  }) =>
    apiFetch<{ order: OrderRecord }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  runBudgetStylist: (payload: BudgetStylistRequest) =>
    apiFetch<BudgetStylistResponse>("/api/ai/budget-stylist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  runOutfitGenerator: (payload: OutfitGeneratorRequest) =>
    apiFetch<OutfitGeneratorResponse>("/api/ai/outfit-generator", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  runColorMatch: (payload: ColorMatchRequest) =>
    apiFetch<ColorMatchResponse>("/api/ai/color-match", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sendChatMessage: (message: string) =>
    apiFetch<{
      reply: string;
      recommendedProducts: Product[];
      totalBundlePrice: number;
      engineSource: "live-ai" | "smart-catalog";
    }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
