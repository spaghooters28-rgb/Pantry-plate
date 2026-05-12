import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";

interface IngredientData { name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean; }
interface SideData { name: string; description: string; }
interface MealData { name: string; description: string; cuisine: string; protein: string; isGlutenFree: boolean; cookTimeMinutes: number; servings: number; calories: number; tags: string[]; instructions: string; ingredients: IngredientData[]; sides: SideData[]; }

const meals: MealData[] = [
  // ===== GREEK (1 more) =====
  {
    name: "Pastitsio",
    description: "Greek baked pasta layered with spiced beef ragù and a thick béchamel — the Greek lasagna.",
    cuisine: "Greek", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 90, servings: 8, calories: 570,
    tags: ["greek", "baked", "pasta"],
    instructions: "1. Cook penne or bucatini; mix with egg whites and Parmesan.\n2. Make meat sauce: brown beef with onion, tomatoes, cinnamon, allspice, and oregano.\n3. Make thick béchamel: butter, flour, warm milk, egg yolks, and nutmeg.\n4. Layer: pasta, meat sauce, more pasta, then béchamel.\n5. Bake at 375°F for 45 minutes until top is golden. Rest 15 minutes before cutting.",
    ingredients: [
      { name: "Penne or Bucatini", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Ground Beef", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Whole Milk", quantity: "4", unit: "cups for béchamel", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Butter", quantity: "6", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Parmesan", quantity: "1/2", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
    ],
    sides: [{ name: "Greek Salad", description: "Village salad" }, { name: "Crusty Bread", description: "Rustic bread" }],
  },
  // ===== INDIAN (1 more) =====
  {
    name: "Saag Aloo",
    description: "Wilted spinach and tender potatoes cooked with ginger, garlic, and earthy Indian spices.",
    cuisine: "Indian", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 30, servings: 4, calories: 280,
    tags: ["indian", "vegetarian", "spinach"],
    instructions: "1. Boil potato cubes until just tender; drain.\n2. Heat oil; bloom cumin and mustard seeds.\n3. Add ginger, garlic, green chili, and onion; cook 5 minutes.\n4. Add potatoes; coat in spices and lightly crisp.\n5. Wilt in fresh spinach with turmeric, coriander, and garam masala. Season with salt.",
    ingredients: [
      { name: "Fresh Spinach", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Potatoes", quantity: "3", unit: "medium cubed", category: "Produce", isCommonPantryItem: true },
      { name: "Cumin Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Fresh Ginger", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [{ name: "Roti", description: "Whole wheat flatbread" }, { name: "Dal", description: "Yellow lentil soup" }],
  },
  // ===== ITALIAN (1 more) =====
  {
    name: "Cacio e Pepe",
    description: "Roman pasta of spaghetti in a glossy sauce of Pecorino Romano and cracked black pepper.",
    cuisine: "Italian", protein: "Vegetarian", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 510,
    tags: ["italian", "pasta", "roman"],
    instructions: "1. Cook spaghetti in well-salted water; reserve 1.5 cups pasta water.\n2. Toast cracked black pepper in dry pan 30 seconds.\n3. Add a ladleful of pasta water; simmer.\n4. Add drained pasta; toss over medium heat.\n5. Off heat, add grated Pecorino and Parmesan; toss vigorously with splashes of water until glossy.",
    ingredients: [
      { name: "Spaghetti", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Pecorino Romano", quantity: "1.5", unit: "cups finely grated", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Parmesan", quantity: "1/2", unit: "cup finely grated", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Black Pepper", quantity: "2", unit: "tsp coarsely cracked", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [{ name: "Arugula Salad", description: "Peppery green salad" }, { name: "Garlic Bread", description: "Crusty bread" }],
  },
  // ===== JAPANESE (1 more) =====
  {
    name: "Oyakodon (Chicken and Egg Bowl)",
    description: "Tender chicken and softly set egg simmered in sweet dashi sauce over steamed rice.",
    cuisine: "Japanese", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 15, servings: 4, calories: 480,
    tags: ["japanese", "rice bowl", "quick"],
    instructions: "1. Simmer dashi, soy sauce, mirin, and sugar in a wide pan.\n2. Add sliced onion; cook 2 minutes.\n3. Add thin-sliced chicken thighs; simmer 4 minutes until just cooked.\n4. Beat eggs lightly (yolks and whites barely mixed); pour over chicken.\n5. Cover 30 seconds until egg is barely set — custardy. Slide over rice; garnish with green onion.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "1", unit: "lb thin-sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Eggs", quantity: "6", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Dashi Stock", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Mirin", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Short-Grain Rice", quantity: "3", unit: "cups cooked", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [{ name: "Miso Soup", description: "Light miso broth" }, { name: "Pickled Ginger", description: "Gari ginger" }],
  },
  // ===== KOREAN (2 more) =====
  {
    name: "Sundubu Jjigae (Soft Tofu Stew)",
    description: "Silky, spicy Korean soft tofu stew in anchovy broth with pork, mushrooms, and a raw egg cracked in.",
    cuisine: "Korean", protein: "Tofu", isGlutenFree: true, cookTimeMinutes: 20, servings: 2, calories: 290,
    tags: ["korean", "stew", "spicy"],
    instructions: "1. Stir-fry pork and gochugaru in sesame oil until fragrant.\n2. Add anchovy stock; bring to boil.\n3. Add soft tofu in large spoonfuls; simmer gently 5 minutes.\n4. Add mushrooms, zucchini, and green onion.\n5. Crack a raw egg into center; cover 30 seconds. Serve immediately in hot stone bowl.",
    ingredients: [
      { name: "Soft Tofu (Sundubu)", quantity: "2", unit: "tubes", category: "Pantry", isCommonPantryItem: false },
      { name: "Ground Pork", quantity: "4", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Gochugaru", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Anchovy Stock", quantity: "2", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [{ name: "Steamed Rice", description: "Short-grain rice" }, { name: "Kimchi", description: "Fermented cabbage" }],
  },
  {
    name: "Korean Dakgangjeong (Crispy Fried Chicken)",
    description: "Double-fried chicken wings glazed in a sweet, spicy gochujang sauce with sesame and peanuts.",
    cuisine: "Korean", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 40, servings: 4, calories: 560,
    tags: ["korean", "fried-chicken", "sweet-spicy"],
    instructions: "1. Marinate chicken wings in soy sauce, garlic, and ginger.\n2. Coat in potato starch; first fry at 325°F for 6 minutes.\n3. Rest 5 minutes; second fry at 375°F for 3 minutes until very crispy.\n4. Make sauce: gochujang, soy, honey, garlic, rice vinegar; simmer until thick.\n5. Toss hot chicken in sauce; sprinkle sesame seeds and peanuts.",
    ingredients: [
      { name: "Chicken Wings", quantity: "2.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Potato Starch", quantity: "3/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Gochujang", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Honey", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [{ name: "Pickled Daikon", description: "Yellow pickled radish" }, { name: "Korean Beer", description: "Hite or Cass beer" }],
  },
  // ===== MEXICAN (1 more) =====
  {
    name: "Sopa de Lima",
    description: "Yucatán's bright, citrusy shredded chicken soup with fried tortilla strips and lime.",
    cuisine: "Mexican", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 45, servings: 6, calories: 320,
    tags: ["mexican", "yucatan", "soup"],
    instructions: "1. Simmer chicken breasts in broth with onion, garlic, and herbs; shred.\n2. Fry habanero, tomato, and onion until charred; blend into broth.\n3. Return shredded chicken to broth; add sliced limas (or lime slices).\n4. Season with salt; simmer 10 minutes.\n5. Serve with crispy fried tortilla strips and extra lime wedges.",
    ingredients: [
      { name: "Chicken Breast", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chicken Stock", quantity: "8", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Limes", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "6", unit: "for strips", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Habanero Pepper", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [{ name: "Avocado Slices", description: "Fresh avocado" }, { name: "Warm Tortillas", description: "Soft corn tortillas" }],
  },
  // ===== MIDDLE EASTERN (3 more) =====
  {
    name: "Turkish Adana Kebab",
    description: "Hand-minced spiced lamb shaped around flat skewers and grilled over charcoal.",
    cuisine: "Middle Eastern", protein: "Lamb", isGlutenFree: false, cookTimeMinutes: 25, servings: 4, calories: 490,
    tags: ["middle-eastern", "turkish", "kebab"],
    instructions: "1. Hand-chop or grind lamb shoulder with lamb tail fat.\n2. Mix with red pepper flakes, cumin, coriander, garlic, and salt.\n3. Knead vigorously 10 minutes; refrigerate 1 hour.\n4. Mold around flat metal skewers into long sausage shapes.\n5. Grill over high charcoal heat 10–12 minutes, turning carefully.",
    ingredients: [
      { name: "Ground Lamb", quantity: "2", unit: "lbs shoulder", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Red Pepper Flakes", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sumac", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Flatbread", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
    ],
    sides: [{ name: "Shepherd's Salad", description: "Turkish coban salatasi" }, { name: "Ayran", description: "Salted yogurt drink" }],
  },
  {
    name: "Middle Eastern Shakshuka with Feta",
    description: "Spiced tomato and pepper sauce with eggs poached directly in the pan, finished with feta.",
    cuisine: "Middle Eastern", protein: "Eggs", isGlutenFree: true, cookTimeMinutes: 25, servings: 4, calories: 300,
    tags: ["middle-eastern", "eggs", "breakfast"],
    instructions: "1. Sauté onion and peppers in olive oil until soft.\n2. Add garlic, cumin, paprika, and harissa; cook 1 minute.\n3. Add crushed tomatoes; simmer 10 minutes until slightly thick.\n4. Make wells; crack in eggs. Cover and cook 5–7 minutes until whites set, yolks runny.\n5. Crumble feta over; garnish with parsley and chili flakes.",
    ingredients: [
      { name: "Eggs", quantity: "6", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "3", unit: "oz crumbled", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "whole diced", category: "Produce", isCommonPantryItem: false },
      { name: "Harissa Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "medium diced", category: "Produce", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: true },
    ],
    sides: [{ name: "Pita Bread", description: "Warm pita for dipping" }, { name: "Labneh", description: "Strained yogurt" }],
  },
  {
    name: "Persian Koofteh (Rice-Stuffed Meatballs)",
    description: "Giant Iranian herb meatballs stuffed with walnuts, prunes, and raisins in a saffron broth.",
    cuisine: "Middle Eastern", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 90, servings: 4, calories: 530,
    tags: ["middle-eastern", "persian", "meatballs"],
    instructions: "1. Mix ground beef with cooked rice, herbs (parsley, tarragon, chives), eggs, and turmeric.\n2. Place walnut, prune, and raisin inside each large ball.\n3. Make broth: sauté onion with saffron, tomato paste, and stock.\n4. Gently lower meatballs into simmering broth.\n5. Cook covered on very low heat 45 minutes — don't stir.",
    ingredients: [
      { name: "Ground Beef", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cooked Short-Grain Rice", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Walnuts", quantity: "1/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Prunes", quantity: "1/4", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Saffron", quantity: "1/4", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Herbs (Parsley, Tarragon)", quantity: "1", unit: "cup chopped", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [{ name: "Persian Rice", description: "Basmati with tahdig" }, { name: "Torshi", description: "Persian pickled vegetables" }],
  },
  // ===== OTHER (2 more) =====
  {
    name: "Moroccan Chicken Bastilla",
    description: "Crispy Moroccan filo pie with shredded chicken, almonds, and eggs — sweet-savory and spectacular.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: false, cookTimeMinutes: 75, servings: 8, calories: 520,
    tags: ["moroccan", "pastry", "festive"],
    instructions: "1. Poach chicken with onion, ginger, saffron, and cinnamon; shred meat.\n2. Cook shredded chicken with eggs scrambled in the saffron broth.\n3. Grind almonds with powdered sugar and cinnamon.\n4. Layer buttered filo sheets; add chicken layer, then almond layer.\n5. Close filo; bake at 375°F 30 minutes. Dust with powdered sugar and cinnamon.",
    ingredients: [
      { name: "Whole Chicken", quantity: "1", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Filo Pastry Sheets", quantity: "12", unit: "sheets", category: "Frozen", isCommonPantryItem: false },
      { name: "Almonds", quantity: "1.5", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Powdered Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Saffron", quantity: "1/4", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Ginger", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [{ name: "Harira Soup", description: "Moroccan tomato lentil soup" }, { name: "Moroccan Mint Tea", description: "Sweet green tea with mint" }],
  },
  {
    name: "Ethiopian Doro Wat",
    description: "Slow-simmered Ethiopian chicken stew in a deep, complex berbere spice sauce with hard-boiled eggs.",
    cuisine: "Other", protein: "Chicken", isGlutenFree: true, cookTimeMinutes: 120, servings: 6, calories: 480,
    tags: ["ethiopian", "stew", "spiced"],
    instructions: "1. Slow-cook diced onions in niter kibbeh (spiced butter) without water for 45 minutes.\n2. Add berbere spice paste and tomato paste; cook 10 minutes.\n3. Add chicken pieces; coat in sauce.\n4. Add stock and hard-boiled scored eggs; simmer 30 minutes.\n5. Serve over spongy injera bread.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "2", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Berbere Spice Blend", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Onions", quantity: "4", unit: "large", category: "Produce", isCommonPantryItem: true },
      { name: "Eggs", quantity: "4", unit: "hard-boiled scored", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Niter Kibbeh or Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Tomato Paste", quantity: "2", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
    ],
    sides: [{ name: "Injera", description: "Spongy Ethiopian flatbread" }, { name: "Lentil Stew", description: "Misir Wat red lentils" }],
  },
  // ===== SIDE DISHES (1 more) =====
  {
    name: "Creamed Spinach",
    description: "Rich, velvety steakhouse-style creamed spinach with Parmesan and a hint of nutmeg.",
    cuisine: "Side Dishes", protein: "Vegetarian", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 210,
    tags: ["side", "spinach", "steakhouse"],
    instructions: "1. Blanch spinach briefly; squeeze very dry and chop.\n2. Make béchamel: melt butter, whisk in flour, then warm cream.\n3. Season with nutmeg, salt, and pepper.\n4. Fold in spinach and Parmesan.\n5. Simmer 3 minutes until thickened; taste for seasoning.",
    ingredients: [
      { name: "Fresh Spinach", quantity: "2", unit: "lbs", category: "Produce", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "3/4", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Parmesan", quantity: "1/3", unit: "cup grated", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Nutmeg", quantity: "1/4", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "All-Purpose Flour", quantity: "1", unit: "tbsp", category: "Grains & Bread", isCommonPantryItem: true },
    ],
    sides: [{ name: "Grilled Steak", description: "Classic steakhouse pairing" }, { name: "Baked Potato", description: "Loaded baked potato" }],
  },
  // ===== THAI (5 more) =====
  {
    name: "Massaman Curry",
    description: "Mild, rich Thai-Muslim curry with beef, potatoes, and peanuts in a coconut-spice sauce.",
    cuisine: "Thai", protein: "Beef", isGlutenFree: true, cookTimeMinutes: 90, servings: 6, calories: 560,
    tags: ["thai", "curry", "mild"],
    instructions: "1. Fry massaman curry paste in coconut cream until oils separate.\n2. Brown beef cubes; add coconut milk and beef stock.\n3. Add potatoes, onion, and fish sauce.\n4. Simmer covered 1 hour until beef is very tender.\n5. Stir in peanuts, tamarind, and palm sugar. Garnish with crispy shallots.",
    ingredients: [
      { name: "Beef Chuck", quantity: "2", unit: "lbs cubed", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Massaman Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "2", unit: "cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Potatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: true },
      { name: "Roasted Peanuts", quantity: "1/3", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [{ name: "Jasmine Rice", description: "Steamed Thai rice" }, { name: "Roti Canai", description: "Malaysian flaky flatbread" }],
  },
  {
    name: "Thai Pork Larb",
    description: "Thai minced pork salad tossed with toasted rice powder, herbs, lime, and fish sauce.",
    cuisine: "Thai", protein: "Pork", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 310,
    tags: ["thai", "salad", "northeast"],
    instructions: "1. Toast raw rice in dry pan until golden; grind coarsely in mortar.\n2. Cook minced pork in a dry pan until just cooked; cool slightly.\n3. Toss warm pork with fish sauce, lime juice, and chili flakes.\n4. Add shallots, fresh mint, cilantro, and toasted rice powder.\n5. Serve immediately at room temperature with sticky rice.",
    ingredients: [
      { name: "Ground Pork", quantity: "1.5", unit: "lbs", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Mint", quantity: "1/2", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "3", unit: "thinly sliced", category: "Produce", isCommonPantryItem: false },
      { name: "Long-Grain Rice", quantity: "2", unit: "tbsp for powder", category: "Grains & Bread", isCommonPantryItem: true },
    ],
    sides: [{ name: "Sticky Rice", description: "Thai glutinous rice" }, { name: "Raw Cabbage Wedge", description: "Fresh cabbage for scooping" }],
  },
  {
    name: "Pad See Ew",
    description: "Broad rice noodles stir-fried with beef, Chinese broccoli, and dark sweet soy sauce.",
    cuisine: "Thai", protein: "Beef", isGlutenFree: false, cookTimeMinutes: 20, servings: 4, calories: 490,
    tags: ["thai", "noodles", "stir-fry"],
    instructions: "1. Soak wide rice noodles until pliable; drain.\n2. Stir-fry beef strips over very high heat; set aside.\n3. Fry garlic; add noodles — press against hot wok to char slightly.\n4. Season with dark soy, oyster sauce, and sugar.\n5. Add Chinese broccoli; scramble an egg through. Return beef; toss.",
    ingredients: [
      { name: "Wide Rice Noodles", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Beef Sirloin", quantity: "1", unit: "lb sliced", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chinese Broccoli (Gai Lan)", quantity: "1", unit: "bunch", category: "Produce", isCommonPantryItem: false },
      { name: "Dark Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Oyster Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [{ name: "Nam Prik", description: "Thai chili condiments" }, { name: "Cucumber Slices", description: "Fresh cucumber" }],
  },
  {
    name: "Tom Yum Goong",
    description: "Thailand's iconic hot-and-sour shrimp soup with lemongrass, galangal, and kaffir lime.",
    cuisine: "Thai", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 220,
    tags: ["thai", "soup", "spicy-sour"],
    instructions: "1. Bring stock to boil with lemongrass, galangal, kaffir lime leaves, and chilies.\n2. Add mushrooms; simmer 3 minutes.\n3. Add shrimp; cook 2–3 minutes until pink.\n4. Season with fish sauce and lime juice — should be sharply sour and spicy.\n5. Stir in a spoon of chili paste (nam prik pao); garnish with cilantro.",
    ingredients: [
      { name: "Large Shrimp", quantity: "1", unit: "lb peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Galangal", quantity: "1.5", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "8", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [{ name: "Jasmine Rice", description: "Steamed rice" }, { name: "Thai Spring Rolls", description: "Crispy appetizer" }],
  },
  {
    name: "Thai Coconut Shrimp Soup (Tom Kha Gung)",
    description: "Creamy coconut milk soup with shrimp, mushrooms, and the fragrant trio of galangal, lemongrass, and lime leaf.",
    cuisine: "Thai", protein: "Shrimp", isGlutenFree: true, cookTimeMinutes: 20, servings: 4, calories: 340,
    tags: ["thai", "soup", "coconut"],
    instructions: "1. Simmer coconut milk with stock, lemongrass, galangal, and lime leaves.\n2. Add mushrooms; cook 3 minutes.\n3. Add shrimp; cook until just pink, 2–3 minutes.\n4. Season with fish sauce, lime juice, and palm sugar.\n5. Taste — should balance creamy, sour, and salty. Garnish with chili and cilantro.",
    ingredients: [
      { name: "Shrimp", quantity: "1", unit: "lb peeled", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "2", unit: "cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Galangal", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "6", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [{ name: "Jasmine Rice", description: "Thai rice" }, { name: "Thai Chili Sauce", description: "Extra chili on side" }],
  },
];

async function main() {
  console.log("Seeding meals database (batch 4 — top-up)…");

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
