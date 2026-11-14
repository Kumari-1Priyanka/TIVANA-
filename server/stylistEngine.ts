import { GoogleGenAI, Type } from "@google/genai";
import type {
  BudgetStylistRequest,
  BudgetStylistResponse,
  ColorMatchRequest,
  ColorMatchResponse,
  ColorRecommendationGroup,
  OutfitGeneratorRequest,
  OutfitGeneratorResponse,
  OutfitSlot,
  Product,
  RecommendedPiece,
} from "../src/types/fashion.ts";

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "MY_GEMINI_API_KEY" || key.length < 10) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function matchesGender(product: Product, gender: string): boolean {
  if (gender === "Unisex") return true;
  return product.gender === gender || product.gender === "Unisex";
}

function scoreProduct(
  product: Product,
  occasion: string,
  style: string,
  preferredColors: string[]
): number {
  let score = product.rating * 10;
  if (product.occasions.some((o) => o.toLowerCase() === occasion.toLowerCase())) {
    score += 30;
  }
  if (product.styles.some((s) => s.toLowerCase() === style.toLowerCase())) {
    score += 25;
  }
  if (
    preferredColors.length > 0 &&
    preferredColors.some(
      (c) =>
        product.primaryColor.toLowerCase() === c.toLowerCase() ||
        product.colors.some((pc) => pc.toLowerCase().includes(c.toLowerCase()))
    )
  ) {
    score += 20;
  }
  if (product.isTrending) score += 5;
  return score;
}

function pickBestWithinBudget(
  candidates: Product[],
  maxBudget: number,
  occasion: string,
  style: string,
  preferredColors: string[],
  excludeIds: Set<string>
): Product | null {
  const affordable = candidates
    .filter((p) => !excludeIds.has(p.id) && p.price <= maxBudget)
    .sort((a, b) => {
      const diff =
        scoreProduct(b, occasion, style, preferredColors) -
        scoreProduct(a, occasion, style, preferredColors);
      if (diff !== 0) return diff;
      return a.price - b.price;
    });
  return affordable[0] ?? null;
}

function findAlternatives(
  product: Product,
  allProducts: Product[],
  gender: string,
  maxAllowedPrice: number
): Product[] {
  return allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.slot === product.slot &&
        matchesGender(p, gender) &&
        p.price <= maxAllowedPrice
    )
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, 2);
}

