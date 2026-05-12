import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";

interface IngredientData {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  isCommonPantryItem: boolean;
}
interface SideData {
  name: string;
  description: string;
}
interface MealData {
  name: string;
  description: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  tags: string[];
  instructions: string;
  ingredients: IngredientData[];
  sides: SideData[];
}

const meals: MealData[] = [
  // ===== GREEK (additional) =====
  {
    name: "Spanakopita",
    description: "Flaky phyllo pastry filled with a savory spinach and feta cheese mixture, baked golden.",
    cuisine: "Greek", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 60, servings: 8, calories: 310,
    tags: ["greek", "pastry", "vegetarian"],
    instructions: "1. Sauté spinach with onion and garlic until wilted; let cool.\n2. Mix spinach with crumbled feta, eggs, dill, and nutmeg.\n3. Brush phyllo sheets with melted butter, layering 8 sheets in pan.\n4. Spread filling evenly; layer 8 more buttered phyllo sheets on top.\n5. Score top layers into squares. Bake at 375°F for 40–45 minutes until golden.",
    ingredients: [
      { name: "Phyllo Dough", quantity: "1", unit: "lb", category: "Frozen", isCommonPantryItem: false },
      { name: "Fresh Spinach", quantity: "2", unit: "lbs", category: "Produce", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "1", unit: "lb", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Eggs", quantity: "3", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter", quantity: "1/2", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Fresh Dill", quantity: "1/4", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Greek Salad", description: "Tomatoes, cucumbers, olives and feta" },
      { name: "Tzatziki", description: "Cool yogurt and cucumber dip" },
    ],
  },
  {
    name: "Greek Lemon Chicken Soup (Avgolemono)",
    description: "Silky Greek egg-lemon broth with tender chicken and orzo — comforting and bright.",
    cuisine: "Greek", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 45, servings: 6, calories: 280,
    tags: ["greek", "soup", "comfort"],
    instructions: "1. Simmer chicken breasts in broth with onion, celery, and bay leaf for 25 minutes.\n2. Remove chicken; shred into bite-sized pieces.\n3. Add orzo to simmering broth; cook 8 minutes.\n4. Whisk eggs with lemon juice until frothy; slowly ladle hot broth into egg mixture.\n5. Pour tempered egg mixture back into pot; stir gently — do not boil.\n6. Return chicken; season with salt and white pepper. Serve with fresh dill.",
    ingredients: [
      { name: "Chicken Breasts", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "8", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Orzo Pasta", quantity: "3/4", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "3", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "1/3", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Dill", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Crusty Bread", description: "Warm rustic bread for dipping" },
      { name: "Greek Salad", description: "Classic village salad" },
    ],
  },
  {
    name: "Grilled Lamb Chops with Herbs",
    description: "Marinated lamb rib chops grilled over high heat — herby, smoky, and juicy.",
    cuisine: "Greek", protein: "Lamb", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 580,
    tags: ["greek", "grilled", "lamb"],
    instructions: "1. Mix olive oil, lemon juice, garlic, oregano, rosemary, salt, and pepper.\n2. Marinate lamb chops for at least 1 hour, or overnight.\n3. Bring chops to room temperature. Preheat grill to high.\n4. Grill chops 3–4 minutes per side for medium-rare.\n5. Rest 5 minutes; serve with lemon wedges and fresh herbs.",
    ingredients: [
      { name: "Lamb Rib Chops", quantity: "8", unit: "pieces", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "2", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Potatoes", description: "Lemon-oregano roasted potatoes" },
      { name: "Tzatziki", description: "Garlic yogurt sauce" },
    ],
  },
  {
    name: "Saganaki (Fried Greek Cheese)",
    description: "Thick slabs of kefalograviera or halloumi cheese pan-fried until golden and crispy, flambéed with ouzo.",
    cuisine: "Greek", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 10, servings: 4, calories: 390,
    tags: ["greek", "appetizer", "cheese"],
    instructions: "1. Cut cheese into 1/2-inch slabs; pat dry.\n2. Dredge cheese in flour, shaking off excess.\n3. Heat olive oil in skillet over medium-high heat.\n4. Fry cheese 2 minutes per side until golden and crusty.\n5. Optional: add a splash of ouzo or brandy and flambé briefly.\n6. Squeeze lemon juice over top; serve immediately with pita.",
    ingredients: [
      { name: "Kefalograviera or Halloumi Cheese", quantity: "12", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "All-Purpose Flour", quantity: "1/4", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Pita Bread", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Kalamata Olives", description: "Cured black olives with herbs" },
      { name: "Pita Triangles", description: "Warm pita cut into wedges" },
    ],
  },
  {
    name: "Greek Stuffed Peppers (Gemista)",
    description: "Bell peppers stuffed with a herbed rice and tomato filling, slow-baked in olive oil until tender.",
    cuisine: "Greek", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 75, servings: 4, calories: 340,
    tags: ["greek", "vegetarian", "stuffed"],
    instructions: "1. Cut tops off peppers; scoop out seeds.\n2. Sauté onion and garlic; add grated tomato, rice, fresh herbs, pine nuts, and olive oil.\n3. Season filling generously with salt, pepper, and dried mint.\n4. Fill peppers 3/4 full (rice expands).\n5. Place in baking dish; add 1/2 cup water and drizzle with olive oil.\n6. Bake covered at 375°F for 45 minutes; uncover and bake 15 more minutes.",
    ingredients: [
      { name: "Bell Peppers", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Long-Grain Rice", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Tomatoes", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Fresh Mint", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Pine Nuts", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Greek Yogurt", description: "Plain yogurt for cooling contrast" },
      { name: "Crusty Bread", description: "Fresh bread to soak up juices" },
    ],
  },
  {
    name: "Beef Stifado",
    description: "Greek braised beef stew with pearl onions, warming spices, and a fragrant tomato wine sauce.",
    cuisine: "Greek", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 120, servings: 6, calories: 490,
    tags: ["greek", "stew", "braised"],
    instructions: "1. Sear beef chunks in olive oil until browned on all sides.\n2. Add pearl onions to pan; cook 5 minutes.\n3. Deglaze with red wine; add crushed tomatoes, cinnamon sticks, cloves, bay leaves, and garlic.\n4. Braise covered over low heat for 1.5–2 hours until beef is very tender.\n5. Season and serve over egg noodles or with crusty bread.",
    ingredients: [
      { name: "Beef Chuck", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Pearl Onions", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Red Wine", quantity: "1", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Cinnamon Stick", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Egg Noodles", description: "Wide egg noodles to absorb the sauce" },
      { name: "Feta Bread", description: "Rustic bread with crumbled feta" },
    ],
  },
  {
    name: "Shrimp Saganaki",
    description: "Juicy shrimp in a spiced tomato feta sauce, baked in a clay dish and served sizzling.",
    cuisine: "Greek", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 310,
    tags: ["greek", "seafood", "baked"],
    instructions: "1. Sauté onion and garlic in olive oil. Add ouzo and cook off.\n2. Add crushed tomatoes, chili flakes, and fresh oregano; simmer 10 minutes.\n3. Nestle raw shrimp into the sauce; crumble feta generously over top.\n4. Bake at 400°F for 12–15 minutes until shrimp are pink and feta is slightly melted.\n5. Serve with crusty bread immediately.",
    ingredients: [
      { name: "Large Shrimp", quantity: "1.5", unit: "lbs peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "6", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Red Chili Flakes", quantity: "1/2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Bread", description: "For scooping up the sauce" },
      { name: "Greek Salad", description: "Light salad to balance the rich dish" },
    ],
  },
  {
    name: "Greek Tzatziki Bowl",
    description: "A refreshing bowl built on creamy tzatziki with grilled vegetables, chickpeas, and warm pita.",
    cuisine: "Greek", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 20, servings: 2, calories: 420,
    tags: ["greek", "bowl", "healthy"],
    instructions: "1. Make tzatziki: grate cucumber, squeeze dry, mix with Greek yogurt, garlic, dill, lemon juice, and olive oil.\n2. Toss chickpeas with olive oil, cumin, and paprika; roast at 400°F for 20 minutes.\n3. Grill or roast zucchini and bell peppers with olive oil and oregano.\n4. Assemble bowls: dollop tzatziki, arrange vegetables and chickpeas, top with olives and feta.\n5. Serve with warm pita.",
    ingredients: [
      { name: "Greek Yogurt", quantity: "1.5", unit: "cups", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Chickpeas", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Bell Peppers", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "3", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Pita Bread", quantity: "2", unit: "whole", category: "Bakery", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Kalamata Olives", description: "Briny olives for garnish" },
      { name: "Lemon Wedges", description: "Fresh lemon to brighten the bowl" },
    ],
  },
  // ===== JAPANESE =====
  {
    name: "Tonkotsu Ramen",
    description: "Rich, milky pork bone broth ramen with chashu pork, soft-boiled egg, nori, and bamboo shoots.",
    cuisine: "Japanese", protein: "Pork", isGlutenFree: false, cookTimeMinutes: 240, servings: 4, calories: 680,
    tags: ["japanese", "ramen", "noodles"],
    instructions: "1. Simmer pork bones in water for 4 hours until broth is opaque and rich.\n2. Make chashu: roll pork belly, tie, sear, then braise in soy, mirin, and sake for 90 minutes.\n3. Marinate soft-boiled eggs in soy sauce and mirin for 2+ hours.\n4. Cook fresh ramen noodles per package.\n5. Season broth with tare (soy, mirin, sesame oil).\n6. Bowl: noodles, hot broth, sliced chashu, halved egg, nori, green onions, bamboo shoots.",
    ingredients: [
      { name: "Pork Bones", quantity: "3", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Pork Belly", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Ramen Noodles", quantity: "4", unit: "portions", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "1/2", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Nori Sheets", quantity: "4", unit: "sheets", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Gyoza", description: "Pan-fried pork and cabbage dumplings" },
      { name: "Karaage Chicken", description: "Japanese fried chicken bites" },
    ],
  },
  {
    name: "Chicken Katsu",
    description: "Golden panko-crusted chicken cutlets with a savory tonkatsu sauce and shredded cabbage.",
    cuisine: "Japanese", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 30, servings: 4, calories: 540,
    tags: ["japanese", "fried", "cutlet"],
    instructions: "1. Pound chicken breasts to even 1/2-inch thickness.\n2. Set up breading station: seasoned flour, beaten eggs, panko breadcrumbs.\n3. Coat chicken in flour, dip in egg, press into panko.\n4. Fry in 350°F oil for 4–5 minutes per side until golden.\n5. Make tonkatsu sauce: mix ketchup, Worcestershire, soy sauce, and sugar.\n6. Slice and serve over steamed rice with shredded cabbage and sauce.",
    ingredients: [
      { name: "Chicken Breasts", quantity: "4", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Panko Breadcrumbs", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "All-Purpose Flour", quantity: "1/2", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Cabbage", quantity: "2", unit: "cups shredded", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Rice", description: "Japanese short-grain white rice" },
      { name: "Miso Soup", description: "Light miso broth with tofu and wakame" },
    ],
  },
  {
    name: "Beef Gyudon",
    description: "Japanese rice bowl topped with thinly sliced beef and onions simmered in a sweet-savory dashi broth.",
    cuisine: "Japanese", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 560,
    tags: ["japanese", "rice-bowl", "quick"],
    instructions: "1. Thinly slice beef ribeye against the grain; slice onions into half-moons.\n2. Combine dashi, soy sauce, mirin, and sugar in a skillet; bring to simmer.\n3. Add onions; cook 5 minutes until softened.\n4. Add beef in single layer; simmer 2–3 minutes until cooked.\n5. Serve over steamed rice; top with soft-boiled egg and pickled ginger.",
    ingredients: [
      { name: "Beef Ribeye", quantity: "1", unit: "lb thinly sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Dashi Stock", quantity: "3/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Japanese Short-Grain Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Miso Soup", description: "Classic dashi-based miso soup" },
      { name: "Pickled Ginger", description: "Thinly sliced pickled ginger" },
    ],
  },
  {
    name: "Salmon Teriyaki",
    description: "Glazed salmon fillets with a glossy homemade teriyaki sauce — sticky, sweet, and umami-rich.",
    cuisine: "Japanese", protein: "Salmon", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 420,
    tags: ["japanese", "salmon", "teriyaki"],
    instructions: "1. Make teriyaki sauce: simmer soy sauce, mirin, sake, and sugar until slightly thickened.\n2. Season salmon fillets with salt.\n3. Heat oil in skillet; place salmon skin-side down. Cook 4 minutes.\n4. Flip salmon; spoon teriyaki sauce over; cook 3 more minutes, glazing frequently.\n5. Serve over rice with steamed broccoli and sesame seeds.",
    ingredients: [
      { name: "Salmon Fillets", quantity: "4", unit: "6-oz pieces", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sake", quantity: "2", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Fluffy Japanese rice" },
      { name: "Steamed Broccoli", description: "Simple steamed florets with sesame oil" },
    ],
  },
  {
    name: "Miso Glazed Eggplant (Nasu Dengaku)",
    description: "Silky Japanese eggplant halves broiled with a sweet miso glaze until caramelized.",
    cuisine: "Japanese", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 200,
    tags: ["japanese", "vegetarian", "eggplant"],
    instructions: "1. Halve eggplants lengthwise; score flesh in crosshatch pattern.\n2. Brush with sesame oil; broil cut side up for 8 minutes until soft.\n3. Whisk white miso, mirin, sake, and sugar into a paste.\n4. Spread miso paste over eggplant halves.\n5. Broil 2–3 more minutes until glaze is bubbling and caramelized.\n6. Garnish with sesame seeds and green onions.",
    ingredients: [
      { name: "Japanese Eggplant", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "White Miso Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Rice", description: "Simple white rice" },
      { name: "Miso Soup", description: "Light kombu and tofu soup" },
    ],
  },
  {
    name: "Japanese Curry Rice",
    description: "Mild, deeply savory Japanese-style curry with tender chicken, potatoes, and carrots over steamed rice.",
    cuisine: "Japanese", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 50, servings: 6, calories: 530,
    tags: ["japanese", "curry", "comfort"],
    instructions: "1. Brown chicken pieces in oil; remove and set aside.\n2. Sauté onions until golden and caramelized, about 15 minutes.\n3. Add carrots and potatoes; sauté briefly.\n4. Add chicken back; pour in water or stock. Simmer 20 minutes.\n5. Remove from heat; dissolve Japanese curry roux blocks into stew.\n6. Return to low heat; simmer 10 minutes until thick. Serve over rice.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Japanese Curry Roux", quantity: "1", unit: "box", category: "Pantry", isCommonPantryItem: false },
      { name: "Potatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Carrots", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Onion", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Short-Grain Rice", quantity: "3", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Fukujinzuke Pickles", description: "Red Japanese pickled vegetables" },
      { name: "Tonkatsu on Side", description: "Optional crispy pork cutlet alongside" },
    ],
  },
  {
    name: "Shrimp Tempura",
    description: "Perfectly light and crispy battered shrimp and vegetables, served with dipping sauce.",
    cuisine: "Japanese", protein: "Shrimp", isGlutenFree: false, cookTimeMinutes: 30, servings: 4, calories: 360,
    tags: ["japanese", "fried", "shrimp"],
    instructions: "1. Make tentsuyu dipping sauce: combine dashi, soy sauce, and mirin.\n2. Mix tempura batter: cold water and egg yolk lightly mixed with flour — lumpy batter is correct.\n3. Pat shrimp dry; straighten by scoring belly. Dust with flour.\n4. Dip shrimp in batter; fry at 350°F for 2–3 minutes until pale golden and crisp.\n5. Drain on rack; serve immediately with dipping sauce and grated daikon.",
    ingredients: [
      { name: "Large Shrimp", quantity: "1.5", unit: "lbs peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Tempura Flour", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Egg Yolk", quantity: "1", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Ice Cold Water", quantity: "1", unit: "cup", category: "Beverages", isCommonPantryItem: true },
      { name: "Dashi Stock", quantity: "1/2", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Rice", description: "Plain white rice" },
      { name: "Miso Soup", description: "Light soup with tofu and scallions" },
    ],
  },
  {
    name: "Yakitori Chicken Skewers",
    description: "Japanese charcoal-grilled chicken skewers glazed with a smoky tare sauce — bar food at its finest.",
    cuisine: "Japanese", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 25, servings: 4, calories: 310,
    tags: ["japanese", "skewers", "grilled"],
    instructions: "1. Make tare: simmer soy sauce, mirin, sake, and sugar until slightly syrupy.\n2. Cut chicken thighs into bite-size pieces; thread onto skewers, alternating with green onion chunks.\n3. Grill over high heat 3–4 minutes, turning occasionally.\n4. Brush generously with tare; grill 1–2 more minutes.\n5. Repeat glazing; serve with remaining tare for dipping.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "1.5", unit: "lbs boneless", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sake", quantity: "3", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Sugar", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "4", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Yakitori Rice", description: "Short-grain rice with sesame" },
      { name: "Shishito Peppers", description: "Blistered shishito peppers with sea salt" },
    ],
  },
  {
    name: "Agedashi Tofu",
    description: "Silken tofu lightly coated and deep-fried, served in a hot savory dashi broth.",
    cuisine: "Japanese", protein: "Tofu", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 220,
    tags: ["japanese", "tofu", "vegetarian"],
    instructions: "1. Drain silken tofu on paper towels for 15 minutes; cut into large cubes.\n2. Dust tofu cubes with potato starch or cornstarch.\n3. Deep fry at 350°F for 3–4 minutes until light golden.\n4. Make broth: combine dashi, soy sauce, and mirin; heat gently.\n5. Serve tofu in broth; top with grated daikon, ginger, and katsuobushi.",
    ingredients: [
      { name: "Silken Tofu", quantity: "1", unit: "block", category: "Pantry", isCommonPantryItem: false },
      { name: "Potato Starch", quantity: "1/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Dashi Stock", quantity: "1.5", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Daikon Radish", quantity: "3", unit: "tbsp grated", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Edamame", description: "Salted steamed edamame" },
      { name: "Steamed Rice", description: "Japanese white rice" },
    ],
  },
  {
    name: "Oyakodon (Chicken and Egg Bowl)",
    description: "Tender chicken and egg simmered together in a sweet dashi sauce, served over rice — a Japanese classic.",
    cuisine: "Japanese", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 20, servings: 2, calories: 510,
    tags: ["japanese", "rice-bowl", "eggs"],
    instructions: "1. Thinly slice chicken thighs; slice onion into thin half-moons.\n2. Simmer dashi, soy sauce, mirin, and sugar in a small skillet.\n3. Add onions; cook 3 minutes. Add chicken; cook 4 minutes.\n4. Beat eggs loosely; pour over chicken and onion in circular motion.\n5. Cover and cook 1 minute — eggs should be just set and custardy.\n6. Slide over a bowl of hot rice; garnish with mitsuba or green onion.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "12", unit: "oz boneless", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Dashi Stock", quantity: "1/2", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Short-Grain Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Miso Soup", description: "Tofu and seaweed miso broth" },
      { name: "Japanese Pickles", description: "Tsukemono — lightly pickled vegetables" },
    ],
  },
  {
    name: "Soba Noodles with Dipping Sauce",
    description: "Chilled buckwheat soba noodles served with a cold tsuyu dipping broth and crispy tempura bits.",
    cuisine: "Japanese", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 340,
    tags: ["japanese", "noodles", "cold"],
    instructions: "1. Cook soba noodles per package; rinse under cold water until chilled.\n2. Make tsuyu: combine dashi, soy sauce, and mirin; chill.\n3. Arrange noodles on bamboo mat or plate.\n4. Serve noodles alongside small bowls of cold tsuyu.\n5. Garnish with chopped green onions, wasabi, and nori strips.\n6. Dip noodles in sauce and eat.",
    ingredients: [
      { name: "Soba Noodles", quantity: "12", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Dashi Stock", quantity: "1.5", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Wasabi Paste", quantity: "2", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tempura Shrimp", description: "Lightly battered and fried shrimp" },
      { name: "Wakame Salad", description: "Seaweed salad with sesame dressing" },
    ],
  },
  // ===== KOREAN =====
  {
    name: "Korean BBQ Beef Bulgogi",
    description: "Thinly sliced marinated beef grilled over high heat — sweet, savory, and slightly smoky.",
    cuisine: "Korean", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 25, servings: 4, calories: 480,
    tags: ["korean", "bbq", "grilled"],
    instructions: "1. Mix soy sauce, pear or apple puree, sesame oil, garlic, ginger, sugar, and black pepper.\n2. Slice beef ribeye paper-thin against the grain; marinate at least 30 minutes.\n3. Grill or cook in a very hot cast iron skillet in small batches.\n4. Cook 1–2 minutes per side — don't overcrowd.\n5. Serve over steamed rice with banchan (kimchi, pickled radish, etc.).",
    ingredients: [
      { name: "Beef Ribeye", quantity: "1.5", unit: "lbs thinly sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Pear or Apple", quantity: "1/2", unit: "whole grated", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "5", unit: "cloves minced", category: "Produce", isCommonPantryItem: true },
      { name: "Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Kimchi", description: "Fermented spicy cabbage" },
      { name: "Steamed Rice", description: "Short-grain white rice" },
    ],
  },
  {
    name: "Bibimbap",
    description: "Korean mixed rice bowl topped with colorful seasoned vegetables, gochujang, and a fried egg.",
    cuisine: "Korean", protein: "Eggs", isGlutenFree: true, cookTimeMinutes: 40, servings: 4, calories: 520,
    tags: ["korean", "rice-bowl", "vegetarian"],
    instructions: "1. Blanch and season spinach with sesame oil, garlic, and soy sauce.\n2. Sauté bean sprouts and shredded carrots separately with sesame oil.\n3. Sauté sliced mushrooms with soy and garlic.\n4. Cook rice; spread in hot stone bowl (dolsot) or regular bowl.\n5. Arrange vegetable toppings over rice; add a fried egg on top.\n6. Mix gochujang sauce; drizzle over. Mix everything together before eating.",
    ingredients: [
      { name: "Short-Grain Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Fresh Spinach", quantity: "4", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Bean Sprouts", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Gochujang", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Kimchi", description: "Spicy fermented cabbage" },
      { name: "Miso Soup", description: "Light Korean doenjang jjigae" },
    ],
  },
  {
    name: "Dakgalbi (Spicy Korean Chicken Stir-Fry)",
    description: "Chewy, spicy gochujang-marinated chicken stir-fried with rice cakes, cabbage, and sweet potatoes.",
    cuisine: "Korean", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 30, servings: 4, calories: 510,
    tags: ["korean", "spicy", "stir-fry"],
    instructions: "1. Marinate chicken in gochujang, soy sauce, sesame oil, garlic, ginger, and sugar for 30 minutes.\n2. Soak tteok (rice cakes) in cold water for 10 minutes if dried.\n3. Heat oil in large skillet; add chicken and cook 5 minutes.\n4. Add cabbage, sweet potato, and rice cakes; stir-fry 8–10 minutes.\n5. Adjust seasoning; serve hot with steamed rice.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "1.5", unit: "lbs diced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Gochujang", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Korean Rice Cakes (Tteok)", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Cabbage", quantity: "1/4", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Sweet Potato", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Fried Rice", description: "Cheesy fried rice stirred into the pan at the end" },
      { name: "Perilla Wraps", description: "Fresh perilla leaves for wrapping" },
    ],
  },
  {
    name: "Sundubu Jjigae (Soft Tofu Stew)",
    description: "Fiery Korean soft tofu stew with seafood, pork, and egg in a bold anchovy broth.",
    cuisine: "Korean", protein: "Tofu", isGlutenFree: true, cookTimeMinutes: 25, servings: 2, calories: 340,
    tags: ["korean", "stew", "spicy"],
    instructions: "1. Sauté ground pork with gochugaru (chili flakes) and garlic in sesame oil.\n2. Add anchovy stock and bring to boil.\n3. Add kimchi, clams or shrimp, and mushrooms; simmer 5 minutes.\n4. Spoon in soft tofu in large chunks — don't stir, just push gently.\n5. Crack an egg into the center; simmer 2 more minutes.\n6. Season with soy sauce; serve bubbling in the clay pot with rice.",
    ingredients: [
      { name: "Soft Tofu", quantity: "2", unit: "tubes", category: "Pantry", isCommonPantryItem: false },
      { name: "Ground Pork", quantity: "4", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Gochugaru (Korean Chili Flakes)", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Kimchi", quantity: "1/2", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Rice", description: "Plain short-grain rice to cool the heat" },
      { name: "Banchan", description: "Assorted Korean side dishes" },
    ],
  },
  {
    name: "Korean Fried Chicken",
    description: "Ultra-crispy double-fried chicken glazed in a sweet-spicy gochujang or soy-garlic sauce.",
    cuisine: "Korean", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 45, servings: 4, calories: 620,
    tags: ["korean", "fried", "chicken"],
    instructions: "1. Coat chicken wings in seasoned flour (garlic powder, salt, pepper).\n2. Fry at 325°F for 8 minutes; remove and rest 5 minutes.\n3. Fry again at 375°F for 4–5 minutes until extra crispy.\n4. Make glaze: cook gochujang, soy sauce, garlic, honey, and vinegar until bubbly.\n5. Toss hot chicken in glaze; garnish with sesame seeds and scallions.",
    ingredients: [
      { name: "Chicken Wings", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Gochujang", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Honey", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "4", unit: "cloves minced", category: "Produce", isCommonPantryItem: true },
      { name: "All-Purpose Flour", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Korean Pickled Radish", description: "Sweet-tangy yellow pickled radish cubes" },
      { name: "Beer or Soda", description: "Classic Korean chimaek pairing" },
    ],
  },
  {
    name: "Japchae (Glass Noodle Stir-Fry)",
    description: "Stir-fried sweet potato glass noodles with colorful vegetables and beef in a sesame-soy sauce.",
    cuisine: "Korean", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 35, servings: 4, calories: 430,
    tags: ["korean", "noodles", "stir-fry"],
    instructions: "1. Soak glass noodles in warm water 20 minutes; boil 5 minutes; drain.\n2. Marinate sliced beef in soy sauce, sugar, and sesame oil.\n3. Stir-fry beef; set aside. Stir-fry spinach, mushrooms, carrots, and bell peppers separately.\n4. Combine all in large pan with noodles; season with soy sauce, sesame oil, and sugar.\n5. Toss well; garnish with sesame seeds and egg strips.",
    ingredients: [
      { name: "Sweet Potato Glass Noodles", quantity: "8", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Beef Sirloin", quantity: "8", unit: "oz thinly sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Shiitake Mushrooms", quantity: "1", unit: "cup sliced", category: "Produce", isCommonPantryItem: false },
      { name: "Spinach", quantity: "4", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Kimchi", description: "Spicy fermented cabbage" },
      { name: "Steamed Rice", description: "Korean short-grain rice" },
    ],
  },
  {
    name: "Kimchi Jjigae (Kimchi Stew)",
    description: "Bold, fermented-tangy kimchi and pork stew with tofu — a staple Korean comfort food.",
    cuisine: "Korean", protein: "Pork", isGlutenFree: true, cookTimeMinutes: 35, servings: 4, calories: 380,
    tags: ["korean", "stew", "kimchi"],
    instructions: "1. Sauté pork belly slices until browned and fat is rendered.\n2. Add old, sour kimchi and cook together 5 minutes.\n3. Add water or pork stock, gochugaru, and soy sauce; bring to boil.\n4. Reduce heat; simmer 20 minutes until flavors meld.\n5. Add tofu cubes; simmer 5 more minutes.\n6. Finish with sesame oil; serve over rice.",
    ingredients: [
      { name: "Well-Fermented Kimchi", quantity: "2", unit: "cups", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Pork Belly", quantity: "8", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Firm Tofu", quantity: "1", unit: "block", category: "Pantry", isCommonPantryItem: false },
      { name: "Gochugaru", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Rice", description: "Essential alongside the stew" },
      { name: "Pickled Radish", description: "Cooling daikon pickles" },
    ],
  },
  {
    name: "Haemul Pajeon (Seafood Scallion Pancake)",
    description: "Crispy Korean savory pancake packed with shrimp, squid, and green onions.",
    cuisine: "Korean", protein: "Shrimp", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 350,
    tags: ["korean", "pancake", "seafood"],
    instructions: "1. Mix flour, rice flour, egg, cold water, and salt into a thin batter.\n2. Fold in sliced green onions, shrimp, and squid rings.\n3. Heat generous oil in large skillet over high heat.\n4. Pour batter in; flatten and cook until bottom is golden, about 5 minutes.\n5. Flip carefully; cook other side until crispy.\n6. Make dipping sauce: soy sauce, rice vinegar, sesame oil, and chili.",
    ingredients: [
      { name: "All-Purpose Flour", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Rice Flour", quantity: "1/4", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Shrimp", quantity: "8", unit: "oz peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "1", unit: "bunch", category: "Produce", isCommonPantryItem: false },
      { name: "Egg", quantity: "1", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Makgeolli", description: "Traditional Korean rice wine" },
      { name: "Kimchi", description: "Spicy fermented cabbage" },
    ],
  },
  // ===== MIDDLE EASTERN =====
  {
    name: "Lamb Shawarma",
    description: "Slow-roasted, heavily spiced lamb sliced from a vertical rotisserie and served in warm flatbread.",
    cuisine: "Middle Eastern", protein: "Lamb", isGlutenFree: false, cookTimeMinutes: 120, servings: 6, calories: 570,
    tags: ["middle-eastern", "shawarma", "lamb"],
    instructions: "1. Mix shawarma spices: cumin, coriander, turmeric, paprika, cinnamon, allspice, garlic, lemon, and olive oil.\n2. Marinate lamb overnight in spice mixture.\n3. Roll lamb into a cylinder; tie and slow-roast at 325°F for 2 hours.\n4. Broil 5 minutes for caramelized exterior.\n5. Slice thinly; serve in warm flatbread with garlic sauce, tahini, tomatoes, and pickles.",
    ingredients: [
      { name: "Lamb Leg or Shoulder", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Flatbread or Pita", quantity: "6", unit: "whole", category: "Bakery", isCommonPantryItem: false },
      { name: "Tahini", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Coriander", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Fattoush Salad", description: "Crispy pita and herb salad" },
      { name: "Hummus", description: "Creamy chickpea dip" },
    ],
  },
  {
    name: "Chicken Shawarma",
    description: "Juicy, spiced chicken thighs marinated in Middle Eastern aromatics and served in pita.",
    cuisine: "Middle Eastern", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 40, servings: 4, calories: 490,
    tags: ["middle-eastern", "shawarma", "chicken"],
    instructions: "1. Marinate chicken in yogurt, lemon, garlic, cumin, paprika, turmeric, and cinnamon for 2+ hours.\n2. Grill or roast chicken at 425°F for 25–30 minutes.\n3. Rest 5 minutes; slice or chop.\n4. Warm pitas; spread with garlic sauce or hummus.\n5. Fill with chicken, tomatoes, cucumber, and pickled turnips.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Greek Yogurt", quantity: "1/2", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Pita Bread", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Paprika", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tahini Sauce", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Fattoush", description: "Herb and crispy bread salad" },
      { name: "Pickled Turnips", description: "Pink pickled turnip slices" },
    ],
  },
  {
    name: "Falafel",
    description: "Crispy fried chickpea and herb patties — golden outside, vibrantly green inside.",
    cuisine: "Middle Eastern", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 360,
    tags: ["middle-eastern", "vegetarian", "fried"],
    instructions: "1. Soak dried chickpeas overnight; drain (do NOT use canned).\n2. Process chickpeas with onion, garlic, parsley, cilantro, cumin, coriander, and baking powder.\n3. Refrigerate mixture 1 hour; form into small patties.\n4. Fry at 375°F for 3–4 minutes until deeply golden and crispy.\n5. Serve in pita with tahini sauce, tomatoes, pickles, and fresh herbs.",
    ingredients: [
      { name: "Dried Chickpeas", quantity: "2", unit: "cups (soaked)", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "1/2", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tahini", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Hummus", description: "Creamy chickpea and tahini dip" },
      { name: "Tabbouleh", description: "Parsley and bulgur salad" },
    ],
  },
  {
    name: "Shakshuka",
    description: "Eggs poached in a spiced tomato and pepper sauce — the ultimate Middle Eastern brunch.",
    cuisine: "Middle Eastern", protein: "Eggs", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 290,
    tags: ["middle-eastern", "eggs", "brunch"],
    instructions: "1. Sauté onion and bell peppers in olive oil until soft.\n2. Add garlic, cumin, paprika, and chili flakes; cook 1 minute.\n3. Add crushed tomatoes; season and simmer 10 minutes until thickened.\n4. Make wells in the sauce; crack eggs into each well.\n5. Cover and simmer 6–8 minutes until whites are set but yolks runny.\n6. Garnish with feta, parsley, and serve with warm pita.",
    ingredients: [
      { name: "Eggs", quantity: "6", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Bell Peppers", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "3", unit: "oz crumbled", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Paprika", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pita Bread", description: "Warm flatbread for scooping" },
      { name: "Labneh", description: "Strained yogurt cheese" },
    ],
  },
  {
    name: "Beef Kofta",
    description: "Spiced ground beef and lamb kofta skewers grilled over charcoal, served with tahini and flatbread.",
    cuisine: "Middle Eastern", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 430,
    tags: ["middle-eastern", "grilled", "skewer"],
    instructions: "1. Mix ground beef and lamb with grated onion, garlic, parsley, cumin, coriander, cinnamon, allspice, and chili.\n2. Knead meat vigorously to bind; refrigerate 30 minutes.\n3. Form around flat skewers in elongated torpedo shapes.\n4. Grill over high heat 4–5 minutes per side until cooked through.\n5. Serve with tahini sauce, flatbread, and onion-herb salad.",
    ingredients: [
      { name: "Ground Beef", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ground Lamb", quantity: "1/2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium grated", category: "Produce", isCommonPantryItem: true },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tahini", quantity: "1/4", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Fattoush Salad", description: "Herb salad with crispy pita" },
      { name: "Garlic Flatbread", description: "Warm garlic-brushed flatbread" },
    ],
  },
  {
    name: "Hummus with Warm Spiced Chickpeas",
    description: "Ultra-creamy homemade hummus topped with warm chickpeas, olive oil, paprika, and fresh herbs.",
    cuisine: "Middle Eastern", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 15, servings: 6, calories: 270,
    tags: ["middle-eastern", "dip", "vegetarian"],
    instructions: "1. Blend chickpeas, tahini, lemon juice, garlic, ice water, and salt until incredibly smooth.\n2. Taste and adjust — more lemon, tahini, or salt as needed.\n3. Warm extra chickpeas in olive oil with paprika and cumin.\n4. Swirl hummus in shallow bowl; top with warm chickpeas.\n5. Drizzle with olive oil, sprinkle paprika and sumac, finish with fresh parsley.",
    ingredients: [
      { name: "Canned Chickpeas", quantity: "2", unit: "cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Tahini", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Warm Pita", description: "Freshly warmed pita wedges" },
      { name: "Crudités", description: "Sliced cucumber, carrot, and celery" },
    ],
  },
  {
    name: "Mujaddara (Lentils and Rice)",
    description: "Ancient Levantine dish of lentils and rice topped with crispy caramelized onions — hearty and nutritious.",
    cuisine: "Middle Eastern", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 50, servings: 6, calories: 390,
    tags: ["middle-eastern", "vegetarian", "lentils"],
    instructions: "1. Caramelize onions in olive oil over low heat for 30–40 minutes until deep golden.\n2. Cook lentils in salted water until just tender; drain.\n3. Toast rice briefly in pot; add lentils, water, and spices (cumin, coriander, cinnamon).\n4. Cook covered on low heat until rice is tender.\n5. Top with crispy onions; serve with yogurt and flatbread.",
    ingredients: [
      { name: "Green or Brown Lentils", quantity: "1.5", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Long-Grain Rice", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Onions", quantity: "3", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "1/2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Plain Yogurt", description: "Cooling yogurt to serve alongside" },
      { name: "Cucumber Salad", description: "Fresh cucumber, mint, and lemon salad" },
    ],
  },
  {
    name: "Persian Herb Frittata (Kuku Sabzi)",
    description: "Vibrant Persian egg frittata packed with fresh herbs and walnuts — served at Nowruz celebrations.",
    cuisine: "Middle Eastern", protein: "Eggs", isGlutenFree: true, cookTimeMinutes: 30, servings: 6, calories: 220,
    tags: ["middle-eastern", "eggs", "herbs"],
    instructions: "1. Finely chop large amounts of parsley, cilantro, dill, and fenugreek leaves.\n2. Mix herbs with eggs, walnuts, barberries (or dried cranberries), turmeric, and salt.\n3. Heat oil in oven-safe skillet; pour in egg mixture.\n4. Cook on stovetop 5 minutes until bottom is set.\n5. Bake at 350°F for 15 minutes or flip and cook other side until golden.\n6. Serve with yogurt and flatbread.",
    ingredients: [
      { name: "Eggs", quantity: "6", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Dill", quantity: "1/2", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Walnuts", quantity: "1/4", unit: "cup chopped", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "1/2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Lavash", description: "Thin Persian flatbread" },
      { name: "Greek Yogurt", description: "Thick yogurt with mint" },
    ],
  },
  // ===== THAI =====
  {
    name: "Pad Thai",
    description: "Thailand's beloved stir-fried rice noodles with shrimp, egg, bean sprouts, and a tangy tamarind sauce.",
    cuisine: "Thai", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 490,
    tags: ["thai", "noodles", "stir-fry"],
    instructions: "1. Soak rice noodles in warm water 20 minutes; drain.\n2. Make sauce: mix tamarind paste, fish sauce, sugar, and lime juice.\n3. Stir-fry shrimp in hot wok until pink; push to side.\n4. Scramble eggs in center of wok.\n5. Add noodles and sauce; toss vigorously over high heat.\n6. Add bean sprouts and green onions; toss 1 minute.\n7. Serve with crushed peanuts, lime wedges, and chili flakes.",
    ingredients: [
      { name: "Rice Noodles", quantity: "8", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Shrimp", quantity: "1", unit: "lb peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Tamarind Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Bean Sprouts", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Roasted Peanuts", quantity: "1/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tom Yum Soup", description: "Hot and sour Thai soup" },
      { name: "Spring Rolls", description: "Crispy vegetable rolls with sweet chili sauce" },
    ],
  },
  {
    name: "Green Curry with Chicken",
    description: "Fragrant Thai green curry with chicken, Thai eggplant, and creamy coconut milk.",
    cuisine: "Thai", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 510,
    tags: ["thai", "curry", "spicy"],
    instructions: "1. Heat coconut cream in wok until sizzling; fry green curry paste 2 minutes until fragrant.\n2. Add chicken strips; coat in curry paste and cook 3 minutes.\n3. Add coconut milk, chicken stock, fish sauce, and palm sugar.\n4. Add Thai eggplant, bamboo shoots, and kaffir lime leaves.\n5. Simmer 12 minutes; finish with Thai basil and lime juice.\n6. Serve over jasmine rice.",
    ingredients: [
      { name: "Chicken Breast", quantity: "1.5", unit: "lbs sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Green Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "14", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Thai Eggplant", quantity: "8", unit: "small", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "1/2", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Fragrant Thai jasmine rice" },
      { name: "Prawn Crackers", description: "Crispy shrimp crackers" },
    ],
  },
  {
    name: "Red Curry with Shrimp",
    description: "Vibrant Thai red curry with plump shrimp and vegetables in a rich coconut milk broth.",
    cuisine: "Thai", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 420,
    tags: ["thai", "curry", "seafood"],
    instructions: "1. Fry red curry paste in coconut cream until oils separate and paste is fragrant.\n2. Add coconut milk, fish sauce, lime leaves, and lemongrass.\n3. Simmer 5 minutes; taste and adjust sweetness with palm sugar.\n4. Add shrimp and bell peppers; simmer 4–5 minutes.\n5. Finish with Thai basil and a squeeze of lime.",
    ingredients: [
      { name: "Large Shrimp", quantity: "1.5", unit: "lbs peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Red Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "14", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Bell Peppers", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "1/2", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Fluffy fragrant rice" },
      { name: "Roti", description: "Flaky Thai flatbread" },
    ],
  },
  {
    name: "Tom Yum Soup",
    description: "Thailand's famous hot and sour soup with shrimp, lemongrass, galangal, and kaffir lime leaves.",
    cuisine: "Thai", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 180,
    tags: ["thai", "soup", "spicy"],
    instructions: "1. Bring stock to boil with lemongrass, galangal, kaffir lime leaves, and chili.\n2. Simmer 5 minutes to infuse flavors.\n3. Add mushrooms; simmer 3 minutes.\n4. Add shrimp; cook 2–3 minutes until pink.\n5. Season with fish sauce and lime juice.\n6. Garnish with cilantro; serve immediately.",
    ingredients: [
      { name: "Shrimp", quantity: "1", unit: "lb peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "6", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Galangal or Ginger", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed Thai jasmine rice" },
      { name: "Spring Rolls", description: "Crispy veggie rolls" },
    ],
  },
  {
    name: "Massaman Curry",
    description: "Rich, mild Thai-Muslim curry with tender beef, potatoes, and peanuts in an aromatic broth.",
    cuisine: "Thai", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 90, servings: 6, calories: 580,
    tags: ["thai", "curry", "mild"],
    instructions: "1. Brown beef chunks in oil; set aside.\n2. Fry massaman curry paste in coconut cream 2 minutes.\n3. Return beef; add coconut milk, water, and fish sauce.\n4. Add potatoes, onion, cinnamon sticks, cardamom, and bay leaves.\n5. Simmer covered 60 minutes until beef is tender.\n6. Stir in roasted peanuts and palm sugar. Serve with rice.",
    ingredients: [
      { name: "Beef Chuck", quantity: "2", unit: "lbs cubed", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Massaman Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "14", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Potatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Roasted Peanuts", quantity: "1/3", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Roti Canai", description: "Flaky Malaysian-style flatbread" },
      { name: "Pickled Cucumber", description: "Cool Thai cucumber relish" },
    ],
  },
  {
    name: "Larb (Thai Minced Meat Salad)",
    description: "Tangy, herby Thai meat salad with minced pork, toasted rice powder, lime, and fresh mint.",
    cuisine: "Thai", protein: "Pork", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 310,
    tags: ["thai", "salad", "spicy"],
    instructions: "1. Toast uncooked rice in dry pan until golden; grind to coarse powder.\n2. Cook ground pork in water until just done — no oil.\n3. Season with fish sauce, lime juice, chili, and toasted rice powder.\n4. Add shallots, fresh mint, cilantro, and green onions.\n5. Toss while still warm; taste and adjust fish sauce and lime.",
    ingredients: [
      { name: "Ground Pork", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Mint", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Long-Grain Rice", quantity: "2", unit: "tbsp for powder", category: "Grains & Bread", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Sticky Rice", description: "Thai glutinous rice balls" },
      { name: "Fresh Cabbage Wedge", description: "Raw cabbage for scooping" },
    ],
  },
  {
    name: "Pad See Ew",
    description: "Wide rice noodles stir-fried with beef, Chinese broccoli, and a savory soy-oyster sauce.",
    cuisine: "Thai", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 520,
    tags: ["thai", "noodles", "stir-fry"],
    instructions: "1. Marinate beef slices in soy sauce and oyster sauce.\n2. Soak wide rice noodles until pliable; drain.\n3. Heat wok until smoking; fry beef until charred. Remove.\n4. Add noodles to wok; spread flat and let char undisturbed 1 minute.\n5. Add egg and scramble; add Chinese broccoli stalks then leaves.\n6. Return beef; season with soy sauce, oyster sauce, and sugar. Toss quickly.",
    ingredients: [
      { name: "Wide Rice Noodles", quantity: "12", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Beef Flank Steak", quantity: "12", unit: "oz sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chinese Broccoli (Gai Lan)", quantity: "8", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Oyster Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Sliced Chili in Vinegar", description: "Thai table condiment of chilies in vinegar" },
      { name: "Thai Iced Tea", description: "Sweetened tea with condensed milk" },
    ],
  },
  {
    name: "Mango Sticky Rice",
    description: "Sweet glutinous rice drenched in coconut cream, topped with ripe mango slices.",
    cuisine: "Thai", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 40, servings: 4, calories: 450,
    tags: ["thai", "dessert", "sweet"],
    instructions: "1. Soak glutinous rice overnight; steam for 20–25 minutes until translucent.\n2. Warm coconut milk with sugar and salt until dissolved.\n3. Pour half the coconut sauce over hot rice; fold in and let absorb 20 minutes.\n4. Make topping: heat remaining coconut milk with a pinch of salt until warm.\n5. Slice ripe mango into fans.\n6. Serve rice with mango slices and drizzle coconut topping over.",
    ingredients: [
      { name: "Glutinous Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "14", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Sugar", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ripe Mango", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Thai Iced Tea", description: "Orange spiced tea with condensed milk" },
      { name: "Coconut Ice Cream", description: "Cool homemade coconut ice cream" },
    ],
  },
  // ===== SIDE DISHES =====
  {
    name: "Classic Mashed Potatoes",
    description: "Buttery, creamy mashed potatoes — the ultimate comfort side dish.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 25, servings: 6, calories: 280,
    tags: ["side", "potatoes", "classic"],
    instructions: "1. Peel and chunk russet potatoes; place in cold salted water.\n2. Bring to boil; cook 15–20 minutes until very tender.\n3. Drain and return to pot; heat briefly to steam off excess moisture.\n4. Rice or mash potatoes; fold in warm butter and hot cream.\n5. Season generously with salt; add more butter as needed.",
    ingredients: [
      { name: "Russet Potatoes", quantity: "3", unit: "lbs", category: "Produce", isCommonPantryItem: true },
      { name: "Butter", quantity: "6", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Heavy Cream", quantity: "1/2", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Salt", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Chives", description: "Freshly snipped chives on top" },
      { name: "Brown Butter", description: "Drizzle of nutty browned butter" },
    ],
  },
  {
    name: "Roasted Garlic Broccoli",
    description: "Crispy, caramelized broccoli florets roasted with garlic and lemon — simple and addictive.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 130,
    tags: ["side", "vegetable", "healthy"],
    instructions: "1. Cut broccoli into large florets; toss with olive oil, sliced garlic, salt, and pepper.\n2. Spread on baking sheet — don't crowd.\n3. Roast at 425°F for 20–22 minutes until edges are deeply charred.\n4. Squeeze fresh lemon over; optional: add red pepper flakes.\n5. Taste for salt and serve immediately.",
    ingredients: [
      { name: "Broccoli", quantity: "2", unit: "large heads", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "4", unit: "cloves sliced", category: "Produce", isCommonPantryItem: true },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Parmesan", description: "Freshly grated Parmesan to finish" },
    ],
  },
  {
    name: "Caesar Salad",
    description: "Classic romaine lettuce with homemade Caesar dressing, garlic croutons, and shaved Parmesan.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 15, servings: 4, calories: 250,
    tags: ["side", "salad", "classic"],
    instructions: "1. Make dressing: whisk anchovy paste, garlic, Dijon, egg yolk, lemon juice, Worcestershire, and olive oil until emulsified.\n2. Make croutons: toss bread cubes with garlic oil; bake at 375°F 10 minutes.\n3. Tear romaine into large pieces; toss with dressing.\n4. Add croutons and shaved Parmesan; toss again.\n5. Serve immediately.",
    ingredients: [
      { name: "Romaine Lettuce", quantity: "2", unit: "heads", category: "Produce", isCommonPantryItem: false },
      { name: "Parmesan Cheese", quantity: "1/2", unit: "cup grated", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Crusty Bread", quantity: "2", unit: "slices", category: "Bakery", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Garlic Bread", description: "Warm garlic butter toast" },
    ],
  },
  {
    name: "Honey Roasted Carrots",
    description: "Tender carrots roasted with honey and thyme until glossy and caramelized.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 35, servings: 4, calories: 150,
    tags: ["side", "vegetable", "roasted"],
    instructions: "1. Peel and halve carrots lengthwise.\n2. Toss with olive oil, honey, fresh thyme, salt, and pepper.\n3. Spread in single layer on baking sheet.\n4. Roast at 400°F for 25–30 minutes until caramelized, turning once.\n5. Garnish with fresh parsley.",
    ingredients: [
      { name: "Carrots", quantity: "2", unit: "lbs", category: "Produce", isCommonPantryItem: true },
      { name: "Honey", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Fresh Thyme", quantity: "4", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Goat Cheese Crumble", description: "Tangy crumbled goat cheese" },
    ],
  },
  {
    name: "Garlic Bread",
    description: "Classic crusty Italian bread slathered with garlic butter and broiled until golden.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 15, servings: 6, calories: 220,
    tags: ["side", "bread", "classic"],
    instructions: "1. Soften butter; mix with minced garlic, parsley, and a pinch of salt.\n2. Slice baguette in half lengthwise.\n3. Spread garlic butter generously over cut sides.\n4. Wrap in foil; bake at 375°F for 10 minutes.\n5. Open foil; broil 3–4 minutes until golden and crusty.",
    ingredients: [
      { name: "Baguette", quantity: "1", unit: "whole", category: "Bakery", isCommonPantryItem: false },
      { name: "Butter", quantity: "6", unit: "tbsp softened", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves minced", category: "Produce", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Marinara Dipping Sauce", description: "Simple tomato sauce for dipping" },
    ],
  },
  {
    name: "Creamed Spinach",
    description: "Rich, velvety spinach in a cream sauce with garlic and nutmeg — steakhouse classic.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 240,
    tags: ["side", "vegetable", "creamy"],
    instructions: "1. Blanch spinach in boiling water 30 seconds; squeeze completely dry.\n2. Make cream sauce: melt butter, cook garlic, add cream, reduce until thick.\n3. Add spinach; fold to coat.\n4. Season with nutmeg, salt, and pepper.\n5. Finish with Parmesan if desired.",
    ingredients: [
      { name: "Fresh Spinach", quantity: "2", unit: "lbs", category: "Produce", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "2", unit: "cloves minced", category: "Produce", isCommonPantryItem: true },
      { name: "Nutmeg", quantity: "1/4", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Bread", description: "For mopping up the sauce" },
    ],
  },
  {
    name: "Coleslaw",
    description: "Crisp, creamy shredded cabbage and carrot slaw — the essential BBQ and sandwich companion.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 15, servings: 8, calories: 160,
    tags: ["side", "salad", "bbq"],
    instructions: "1. Shred green and red cabbage; grate carrots.\n2. Toss vegetables with salt; let sit 10 minutes to draw out moisture.\n3. Squeeze out excess water.\n4. Make dressing: whisk mayonnaise, apple cider vinegar, sugar, celery seed, salt, and pepper.\n5. Toss slaw with dressing; refrigerate 1 hour before serving.",
    ingredients: [
      { name: "Green Cabbage", quantity: "1/2", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Red Cabbage", quantity: "1/4", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Carrots", quantity: "2", unit: "large grated", category: "Produce", isCommonPantryItem: true },
      { name: "Mayonnaise", quantity: "1/2", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Apple Cider Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sugar", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "BBQ Pulled Pork", description: "Classic pairing" },
    ],
  },
  {
    name: "Mac and Cheese",
    description: "Ultra-creamy baked macaroni in a sharp cheddar and Gruyère béchamel, topped with a golden breadcrumb crust.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 45, servings: 8, calories: 490,
    tags: ["side", "pasta", "comfort"],
    instructions: "1. Cook macaroni al dente; drain.\n2. Make béchamel: melt butter, whisk in flour, gradually add warm milk until smooth and thick.\n3. Remove from heat; add shredded cheddar and Gruyère; stir until melted.\n4. Season with mustard powder, hot sauce, nutmeg, salt.\n5. Combine with pasta; pour in baking dish.\n6. Top with panko mixed with butter; bake at 375°F for 25 minutes until golden.",
    ingredients: [
      { name: "Elbow Macaroni", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Sharp Cheddar", quantity: "2", unit: "cups shredded", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Whole Milk", quantity: "3", unit: "cups", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "All-Purpose Flour", quantity: "3", unit: "tbsp", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Panko Breadcrumbs", quantity: "1/2", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Baked Beans", description: "Smoky sweet baked beans" },
      { name: "Pulled Pork", description: "BBQ pulled pork pairing" },
    ],
  },
  {
    name: "Roasted Brussels Sprouts with Bacon",
    description: "Caramelized Brussels sprouts roasted with crispy bacon and a balsamic glaze.",
    cuisine: "Side Dishes", protein: "Pork", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 210,
    tags: ["side", "vegetable", "roasted"],
    instructions: "1. Halve Brussels sprouts; toss with olive oil, salt, and pepper.\n2. Scatter bacon lardons over the pan.\n3. Roast at 425°F for 20–25 minutes, tossing once, until sprouts are crispy and bacon is cooked.\n4. Drizzle with balsamic glaze; toss briefly.\n5. Taste for salt; serve hot.",
    ingredients: [
      { name: "Brussels Sprouts", quantity: "1.5", unit: "lbs", category: "Produce", isCommonPantryItem: false },
      { name: "Bacon", quantity: "4", unit: "slices diced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Balsamic Glaze", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Roasted Chicken", description: "Perfect alongside roast chicken" },
    ],
  },
  {
    name: "Corn on the Cob with Herb Butter",
    description: "Sweet summer corn cooked in boiling water and slathered with herb compound butter.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 15, servings: 4, calories: 200,
    tags: ["side", "corn", "summer"],
    instructions: "1. Bring large pot of water to boil; add a tablespoon of sugar.\n2. Husk corn; cook 5–8 minutes until tender.\n3. Make herb butter: mix softened butter with fresh chives, parsley, garlic, and sea salt.\n4. Roll hot corn in herb butter until coated.\n5. Sprinkle with flaky salt and serve immediately.",
    ingredients: [
      { name: "Corn on the Cob", quantity: "4", unit: "ears", category: "Produce", isCommonPantryItem: false },
      { name: "Butter", quantity: "4", unit: "tbsp softened", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Fresh Chives", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "1", unit: "clove minced", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "BBQ Ribs", description: "Classic BBQ pairing" },
    ],
  },
  // ===== OTHER =====
  {
    name: "Vietnamese Pho",
    description: "Clear, fragrant Vietnamese beef noodle soup with star anise-spiced bone broth and fresh herbs.",
    cuisine: "Other", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 180, servings: 6, calories: 420,
    tags: ["vietnamese", "soup", "noodles"],
    instructions: "1. Char onion and ginger over flame; rinse.\n2. Simmer beef bones and oxtail in water with charred aromatics, star anise, cinnamon, cloves, cardamom, and coriander for 3 hours.\n3. Strain broth; season with fish sauce and sugar.\n4. Cook rice noodles per package; rinse.\n5. Slice raw beef paper-thin.\n6. Bowl noodles; ladle boiling broth over raw beef to cook it.\n7. Serve with beansprouts, basil, lime, hoisin, and sriracha on side.",
    ingredients: [
      { name: "Beef Bones", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Beef Brisket or Flank", quantity: "12", unit: "oz thinly sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Rice Noodles", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Star Anise", quantity: "5", unit: "whole", category: "Pantry", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Bean Sprouts", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Fresh Thai Basil", description: "Herb for garnish" },
      { name: "Hoisin and Sriracha", description: "Table condiments" },
    ],
  },
  {
    name: "Ethiopian Injera with Doro Wat",
    description: "Tangy sourdough flatbread served with slow-cooked chicken in a rich berbere spice stew.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 90, servings: 6, calories: 510,
    tags: ["ethiopian", "stew", "spicy"],
    instructions: "1. Caramelize onions in butter (niter kibbeh) for 20 minutes.\n2. Add berbere spice blend; cook 5 minutes.\n3. Add chicken legs; braise in chicken stock and tomato paste 45 minutes.\n4. Add hard-boiled eggs; simmer 10 more minutes.\n5. Serve on injera flatbread with lentils and yogurt.",
    ingredients: [
      { name: "Chicken Legs", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Berbere Spice Blend", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Injera Bread", quantity: "4", unit: "rounds", category: "Bakery", isCommonPantryItem: false },
      { name: "Onions", quantity: "3", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Eggs", quantity: "4", unit: "hard-boiled", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Misir Wat", description: "Spiced red lentils" },
      { name: "Ayib", description: "Ethiopian cottage cheese" },
    ],
  },
  {
    name: "Peruvian Lomo Saltado",
    description: "Sizzling Peruvian stir-fry of beef, tomatoes, and peppers, served with fries and rice.",
    cuisine: "Other", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 580,
    tags: ["peruvian", "stir-fry", "fusion"],
    instructions: "1. Slice beef sirloin into thick strips; season with cumin, salt, and pepper.\n2. Stir-fry beef in very hot wok in batches until charred; set aside.\n3. Stir-fry onion and aji amarillo (or yellow pepper) briefly.\n4. Add tomato wedges; stir just to wilt.\n5. Return beef; add soy sauce, oyster sauce, red wine vinegar, and cilantro.\n6. Serve over steamed rice with French fries tucked alongside.",
    ingredients: [
      { name: "Beef Sirloin", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "2", unit: "large wedged", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Red Wine Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "French Fries", description: "Crispy fries to mix into the dish" },
      { name: "Aji Sauce", description: "Spicy yellow pepper sauce" },
    ],
  },
  {
    name: "Brazilian Feijoada",
    description: "Brazil's national dish — a hearty black bean and pork stew with smoked sausage and ribs.",
    cuisine: "Other", protein: "Pork", isGlutenFree: true, cookTimeMinutes: 150, servings: 8, calories: 650,
    tags: ["brazilian", "stew", "beans"],
    instructions: "1. Soak dried black beans overnight; drain.\n2. Brown chorizo, pork ribs, and bacon in pot.\n3. Sauté onions and garlic; add beans, pork, and water to cover.\n4. Add bay leaves and cumin; simmer 2 hours until beans are creamy.\n5. Adjust seasoning; serve with white rice, collard greens, and farofa.",
    ingredients: [
      { name: "Dried Black Beans", quantity: "1.5", unit: "lbs", category: "Pantry", isCommonPantryItem: false },
      { name: "Chorizo", quantity: "8", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Pork Spare Ribs", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Bacon", quantity: "4", unit: "slices", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Onion", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "White Rice", description: "Fluffy white rice" },
      { name: "Collard Greens", description: "Sautéed collard greens with garlic" },
    ],
  },
  {
    name: "Moroccan Chicken Tagine",
    description: "Slow-braised Moroccan chicken with preserved lemon, olives, and warming ras el hanout spices.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 80, servings: 6, calories: 470,
    tags: ["moroccan", "tagine", "braised"],
    instructions: "1. Marinate chicken with ras el hanout, garlic, ginger, turmeric, and olive oil overnight.\n2. Sear chicken in Dutch oven until golden.\n3. Add onion, saffron, preserved lemon, and green olives.\n4. Add stock; braise covered at 325°F for 60 minutes.\n5. Adjust seasoning; garnish with fresh cilantro and parsley.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ras El Hanout", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Preserved Lemons", quantity: "2", unit: "quarters", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Green Olives", quantity: "1/2", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Saffron", quantity: "1/2", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Onion", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Couscous", description: "Fluffy steamed semolina couscous" },
      { name: "Harissa", description: "Spicy North African chili paste" },
    ],
  },
  {
    name: "Jamaican Jerk Fish",
    description: "Fiery jerk-spiced grilled fish — bold, smoky, and unmistakably Caribbean.",
    cuisine: "Other", protein: "Fish", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 350,
    tags: ["jamaican", "spicy", "grilled"],
    instructions: "1. Blend jerk marinade: Scotch bonnet peppers, allspice, thyme, garlic, ginger, soy sauce, brown sugar, and lime juice.\n2. Score fish deeply; rub marinade all over and into cuts.\n3. Marinate at least 2 hours.\n4. Grill over high heat 5–6 minutes per side until charred and cooked through.\n5. Serve with festival (fried dumplings) and rice and peas.",
    ingredients: [
      { name: "Whole Snapper or Mahi-Mahi", quantity: "2", unit: "whole fish", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Scotch Bonnet Pepper", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Allspice Berries", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "4", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Rice and Peas", description: "Coconut rice with kidney beans" },
      { name: "Fried Plantains", description: "Sweet caramelized plantain slices" },
    ],
  },
  {
    name: "Spanish Paella",
    description: "Iconic Valencian rice dish with saffron-stained rice, chicken, rabbit, and vegetables.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 60, servings: 6, calories: 540,
    tags: ["spanish", "rice", "seafood"],
    instructions: "1. Sauté chicken and chorizo in paella pan with olive oil.\n2. Add sofrito: grated tomato, onion, garlic, and peppers.\n3. Add rice; stir briefly.\n4. Pour in hot saffron-infused stock (2x rice volume).\n5. Distribute evenly; do NOT stir from this point.\n6. Cook over high heat 10 minutes, then lower for 8 minutes.\n7. Rest 5 minutes; form socarrat (crispy bottom) on high heat at end.",
    ingredients: [
      { name: "Bomba or Short-Grain Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Chicken Thighs", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Saffron", quantity: "1/4", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Chicken Stock", quantity: "4", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "2", unit: "whole grated", category: "Produce", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Alioli", description: "Spanish garlic mayonnaise" },
      { name: "Crusty Bread", description: "Rustic bread to soak up juices" },
    ],
  },
  {
    name: "Turkish Adana Kebab",
    description: "Hand-minced spiced lamb and beef kebabs pressed onto flat skewers and grilled over charcoal.",
    cuisine: "Other", protein: "Lamb", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 490,
    tags: ["turkish", "kebab", "grilled"],
    instructions: "1. Hand-chop lamb and beef together with tail fat until sticky paste forms.\n2. Mix in onion, garlic, chili flakes, cumin, sumac, parsley, and salt.\n3. Knead vigorously; refrigerate 1 hour.\n4. Mold around wide flat skewers; press firmly in elongated shape.\n5. Grill over charcoal 3–4 minutes per side until charred.\n6. Serve with flatbread, sumac onions, and roasted peppers.",
    ingredients: [
      { name: "Ground Lamb", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ground Beef", quantity: "1/2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sumac", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Red Chili Flakes", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Flatbread", quantity: "4", unit: "pieces", category: "Bakery", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Sumac Onions", description: "Thinly sliced onions with sumac and parsley" },
      { name: "Cacik", description: "Turkish yogurt with cucumber and mint" },
    ],
  },
  {
    name: "Filipino Adobo",
    description: "Braised chicken or pork in a tart, garlicky soy-vinegar sauce — the unofficial national dish of the Philippines.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 60, servings: 4, calories: 490,
    tags: ["filipino", "braised", "tangy"],
    instructions: "1. Combine chicken with soy sauce, white vinegar, garlic, bay leaves, and black pepper.\n2. Marinate 30 minutes; bring to boil in the marinade.\n3. Reduce heat; simmer covered 30 minutes.\n4. Uncover and simmer 15 more minutes until sauce reduces and coats chicken.\n5. Serve with steamed rice and sliced cucumber.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "White Vinegar", quantity: "1/3", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "8", unit: "cloves crushed", category: "Produce", isCommonPantryItem: true },
      { name: "Bay Leaves", quantity: "3", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Black Peppercorns", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Jasmine Rice", description: "Plain white rice to soak up sauce" },
      { name: "Pickled Papaya", description: "Atchara — sweet pickled green papaya" },
    ],
  },
];

async function main() {
  console.log("Seeding meals database (batch 2)…");

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
