export type ProductCategory =
  | "Women's Fashion"
  | "Men's Fashion"
  | "Footwear"
  | "Watches"
  | "Bags"
  | "Accessories"
  | "Jewellery";

export type OutfitSlot =
  | "top"
  | "bottom"
  | "dress"
  | "skirt"
  | "footwear"
  | "watch"
  | "handbag"
  | "jewellery"
  | "sunglasses";

export type GenderTarget = "Women" | "Men" | "Unisex";

export type ImageKey =
  | "hero_editorial"
  | "lookbook_outfit"
  | "womens_tops"
  | "womens_dresses"
  | "mens_shirts"
  | "denim_trousers"
  | "sneakers"
  | "heels_loafers"
  | "watches"
  | "handbags"
  | "jewellery"
  | "sunglasses";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  slot: OutfitSlot;
  gender: GenderTarget;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: string[];
  primaryColor: string;
  occasions: string[];
  styles: string[];
  description: string;
  fabricCare: string;
  imageKey: ImageKey;
  isTrending: boolean;
  isNewArrival: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface UserPreferences {
  defaultBudget: number;
  preferredGender: GenderTarget;
  favoriteStyle: string;
  favoriteColors: string[];
  topSize: string;
  footwearSize: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface SavedOutfit {
  id: string;
  name: string;
  occasion: string;
  style: string;
  productIds: string[];
  totalPrice: number;
  createdAt: string;
  notes: string;
}

export interface OrderItemSummary {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  imageKey: ImageKey;
}

export interface OrderRecord {
  id: string;
  items: OrderItemSummary[];
  totalAmount: number;
  shippingName: string;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface BudgetStylistRequest {
  budget: number;
  gender: GenderTarget;
  occasion: string;
  style: string;
  preferredColors: string[];
  clothingType: "Full Outfit" | "Top + Bottom" | "Dress + Accessories";
  includeWatch: boolean;
  includeBag: boolean;
  includeFootwear: boolean;
  includeJewellery: boolean;
  instructions: string;
}

export interface RecommendedPiece {
  product: Product;
  reason: string;
  alternatives: Product[];
}

export interface BudgetStylistResponse {
  engineSource: "live-ai" | "smart-catalog";
  budget: number;
  totalPrice: number;
  remainingBudget: number;
  headline: string;
  styleSummary: string;
  colorHarmonyNote: string;
  items: RecommendedPiece[];
}

export interface OutfitGeneratorRequest {
  selectedSlots: Record<string, string>;
  gender: GenderTarget;
  occasion: string;
  style: string;
  budget: number;
}

export interface OutfitGeneratorResponse {
  engineSource: "live-ai" | "smart-catalog";
  outfitTitle: string;
  totalPrice: number;
  colorExplanation: string;
  styleExplanation: string;
  pieces: {
    slot: OutfitSlot;
    product: Product;
    reason: string;
    alternatives: Product[];
  }[];
}

export interface ColorMatchRequest {
  garmentType: string;
  garmentColor: string;
  gender: GenderTarget;
  occasion: string;
}

export interface ColorRecommendationGroup {
  slotLabel: string;
  recommendedColors: string[];
  hexSwatches: string[];
  rationale: string;
  products: Product[];
}

export interface ColorMatchResponse {
  engineSource: "live-ai" | "smart-catalog";
  baseSummary: string;
  paletteTitle: string;
  harmonyPrinciple: string;
  groups: ColorRecommendationGroup[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedProducts?: Product[];
  totalBundlePrice?: number;
  engineSource?: "live-ai" | "smart-catalog";
  timestamp: string;
}