function buildDeterministicBudgetOutfit(
  req: BudgetStylistRequest,
  allProducts: Product[]
): BudgetStylistResponse {
  const pool = allProducts.filter((p) => matchesGender(p, req.gender));
  const selected: RecommendedPiece[] = [];
  const usedIds = new Set<string>();
  let remaining = Math.max(200, req.budget);

  const desiredSlots: OutfitSlot[] = [];
  if (req.clothingType === "Dress + Accessories" && req.gender !== "Men") {
    desiredSlots.push("dress");
  } else {
    desiredSlots.push("top", "bottom");
  }
  if (req.includeFootwear) desiredSlots.push("footwear");
  if (req.includeWatch) desiredSlots.push("watch");
  if (req.includeBag && req.gender !== "Men") desiredSlots.push("handbag");
  if (req.includeJewellery) desiredSlots.push("jewellery");

  // Reserve minimum price of cheapest item in subsequent slots so earlier slots don't starve later ones
  const minPriceBySlot = new Map<OutfitSlot, number>();
  for (const slot of desiredSlots) {
    const slotProducts = pool.filter((p) => p.slot === slot);
    const minP = slotProducts.length > 0 ? Math.min(...slotProducts.map((p) => p.price)) : 0;
    minPriceBySlot.set(slot, minP);
  }

  for (let i = 0; i < desiredSlots.length; i++) {
    const slot = desiredSlots[i];
    const futureMinReserve = desiredSlots
      .slice(i + 1)
      .reduce((acc, s) => acc + (minPriceBySlot.get(s) ?? 0), 0);

    const maxForSlot = Math.max(0, remaining - futureMinReserve);
    const slotCandidates = pool.filter((p) => p.slot === slot);
    // Try fitting with reserve first; if impossible, try full remaining
    let pick = pickBestWithinBudget(
      slotCandidates,
      maxForSlot,
      req.occasion,
      req.style,
      req.preferredColors,
      usedIds
    );
    if (!pick) {
      pick = pickBestWithinBudget(
        slotCandidates,
        remaining,
        req.occasion,
        req.style,
        req.preferredColors,
        usedIds
      );
    }

    if (pick && pick.price <= remaining) {
      usedIds.add(pick.id);
      remaining -= pick.price;
      const reasonParts: string[] = [];
      if (pick.occasions.includes(req.occasion)) {
        reasonParts.push(`tailored for ${req.occasion.toLowerCase()}`);
      }
      if (pick.styles.includes(req.style)) {
        reasonParts.push(`captures a ${req.style.toLowerCase()} silhouette`);
      }
      if (
        req.preferredColors.some(
          (c) => pick.primaryColor.toLowerCase() === c.toLowerCase()
        )
      ) {
        reasonParts.push(`features your preferred ${pick.primaryColor.toLowerCase()} palette`);
      }
      if (reasonParts.length === 0) {
        reasonParts.push(`balances quality (${pick.rating}★) with smart ₹${pick.price} value`);
      }

      selected.push({
        product: pick,
        reason: `Selected because it ${reasonParts.join(" and ")}.`,
        alternatives: [],
      });
    }
  }

  // Populate alternatives within budget headroom
  for (const item of selected) {
    const maxSwapPrice = item.product.price + remaining;
    item.alternatives = findAlternatives(item.product, allProducts, req.gender, maxSwapPrice);
  }

  const totalPrice = selected.reduce((sum, item) => sum + item.product.price, 0);

  return {
    engineSource: "smart-catalog",
    budget: req.budget,
    totalPrice,
    remainingBudget: Math.max(0, req.budget - totalPrice),
    headline: `${req.style} ${req.occasion} Look under ₹${req.budget.toLocaleString("en-IN")}`,
    styleSummary: `Curated ${selected.length}-piece ${req.gender.toLowerCase()} ensemble designed for ${req.occasion} with cohesive ${req.style.toLowerCase()} proportions.`,
    colorHarmonyNote: `Grounded in ${
      selected.map((s) => s.product.primaryColor).filter((v, i, a) => a.indexOf(v) === i).join(" + ") || "neutral"
    } tones for effortless contrast and visual balance.`,
    items: selected,
  };
}

