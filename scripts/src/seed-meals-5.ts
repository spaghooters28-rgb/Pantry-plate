import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";

interface IngredientData { name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean; }
interface SideData { name: string; description: string; }
interface MealData { name: string; description: string; cuisine: string; protein: string; isGlutenFree: boolean; cookTimeMinutes: number; servings: number; calories: number; tags: string[]; instructions: string; ingredients: IngredientData[]; sides: SideData[]; }

const meals: MealData[] = [
  {
    name: "Pasta Primavera",
    description: "Light Italian pasta with seasonal vegetables in a garlic, white wine, and Parmesan sauce.",
    cuisine: "Italian", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 25, servings: 4, calories: 440,
    tags: ["italian", "pasta", "vegetarian"],
    instructions: "1. Sauté garlic in olive oil; add asparagus, zucchini, and cherry tomatoes.\n2. Add white wine; reduce 2 minutes.\n3. Cook pasta; reserve 1 cup pasta water.\n4. Toss pasta with vegetables; add pasta water to emulsify.\n5. Finish with Parmesan, lemon zest, and fresh basil.",
    ingredients: [
      { name: "Pasta (Linguine or Penne)", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Asparagus", quantity: "8", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Cherry Tomatoes", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Zucchini", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "White Wine", quantity: "1/3", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Parmesan", quantity: "1/2", unit: "cup grated", category: "Dairy & Eggs", isCommonPantryItem: false },
    ],
    sides: [{ name: "Garlic Bread", description: "Toasted garlic bread" }, { name: "Caesar Salad", description: "Crisp romaine salad" }],
  },
  {
    name: "Teriyaki Salmon Bowl",
    description: "Glazed salmon fillet over steamed rice with edamame, avocado, and a homemade teriyaki sauce.",
    cuisine: "Japanese", protein: "Salmon", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 510,
    tags: ["japanese", "bowl", "salmon"],
    instructions: "1. Make teriyaki sauce: simmer soy sauce, mirin, sake, and sugar until slightly thick.\n2. Brush salmon fillets with sauce; sear skin-side down 4 minutes.\n3. Flip; brush again; cook 3 minutes. Caramelize under broiler 1 minute.\n4. Serve over steamed rice with edamame, avocado, and cucumber.\n5. Drizzle extra teriyaki and sesame seeds over bowl.",
    ingredients: [
      { name: "Salmon Fillets", quantity: "4", unit: "portions", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Short-Grain Rice", quantity: "3", unit: "cups cooked", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Avocado", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Frozen Edamame", quantity: "1", unit: "cup shelled", category: "Frozen", isCommonPantryItem: false },
    ],
    sides: [{ name: "Miso Soup", description: "Light tofu miso soup" }, { name: "Pickled Ginger", description: "Fresh pickled ginger" }],
  },
  {
    name: "Korean Bibimbap",
    description: "Korean mixed rice bowl with seasoned vegetables, gochujang, a fried egg, and sesame oil.",
    cuisine: "Korean", protein: "Eggs", isGlutenFree: true, cookTimeMinutes: 40, servings: 4, calories: 480,
    tags: ["korean", "rice-bowl", "vegetarian"],
    instructions: "1. Prepare seasoned vegetables separately: blanched spinach with garlic and sesame, sautéed mushrooms, sautéed zucchini, blanched bean sprouts, julienned carrots.\n2. Cook short-grain rice.\n3. Heat stone bowl (dolsot) with sesame oil until smoking.\n4. Add rice; arrange vegetables in sections around it.\n5. Top with a fried egg; serve with gochujang sauce on the side. Mix everything at the table.",
    ingredients: [
      { name: "Short-Grain Rice", quantity: "3", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Gochujang", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Spinach", quantity: "4", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Shiitake Mushrooms", quantity: "6", unit: "caps", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [{ name: "Kimchi", description: "Fermented cabbage" }, { name: "Doenjang Jjigae", description: "Soybean paste stew" }],
  },
  {
    name: "Lebanese Kafta Kebab",
    description: "Seasoned ground beef and lamb formed onto skewers with parsley and onion, grilled over charcoal.",
    cuisine: "Middle Eastern", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 450,
    tags: ["middle-eastern", "lebanese", "grilled"],
    instructions: "1. Combine ground beef and lamb with finely grated onion, parsley, allspice, cinnamon, cumin, and salt.\n2. Knead 5 minutes until paste-like.\n3. Mold around flat skewers into long oval shapes.\n4. Grill over high heat 4–5 minutes per side.\n5. Serve in pita with tahini, tomatoes, and pickled turnips.",
    ingredients: [
      { name: "Ground Beef", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ground Lamb", quantity: "1/2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "1/2", unit: "cup finely minced", category: "Produce", isCommonPantryItem: false },
      { name: "Allspice", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium grated", category: "Produce", isCommonPantryItem: true },
      { name: "Pita Bread", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
    ],
    sides: [{ name: "Tahini Sauce", description: "Sesame lemon dip" }, { name: "Tabbouleh", description: "Herb and bulgur salad" }],
  },
  {
    name: "Roasted Garlic Mashed Potatoes",
    description: "Ultra-creamy mashed potatoes loaded with roasted garlic, butter, and warm cream.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 50, servings: 6, calories: 310,
    tags: ["side", "potatoes", "comfort"],
    instructions: "1. Roast whole garlic head at 400°F for 40 minutes until golden; squeeze out cloves.\n2. Boil russet potatoes until very tender; drain well.\n3. Rice or mash potatoes; mix in roasted garlic paste.\n4. Heat butter and cream together; fold gradually into potatoes.\n5. Season with salt and white pepper; serve with chive garnish.",
    ingredients: [
      { name: "Russet Potatoes", quantity: "3", unit: "lbs", category: "Produce", isCommonPantryItem: true },
      { name: "Whole Garlic Head", quantity: "1", unit: "whole roasted", category: "Produce", isCommonPantryItem: true },
      { name: "Butter", quantity: "6", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Heavy Cream", quantity: "1/2", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Fresh Chives", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [{ name: "Roast Beef", description: "Hearty roast beef" }, { name: "Gravy", description: "Rich brown gravy" }],
  },
  {
    name: "Thai Mango Sticky Rice",
    description: "Sweet glutinous rice served warm with fresh mango slices and rich coconut cream sauce.",
    cuisine: "Thai", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 45, servings: 4, calories: 420,
    tags: ["thai", "dessert", "sweet"],
    instructions: "1. Soak glutinous rice 4+ hours or overnight; steam 25 minutes until tender.\n2. Warm coconut milk with sugar and salt; pour half over hot rice. Let absorb 15 minutes.\n3. Reduce remaining coconut milk slightly into a thin sauce.\n4. Peel and slice ripe mangoes.\n5. Plate rice; arrange mango alongside; drizzle coconut sauce over rice.",
    ingredients: [
      { name: "Glutinous Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "2", unit: "cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Ripe Mangoes", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1/3", unit: "cup", category: "Pantry", isCommonPantryItem: true },
      { name: "Salt", quantity: "1/2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [{ name: "Sesame Seeds", description: "Toasted black sesame seeds" }, { name: "Thai Iced Tea", description: "Sweet spiced tea" }],
  },
  {
    name: "Khao Soi (Northern Thai Curry Noodles)",
    description: "Rich Chiang Mai coconut curry noodle soup topped with crispy egg noodles and pickled mustard greens.",
    cuisine: "Thai", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 35, servings: 4, calories: 530,
    tags: ["thai", "noodles", "northern-thai"],
    instructions: "1. Fry khao soi curry paste in coconut cream until fragrant and oils separate.\n2. Add chicken drumsticks; coat in paste and cook 3 minutes.\n3. Add coconut milk and chicken stock; simmer 20 minutes.\n4. Season with fish sauce, soy sauce, and palm sugar.\n5. Cook egg noodles; deep fry a handful until crispy. Serve broth over noodles; top with crispy noodles, pickled mustard greens, shallots, and lime.",
    ingredients: [
      { name: "Chicken Drumsticks", quantity: "8", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Egg Noodles", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Khao Soi Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "2", unit: "cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Pickled Mustard Greens", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [{ name: "Lime Wedges", description: "Fresh lime" }, { name: "Crispy Shallots", description: "Fried shallots garnish" }],
  },
];

async function main() {
  console.log("Seeding meals database (batch 5 — final top-up)…");

  const existing = await db.select({ name: mealsTable.name }).from(mealsTable);
  const existingNames = new Set(existing.map((m) => m.name));

  let added = 0;
  let skipped = 0;

  for (const meal of meals) {
    if (existingNames.has(meal.name)) {
      skipped++;
      continue;
    }

    const { ingredients, sides, ...mealData } = meal;

    const [inserted] = await db
      .insert(mealsTable)
      .values({ ...mealData, imageUrl: null })
      .returning();

    if (!inserted) continue;

    if (ingredients.length > 0) {
      await db.insert(ingredientsTable).values(
        ingredients.map((ing) => ({
          mealId: inserted.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          category: ing.category,
          isCommonPantryItem: ing.isCommonPantryItem,
        }))
      );
    }

    if (sides.length > 0) {
      await db.insert(sidesTable).values(
        sides.map((side) => ({
          mealId: inserted.id,
          name: side.name,
          description: side.description,
        }))
      );
    }

    added++;
  }

  console.log(`Done! Added ${added} meals, skipped ${skipped} duplicates.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
