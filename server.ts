import "dotenv/config";
import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import {
  authenticateUser,
  createOrder,
  createSession,
  createUser,
  deleteSession,
  getAllProducts,
  getOrdersForUser,
  getProductById,
  getUserBySession,
  getUserState,
  saveUserState,
  updateUserPreferences,
} from "./server/db.ts";
import {
  runBudgetStylist,
  runColorMatch,
  runFashionChat,
  runOutfitGenerator,
} from "./server/stylistEngine.ts";
import type {
  BudgetStylistRequest,
  ColorMatchRequest,
  OutfitGeneratorRequest,
  UserPreferences,
} from "./src/types/fashion.ts";

const app = express();
app.use(express.json({ limit: "1mb" }));

function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

// Health & Products
app.get("/api/health", (_req, res) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
      process.env.GEMINI_API_KEY.length > 10
  );
  res.json({ ok: true, liveAiAvailable: hasGemini });
});

app.get("/api/products", (_req, res) => {
  res.json({ products: getAllProducts() });
});

// Authentication
app.post("/api/auth/signup", (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: "Please enter your full name." });
      return;
    }
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }
    const user = createUser(name, email, password);
    const token = createSession(user.id);
    const state = getUserState(user.id);
    const orders = getOrdersForUser(user.id);
    res.status(201).json({ user, token, state, orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    res.status(500).json({ error: "Failed to create account." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const user = authenticateUser(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  const token = createSession(user.id);
  const state = getUserState(user.id);
  const orders = getOrdersForUser(user.id);
  res.json({ user, token, state, orders });
});

app.post("/api/auth/logout", (req, res) => {
  const token = extractToken(req);
  if (token) deleteSession(token);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  const user = getUserBySession(token);
  if (!user) {
    res.status(401).json({ error: "Session expired." });
    return;
  }
  const state = getUserState(user.id);
  const orders = getOrdersForUser(user.id);
  res.json({ user, state, orders });
});

app.put("/api/user/preferences", (req, res) => {
  const token = extractToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    res.status(401).json({ error: "Please sign in to save preferences." });
    return;
  }
  const preferences = req.body as UserPreferences;
  const updated = updateUserPreferences(user.id, preferences);
  res.json({ user: updated });
});

app.put("/api/user/state", (req, res) => {
  const token = extractToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    res.status(401).json({ error: "Please sign in to sync your wardrobe." });
    return;
  }
  saveUserState(user.id, req.body);
  res.json({ ok: true });
});

app.post("/api/orders", (req, res) => {
  const token = extractToken(req);
  const user = token ? getUserBySession(token) : null;
  const { items, shippingName, shippingAddress, paymentMethod } = req.body as {
    items: {
      productId: string;
      quantity: number;
      selectedSize: string;
      selectedColor: string;
    }[];
    shippingName: string;
    shippingAddress: string;
    paymentMethod: string;
  };

  if (!items || items.length === 0) {
    res.status(400).json({ error: "Your bag is empty." });
    return;
  }
  if (!shippingName?.trim() || !shippingAddress?.trim()) {
    res.status(400).json({ error: "Please enter recipient name and delivery address." });
    return;
  }

  const authoritativeItems = items
    .map((item) => {
      const prod = getProductById(item.productId);
      if (!prod) return null;
      return {
        productId: prod.id,
        name: prod.name,
        brand: prod.brand,
        price: prod.price,
        quantity: Math.max(1, item.quantity),
        selectedSize: item.selectedSize || prod.sizes[0] || "One Size",
        selectedColor: item.selectedColor || prod.primaryColor,
        imageKey: prod.imageKey,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const totalAmount = authoritativeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!user) {
    // Allow guest checkout summary cleanly while encouraging sign-in for persistent history
    res.status(201).json({
      order: {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: authoritativeItems,
        totalAmount,
        shippingName: shippingName.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod || "Cash on Delivery",
        status: "Confirmed — Preparing Dispatch",
        createdAt: new Date().toISOString(),
      },
    });
    return;
  }

  const order = createOrder(user.id, {
    items: authoritativeItems,
    totalAmount,
    shippingName: shippingName.trim(),
    shippingAddress: shippingAddress.trim(),
    paymentMethod: paymentMethod || "Cash on Delivery",
  });

  // Clear persisted cart after order
  const currentState = getUserState(user.id);
  saveUserState(user.id, { ...currentState, cart: [] });

  res.status(201).json({ order });
});

// AI Stylist Endpoints
app.post("/api/ai/budget-stylist", async (req, res) => {
  try {
    const payload = req.body as BudgetStylistRequest;
    const products = getAllProducts();
    const result = await runBudgetStylist(payload, products);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to generate budget recommendations right now." });
  }
});

app.post("/api/ai/outfit-generator", async (req, res) => {
  try {
    const payload = req.body as OutfitGeneratorRequest;
    const products = getAllProducts();
    const result = await runOutfitGenerator(payload, products);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to generate outfit right now." });
  }
});

app.post("/api/ai/color-match", async (req, res) => {
  try {
    const payload = req.body as ColorMatchRequest;
    const products = getAllProducts();
    const result = await runColorMatch(payload, products);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to generate colour match right now." });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body as { message?: string };
    if (!message || !message.trim()) {
      res.status(400).json({ error: "Please enter a fashion question." });
      return;
    }
    const products = getAllProducts();
    const result = await runFashionChat(message.trim(), products);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "StyleMate assistant is briefly unavailable." });
  }
});

async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StyleMate AI server running on http://localhost:${PORT}`);
  });
}

startServer();