export async function runBudgetStylist(
  req: BudgetStylistRequest,
  allProducts: Product[]
): Promise<BudgetStylistResponse> {
  const fallback = buildDeterministicBudgetOutfit(req, allProducts);
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const eligible = allProducts.filter((p) => matchesGender(p, req.gender));
    const catalogCompact = eligible.map((p) => ({
      id: p.id,
      name: p.name,
      slot: p.slot,
      price: p.price,
      color: p.primaryColor,
      occasions: p.occasions,
      styles: p.styles,
    }));

    const prompt = `You are StyleMate AI, a senior personal fashion stylist.
Select the best complete outfit from the provided catalog JSON ONLY.
CRITICAL RULE: The sum of prices of all selected product IDs MUST BE LESS THAN OR EQUAL TO ${req.budget}. NEVER exceed ${req.budget}.

User Brief:
- Max Budget: ₹${req.budget}
- Gender/Department: ${req.gender}
- Occasion: ${req.occasion}
- Fashion Style: ${req.style}
- Clothing Format: ${req.clothingType}
- Preferred Colours: ${req.preferredColors.join(", ") || "Any harmonious palette"}
- Include Footwear: ${req.includeFootwear}
- Include Watch: ${req.includeWatch}
- Include Handbag: ${req.includeBag}
- Include Jewellery: ${req.includeJewellery}
- Extra Instructions: ${req.instructions || "None"}

Catalog:
${JSON.stringify(catalogCompact)}

Pick distinct complementary slots (max 1 item per slot) whose combined price <= ${req.budget}, and explain why each item fits.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            styleSummary: { type: Type.STRING },
            colorHarmonyNote: { type: Type.STRING },
            picks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["productId", "reason"],
              },
            },
          },
          required: ["headline", "styleSummary", "colorHarmonyNote", "picks"],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim()) as {
      headline?: string;
      styleSummary?: string;
      colorHarmonyNote?: string;
      picks?: { productId: string; reason: string }[];
    };

    if (!parsed.picks || parsed.picks.length === 0) return fallback;

    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const verifiedItems: RecommendedPiece[] = [];
    const seenSlots = new Set<string>();
    let runningTotal = 0;

    for (const pick of parsed.picks) {
      const prod = productMap.get(pick.productId);
      if (!prod) continue;
      if (seenSlots.has(prod.slot)) continue;
      if (runningTotal + prod.price > req.budget) continue;
      seenSlots.add(prod.slot);
      runningTotal += prod.price;
      verifiedItems.push({
        product: prod,
        reason: pick.reason,
        alternatives: [],
      });
    }

    if (verifiedItems.length < 2) return fallback;

    const remaining = Math.max(0, req.budget - runningTotal);
    for (const item of verifiedItems) {
      item.alternatives = findAlternatives(
        item.product,
        allProducts,
        req.gender,
        item.product.price + remaining
      );
    }

    return {
      engineSource: "live-ai",
      budget: req.budget,
      totalPrice: runningTotal,
      remainingBudget: remaining,
      headline: parsed.headline || fallback.headline,
      styleSummary: parsed.styleSummary || fallback.styleSummary,
      colorHarmonyNote: parsed.colorHarmonyNote || fallback.colorHarmonyNote,
      items: verifiedItems,
    };
  } catch (err) {
    console.error("Gemini budget stylist fallback triggered:", err);
    return fallback;
  }
}

export async function runOutfitGenerator(
  req: OutfitGeneratorRequest,
  allProducts: Product[]
): Promise<OutfitGeneratorResponse> {
  const productMap = new Map(allProducts.map((p) => [p.id, p]));
  const pool = allProducts.filter((p) => matchesGender(p, req.gender));

  // Determine active slots: if user picked a dress, omit top & bottom unless explicitly selected
  const hasDress = Boolean(req.selectedSlots.dress);
  const hasSkirt = Boolean(req.selectedSlots.skirt);
  const targetSlots: OutfitSlot[] = hasDress
    ? ["dress", "footwear", "watch", "handbag", "jewellery", "sunglasses"]
    : hasSkirt
    ? ["top", "skirt", "footwear", "watch", "handbag", "jewellery", "sunglasses"]
    : req.gender === "Men"
    ? ["top", "bottom", "footwear", "watch", "sunglasses"]
    : ["top", "bottom", "footwear", "watch", "handbag", "jewellery", "sunglasses"];

  const buildDeterministic = (): OutfitGeneratorResponse => {
    const pieces: OutfitGeneratorResponse["pieces"] = [];
    const usedIds = new Set<string>();
    let spent = 0;

    // First lock user-selected items
    for (const slot of targetSlots) {
      const chosenId = req.selectedSlots[slot];
      if (chosenId && productMap.has(chosenId)) {
        const prod = productMap.get(chosenId)!;
        usedIds.add(prod.id);
        spent += prod.price;
      }
    }

    let remaining = Math.max(0, req.budget - spent);

    for (const slot of targetSlots) {
      const chosenId = req.selectedSlots[slot];
      let product: Product | null = chosenId ? productMap.get(chosenId) ?? null : null;
      let reason = "";

      if (product) {
        reason = "Locked from your wardrobe selection to anchor this outfit.";
      } else {
        const candidates = pool.filter((p) => p.slot === slot);
        product =
          pickBestWithinBudget(candidates, remaining, req.occasion, req.style, [], usedIds) ??
          candidates.sort((a, b) => a.price - b.price)[0] ??
          null;
        if (product) {
          usedIds.add(product.id);
          remaining = Math.max(0, remaining - product.price);
          reason = `Chosen to complement your ${req.style.toLowerCase()} ${req.occasion.toLowerCase()} palette in ${product.primaryColor.toLowerCase()}.`;
        }
      }

      if (product) {
        pieces.push({
          slot,
          product,
          reason,
          alternatives: findAlternatives(product, allProducts, req.gender, product.price + 500),
        });
      }
    }

    const totalPrice = pieces.reduce((sum, p) => sum + p.product.price, 0);
    const palette = pieces
      .map((p) => p.product.primaryColor)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4)
      .join(" + ");

    return {
      engineSource: "smart-catalog",
      outfitTitle: `${req.style} ${req.occasion} Complete Ensemble`,
      totalPrice,
      colorExplanation: `The ${palette} colour story pairs crisp light-reflecting neutrals with a soft focal tone so footwear, timepiece, and bag reinforce rather than compete.`,
      styleExplanation: `Built around clean ${req.style.toLowerCase()} proportions suitable for ${req.occasion.toLowerCase()}, balancing structured tailoring with relaxed accessories.`,
      pieces,
    };
  };

  const fallback = buildDeterministic();
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const lockedSummary = Object.entries(req.selectedSlots)
      .filter(([, id]) => Boolean(id && productMap.has(id)))
      .map(([slot, id]) => {
        const p = productMap.get(id)!;
        return `${slot}: ${p.id} (${p.name}, ₹${p.price}, ${p.primaryColor})`;
      });

    const catalogCompact = pool.map((p) => ({
      id: p.id,
      name: p.name,
      slot: p.slot,
      price: p.price,
      color: p.primaryColor,
      styles: p.styles,
      occasions: p.occasions,
    }));

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `You are StyleMate AI's Complete Outfit Architect.
Build a complete harmonious outfit for ${req.gender}, occasion "${req.occasion}", style "${req.style}", target budget around ₹${req.budget}.
Locked user picks (MUST keep these exact product IDs): ${lockedSummary.join("; ") || "None"}.
Target slots to fill: ${targetSlots.join(", ")}.
Catalog JSON: ${JSON.stringify(catalogCompact)}.
Return 1 product ID per target slot and explain the colour harmony and styling logic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfitTitle: { type: Type.STRING },
            colorExplanation: { type: Type.STRING },
            styleExplanation: { type: Type.STRING },
            pieces: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slot: { type: Type.STRING },
                  productId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["slot", "productId", "reason"],
              },
            },
          },
          required: ["outfitTitle", "colorExplanation", "styleExplanation", "pieces"],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim()) as {
      outfitTitle?: string;
      colorExplanation?: string;
      styleExplanation?: string;
      pieces?: { slot: string; productId: string; reason: string }[];
    };

    if (!parsed.pieces || parsed.pieces.length === 0) return fallback;

    const finalPieces: OutfitGeneratorResponse["pieces"] = [];
    const seen = new Set<string>();

    // Always honor locked user picks first
    for (const slot of targetSlots) {
      const lockedId = req.selectedSlots[slot];
      const aiPick = parsed.pieces.find((x) => x.slot === slot);
      const chosenProd =
        (lockedId ? productMap.get(lockedId) : undefined) ??
        (aiPick ? productMap.get(aiPick.productId) : undefined) ??
        fallback.pieces.find((x) => x.slot === slot)?.product;

      if (chosenProd && !seen.has(slot)) {
        seen.add(slot);
        finalPieces.push({
          slot,
          product: chosenProd,
          reason: lockedId
            ? "Locked from your selection as the anchor of this look."
            : aiPick?.reason || "Selected by StyleMate AI for tonal balance.",
          alternatives: findAlternatives(chosenProd, allProducts, req.gender, chosenProd.price + 600),
        });
      }
    }

    const totalPrice = finalPieces.reduce((sum, p) => sum + p.product.price, 0);

    return {
      engineSource: "live-ai",
      outfitTitle: parsed.outfitTitle || fallback.outfitTitle,
      totalPrice,
      colorExplanation: parsed.colorExplanation || fallback.colorExplanation,
      styleExplanation: parsed.styleExplanation || fallback.styleExplanation,
      pieces: finalPieces,
    };
  } catch (err) {
    console.error("Gemini outfit generator fallback:", err);
    return fallback;
  }
}

