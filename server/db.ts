import Database from "better-sqlite3";
import path from "node:path";
import crypto from "node:crypto";
import type {
  CartItem,
  OrderRecord,
  Product,
  SavedOutfit,
  UserPreferences,
  UserProfile,
} from "../src/types/fashion.ts";

const DB_PATH = path.resolve(process.cwd(), "stylemate.db");
export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    slot TEXT NOT NULL,
    gender TEXT NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    discount_percent INTEGER NOT NULL,
    rating REAL NOT NULL,
    review_count INTEGER NOT NULL,
    sizes_json TEXT NOT NULL,
    colors_json TEXT NOT NULL,
    primary_color TEXT NOT NULL,
    occasions_json TEXT NOT NULL,
    styles_json TEXT NOT NULL,
    description TEXT NOT NULL,
    fabric_care TEXT NOT NULL,
    image_key TEXT NOT NULL,
    is_trending INTEGER NOT NULL DEFAULT 0,
    is_new_arrival INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    preferences_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_states (
    user_id TEXT PRIMARY KEY,
    wishlist_json TEXT NOT NULL DEFAULT '[]',
    cart_json TEXT NOT NULL DEFAULT '[]',
    recently_viewed_json TEXT NOT NULL DEFAULT '[]',
    saved_outfits_json TEXT NOT NULL DEFAULT '[]',
    budget_cap INTEGER NOT NULL DEFAULT 3000,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    shipping_name TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "sm-w-top-01",
    name: "Blush Ribbed Cropped Knit Top",
    brand: "Atelier Rose",
    category: "Women's Fashion",
    slot: "top",
    gender: "Women",
    price: 499,
    originalPrice: 899,
    discountPercent: 44,
    rating: 4.7,
    reviewCount: 284,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Soft Pink", "Ivory", "Black"],
    primaryColor: "Pink",
    occasions: ["College Party", "Casual Day Out", "Birthday", "Date Night"],
    styles: ["Casual & Trendy", "Minimalist Chic"],
    description: "Breathable stretch-cotton ribbed crop top in signature blush pink. Pairs effortlessly with high-rise denim or pleated skirts.",
    fabricCare: "95% Combed Cotton, 5% Elastane · Cold gentle wash",
    imageKey: "womens_tops",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-w-top-02",
    name: "Ivory Draped Satin Wrap Blouse",
    brand: "Maison Naya",
    category: "Women's Fashion",
    slot: "top",
    gender: "Women",
    price: 799,
    originalPrice: 1299,
    discountPercent: 38,
    rating: 4.8,
    reviewCount: 192,
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Ivory", "Champagne"],
    primaryColor: "White",
    occasions: ["Office / Formal", "Date Night", "College Farewell"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "Fluid matte-satin wrap silhouette with subtle waist tie for refined workwear and evening dining.",
    fabricCare: "100% Viscose Satin · Hand wash cold",
    imageKey: "womens_tops",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-w-top-03",
    name: "Noir Ruched Peplum Studio Top",
    brand: "Verve & Silk",
    category: "Women's Fashion",
    slot: "top",
    gender: "Women",
    price: 649,
    originalPrice: 1099,
    discountPercent: 41,
    rating: 4.6,
    reviewCount: 145,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Wine", "Blush"],
    primaryColor: "Black",
    occasions: ["College Party", "Date Night", "Birthday"],
    styles: ["Casual & Trendy", "Streetwear"],
    description: "Sculpted square-neck black top with soft waist ruching designed for sleek evening layering.",
    fabricCare: "Cotton-Modal Blend · Machine wash gentle",
    imageKey: "womens_tops",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-w-dress-01",
    name: "Dusty Rose Pleated Midi Slip Dress",
    brand: "Atelier Rose",
    category: "Women's Fashion",
    slot: "dress",
    gender: "Women",
    price: 1299,
    originalPrice: 2199,
    discountPercent: 41,
    rating: 4.9,
    reviewCount: 412,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "Champagne", "Sage"],
    primaryColor: "Pink",
    occasions: ["Birthday", "Date Night", "College Farewell", "Wedding / Festive"],
    styles: ["Minimalist Chic", "Bohemian"],
    description: "Bias-cut dusty rose midi dress with flowing accordion pleats and adjustable tie waist.",
    fabricCare: "100% Soft Georgette Chiffon · Dry clean or hand wash",
    imageKey: "womens_dresses",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-w-dress-02",
    name: "Midnight Tailored A-Line Cocktail Dress",
    brand: "Maison Naya",
    category: "Women's Fashion",
    slot: "dress",
    gender: "Women",
    price: 1149,
    originalPrice: 1899,
    discountPercent: 39,
    rating: 4.8,
    reviewCount: 309,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Navy"],
    primaryColor: "Black",
    occasions: ["College Farewell", "Date Night", "College Party", "Birthday"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "Structured little black A-line dress with clean sweetheart neckline and concealed back zip.",
    fabricCare: "Cotton-Crepe Twill · Gentle wash",
    imageKey: "womens_dresses",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-w-skirt-01",
    name: "Cream Satin Pleated Midi Skirt",
    brand: "Sora Studio",
    category: "Women's Fashion",
    slot: "skirt",
    gender: "Women",
    price: 699,
    originalPrice: 1199,
    discountPercent: 42,
    rating: 4.7,
    reviewCount: 168,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Beige", "Ivory", "Blush"],
    primaryColor: "Beige",
    occasions: ["Office / Formal", "Date Night", "Casual Day Out", "Birthday"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "High-waisted pleated midi skirt in luminous warm cream that transitions seamlessly from campus to dinner.",
    fabricCare: "Recycled Poly Satin · Cold wash",
    imageKey: "womens_dresses",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-m-top-01",
    name: "Jet Black Tailored Linen Shirt",
    brand: "Kora Menswear",
    category: "Men's Fashion",
    slot: "top",
    gender: "Men",
    price: 699,
    originalPrice: 1299,
    discountPercent: 46,
    rating: 4.8,
    reviewCount: 356,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal"],
    primaryColor: "Black",
    occasions: ["College Party", "Date Night", "College Farewell", "Office / Formal"],
    styles: ["Minimalist Chic", "Casual & Trendy", "Classic Formal"],
    description: "Crisp breathable cotton-linen button-down in deep obsidian black with modern slim tailored shoulder fit.",
    fabricCare: "55% European Linen, 45% Cotton · Machine wash cold",
    imageKey: "mens_shirts",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-m-top-02",
    name: "Ivory Oxford Button-Down Shirt",
    brand: "Kora Menswear",
    category: "Men's Fashion",
    slot: "top",
    gender: "Men",
    price: 599,
    originalPrice: 999,
    discountPercent: 40,
    rating: 4.7,
    reviewCount: 221,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Ivory", "Sky Blue"],
    primaryColor: "White",
    occasions: ["Office / Formal", "College Farewell", "Casual Day Out"],
    styles: ["Classic Formal", "Minimalist Chic"],
    description: "Essential textured cotton Oxford shirt in warm off-white designed for clean layering with chinos or denim.",
    fabricCare: "100% Organic Cotton Oxford · Easy iron",
    imageKey: "mens_shirts",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-m-top-03",
    name: "Pastel Blush Relaxed Resort Overshirt",
    brand: "Urban Loom",
    category: "Men's Fashion",
    slot: "top",
    gender: "Men",
    price: 499,
    originalPrice: 899,
    discountPercent: 44,
    rating: 4.5,
    reviewCount: 118,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "White", "Beige"],
    primaryColor: "Pink",
    occasions: ["College Party", "Casual Day Out", "Birthday"],
    styles: ["Casual & Trendy", "Streetwear"],
    description: "Lightweight pastel pink camp-collar shirt with relaxed drape for campus hangouts and weekend brunches.",
    fabricCare: "100% Cotton Poplin · Cold wash",
    imageKey: "mens_shirts",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-u-bot-01",
    name: "Vintage Indigo Straight-Leg Jeans",
    brand: "Denim Atelier",
    category: "Women's Fashion",
    slot: "bottom",
    gender: "Women",
    price: 699,
    originalPrice: 1399,
    discountPercent: 50,
    rating: 4.8,
    reviewCount: 540,
    sizes: ["26", "28", "30", "32", "34"],
    colors: ["Blue", "Indigo", "Black"],
    primaryColor: "Blue",
    occasions: ["College Party", "Casual Day Out", "Birthday"],
    styles: ["Casual & Trendy", "Streetwear", "Minimalist Chic"],
    description: "High-waisted classic indigo blue straight-leg denim with soft comfort stretch and clean ankle cut.",
    fabricCare: "98% Cotton, 2% Elastane · Wash inside out",
    imageKey: "denim_trousers",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-m-bot-01",
    name: "Classic Mid-Wash Tapered Blue Jeans",
    brand: "Denim Atelier",
    category: "Men's Fashion",
    slot: "bottom",
    gender: "Men",
    price: 749,
    originalPrice: 1499,
    discountPercent: 50,
    rating: 4.7,
    reviewCount: 410,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Dark Indigo"],
    primaryColor: "Blue",
    occasions: ["College Party", "Casual Day Out", "Birthday", "Date Night"],
    styles: ["Casual & Trendy", "Streetwear"],
    description: "Versatile mid-wash blue tapered jeans crafted for all-day movement and clean sneaker pairing.",
    fabricCare: "99% Cotton Denim · Machine wash cold",
    imageKey: "denim_trousers",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-u-bot-02",
    name: "Warm Beige Pleated Tailored Trousers",
    brand: "Sora Studio",
    category: "Women's Fashion",
    slot: "bottom",
    gender: "Women",
    price: 799,
    originalPrice: 1499,
    discountPercent: 47,
    rating: 4.8,
    reviewCount: 274,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Taupe", "Black"],
    primaryColor: "Beige",
    occasions: ["Office / Formal", "College Farewell", "Date Night"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "High-rise pleated wide-taper trousers in warm sand beige that elongate the silhouette.",
    fabricCare: "Poly-Viscose Twill · Gentle machine wash",
    imageKey: "denim_trousers",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-m-bot-02",
    name: "Sandstone Slim Chino Trousers",
    brand: "Kora Menswear",
    category: "Men's Fashion",
    slot: "bottom",
    gender: "Men",
    price: 799,
    originalPrice: 1399,
    discountPercent: 43,
    rating: 4.6,
    reviewCount: 198,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Beige", "Khaki", "Navy"],
    primaryColor: "Beige",
    occasions: ["Office / Formal", "College Farewell", "Date Night", "Casual Day Out"],
    styles: ["Classic Formal", "Minimalist Chic"],
    description: "Clean-front stretch cotton chinos in warm sandstone beige with concealed coin pocket.",
    fabricCare: "97% Brushed Cotton, 3% Spandex",
    imageKey: "denim_trousers",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-f-snk-01",
    name: "Pure White Minimalist Court Sneakers",
    brand: "SoleCraft",
    category: "Footwear",
    slot: "footwear",
    gender: "Unisex",
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    rating: 4.8,
    reviewCount: 682,
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    colors: ["White"],
    primaryColor: "White",
    occasions: ["College Party", "Casual Day Out", "Birthday", "Date Night"],
    styles: ["Casual & Trendy", "Streetwear", "Minimalist Chic"],
    description: "Crisp low-top white court sneakers with cushioned memory-foam footbed and zero-logo clean stitching.",
    fabricCare: "Vegan Pebble Leather · Wipe with damp cloth",
    imageKey: "sneakers",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-f-snk-02",
    name: "Cloud-Sole Retro Canvas Sneakers",
    brand: "SoleCraft",
    category: "Footwear",
    slot: "footwear",
    gender: "Unisex",
    price: 899,
    originalPrice: 1499,
    discountPercent: 40,
    rating: 4.7,
    reviewCount: 315,
    sizes: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    colors: ["White", "Ivory"],
    primaryColor: "White",
    occasions: ["College Party", "Casual Day Out", "Birthday"],
    styles: ["Streetwear", "Casual & Trendy"],
    description: "Elevated platform-sole white trainers crafted for everyday campus miles and denim outfits.",
    fabricCare: "Breathable Canvas & Rubber Sole",
    imageKey: "sneakers",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-f-heel-01",
    name: "Dusty Pink Satin Block Heels",
    brand: "Atelier Rose",
    category: "Footwear",
    slot: "footwear",
    gender: "Women",
    price: 799,
    originalPrice: 1499,
    discountPercent: 47,
    rating: 4.9,
    reviewCount: 263,
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: ["Pink", "White", "Silver"],
    primaryColor: "Pink",
    occasions: ["College Farewell", "Date Night", "Wedding / Festive", "Birthday"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "Comfortable 2.5-inch block-heel ankle-strap sandals in luminous dusty rose satin.",
    fabricCare: "Satin Upper, Cushioned Insole",
    imageKey: "heels_loafers",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-f-heel-02",
    name: "Pearl White Strappy Dress Heels",
    brand: "Maison Naya",
    category: "Footwear",
    slot: "footwear",
    gender: "Women",
    price: 699,
    originalPrice: 1299,
    discountPercent: 46,
    rating: 4.7,
    reviewCount: 174,
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    colors: ["White", "Beige"],
    primaryColor: "White",
    occasions: ["College Farewell", "Date Night", "Birthday", "Office / Formal"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "Minimalist ivory-white strappy block heels designed to elevate pink dresses and pleated skirts.",
    fabricCare: "Soft Matte Faux-Leather · Wipe clean",
    imageKey: "heels_loafers",
    isTrending: false,
    isNewArrival: false,
  },
  {
    id: "sm-f-loaf-01",
    name: "Cognac Brown Leather Penny Loafers",
    brand: "Kora Menswear",
    category: "Footwear",
    slot: "footwear",
    gender: "Men",
    price: 999,
    originalPrice: 1899,
    discountPercent: 47,
    rating: 4.8,
    reviewCount: 245,
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: ["Brown", "Tan", "Black"],
    primaryColor: "Brown",
    occasions: ["Office / Formal", "College Farewell", "Date Night", "Wedding / Festive"],
    styles: ["Classic Formal", "Minimalist Chic"],
    description: "Hand-finished cognac brown penny loafers with stitched apron toe and flexible sole.",
    fabricCare: "Supple Full-Grain Leather · Condition monthly",
    imageKey: "heels_loafers",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-wt-01",
    name: "Blush Strap Minimalist Dial Watch",
    brand: "Chrono Rose",
    category: "Watches",
    slot: "watch",
    gender: "Unisex",
    price: 199,
    originalPrice: 599,
    discountPercent: 67,
    rating: 4.6,
    reviewCount: 491,
    sizes: ["One Size"],
    colors: ["Pink", "Taupe", "Rose Gold"],
    primaryColor: "Pink",
    occasions: ["College Party", "Casual Day Out", "Birthday", "Office / Formal"],
    styles: ["Minimalist Chic", "Casual & Trendy"],
    description: "Ultra-slim rose-gold bezel timepiece with pearl dial and soft blush-taupe strap for everyday styling.",
    fabricCare: "Splash Resistant 3ATM · Japanese Quartz",
    imageKey: "watches",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-wt-02",
    name: "Classic Rose-Gold Chronograph Watch",
    brand: "Chrono Rose",
    category: "Watches",
    slot: "watch",
    gender: "Unisex",
    price: 699,
    originalPrice: 1499,
    discountPercent: 53,
    rating: 4.8,
    reviewCount: 312,
    sizes: ["One Size"],
    colors: ["Rose Gold", "Brown", "Black"],
    primaryColor: "Gold",
    occasions: ["Office / Formal", "College Farewell", "Date Night", "Wedding / Festive"],
    styles: ["Classic Formal", "Minimalist Chic"],
    description: "Refined 38mm brushed rose-gold watch with sunray dial and Italian-textured leather strap.",
    fabricCare: "Water Resistant 5ATM · Mineral Glass",
    imageKey: "watches",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-wt-03",
    name: "Obsidian Silver Formal Dress Watch",
    brand: "Vanguard Time",
    category: "Watches",
    slot: "watch",
    gender: "Men",
    price: 549,
    originalPrice: 1199,
    discountPercent: 54,
    rating: 4.7,
    reviewCount: 208,
    sizes: ["One Size"],
    colors: ["Silver", "Black"],
    primaryColor: "Silver",
    occasions: ["Office / Formal", "College Farewell", "Date Night"],
    styles: ["Classic Formal", "Minimalist Chic"],
    description: "Slim silver-cased formal dress watch with matte black leather strap built for tailored shirts.",
    fabricCare: "Stainless Steel Case · 5ATM",
    imageKey: "watches",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-bg-01",
    name: "Blush & Taupe Structured Tote Bag",
    brand: "Aurore Paris",
    category: "Bags",
    slot: "handbag",
    gender: "Women",
    price: 649,
    originalPrice: 1299,
    discountPercent: 50,
    rating: 4.8,
    reviewCount: 388,
    sizes: ["One Size"],
    colors: ["Pink", "Beige", "Brown"],
    primaryColor: "Pink",
    occasions: ["Office / Formal", "College Party", "Casual Day Out", "Birthday"],
    styles: ["Minimalist Chic", "Classic Formal"],
    description: "Architectural two-tone blush and warm taupe tote handbag with brushed gold turn-lock clasp.",
    fabricCare: "Textured Vegan Calfskin · Wipe clean",
    imageKey: "handbags",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-bg-02",
    name: "Cognac Brown Crossbody Satchel",
    brand: "Aurore Paris",
    category: "Bags",
    slot: "handbag",
    gender: "Women",
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    rating: 4.7,
    reviewCount: 264,
    sizes: ["One Size"],
    colors: ["Brown", "Beige"],
    primaryColor: "Brown",
    occasions: ["Casual Day Out", "Office / Formal", "Date Night", "Birthday"],
    styles: ["Minimalist Chic", "Bohemian", "Casual & Trendy"],
    description: "Compact warm brown structured satchel with detachable crossbody strap—ideal match for white tops and beige trousers.",
    fabricCare: "Pebbled Faux Leather · Dust bag included",
    imageKey: "handbags",
    isTrending: true,
    isNewArrival: false,
  },
  {
    id: "sm-bg-03",
    name: "Ivory Mini Top-Handle Bag",
    brand: "Atelier Rose",
    category: "Bags",
    slot: "handbag",
    gender: "Women",
    price: 449,
    originalPrice: 899,
    discountPercent: 50,
    rating: 4.6,
    reviewCount: 175,
    sizes: ["One Size"],
    colors: ["White", "Ivory"],
    primaryColor: "White",
    occasions: ["College Party", "Date Night", "Birthday", "College Farewell"],
    styles: ["Casual & Trendy", "Minimalist Chic"],
    description: "Chic cream-ivory mini top-handle handbag sized for phone, compact, and keys.",
    fabricCare: "Smooth Matte Finish · Wipe clean",
    imageKey: "handbags",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-jw-01",
    name: "Sterling Silver Pearl Drop & Layered Necklace Set",
    brand: "Lune Fine",
    category: "Jewellery",
    slot: "jewellery",
    gender: "Women",
    price: 299,
    originalPrice: 699,
    discountPercent: 57,
    rating: 4.9,
    reviewCount: 418,
    sizes: ["One Size"],
    colors: ["Silver", "Pearl White"],
    primaryColor: "Silver",
    occasions: ["College Farewell", "Date Night", "Birthday", "Wedding / Festive"],
    styles: ["Minimalist Chic", "Classic Formal", "Bohemian"],
    description: "Delicate sterling-plated double coin pendant paired with freshwater pearl huggie earrings.",
    fabricCare: "Hypoallergenic Rhodium Plate · Store dry",
    imageKey: "jewellery",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-jw-02",
    name: "Rose-Gold Hammered Disc Bracelet",
    brand: "Lune Fine",
    category: "Jewellery",
    slot: "jewellery",
    gender: "Unisex",
    price: 199,
    originalPrice: 449,
    discountPercent: 56,
    rating: 4.7,
    reviewCount: 229,
    sizes: ["One Size"],
    colors: ["Rose Gold", "Gold"],
    primaryColor: "Gold",
    occasions: ["College Party", "Casual Day Out", "Birthday", "Date Night"],
    styles: ["Minimalist Chic", "Casual & Trendy"],
    description: "Featherlight hammered rose-gold chain bracelet for subtle wrist layering next to your timepiece.",
    fabricCare: "Anti-Tarnish Rose Gold Plate",
    imageKey: "jewellery",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-ac-01",
    name: "Blush Tortoiseshell Acetate Sunglasses",
    brand: "Aura Eyewear",
    category: "Accessories",
    slot: "sunglasses",
    gender: "Unisex",
    price: 299,
    originalPrice: 699,
    discountPercent: 57,
    rating: 4.8,
    reviewCount: 342,
    sizes: ["One Size"],
    colors: ["Brown", "Pink", "Tortoiseshell"],
    primaryColor: "Brown",
    occasions: ["College Party", "Casual Day Out", "Birthday"],
    styles: ["Casual & Trendy", "Minimalist Chic", "Streetwear"],
    description: "Sculpted amber tortoiseshell and translucent blush-pink acetate frames with UV400 gradient lenses.",
    fabricCare: "UV400 Polarized · Microfiber pouch included",
    imageKey: "sunglasses",
    isTrending: true,
    isNewArrival: true,
  },
  {
    id: "sm-ac-02",
    name: "Noir Classic Rectangular Sunglasses",
    brand: "Aura Eyewear",
    category: "Accessories",
    slot: "sunglasses",
    gender: "Unisex",
    price: 249,
    originalPrice: 599,
    discountPercent: 58,
    rating: 4.6,
    reviewCount: 190,
    sizes: ["One Size"],
    colors: ["Black"],
    primaryColor: "Black",
    occasions: ["Casual Day Out", "College Party", "Office / Formal"],
    styles: ["Streetwear", "Minimalist Chic", "Classic Formal"],
    description: "Sharp matte-black acetate frames that anchor monochrome and denim streetwear outfits.",
    fabricCare: "UV400 Protection · Hard case included",
    imageKey: "sunglasses",
    isTrending: false,
    isNewArrival: false,
  },
  {
    id: "sm-w-top-04",
    name: "Soft Rose Relaxed Oversized Tee",
    brand: "Urban Loom",
    category: "Women's Fashion",
    slot: "top",
    gender: "Women",
    price: 399,
    originalPrice: 699,
    discountPercent: 43,
    rating: 4.6,
    reviewCount: 256,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "White"],
    primaryColor: "Pink",
    occasions: ["College Party", "Casual Day Out"],
    styles: ["Streetwear", "Casual & Trendy"],
    description: "Heavyweight 220gsm combed cotton tee in washed pastel rose for effortless streetwear styling.",
    fabricCare: "100% Combed Cotton · Cold wash",
    imageKey: "womens_tops",
    isTrending: false,
    isNewArrival: true,
  },
  {
    id: "sm-m-top-04",
    name: "Charcoal Minimalist Crewneck Tee",
    brand: "Urban Loom",
    category: "Men's Fashion",
    slot: "top",
    gender: "Men",
    price: 399,
    originalPrice: 749,
    discountPercent: 47,
    rating: 4.7,
    reviewCount: 310,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Beige"],
    primaryColor: "Black",
    occasions: ["College Party", "Casual Day Out", "Birthday"],
    styles: ["Streetwear", "Casual & Trendy", "Minimalist Chic"],
    description: "Structured organic cotton crewneck tee with drop-shoulder cut that pairs cleanly with blue jeans and white sneakers.",
    fabricCare: "100% Organic Cotton · Pre-shrunk",
    imageKey: "mens_shirts",
    isTrending: true,
    isNewArrival: false,
  },
];

function seedProducts() {
  const countRow = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (countRow.count > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (
      id, name, brand, category, slot, gender, price, original_price, discount_percent,
      rating, review_count, sizes_json, colors_json, primary_color, occasions_json,
      styles_json, description, fabric_care, image_key, is_trending, is_new_arrival
    ) VALUES (
      @id, @name, @brand, @category, @slot, @gender, @price, @originalPrice, @discountPercent,
      @rating, @reviewCount, @sizesJson, @colorsJson, @primaryColor, @occasionsJson,
      @stylesJson, @description, @fabricCare, @imageKey, @isTrending, @isNewArrival
    )
  `);

  const insertMany = db.transaction((items: Product[]) => {
    for (const item of items) {
      insert.run({
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        slot: item.slot,
        gender: item.gender,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        rating: item.rating,
        reviewCount: item.reviewCount,
        sizesJson: JSON.stringify(item.sizes),
        colorsJson: JSON.stringify(item.colors),
        primaryColor: item.primaryColor,
        occasionsJson: JSON.stringify(item.occasions),
        stylesJson: JSON.stringify(item.styles),
        description: item.description,
        fabricCare: item.fabricCare,
        imageKey: item.imageKey,
        isTrending: item.isTrending ? 1 : 0,
        isNewArrival: item.isNewArrival ? 1 : 0,
      });
    }
  });

  insertMany(INITIAL_PRODUCTS);
}

seedProducts();

interface DbProductRow {
  id: string;
  name: string;
  brand: string;
  category: Product["category"];
  slot: Product["slot"];
  gender: Product["gender"];
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  sizes_json: string;
  colors_json: string;
  primary_color: string;
  occasions_json: string;
  styles_json: string;
  description: string;
  fabric_care: string;
  image_key: Product["imageKey"];
  is_trending: number;
  is_new_arrival: number;
}

function mapProductRow(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    slot: row.slot,
    gender: row.gender,
    price: row.price,
    originalPrice: row.original_price,
    discountPercent: row.discount_percent,
    rating: row.rating,
    reviewCount: row.review_count,
    sizes: JSON.parse(row.sizes_json) as string[],
    colors: JSON.parse(row.colors_json) as string[],
    primaryColor: row.primary_color,
    occasions: JSON.parse(row.occasions_json) as string[],
    styles: JSON.parse(row.styles_json) as string[],
    description: row.description,
    fabricCare: row.fabric_care,
    imageKey: row.image_key,
    isTrending: Boolean(row.is_trending),
    isNewArrival: Boolean(row.is_new_arrival),
  };
}

export function getAllProducts(): Product[] {
  const rows = db.prepare("SELECT * FROM products ORDER BY is_trending DESC, rating DESC").all() as DbProductRow[];
  return rows.map(mapProductRow);
}

export function getProductById(id: string): Product | null {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as DbProductRow | undefined;
  return row ? mapProductRow(row) : null;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultBudget: 2500,
  preferredGender: "Women",
  favoriteStyle: "Minimalist Chic",
  favoriteColors: ["Pink", "White", "Beige"],
  topSize: "M",
  footwearSize: "UK 6",
};

export function createUser(name: string, email: string, password: string): UserProfile {
  const id = `usr_${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const prefs = DEFAULT_PREFERENCES;

  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, preferences_json, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, name.trim(), email.toLowerCase().trim(), passwordHash, JSON.stringify(prefs), createdAt);

  db.prepare("INSERT INTO user_states (user_id) VALUES (?)").run(id);

  return {
    id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    createdAt,
    preferences: prefs,
  };
}

export function authenticateUser(email: string, password: string): UserProfile | null {
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as
    | {
        id: string;
        name: string;
        email: string;
        password_hash: string;
        preferences_json: string;
        created_at: string;
      }
    | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    preferences: JSON.parse(row.preferences_json) as UserPreferences,
  };
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
    token,
    userId,
    expiresAt
  );
  return token;
}

export function getUserBySession(token: string): UserProfile | null {
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.preferences_json, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?`
    )
    .get(token) as
    | {
        id: string;
        name: string;
        email: string;
        preferences_json: string;
        created_at: string;
        expires_at: string;
      }
    | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    preferences: JSON.parse(row.preferences_json) as UserPreferences,
  };
}

export function deleteSession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function updateUserPreferences(userId: string, preferences: UserPreferences): UserProfile | null {
  db.prepare("UPDATE users SET preferences_json = ? WHERE id = ?").run(
    JSON.stringify(preferences),
    userId
  );
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
    | { id: string; name: string; email: string; preferences_json: string; created_at: string }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    preferences: JSON.parse(row.preferences_json) as UserPreferences,
  };
}

export interface PersistedUserState {
  wishlist: string[];
  cart: CartItem[];
  recentlyViewed: string[];
  savedOutfits: SavedOutfit[];
  budgetCap: number;
}

export function getUserState(userId: string): PersistedUserState {
  const row = db.prepare("SELECT * FROM user_states WHERE user_id = ?").get(userId) as
    | {
        wishlist_json: string;
        cart_json: string;
        recently_viewed_json: string;
        saved_outfits_json: string;
        budget_cap: number;
      }
    | undefined;

  if (!row) {
    db.prepare("INSERT OR IGNORE INTO user_states (user_id) VALUES (?)").run(userId);
    return {
      wishlist: [],
      cart: [],
      recentlyViewed: [],
      savedOutfits: [],
      budgetCap: 3000,
    };
  }

  return {
    wishlist: JSON.parse(row.wishlist_json) as string[],
    cart: JSON.parse(row.cart_json) as CartItem[],
    recentlyViewed: JSON.parse(row.recently_viewed_json) as string[],
    savedOutfits: JSON.parse(row.saved_outfits_json) as SavedOutfit[],
    budgetCap: row.budget_cap,
  };
}

export function saveUserState(userId: string, state: PersistedUserState): void {
  db.prepare(
    `INSERT INTO user_states (user_id, wishlist_json, cart_json, recently_viewed_json, saved_outfits_json, budget_cap)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       wishlist_json = excluded.wishlist_json,
       cart_json = excluded.cart_json,
       recently_viewed_json = excluded.recently_viewed_json,
       saved_outfits_json = excluded.saved_outfits_json,
       budget_cap = excluded.budget_cap`
  ).run(
    userId,
    JSON.stringify(state.wishlist),
    JSON.stringify(state.cart),
    JSON.stringify(state.recentlyViewed),
    JSON.stringify(state.savedOutfits),
    state.budgetCap
  );
}

export function createOrder(
  userId: string,
  order: Omit<OrderRecord, "id" | "createdAt" | "status">
): OrderRecord {
  const id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = new Date().toISOString();
  const status = "Confirmed — Preparing Dispatch";

  db.prepare(
    `INSERT INTO orders (id, user_id, items_json, total_amount, shipping_name, shipping_address, payment_method, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    JSON.stringify(order.items),
    order.totalAmount,
    order.shippingName,
    order.shippingAddress,
    order.paymentMethod,
    status,
    createdAt
  );

  return {
    id,
    ...order,
    status,
    createdAt,
  };
}

export function getOrdersForUser(userId: string): OrderRecord[] {
  const rows = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as {
    id: string;
    items_json: string;
    total_amount: number;
    shipping_name: string;
    shipping_address: string;
    payment_method: string;
    status: string;
    created_at: string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    items: JSON.parse(row.items_json),
    totalAmount: row.total_amount,
    shippingName: row.shipping_name,
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  }));
}