const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#1E1B1E",
  White: "#F9F7F4",
  Pink: "#E8B4C6",
  Blue: "#365B8C",
  Beige: "#D8C5AD",
  Brown: "#8A5638",
  Silver: "#C4C9CE",
  Gold: "#D4A373",
  Ivory: "#F5EFE6",
  "Rose Gold": "#D89A9E",
};

function buildDeterministicColorMatch(
  req: ColorMatchRequest,
  allProducts: Product[]
): ColorMatchResponse {
  const color = req.garmentColor;
  const pool = allProducts.filter((p) => matchesGender(p, req.gender));

  const rules: Record<
    string,
    {
      title: string;
      principle: string;
      shoes: string[];
      shoesWhy: string;
      watches: string[];
      watchesWhy: string;
      bags: string[];
      bagsWhy: string;
      accessories: string[];
      accessoriesWhy: string;
    }
  > = {
    Black: {
      title: "High-Contrast Classic Noir",
      principle:
        "Black absorbs light, so pairing it with crisp white footwear, indigo denim, and metallic silver or rose-gold hardware keeps the outfit fresh and dimensional.",
      shoes: ["White", "Pink", "Brown"],
      shoesWhy: "Crisp white sneakers brighten a black garment immediately, while dusty pink heels add evening softness.",
      watches: ["Silver", "Rose Gold", "Gold"],
      watchesWhy: "Brushed silver or rose-gold bezels create clean metallic contrast against dark sleeves.",
      bags: ["Pink", "White", "Beige"],
      bagsWhy: "Blush pink or ivory bags lift the darkness of black without clashing.",
      accessories: ["Silver", "Gold", "Black"],
      accessoriesWhy: "Sterling silver chains and pearl drops reflect light near the neckline.",
    },
    White: {
      title: "Sunlit Alabaster & Warm Earth",
      principle:
        "White serves as a luminous canvas—pairing it with warm beige trousers, cognac brown leather, and rose-gold accents creates effortless Mediterranean editorial warmth.",
      shoes: ["Brown", "Pink", "White"],
      shoesWhy: "Cognac loafers or dusty pink block heels warm up pure white fabric naturally.",
      watches: ["Gold", "Pink", "Brown"],
      watchesWhy: "Rose-gold and blush-taupe leather straps echo warm neutral undertones.",
      bags: ["Brown", "Pink", "Beige"],
      bagsWhy: "A cognac brown satchel or blush-taupe tote anchors crisp white with rich texture.",
      accessories: ["Gold", "Brown", "Silver"],
      accessoriesWhy: "Tortoiseshell sunglasses and warm rose-gold bracelets complete the sunlit palette.",
    },
    Pink: {
      title: "Soft Rose Quartz & Pearl Harmony",
      principle:
        "Blush and dusty rose shimmer best alongside pure white footwear, cool sterling silver jewellery, and soft taupe or ivory leather goods.",
      shoes: ["White", "Pink", "Beige"],
      shoesWhy: "White heels or court sneakers keep soft pink crisp and modern rather than overly sweet.",
      watches: ["Pink", "Silver", "Gold"],
      watchesWhy: "Mother-of-pearl dials with blush-taupe or silver straps blend seamlessly with rose hues.",
      bags: ["White", "Beige", "Pink"],
      bagsWhy: "An ivory mini bag or structured taupe-blush tote frames the outfit cleanly.",
      accessories: ["Silver", "Pearl White", "Brown"],
      accessoriesWhy: "Sterling silver and freshwater pearls brighten rosy skin tones effortlessly.",
    },
    Blue: {
      title: "Indigo Coastal Balance",
      principle:
        "Classic indigo and blue garments pair timelessly with pure white sneakers, cognac brown leather, and brushed silver or tortoiseshell accents.",
      shoes: ["White", "Brown"],
      shoesWhy: "White low-top sneakers give blue denim clean athletic polish; cognac loafers dress it up.",
      watches: ["Silver", "Gold", "Pink"],
      watchesWhy: "Silver and rose-gold dials provide crisp contrast against cool denim blues.",
      bags: ["Brown", "White", "Pink"],
      bagsWhy: "Warm cognac brown or cream bags balance cool indigo undertones.",
      accessories: ["Brown", "Silver", "Black"],
      accessoriesWhy: "Amber tortoiseshell eyewear warms up cool blue hues.",
    },
    Beige: {
      title: "Monochrome Sand & Espresso Contrast",
      principle:
        "Warm beige thrives in tonal layering—combine deeper cognac brown leather, crisp white tops, and gold-toned hardware for refined depth.",
      shoes: ["Brown", "White", "Pink"],
      shoesWhy: "Cognac brown loafers add tonal richness; white sneakers keep beige casual.",
      watches: ["Gold", "Pink", "Brown"],
      watchesWhy: "Rose-gold cases and taupe straps harmonize with sand and camel tones.",
      bags: ["Brown", "Pink", "White"],
      bagsWhy: "A cognac satchel or blush-taupe tote creates layered quiet-luxury texture.",
      accessories: ["Gold", "Brown", "Silver"],
      accessoriesWhy: "Tortoiseshell frames and rose-gold wristwear echo warm sand undertones.",
    },
  };

  const rule = rules[color] ?? rules.Pink;

  const findByColors = (slots: OutfitSlot[], targetColors: string[]) =>
    pool
      .filter(
        (p) =>
          slots.includes(p.slot) &&
          targetColors.some(
            (tc) =>
              p.primaryColor.toLowerCase() === tc.toLowerCase() ||
              p.colors.some((pc) => pc.toLowerCase().includes(tc.toLowerCase()))
          )
      )
      .slice(0, 3);

  const groups: ColorRecommendationGroup[] = [
    {
      slotLabel: "Recommended Shoes & Footwear",
      recommendedColors: rule.shoes,
      hexSwatches: rule.shoes.map((c) => COLOR_HEX_MAP[c] || "#E8B4C6"),
      rationale: rule.shoesWhy,
      products: findByColors(["footwear"], rule.shoes),
    },
    {
      slotLabel: "Matching Watches",
      recommendedColors: rule.watches,
      hexSwatches: rule.watches.map((c) => COLOR_HEX_MAP[c] || "#D4A373"),
      rationale: rule.watchesWhy,
      products: findByColors(["watch"], rule.watches),
    },
    {
      slotLabel: "Coordinated Handbags",
      recommendedColors: rule.bags,
      hexSwatches: rule.bags.map((c) => COLOR_HEX_MAP[c] || "#D8C5AD"),
      rationale: rule.bagsWhy,
      products: findByColors(["handbag"], rule.bags),
    },
    {
      slotLabel: "Jewellery & Eyewear",
      recommendedColors: rule.accessories,
      hexSwatches: rule.accessories.map((c) => COLOR_HEX_MAP[c] || "#C4C9CE"),
      rationale: rule.accessoriesWhy,
      products: findByColors(["jewellery", "sunglasses"], rule.accessories),
    },
  ];

  return {
    engineSource: "smart-catalog",
    baseSummary: `${color} ${req.garmentType} (${req.occasion})`,
    paletteTitle: rule.title,
    harmonyPrinciple: rule.principle,
    groups,
  };
}

export async function runColorMatch(
  req: ColorMatchRequest,
  allProducts: Product[]
): Promise<ColorMatchResponse> {
  const fallback = buildDeterministicColorMatch(req, allProducts);
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `You are StyleMate AI's Colour Theory Stylist.
The user is wearing a "${req.garmentColor} ${req.garmentType}" for "${req.occasion}" (${req.gender}).
Provide an inspiring palette title, concise colour theory principle, and tailored colour pairing rationale for:
1) Footwear
2) Watches
3) Handbags
4) Jewellery & Accessories`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paletteTitle: { type: Type.STRING },
            harmonyPrinciple: { type: Type.STRING },
            shoesWhy: { type: Type.STRING },
            watchesWhy: { type: Type.STRING },
            bagsWhy: { type: Type.STRING },
            accessoriesWhy: { type: Type.STRING },
          },
          required: [
            "paletteTitle",
            "harmonyPrinciple",
            "shoesWhy",
            "watchesWhy",
            "bagsWhy",
            "accessoriesWhy",
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim()) as {
      paletteTitle?: string;
      harmonyPrinciple?: string;
      shoesWhy?: string;
      watchesWhy?: string;
      bagsWhy?: string;
      accessoriesWhy?: string;
    };

    return {
      ...fallback,
      engineSource: "live-ai",
      paletteTitle: parsed.paletteTitle || fallback.paletteTitle,
      harmonyPrinciple: parsed.harmonyPrinciple || fallback.harmonyPrinciple,
      groups: [
        { ...fallback.groups[0], rationale: parsed.shoesWhy || fallback.groups[0].rationale },
        { ...fallback.groups[1], rationale: parsed.watchesWhy || fallback.groups[1].rationale },
        { ...fallback.groups[2], rationale: parsed.bagsWhy || fallback.groups[2].rationale },
        { ...fallback.groups[3], rationale: parsed.accessoriesWhy || fallback.groups[3].rationale },
      ],
    };
  } catch (err) {
    console.error("Gemini color match fallback:", err);
    return fallback;
  }
}

export async function runFashionChat(
  message: string,
  allProducts: Product[]
): Promise<{
  reply: string;
  recommendedProducts: Product[];
  totalBundlePrice: number;
  engineSource: "live-ai" | "smart-catalog";
}> {
  const lower = message.toLowerCase();

  // Extract optional budget figure from user prompt
  const budgetMatch = lower.match(/(?:under|below|within|budget|₹|rs\.?)\s*(\d{3,5})/i);
  const parsedBudget = budgetMatch ? Number(budgetMatch[1]) : null;

  const buildSmartChatFallback = () => {
    let picks: Product[] = [];
    let reply = "";

    if (lower.includes("black dress")) {
      picks = allProducts.filter((p) =>
        ["sm-f-heel-02", "sm-jw-01", "sm-bg-03", "sm-wt-01"].includes(p.id)
      );
      reply =
        "A black dress shines with luminous contrast: pair it with Pearl White Strappy Heels (₹699) or Dusty Pink Satin Block Heels (₹799), Sterling Silver Pearl Jewellery (₹299), and an Ivory Mini Top-Handle Bag (₹449).";
    } else if (lower.includes("white sneakers")) {
      picks = allProducts.filter((p) =>
        ["sm-w-top-01", "sm-u-bot-01", "sm-m-top-01", "sm-ac-01"].includes(p.id)
      );
      reply =
        "White sneakers are endlessly versatile! Pair them with Vintage Indigo Straight-Leg Jeans (₹699) and either a Blush Ribbed Cropped Knit Top (₹499) or Jet Black Tailored Linen Shirt (₹699), plus Blush Tortoiseshell Sunglasses (₹299).";
    } else if (lower.includes("formal") && lower.includes("watch")) {
      picks = allProducts.filter((p) =>
        ["sm-wt-03", "sm-wt-02", "sm-m-top-02", "sm-u-bot-02"].includes(p.id)
      );
      reply =
        "For formal attire, choose a slim leather-strap dress watch with a clean dial: our Obsidian Silver Formal Dress Watch (₹549) pairs sharply with tailored dark shirts, while the Classic Rose-Gold Chronograph (₹699) complements ivory and beige suiting.";
    } else if (lower.includes("farewell")) {
      picks = allProducts.filter((p) =>
        ["sm-w-dress-01", "sm-f-heel-01", "sm-jw-01", "sm-bg-03"].includes(p.id)
      );
      reply =
        "For a memorable college farewell, try our Dusty Rose Pleated Midi Slip Dress (₹1,299) styled with Pearl Drop Sterling Jewellery (₹299) and an Ivory Mini Top-Handle Bag (₹449).";
    } else {
      const targetBudget = parsedBudget ?? 2000;
      const gender =
        lower.includes("men") && !lower.includes("women") ? "Men" : "Women";
      const occasion = lower.includes("birthday")
        ? "Birthday"
        : lower.includes("formal") || lower.includes("office")
        ? "Office / Formal"
        : "College Party";

      const styled = buildDeterministicBudgetOutfit(
        {
          budget: targetBudget,
          gender,
          occasion,
          style: "Casual & Trendy",
          preferredColors: ["Pink", "White", "Blue"],
          clothingType: "Full Outfit",
          includeFootwear: true,
          includeWatch: true,
          includeBag: targetBudget >= 1800,
          includeJewellery: targetBudget >= 2200,
          instructions: message,
        },
        allProducts
      );
      picks = styled.items.map((i) => i.product);
      const total = picks.reduce((s, p) => s + p.price, 0);
      reply = `Here is a curated ${occasion.toLowerCase()} look within your ₹${targetBudget.toLocaleString(
        "en-IN"
      )} budget (${picks.length} coordinated pieces totalling ₹${total.toLocaleString("en-IN")}): ${picks
        .map((p) => `${p.name} (₹${p.price})`)
        .join(", ")}.`;
    }

    return {
      reply,
      recommendedProducts: picks,
      totalBundlePrice: picks.reduce((s, p) => s + p.price, 0),
      engineSource: "smart-catalog" as const,
    };
  };

  const fallback = buildSmartChatFallback();
  const ai = getGeminiClient();
  if (!ai) return fallback;

  try {
    const catalogCompact = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      slot: p.slot,
      gender: p.gender,
      price: p.price,
      color: p.primaryColor,
      occasions: p.occasions,
    }));

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `You are StyleMate AI, a warm, knowledgeable luxury fashion stylist.
Answer the shopper's question concisely and helpfully.
If they mention a budget (e.g. ₹1500 or ₹2500), ensure the total price of recommendedProductIds NEVER exceeds that budget.
Only recommend IDs that exist in the catalog below.

Catalog:
${JSON.stringify(catalogCompact)}

Shopper Question: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["reply", "recommendedProductIds"],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim()) as {
      reply?: string;
      recommendedProductIds?: string[];
    };

    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    let recs = (parsed.recommendedProductIds ?? [])
      .map((id) => productMap.get(id))
      .filter((p): p is Product => Boolean(p));

    if (parsedBudget !== null) {
      const kept: Product[] = [];
      let sum = 0;
      for (const p of recs) {
        if (sum + p.price <= parsedBudget) {
          kept.push(p);
          sum += p.price;
        }
      }
      recs = kept;
    }

    if (recs.length === 0) {
      recs = fallback.recommendedProducts;
    }

    return {
      reply: parsed.reply || fallback.reply,
      recommendedProducts: recs,
      totalBundlePrice: recs.reduce((s, p) => s + p.price, 0),
      engineSource: "live-ai",
    };
  } catch (err) {
    console.error("Gemini chat fallback:", err);
    return fallback;
  }
}
