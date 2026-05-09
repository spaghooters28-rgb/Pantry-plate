// Seed ingredients + instructions for Indian, Italian, Mediterranean & Mexican meals
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

interface Ing { name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean; }
interface Side { name: string; description: string; }
interface Patch { id: number; instructions: string; ingredients: Ing[]; sides?: Side[]; }

const patches: Patch[] = [
  // ── INDIAN ───────────────────────────────────────────────────────────────────
  {
    id: 19, // Chicken Tikka (Grilled)
    instructions: "1. Mix yogurt, lemon juice, ginger-garlic paste, cumin, coriander, garam masala, turmeric, Kashmiri chili powder, and salt into a marinade.\n2. Score chicken pieces and coat thoroughly in marinade. Refrigerate at least 4 hours or overnight.\n3. Thread onto skewers. Grill over high heat 5–6 minutes per side until lightly charred and cooked through to 165°F.\n4. Brush with melted butter and cook 1 minute more.\n5. Serve hot with sliced onion, lemon wedges, and green chutney.",
    ingredients: [
      { name: "Boneless Chicken Thighs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Plain Yogurt", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Ginger-Garlic Paste", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Kashmiri Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Green Chutney", description: "Blended cilantro, mint, and green chili dipping sauce" },
      { name: "Butter Naan", description: "Soft grilled flatbread" },
    ],
  },
  {
    id: 20, // Mango Chicken Curry
    instructions: "1. Heat oil in a heavy pot. Sauté onion until golden, about 8 minutes. Add ginger and garlic; cook 2 minutes.\n2. Add cumin, coriander, turmeric, and garam masala; stir-fry 1 minute.\n3. Add chicken pieces and cook 5 minutes until lightly browned.\n4. Add tomato paste and mango purée; stir well.\n5. Pour in coconut milk; simmer uncovered 20–25 minutes until chicken is cooked and sauce is slightly thickened.\n6. Season with salt and garnish with cilantro. Serve with basmati rice.",
    ingredients: [
      { name: "Boneless Chicken Thighs", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ripe Mango Purée", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato Paste", quantity: "2", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Basmati Rice", description: "Fluffy long-grain basmati rice" },
      { name: "Garlic Naan", description: "Buttered garlic flatbread" },
    ],
  },
  {
    id: 43, // Beef and Vegetable Curry
    instructions: "1. Sear beef chunks in hot oil until browned on all sides. Remove and set aside.\n2. In the same pot, sauté onion 7 minutes until golden. Add ginger, garlic, and curry powder; cook 2 minutes.\n3. Add diced tomatoes and stir well. Return beef to the pot.\n4. Add beef broth and potatoes; bring to a boil.\n5. Reduce heat, cover, and simmer 45–50 minutes until beef is tender.\n6. Add carrots and peas for the last 10 minutes. Season with garam masala, salt, and pepper.",
    ingredients: [
      { name: "Beef Chuck (cubed)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Curry Powder", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Diced Tomatoes (canned)", quantity: "14", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Beef Broth", quantity: "1.5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Potatoes", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Carrots", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Frozen Peas", quantity: "½", unit: "cup", category: "Frozen", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Basmati Rice", description: "Fluffy steamed basmati" },
      { name: "Raita", description: "Cooling yogurt and cucumber sauce" },
    ],
  },
  {
    id: 47, // Nihari (Slow-Cooked Beef Stew)
    instructions: "1. Make nihari masala: dry-roast fennel seeds, coriander, cumin, cardamom, cloves, cinnamon, and black pepper; grind to a powder. Mix with chili powder and ginger powder.\n2. Brown beef shanks in oil in a large pot. Add onions and cook until golden.\n3. Add ginger-garlic paste and nihari masala; stir-fry 2 minutes.\n4. Add water to cover and bring to a boil. Skim foam.\n5. Cover tightly and simmer on very low heat 3–4 hours until beef is falling off the bone.\n6. Mix flour with a little water to a slurry; stir in to thicken. Cook 15 more minutes. Top with fried onions, ginger, lemon, and cilantro.",
    ingredients: [
      { name: "Beef Shanks", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Ginger-Garlic Paste", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fennel Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cardamom Pods", quantity: "4", unit: "whole", category: "Pantry", isCommonPantryItem: false },
      { name: "Kashmiri Chili Powder", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Whole Wheat Flour", quantity: "2", unit: "tbsp", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Naan or Tandoori Roti", description: "Soft flatbread for dipping" },
      { name: "Fried Onions", description: "Crispy golden onion strands for garnish" },
    ],
  },
  {
    id: 63, // Kerala Fish Curry
    instructions: "1. Toast coconut oil in a pan. Fry mustard seeds and curry leaves until they splutter.\n2. Add shallots and cook until golden. Add ginger and garlic; cook 2 minutes.\n3. Add red chili powder, coriander, and turmeric; stir 1 minute.\n4. Pour in coconut milk and add Kodampuli (Gamboge/dried tamarind). Simmer 5 minutes.\n5. Slide in fish pieces; cook gently 8–10 minutes until fish is cooked and sauce is rich.\n6. Season with salt. Serve with steamed rice.",
    ingredients: [
      { name: "Firm Fish (King Fish or Mackerel), sliced", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Shallots", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Kodampuli (Tamarind Pods)", quantity: "3", unit: "pieces", category: "Pantry", isCommonPantryItem: false },
      { name: "Red Chili Powder", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Curry Leaves", quantity: "10", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Mustard Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Coconut Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Kerala Rice", description: "Red parboiled rice or white rice" },
      { name: "Papadam", description: "Crispy lentil wafers" },
    ],
  },
  {
    id: 68, // Goan Fish Curry
    instructions: "1. Blend dried red chilies, cumin, coriander, turmeric, garlic, ginger, tamarind paste, and a splash of water into a smooth spice paste.\n2. Heat oil in a pan; fry the spice paste 3 minutes until fragrant and oil separates.\n3. Add onion and cook until translucent.\n4. Add coconut milk and ½ cup water; simmer 5 minutes.\n5. Slide in fish chunks; cook gently 8–10 minutes.\n6. Season with salt and a squeeze of lime. Garnish with cilantro.",
    ingredients: [
      { name: "Firm Fish (Pomfret or Tilapia)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Dried Red Chilies", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Tamarind Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Basmati Rice", description: "Fluffy long-grain rice" },
      { name: "Pav (Indian Dinner Rolls)", description: "Soft dinner rolls for mopping up the curry" },
    ],
  },
  {
    id: 71, // Coconut Shrimp Curry
    instructions: "1. Heat oil in a pan over medium heat. Add onion; cook until golden. Add garlic and ginger; stir 1 minute.\n2. Add curry powder, cumin, and turmeric; fry 1 minute.\n3. Pour in coconut milk and tomato paste; stir well and bring to a simmer.\n4. Add shrimp; cook 4–5 minutes until pink and cooked through.\n5. Season with salt and lime juice.\n6. Garnish with cilantro and serve over basmati rice.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Curry Powder", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tomato Paste", quantity: "1", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
      { name: "Lime Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Basmati Rice", description: "Fluffy steamed basmati" },
      { name: "Naan", description: "Warm flatbread" },
    ],
  },
  {
    id: 81, // Indian Prawn Masala
    instructions: "1. Heat oil; fry onion until deep golden, about 10 minutes. Add ginger-garlic paste and cook 2 minutes.\n2. Add tomatoes, red chili powder, coriander, cumin, and turmeric. Cook 5–7 minutes until masala thickens and oil separates.\n3. Add prawns; cook 4–5 minutes until pink.\n4. Stir in garam masala and a splash of water if sauce is too thick.\n5. Garnish with cilantro and serve with rice or paratha.",
    ingredients: [
      { name: "Large Prawns (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Ginger-Garlic Paste", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Red Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garam Masala", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Basmati Rice", description: "Fluffy steamed basmati rice" },
      { name: "Lachha Paratha", description: "Flaky layered flatbread" },
    ],
  },
  {
    id: 91, // Pork Vindaloo
    instructions: "1. Blend dried red chilies, cumin, coriander, turmeric, mustard seeds, garlic, ginger, and vinegar into a smooth paste.\n2. Marinate pork in the paste at least 4 hours, preferably overnight.\n3. Heat oil in a heavy pot. Add onion; cook until dark golden.\n4. Add marinated pork and cook on high 5 minutes.\n5. Add a splash of water and tomatoes; bring to a boil. Reduce heat, cover, and simmer 40–50 minutes until pork is very tender.\n6. Adjust heat with extra vinegar and chili. Serve with steamed rice.",
    ingredients: [
      { name: "Pork Shoulder (cubed)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Dried Red Kashmiri Chilies", quantity: "8", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "White Wine Vinegar", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Mustard Seeds", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Basmati Rice", description: "Cooling rice to balance the heat" },
      { name: "Cucumber Raita", description: "Yogurt and cucumber cooling dip" },
    ],
  },
  {
    id: 95, // Saag Paneer
    instructions: "1. Blanch spinach in boiling water 1 minute; drain and blend to a smooth purée.\n2. Heat oil in a pan. Fry cumin seeds 30 seconds, then add onion and cook until golden.\n3. Add ginger and garlic; cook 1 minute. Add tomato and cook until soft.\n4. Add turmeric, coriander, and red chili powder; stir-fry 2 minutes.\n5. Add spinach purée and simmer 5 minutes. Stir in cream and garam masala.\n6. Fold in paneer cubes (pan-fried separately until golden). Simmer 2 minutes more.",
    ingredients: [
      { name: "Paneer", quantity: "14", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Fresh Spinach", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Cumin Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Chili Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Garlic Naan", description: "Soft garlic-buttered flatbread" },
      { name: "Basmati Rice", description: "Fluffy basmati" },
    ],
  },
  {
    id: 96, // Chana Masala
    instructions: "1. Heat oil in a pot. Add cumin seeds; let splutter. Add onion and cook until golden-brown.\n2. Add ginger-garlic paste; cook 2 minutes.\n3. Add tomatoes, chili powder, coriander, cumin, turmeric, and amchur (mango powder). Cook until tomatoes break down, about 8 minutes.\n4. Add drained chickpeas and ½ cup water; stir well.\n5. Simmer 15 minutes. Add garam masala and salt.\n6. Mash a few chickpeas against the side for a thicker sauce. Garnish with cilantro and lemon wedges.",
    ingredients: [
      { name: "Canned Chickpeas", quantity: "2", unit: "15-oz cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Ginger-Garlic Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Red Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Amchur (Dried Mango Powder)", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Bhatura or Puri", description: "Fried puffed bread — the classic pairing" },
      { name: "Basmati Rice", description: "Steamed rice as an alternative" },
    ],
  },
  {
    id: 97, // Palak Dal
    instructions: "1. Rinse red lentils until water runs clear. Cook in water with turmeric and salt 15 minutes until soft.\n2. Blanch fresh spinach in boiling water 1 minute; chop roughly.\n3. Make the tarka: heat ghee in a small pan. Add cumin seeds, garlic, dried red chili, and mustard seeds; fry 1 minute.\n4. Add onion and cook until lightly golden.\n5. Add the tarka to the cooked dal along with the spinach; stir together.\n6. Simmer 5 minutes. Season with salt and lemon juice.",
    ingredients: [
      { name: "Red Lentils", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Spinach", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Ghee or Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Cumin Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Mustard Seeds", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Red Chili", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Roti or Chapati", description: "Whole wheat flatbread" },
      { name: "Steamed Rice", description: "Plain white rice" },
    ],
  },
  {
    id: 101, // Cauliflower Tikka Masala
    instructions: "1. Toss cauliflower florets with yogurt, turmeric, chili powder, and garam masala. Roast at 425°F for 20 minutes until charred at edges.\n2. Make the masala sauce: sauté onion in oil until golden. Add ginger, garlic, cumin, coriander, garam masala, and tomato purée. Cook 8 minutes.\n3. Stir in coconut milk or heavy cream; simmer 5 minutes.\n4. Add roasted cauliflower; simmer 5 minutes more.\n5. Season with salt and finish with a swirl of cream and fresh cilantro.",
    ingredients: [
      { name: "Cauliflower", quantity: "1", unit: "large head", category: "Produce", isCommonPantryItem: false },
      { name: "Plain Yogurt", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Tomato Purée", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Kashmiri Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Garlic Naan", description: "Warm flatbread" },
      { name: "Basmati Rice", description: "Fluffy long-grain rice" },
    ],
  },
  {
    id: 109, // Aloo Gobi
    instructions: "1. Heat oil in a large skillet. Add cumin seeds and let splutter.\n2. Add potatoes; toss and cook 5 minutes until lightly golden.\n3. Add cauliflower florets, ginger, green chili, turmeric, coriander, and chili powder; stir well.\n4. Add 3 tbsp water, cover, and cook on low-medium heat 15–18 minutes, stirring occasionally, until both vegetables are tender.\n5. Uncover, increase heat, and cook off any remaining liquid.\n6. Finish with garam masala, salt, and cilantro.",
    ingredients: [
      { name: "Potatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Cauliflower", quantity: "1", unit: "medium head", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin Seeds", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Green Chili", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Chili Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garam Masala", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Chapati", description: "Whole wheat flatbread" },
      { name: "Mint Raita", description: "Yogurt with mint and cucumber" },
    ],
  },
  {
    id: 119, // Vegan Coconut Dahl
    instructions: "1. Heat coconut oil in a pot. Add mustard seeds and curry leaves; let splutter.\n2. Add onion, garlic, and ginger; cook until golden.\n3. Add cumin, coriander, turmeric, and red chili flakes; stir 1 minute.\n4. Add red lentils, diced tomatoes, and coconut milk. Pour in enough water to cover.\n5. Bring to a boil, then simmer uncovered 20–25 minutes until lentils are very soft.\n6. Stir in spinach and lime juice. Adjust salt. Serve with rice.",
    ingredients: [
      { name: "Red Lentils", quantity: "1.5", unit: "cups", category: "Pantry", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Diced Tomatoes (canned)", quantity: "14", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Curry Leaves", quantity: "8", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Mustard Seeds", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Baby Spinach", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Coconut Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Basmati Rice", description: "Steamed long-grain rice" },
      { name: "Pappadum", description: "Crispy lentil wafers" },
    ],
  },
  {
    id: 123, // Tofu Tikka Masala
    instructions: "1. Press and cube firm tofu. Marinate in yogurt, garam masala, turmeric, and chili powder for 30 minutes. Bake or pan-fry until golden.\n2. Make tikka masala sauce: sauté onion in oil until golden. Add ginger-garlic paste and cook 2 minutes.\n3. Add tomato purée, garam masala, cumin, and coriander. Cook 7 minutes until deep red and fragrant.\n4. Stir in coconut milk; simmer 8 minutes.\n5. Add baked tofu; simmer 3 minutes.\n6. Garnish with cilantro and a swirl of cream. Serve with rice.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Tomato Purée", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Plain Yogurt", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Ginger-Garlic Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garam Masala", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Kashmiri Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Garlic Naan", description: "Buttered garlic flatbread" },
      { name: "Basmati Rice", description: "Fluffy steamed rice" },
    ],
  },

  // ── ITALIAN ──────────────────────────────────────────────────────────────────
  {
    id: 24, // Chicken Piccata (GF)
    instructions: "1. Pound chicken breasts thin and dust with GF flour or arrowroot powder. Season with salt and pepper.\n2. Heat olive oil and 1 tbsp butter in a skillet over medium-high. Sear chicken 3–4 minutes per side until golden. Remove.\n3. In same pan, sauté garlic 30 seconds. Deglaze with white wine; scrape up browned bits.\n4. Add chicken broth, lemon juice, and capers. Simmer 3 minutes.\n5. Stir in remaining butter until sauce is glossy. Return chicken to pan and coat.\n6. Garnish with parsley and lemon slices.",
    ingredients: [
      { name: "Boneless Chicken Breasts", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "GF Flour or Arrowroot", quantity: "¼", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry White Wine", quantity: "⅓", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "⅓", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Capers", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Roasted Asparagus", description: "Oven-roasted asparagus with lemon" },
      { name: "GF Pasta", description: "Rice or corn-based pasta tossed in olive oil" },
    ],
  },
  {
    id: 31, // Chicken Marsala
    instructions: "1. Pound chicken breasts to ¼-inch thickness; season with salt and pepper. Dredge in flour.\n2. Heat olive oil and 1 tbsp butter in a skillet over medium-high. Cook chicken 3–4 minutes per side until golden. Remove.\n3. Add shallots and mushrooms to the pan; cook 5 minutes until mushrooms release their moisture and brown.\n4. Add garlic; cook 30 seconds. Pour in Marsala wine; scrape up bits. Reduce by half.\n5. Add chicken broth and simmer 3 minutes. Swirl in butter.\n6. Return chicken; spoon sauce over. Garnish with parsley.",
    ingredients: [
      { name: "Boneless Chicken Breasts", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "All-Purpose Flour", quantity: "⅓", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Cremini Mushrooms", quantity: "8", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry Marsala Wine", quantity: "¾", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Mashed Potatoes", description: "Buttery creamy mashed potatoes" },
      { name: "Sautéed Broccolini", description: "Garlic broccolini with olive oil" },
    ],
  },
  {
    id: 33, // Chicken Cacciatore
    instructions: "1. Season chicken thighs with salt and pepper. Sear in olive oil in a Dutch oven until golden, about 4 minutes per side. Remove.\n2. Sauté onion, bell pepper, and mushrooms 5 minutes. Add garlic; cook 1 minute.\n3. Pour in white wine; reduce by half. Add crushed tomatoes, chicken broth, olives, capers, thyme, and rosemary.\n4. Return chicken to the pot, nestling into the sauce.\n5. Cover and braise over low heat 35–40 minutes until chicken is tender and sauce is rich.\n6. Adjust seasoning and garnish with fresh basil.",
    ingredients: [
      { name: "Bone-in Chicken Thighs", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Red Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Cremini Mushrooms", quantity: "6", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry White Wine", quantity: "½", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Kalamata Olives", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Capers", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "2", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Creamy Polenta", description: "Parmesan polenta to soak up the sauce" },
      { name: "Crusty Italian Bread", description: "For mopping the braising sauce" },
    ],
  },
  {
    id: 103, // Caprese Tart
    instructions: "1. Roll out puff pastry on a floured surface and fit into a tart pan. Prick with a fork and blind-bake at 375°F for 15 minutes.\n2. Whisk together eggs, heavy cream, and salt for the custard.\n3. Spread a thin layer of pesto over the pastry base.\n4. Layer sliced heirloom tomatoes and fresh mozzarella in the shell.\n5. Pour egg custard over the filling.\n6. Bake 25–30 minutes until custard is just set. Top with fresh basil and a drizzle of olive oil and balsamic glaze.",
    ingredients: [
      { name: "Puff Pastry Sheet", quantity: "1", unit: "sheet", category: "Frozen", isCommonPantryItem: false },
      { name: "Fresh Mozzarella", quantity: "8", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Heirloom Tomatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Eggs", quantity: "3", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Heavy Cream", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Basil Pesto", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Balsamic Glaze", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Arugula Salad", description: "Peppery rocket salad with lemon dressing" },
    ],
  },
  {
    id: 106, // Butternut Squash Risotto
    instructions: "1. Roast butternut squash cubes at 400°F with olive oil, salt, and pepper for 25 minutes. Purée half, keep rest as cubes.\n2. Warm chicken or vegetable broth in a saucepan. Keep at a low simmer.\n3. Sauté shallots and garlic in butter until soft. Add Arborio rice; toast 2 minutes.\n4. Add white wine and stir until absorbed.\n5. Ladle in warm broth one cup at a time, stirring continuously and letting each addition absorb before adding the next, about 18–20 minutes total.\n6. Stir in squash purée, remaining cubes, Parmesan, and a knob of butter. Season generously and serve immediately.",
    ingredients: [
      { name: "Butternut Squash", quantity: "2", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Arborio Rice", quantity: "1.5", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Vegetable Broth", quantity: "5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry White Wine", quantity: "½", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Parmesan Cheese", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Fresh Sage", quantity: "4", unit: "leaves", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Crispy Sage Leaves", description: "Pan-fried sage leaves as a garnish" },
      { name: "Arugula Salad", description: "Light peppery salad alongside" },
    ],
  },
  {
    id: 111, // Eggplant Parmigiana (GF)
    instructions: "1. Slice eggplant into ½-inch rounds; salt and let drain on paper towels 30 minutes. Pat dry.\n2. Dredge in GF breadcrumbs mixed with Parmesan. Fry in olive oil 3 minutes per side until golden.\n3. Make quick tomato sauce: sauté garlic in oil, add crushed tomatoes, basil, and salt. Simmer 15 minutes.\n4. In a baking dish, layer: sauce, eggplant, mozzarella, sauce, eggplant, mozzarella. Top with extra Parmesan.\n5. Bake at 375°F for 30 minutes until bubbly and golden.\n6. Rest 10 minutes before serving. Garnish with fresh basil.",
    ingredients: [
      { name: "Large Eggplants", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Mozzarella", quantity: "12", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Parmesan Cheese (grated)", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "GF Breadcrumbs", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Caesar Salad", description: "Classic romaine with Caesar dressing" },
      { name: "GF Garlic Bread", description: "Toasted GF bread with garlic butter" },
    ],
  },
  {
    id: 118, // Spinach and Ricotta Stuffed Peppers
    instructions: "1. Preheat oven to 375°F. Halve bell peppers lengthwise and remove seeds.\n2. Sauté garlic in olive oil; add spinach and cook until wilted. Let cool slightly.\n3. Mix spinach with ricotta, Parmesan, egg, nutmeg, salt, and pepper.\n4. Spoon filling generously into each pepper half. Top with a spoonful of tomato sauce and shredded mozzarella.\n5. Arrange in a baking dish; pour a small amount of tomato sauce around the peppers.\n6. Bake 30–35 minutes until peppers are tender and cheese is golden and bubbly.",
    ingredients: [
      { name: "Bell Peppers (assorted colors)", quantity: "4", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Ricotta Cheese", quantity: "1.5", unit: "cups", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Fresh Spinach", quantity: "3", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Parmesan Cheese", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Mozzarella", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Egg", quantity: "1", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Nutmeg", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tomato Sauce", quantity: "1.5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Mixed Green Salad", description: "Simple salad with Italian dressing" },
      { name: "Garlic Focaccia", description: "Olive oil-drizzled focaccia" },
    ],
  },
  {
    id: 130, // Tagliatelle with Truffle Cream
    instructions: "1. Bring a large pot of salted water to a boil. Cook tagliatelle until al dente.\n2. In a large skillet over medium-low heat, melt butter. Add shallot and cook gently 3 minutes.\n3. Pour in heavy cream; simmer 4–5 minutes until slightly thickened.\n4. Add Parmesan and stir until melted. Season with salt and white pepper.\n5. Drain pasta (reserve ½ cup pasta water). Toss pasta in the cream sauce, adding pasta water to loosen if needed.\n6. Plate and shave fresh black truffle or drizzle truffle oil generously. Finish with more Parmesan.",
    ingredients: [
      { name: "Tagliatelle Pasta", quantity: "12", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Parmesan Cheese (grated)", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Shallot", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Black Truffle Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: false },
      { name: "Fresh Black Truffle (optional)", quantity: "½", unit: "oz", category: "Produce", isCommonPantryItem: false },
      { name: "White Pepper", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Arugula Salad", description: "Peppery greens with shaved Parmesan" },
    ],
  },
  {
    id: 131, // Gnocchi al Pesto
    instructions: "1. Make fresh pesto: blend basil, pine nuts, Parmesan, garlic, olive oil, and salt until smooth.\n2. Bring a large pot of salted water to a boil. Cook gnocchi until they float to the surface, about 2–3 minutes. Remove with a slotted spoon (reserve ½ cup pasta water).\n3. In a large skillet, toss gnocchi with pesto and a splash of pasta water over low heat until evenly coated.\n4. Add halved cherry tomatoes and extra Parmesan.\n5. Serve immediately with a drizzle of olive oil and extra basil.",
    ingredients: [
      { name: "Potato Gnocchi", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Pine Nuts", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Parmesan Cheese", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "⅓", unit: "cup", category: "Oils", isCommonPantryItem: true },
      { name: "Cherry Tomatoes", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Caprese Salad", description: "Tomato, mozzarella, and basil drizzled with olive oil" },
    ],
  },
  {
    id: 132, // Cacio e Pepe
    instructions: "1. Bring a large pot of lightly salted water to boil. Cook spaghetti or tonnarelli until al dente; reserve 1 cup starchy pasta water.\n2. Toast black pepper in a dry skillet until fragrant; remove.\n3. Combine finely grated Pecorino Romano and Parmesan in a bowl.\n4. Off the heat, toss hot drained pasta in the pan with a splash of pasta water and the cheese mixture, tossing vigorously to create a creamy sauce (no clumping).\n5. Add more pasta water as needed until glossy.\n6. Top with lots of freshly cracked black pepper and extra Pecorino.",
    ingredients: [
      { name: "Spaghetti or Tonnarelli", quantity: "12", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Pecorino Romano (finely grated)", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Parmesan (finely grated)", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Whole Black Peppercorns", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Bitter Leaf Salad", description: "Radicchio and endive salad" },
      { name: "Crusty Italian Bread", description: "For mopping the pasta" },
    ],
  },
  {
    id: 133, // Amatriciana
    instructions: "1. Render guanciale (or pancetta) in a skillet over medium heat until crispy. Remove and reserve fat.\n2. Add crushed red chili flakes to the fat; cook 30 seconds.\n3. Add whole peeled tomatoes, crushing them by hand. Simmer 15–20 minutes until thick.\n4. Meanwhile cook rigatoni in salted water until al dente; reserve 1 cup pasta water.\n5. Add pasta to the sauce with a splash of pasta water; toss to combine.\n6. Return guanciale, add a generous amount of grated Pecorino, and toss. Serve immediately.",
    ingredients: [
      { name: "Rigatoni", quantity: "12", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Guanciale or Pancetta", quantity: "6", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Whole Peeled Tomatoes (San Marzano)", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Pecorino Romano (grated)", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Red Chili Flakes", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dry White Wine", quantity: "¼", unit: "cup", category: "Beverages", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Bitter Green Salad", description: "Arugula with lemon vinaigrette" },
    ],
  },
  {
    id: 134, // Saltimbocca alla Romana
    instructions: "1. Lay chicken scallopini flat. Place a fresh sage leaf on each, then a slice of prosciutto; secure with a toothpick.\n2. Dust lightly with flour on the non-prosciutto side.\n3. Heat butter and olive oil in a skillet over medium-high. Cook prosciutto-side down 3 minutes until crispy.\n4. Flip and cook 2 minutes more.\n5. Remove chicken. Deglaze pan with dry white wine; reduce by half. Swirl in a knob of butter.\n6. Pour pan sauce over the saltimbocca and serve immediately.",
    ingredients: [
      { name: "Chicken Scallopini (thin breast slices)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Prosciutto di Parma", quantity: "6", unit: "slices", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Sage Leaves", quantity: "12", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "All-Purpose Flour", quantity: "¼", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Dry White Wine", quantity: "½", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Sautéed Roman Artichokes", description: "Braised artichoke hearts with garlic and mint" },
      { name: "Roasted Cherry Tomatoes", description: "Burst tomatoes with olive oil" },
    ],
  },
  {
    id: 135, // Ribollita
    instructions: "1. Sauté onion, celery, and carrot in olive oil until soft, about 8 minutes.\n2. Add garlic, rosemary, and thyme; cook 1 minute.\n3. Add diced tomatoes, cannellini beans, and vegetable broth. Simmer 20 minutes.\n4. Tear stale bread into chunks and stir into the soup; the bread should soak up the liquid and thicken the soup.\n5. Add lacinato kale (cavolo nero) and simmer 10 minutes more.\n6. Drizzle with a generous amount of good olive oil before serving.",
    ingredients: [
      { name: "Cannellini Beans (canned)", quantity: "2", unit: "15-oz cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lacinato Kale (Cavolo Nero)", quantity: "4", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Stale Crusty Bread", quantity: "4", unit: "thick slices", category: "Bakery", isCommonPantryItem: false },
      { name: "Diced Tomatoes (canned)", quantity: "14", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Vegetable Broth", quantity: "4", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "1", unit: "sprig", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Extra Olive Oil Drizzle", description: "Finish-quality extra-virgin olive oil poured tableside" },
    ],
  },
  {
    id: 136, // Osso Buco
    instructions: "1. Dust veal shanks with flour; shake off excess. Season with salt and pepper.\n2. Sear in olive oil in a Dutch oven over high heat, 4 minutes per side. Remove.\n3. Sauté onion, celery, carrot, and garlic 8 minutes until soft.\n4. Add tomato paste and cook 1 minute. Add white wine; reduce by half.\n5. Return veal to pot. Add chicken broth, thyme, and bay leaf. Liquid should reach halfway up shanks.\n6. Cover and braise in 325°F oven 2.5–3 hours until meat is falling off the bone. Make gremolata (parsley, lemon zest, garlic) and sprinkle over just before serving.",
    ingredients: [
      { name: "Veal Shanks (osso buco cut)", quantity: "4", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "All-Purpose Flour", quantity: "¼", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato Paste", quantity: "2", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
      { name: "Dry White Wine", quantity: "1", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "1.5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lemon Zest", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Saffron Risotto (Risotto alla Milanese)", description: "The classic companion to osso buco" },
    ],
  },

  // ── MEDITERRANEAN ────────────────────────────────────────────────────────────
  {
    id: 16, // Grilled Lemon Herb Chicken
    instructions: "1. Whisk together olive oil, lemon juice, lemon zest, garlic, oregano, thyme, salt, and pepper for the marinade.\n2. Marinate chicken breasts at least 1 hour.\n3. Preheat grill to medium-high. Grill chicken 5–6 minutes per side until grill marks form and internal temperature reaches 165°F.\n4. Rest 5 minutes before slicing.\n5. Serve with a squeeze of fresh lemon and fresh herbs.",
    ingredients: [
      { name: "Boneless Chicken Breasts", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemon", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Thyme", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Greek Salad", description: "Tomato, cucumber, olive, and feta salad" },
      { name: "Pita Bread", description: "Warm grilled pita" },
    ],
  },
  {
    id: 17, // Chicken Souvlaki Skewers
    instructions: "1. Cut chicken into 1.5-inch cubes. Marinate in olive oil, lemon juice, garlic, oregano, and paprika for at least 2 hours.\n2. Thread chicken onto metal skewers, alternating with chunks of red onion and bell pepper.\n3. Grill over medium-high heat 10–12 minutes, turning every 3 minutes, until cooked through.\n4. Make tzatziki: grate cucumber and squeeze out water; mix with strained yogurt, garlic, dill, lemon, and olive oil.\n5. Serve skewers in warm pita with tzatziki, tomato, and red onion.",
    ingredients: [
      { name: "Boneless Chicken Breast", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Greek Yogurt", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Dill", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tzatziki", description: "Greek yogurt, cucumber, dill, and garlic sauce" },
      { name: "Warm Pita", description: "Grilled flatbread" },
    ],
  },
  {
    id: 21, // Chicken Shawarma Bowl
    instructions: "1. Mix olive oil, lemon juice, garlic, cumin, coriander, paprika, turmeric, cinnamon, and allspice for the shawarma marinade.\n2. Marinate chicken thighs at least 2 hours or overnight.\n3. Grill or roast at 425°F for 25–30 minutes until charred at edges and cooked through. Rest and slice thinly.\n4. Build bowls: rice or couscous, chicken, cucumber-tomato salsa, pickled red onion, and hummus.\n5. Drizzle with garlic sauce and top with fresh parsley and sumac.",
    ingredients: [
      { name: "Boneless Chicken Thighs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sumac", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Hummus", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Pita Bread or Rice", quantity: "4", unit: "servings", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Garlic Sauce (Toum)", description: "Lebanese whipped garlic sauce" },
      { name: "Pickled Turnips", description: "Bright pink pickled vegetables" },
    ],
  },
  {
    id: 27, // Moroccan Spiced Chicken
    instructions: "1. Mix olive oil, lemon juice, garlic, cumin, coriander, ginger, cinnamon, paprika, and turmeric for the Moroccan marinade.\n2. Score chicken thighs and rub thoroughly with marinade. Marinate 2 hours minimum.\n3. Sear chicken skin-side down in an oven-safe skillet 5 minutes. Flip and add sliced onion and preserved lemon.\n4. Nestle in Castelvetrano olives and chickpeas. Pour in chicken broth.\n5. Braise covered at 375°F for 40 minutes.\n6. Uncover and cook 10 minutes more until chicken is caramelized. Garnish with cilantro.",
    ingredients: [
      { name: "Bone-in Chicken Thighs", quantity: "2.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Preserved Lemon", quantity: "1", unit: "whole", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Green Olives (Castelvetrano)", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Chickpeas (canned)", quantity: "15", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Ginger", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chicken Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Couscous", description: "Fluffy steamed couscous" },
      { name: "Harissa", description: "Spicy North African chili paste on the side" },
    ],
  },
  {
    id: 51, // Greek Beef Kebabs (Souvlaki)
    instructions: "1. Mix ground beef with grated onion, garlic, cumin, coriander, paprika, oregano, fresh mint, salt, and pepper. Knead well for 2 minutes.\n2. Shape onto flat metal skewers into sausage shapes, squeezing firmly so they hold.\n3. Refrigerate 30 minutes.\n4. Grill over medium-high heat 4–5 minutes per side until cooked through and nicely charred.\n5. Serve in warm pita with tzatziki, tomato, and red onion.",
    ingredients: [
      { name: "Ground Beef", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion (grated)", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Mint", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tzatziki", description: "Yogurt cucumber garlic sauce" },
      { name: "Warm Pita", description: "Grilled flatbread" },
    ],
  },
  {
    id: 53, // Beef Shawarma Bowl
    instructions: "1. Slice beef very thinly. Marinate in olive oil, lemon, garlic, cumin, allspice, cinnamon, coriander, paprika, and turmeric for 2+ hours.\n2. Cook beef in a very hot skillet or griddle in batches until charred and caramelized, 2–3 minutes per side.\n3. Warm rice or grain base; build bowls with beef, hummus, tabouleh, roasted tomatoes, and cucumber.\n4. Drizzle with garlic sauce (toum) and tahini. Top with fresh parsley and sumac.",
    ingredients: [
      { name: "Beef Sirloin or Ribeye (thinly sliced)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Allspice", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Hummus", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Tahini", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Cooked Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tabouleh", description: "Parsley, bulgur, tomato, and lemon salad" },
      { name: "Pickled Turnips", description: "Pink pickled vegetables" },
    ],
  },
  {
    id: 61, // Grilled Whole Branzino
    instructions: "1. Score branzino on both sides with diagonal cuts. Stuff the cavity with lemon slices, garlic, and fresh herbs (thyme, rosemary, parsley).\n2. Brush all over with olive oil; season generously with salt and pepper.\n3. Grill over medium-high heat 5–7 minutes per side until skin is crispy and fish is cooked through.\n4. Carefully transfer to a platter. Drizzle with lemon juice and more olive oil.\n5. Serve whole with salsa verde or a simple herb relish.",
    ingredients: [
      { name: "Whole Branzino (cleaned)", quantity: "2", unit: "whole fish", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemon", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "4", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "2", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Grilled Vegetables", description: "Zucchini, asparagus, and cherry tomatoes" },
      { name: "Greek Salad", description: "Tomato, olive, feta" },
    ],
  },
  {
    id: 66, // Mediterranean Sea Bass
    instructions: "1. Season sea bass fillets with salt, pepper, and lemon zest.\n2. Sear skin-side down in olive oil over medium-high heat 4–5 minutes until skin is crispy. Flip and cook 2 more minutes.\n3. In another pan, sauté cherry tomatoes, olives, capers, shallot, and garlic until tomatoes burst.\n4. Deglaze with white wine; simmer 2 minutes. Add lemon juice and fresh basil.\n5. Serve sea bass over the tomato-olive sauce. Drizzle with extra-virgin olive oil.",
    ingredients: [
      { name: "Sea Bass Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cherry Tomatoes", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Kalamata Olives", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Capers", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Shallot", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry White Wine", quantity: "¼", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Couscous", description: "Fluffy couscous" },
      { name: "Roasted Fennel", description: "Caramelized fennel wedges with olive oil" },
    ],
  },
  {
    id: 76, // Greek Shrimp Saganaki
    instructions: "1. Heat olive oil in an oven-safe skillet. Sauté onion and garlic until soft.\n2. Add cherry tomatoes and a splash of ouzo (or white wine); cook 2 minutes.\n3. Add crushed tomatoes, oregano, and red chili flakes; simmer 5 minutes.\n4. Nestle shrimp into the sauce. Crumble feta generously over the top.\n5. Transfer to a 400°F oven and bake 10–12 minutes until shrimp are pink and feta is golden.\n6. Finish with fresh parsley and serve with crusty bread.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "6", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cherry Tomatoes", quantity: "1.5", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Ouzo or White Wine", quantity: "¼", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Chili Flakes", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Bread", description: "For mopping up the tomato sauce" },
      { name: "Greek Salad", description: "Classic salad alongside" },
    ],
  },
  {
    id: 79, // Spanish Gambas al Ajillo
    instructions: "1. Pat shrimp dry and season with salt and paprika.\n2. Heat olive oil in a shallow earthenware dish or skillet over medium heat.\n3. Add sliced garlic and dried chilies; cook gently 2–3 minutes until garlic is golden (do not burn).\n4. Increase heat to high. Add shrimp; cook 1–2 minutes per side until pink.\n5. Add a splash of sherry or white wine; sizzle 30 seconds.\n6. Squeeze lemon juice over and garnish with parsley. Serve sizzling hot with crusty bread.",
    ingredients: [
      { name: "Large Shrimp (shell-on or peeled)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Red Chilies", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "⅓", unit: "cup", category: "Oils", isCommonPantryItem: true },
      { name: "Dry Sherry", quantity: "3", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Crusty Pan de Pueblo", description: "Crusty Spanish bread for dipping in garlic oil" },
      { name: "Patatas Bravas", description: "Fried potatoes with spicy tomato sauce" },
    ],
  },
  {
    id: 83, // Moroccan Chermoula Shrimp
    instructions: "1. Make chermoula: blend cilantro, parsley, garlic, cumin, paprika, preserved lemon rind, olive oil, and lemon juice until smooth.\n2. Toss shrimp with half the chermoula; marinate 20 minutes.\n3. Grill or sear shrimp over high heat 1–2 minutes per side.\n4. Transfer to a platter, drizzle with remaining chermoula.\n5. Serve with warm bread or couscous.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Preserved Lemon Rind", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Couscous", description: "Fluffy couscous to serve with the shrimp" },
      { name: "Harissa Yogurt", description: "Creamy yogurt swirled with harissa paste" },
    ],
  },
  {
    id: 93, // Pork Souvlaki
    instructions: "1. Cut pork tenderloin into 1.5-inch cubes. Marinate in olive oil, lemon juice, garlic, oregano, and paprika for 2 hours.\n2. Thread onto metal skewers.\n3. Grill over high heat 10–12 minutes, turning every few minutes, until nicely charred and cooked through.\n4. Serve in warm pita wraps with tzatziki, tomato slices, and red onion.\n5. Drizzle with lemon juice and fresh oregano.",
    ingredients: [
      { name: "Pork Tenderloin", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Greek Yogurt", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Pita Bread", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tzatziki", description: "Cucumber yogurt sauce" },
      { name: "Greek Fries", description: "Fries seasoned with dried oregano and feta" },
    ],
  },
  {
    id: 100, // Shakshuka
    instructions: "1. Heat olive oil in a large skillet over medium heat. Sauté onion and bell pepper 5 minutes.\n2. Add garlic, cumin, smoked paprika, and red chili flakes; cook 1 minute.\n3. Add crushed tomatoes and season with salt and pepper. Simmer 10 minutes until sauce thickens.\n4. Use a spoon to create wells in the sauce. Crack eggs into each well.\n5. Cover and cook 5–8 minutes until whites are set but yolks are still runny.\n6. Top with crumbled feta, fresh cilantro, and parsley. Serve with warm pita or crusty bread.",
    ingredients: [
      { name: "Eggs", quantity: "6", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Red Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Chili Flakes", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Feta Cheese", quantity: "3", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Warm Pita Bread", description: "For scooping up the eggs and sauce" },
      { name: "Labneh", description: "Strained yogurt cheese with olive oil" },
    ],
  },
  {
    id: 102, // Falafel Bowl
    instructions: "1. Soak dried chickpeas overnight; drain (do not use canned). Process with onion, garlic, parsley, cilantro, cumin, coriander, and baking soda until a coarse paste forms. Refrigerate 1 hour.\n2. Shape into small patties or balls. Fry in 375°F oil 3–4 minutes until deep golden. Drain.\n3. Make tahini sauce: whisk tahini, lemon juice, garlic, water, and salt until smooth.\n4. Build bowls: rice or greens, falafel, cucumber-tomato salad, pickled red onion, and a drizzle of tahini.\n5. Top with a pinch of sumac and fresh herbs.",
    ingredients: [
      { name: "Dried Chickpeas (soaked overnight)", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Baking Soda", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Tahini", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Sumac", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Vegetable Oil (for frying)", quantity: "4", unit: "cups", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Hummus", description: "Creamy chickpea dip" },
      { name: "Warm Pita", description: "Flatbread for wrapping" },
    ],
  },
  {
    id: 104, // Zucchini Fritters (GF)
    instructions: "1. Grate zucchini and sprinkle with salt; let sit 10 minutes. Squeeze firmly in a towel to remove all moisture.\n2. Mix squeezed zucchini with eggs, crumbled feta, garlic, GF flour, dill, mint, and pepper.\n3. Heat olive oil in a skillet over medium heat. Scoop tablespoons of batter and flatten into fritters.\n4. Cook 3–4 minutes per side until golden and crispy.\n5. Drain on paper towels. Serve hot with tzatziki.",
    ingredients: [
      { name: "Zucchini", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "3", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "GF All-Purpose Flour", quantity: "¼", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Dill", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Mint", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Tzatziki", description: "Yogurt cucumber dipping sauce" },
      { name: "Greek Salad", description: "Tomato, olive, and feta salad" },
    ],
  },
  {
    id: 108, // Greek Spanakopita
    instructions: "1. Sauté onion in olive oil until soft. Add garlic and cook 1 minute.\n2. Add fresh spinach in batches and cook until wilted; drain very well and chop.\n3. Mix spinach with crumbled feta, ricotta, eggs, dill, nutmeg, salt, and pepper.\n4. Brush a baking pan with butter. Layer 6 sheets of filo, brushing each with melted butter.\n5. Spread spinach-feta filling over the filo. Top with 6 more buttered filo sheets. Score the top into diamonds.\n6. Bake at 375°F for 40–45 minutes until deep golden and crispy.",
    ingredients: [
      { name: "Fresh Spinach", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Feta Cheese", quantity: "8", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Ricotta Cheese", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Filo Dough", quantity: "12", unit: "sheets", category: "Frozen", isCommonPantryItem: false },
      { name: "Butter (melted)", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Dill", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Nutmeg", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Greek Salad", description: "Tomato, cucumber, olives, feta" },
      { name: "Tzatziki", description: "Cucumber yogurt dip" },
    ],
  },
  {
    id: 112, // Buddha Bowl with Tahini
    instructions: "1. Roast chickpeas tossed in olive oil, cumin, and paprika at 400°F for 25 minutes until crispy.\n2. Roast sweet potato cubes and beet wedges with olive oil, salt, and pepper at 400°F for 30 minutes.\n3. Cook quinoa per package directions.\n4. Make tahini dressing: whisk tahini, lemon juice, garlic, water, and a pinch of cumin until smooth.\n5. Assemble bowls: quinoa, roasted vegetables, crispy chickpeas, avocado, shredded red cabbage, and cucumber.\n6. Drizzle generously with tahini dressing. Sprinkle sesame seeds and fresh parsley.",
    ingredients: [
      { name: "Canned Chickpeas", quantity: "15", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Sweet Potato", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Beets", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Quinoa", quantity: "1", unit: "cup dry", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Red Cabbage", quantity: "1", unit: "cup shredded", category: "Produce", isCommonPantryItem: false },
      { name: "Tahini", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "1", unit: "clove", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pita Chips", description: "Toasted pita triangles" },
    ],
  },
  {
    id: 113, // Mujaddara
    instructions: "1. Sauté onions in olive oil over medium-low heat 20–25 minutes until deeply caramelized and golden-brown. Remove half and set aside for topping.\n2. Add rinsed green lentils and water; bring to a boil. Simmer 15 minutes until lentils are partially cooked.\n3. Add rinsed long-grain rice, cumin, allspice, cinnamon, salt, and pepper. Stir well.\n4. Reduce to lowest heat, cover tightly, and cook 20 minutes until rice is cooked and liquid absorbed.\n5. Rest covered 5 minutes, then fluff.\n6. Serve topped with remaining caramelized onions and a dollop of plain yogurt.",
    ingredients: [
      { name: "Green or Brown Lentils", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Long-Grain White Rice", quantity: "1", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Onions", quantity: "3", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Allspice", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Plain Yogurt", description: "Cooling yogurt spooned over the top" },
      { name: "Fattoush Salad", description: "Lebanese salad with toasted pita croutons" },
    ],
  },
  {
    id: 114, // Beet and Goat Cheese Salad
    instructions: "1. Roast beets wrapped in foil at 400°F for 45–60 minutes until tender. Cool, peel, and slice or cube.\n2. Make vinaigrette: whisk balsamic vinegar, Dijon mustard, honey, shallot, olive oil, salt, and pepper.\n3. Toss arugula with half the vinaigrette.\n4. Arrange arugula on plates. Top with beets, crumbled goat cheese, and candied walnuts.\n5. Drizzle with remaining vinaigrette. Finish with fresh thyme or microgreens.",
    ingredients: [
      { name: "Beets", quantity: "4", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Goat Cheese", quantity: "4", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Baby Arugula", quantity: "4", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Candied Walnuts", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Balsamic Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Dijon Mustard", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Honey", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Shallot", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Warm Crusty Bread", description: "For serving with the salad" },
    ],
  },
  {
    id: 116, // Ratatouille
    instructions: "1. Slice zucchini, yellow squash, eggplant, and tomatoes into uniform thin rounds.\n2. Make sauce: sauté onion and garlic in olive oil until soft. Add crushed tomatoes, thyme, and basil; simmer 10 minutes. Spread in bottom of a baking dish.\n3. Arrange vegetable slices in a spiral pattern over the sauce, alternating vegetables.\n4. Mix olive oil, garlic, and thyme; brush over the top. Season well.\n5. Cover with parchment paper; bake at 375°F for 45 minutes.\n6. Uncover and bake 15 more minutes until vegetables are tender and edges caramelized.",
    ingredients: [
      { name: "Zucchini", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Yellow Squash", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Eggplant", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Roma Tomatoes", quantity: "4", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Crushed Tomatoes", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "3", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Baguette", description: "For serving alongside" },
      { name: "Fresh Goat Cheese", description: "Dolloped over the top" },
    ],
  },
  {
    id: 143, // Lamb Kofta Kebabs
    instructions: "1. Combine ground lamb with grated onion, garlic, cumin, coriander, cinnamon, allspice, fresh mint, parsley, salt, and pepper. Mix thoroughly.\n2. Shape onto flat skewers into elongated sausages. Refrigerate 30 minutes.\n3. Grill over high heat 4–5 minutes per side until nicely charred and cooked through.\n4. Make yogurt sauce: mix Greek yogurt with garlic, lemon juice, and fresh mint.\n5. Serve kofta in warm pita with yogurt sauce, sliced tomato, and cucumber.",
    ingredients: [
      { name: "Ground Lamb", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion (grated)", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Allspice", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Mint", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Greek Yogurt", quantity: "¾", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Warm Pita", description: "Grilled flatbread for wrapping" },
      { name: "Fattoush Salad", description: "Tomato, cucumber, and pita chip salad" },
    ],
  },
  {
    id: 144, // Lamb Chops with Rosemary
    instructions: "1. Mix olive oil, minced garlic, fresh rosemary, lemon zest, salt, and pepper. Rub all over lamb chops and marinate 1 hour.\n2. Bring to room temperature before cooking.\n3. Heat a grill pan or skillet over high heat until very hot.\n4. Sear lamb chops 3–4 minutes per side for medium-rare (internal 130°F).\n5. Rest 5 minutes. Drizzle with extra-virgin olive oil and squeeze of lemon.\n6. Serve with roasted garlic and mint sauce.",
    ingredients: [
      { name: "Lamb Rib Chops", quantity: "8", unit: "chops", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "3", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Mint Jelly", description: "Classic British condiment for lamb" },
      { name: "Roasted Baby Potatoes", description: "Crispy halved potatoes with rosemary" },
    ],
  },
  {
    id: 145, // Rack of Lamb (GF)
    instructions: "1. French-trim the rack of lamb if not already done. Score the fat cap lightly.\n2. Season liberally with salt and pepper. Sear fat-side down in a very hot oven-safe skillet 3–4 minutes until golden. Sear all sides.\n3. Make herb crust: pulse parsley, rosemary, thyme, garlic, Dijon mustard, and olive oil in a food processor.\n4. Brush the meaty side with Dijon and press the herb crust onto it firmly.\n5. Roast at 400°F for 18–22 minutes until internal temperature reaches 130°F for medium-rare.\n6. Rest 10 minutes, then slice between the bones.",
    ingredients: [
      { name: "Rack of Lamb (Frenched)", quantity: "2", unit: "racks", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Dijon Mustard", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "2", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "3", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Garlic Mashed Potatoes", description: "Creamy mashed potato with roasted garlic" },
      { name: "Haricots Verts", description: "French green beans with almonds" },
    ],
  },
  {
    id: 147, // Swordfish Steaks (GF)
    instructions: "1. Pat swordfish steaks dry; brush with olive oil and season with salt, pepper, and smoked paprika.\n2. Heat a grill or grill pan over high heat. Cook swordfish 4–5 minutes per side until seared and cooked through (opaque in center).\n3. While fish cooks, make salsa: dice tomatoes, olives, capers, red onion, basil, lemon juice, and olive oil together.\n4. Transfer swordfish to plates. Spoon salsa over the top.\n5. Squeeze fresh lemon juice and serve immediately.",
    ingredients: [
      { name: "Swordfish Steaks", quantity: "4", unit: "6-oz steaks", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cherry Tomatoes", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Kalamata Olives", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Capers", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "¼", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Couscous", description: "Toasted couscous with herbs" },
      { name: "Grilled Asparagus", description: "Charred asparagus spears" },
    ],
  },
  {
    id: 148, // Octopus Salad (GF)
    instructions: "1. Bring a large pot of water with bay leaves, peppercorns, and a wine cork (traditional) to a boil.\n2. Dip octopus tentacles in and out of boiling water 3 times to curl the sucker, then submerge fully. Simmer 60–80 minutes until very tender.\n3. Let cool in liquid. Cut into bite-sized pieces.\n4. Toss octopus with olive oil, lemon juice, red onion, celery, capers, parsley, and oregano.\n5. Season with salt and pepper. Serve at room temperature or slightly chilled.",
    ingredients: [
      { name: "Whole Octopus (cleaned)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "¼", unit: "cup", category: "Oils", isCommonPantryItem: true },
      { name: "Lemon Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "¼", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Capers", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Bay Leaves", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Bread", description: "Rustic bread served alongside" },
      { name: "Lemon Wedges", description: "Extra lemon for squeezing" },
    ],
  },

  // ── MEXICAN ──────────────────────────────────────────────────────────────────
  {
    id: 26, // Chicken Fajita Bowl
    instructions: "1. Mix olive oil, lime juice, garlic, cumin, chili powder, smoked paprika, oregano, salt, and pepper for the marinade.\n2. Marinate chicken thighs at least 30 minutes.\n3. Grill or cook in a cast-iron skillet over high heat 5–6 minutes per side until charred. Rest and slice.\n4. In same pan, sear bell pepper strips and onion until charred and caramelized.\n5. Build bowls: rice, chicken, peppers, onion, black beans, and avocado.\n6. Top with pico de gallo, sour cream, and lime juice.",
    ingredients: [
      { name: "Boneless Chicken Thighs", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Bell Peppers (mixed colors)", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Black Beans (canned)", quantity: "15", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Cooked Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pico de Gallo", description: "Fresh tomato, jalapeño, and cilantro salsa" },
      { name: "Sour Cream", description: "Cool dollop on the side" },
    ],
  },
  {
    id: 36, // Carne Asada Tacos
    instructions: "1. Make marinade: blend orange juice, lime juice, garlic, jalapeño, cilantro, cumin, chili powder, oregano, and olive oil.\n2. Marinate skirt or flank steak at least 2 hours.\n3. Grill over very high heat 3–4 minutes per side for medium-rare. Rest 5 minutes and slice thinly against the grain.\n4. Warm corn tortillas on the grill.\n5. Fill tortillas with sliced carne asada. Top with diced white onion, cilantro, and a squeeze of lime.\n6. Serve with salsa verde and lime wedges.",
    ingredients: [
      { name: "Skirt or Flank Steak", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Orange Juice", quantity: "¼", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Jalapeño", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "White Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Salsa Verde", description: "Tomatillo and jalapeño green salsa" },
      { name: "Lime Wedges", description: "For squeezing over the tacos" },
    ],
  },
  {
    id: 38, // Birria Tacos
    instructions: "1. Toast dried guajillo, ancho, and árbol chilies in a dry pan. Soak in hot water 20 minutes; drain.\n2. Blend chilies with garlic, cumin, oregano, cloves, cinnamon, apple cider vinegar, and beef broth into a smooth sauce.\n3. Sear chuck roast and short ribs on all sides. Place in a Dutch oven and pour chili sauce over.\n4. Braise at 325°F for 3 hours until meat is falling apart. Remove and shred.\n5. Dip corn tortillas in the birria cooking liquid (consommé), then cook on a griddle with a bit of oil until crispy.\n6. Fill with shredded meat and melted cheese. Serve with a cup of consommé for dipping.",
    ingredients: [
      { name: "Beef Chuck Roast", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Beef Short Ribs", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Dried Guajillo Chilies", quantity: "5", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Ancho Chilies", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Apple Cider Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Beef Broth", quantity: "2", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Oaxacan Cheese or Mozzarella", quantity: "1", unit: "cup shredded", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Consommé for Dipping", description: "Strained birria broth served in a small cup alongside" },
      { name: "Diced White Onion and Cilantro", description: "Classic taco topping" },
    ],
  },
  {
    id: 45, // Mexican Carne Guisada
    instructions: "1. Cube beef chuck and season with salt, pepper, and cumin.\n2. Sear beef in batches in a hot Dutch oven until browned. Remove.\n3. Sauté onion, bell pepper, and garlic until soft, about 5 minutes.\n4. Return beef. Add tomatoes, beef broth, chili powder, cumin, and oregano.\n5. Simmer covered on low heat 1.5 hours until beef is very tender and sauce has thickened.\n6. Stir in fresh cilantro. Serve with warm flour tortillas and rice.",
    ingredients: [
      { name: "Beef Chuck (cubed)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Diced Tomatoes (canned)", quantity: "14", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Beef Broth", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Chili Powder", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Flour Tortillas", description: "Warm soft flour tortillas" },
      { name: "Mexican Rice", description: "Tomato-simmered seasoned rice" },
    ],
  },
  {
    id: 55, // Mexican Barbacoa
    instructions: "1. Blend chipotle peppers, adobo sauce, garlic, cumin, oregano, cloves, apple cider vinegar, and beef broth into a sauce.\n2. Season beef cheeks or chuck with salt and pepper.\n3. Sear on all sides in a hot skillet.\n4. Transfer to slow cooker; pour the chipotle sauce over. Add bay leaves and lime juice.\n5. Cook on LOW for 8 hours until beef pulls apart easily.\n6. Shred and mix with cooking juices. Serve in warm corn tortillas with cilantro and white onion.",
    ingredients: [
      { name: "Beef Chuck or Beef Cheeks", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chipotle Peppers in Adobo", quantity: "3", unit: "whole", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Cloves", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Apple Cider Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Beef Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Corn Tortillas", quantity: "16", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "White Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Lime Crema", description: "Sour cream mixed with lime juice and zest" },
      { name: "Guacamole", description: "Avocado, lime, jalapeño, and cilantro" },
    ],
  },
  {
    id: 62, // Fish Tacos (GF)
    instructions: "1. Make batter: mix GF flour, cumin, paprika, garlic powder, and beer (or sparkling water for a lighter option) until smooth.\n2. Season fish with salt and dip in batter.\n3. Fry in 350°F oil 3–4 minutes until golden and crispy. Drain.\n4. Make chipotle crema: blend sour cream with chipotle in adobo, lime juice, and salt.\n5. Warm corn tortillas. Fill each with two pieces of fish.\n6. Top with shredded cabbage, pico de gallo, chipotle crema, and fresh cilantro.",
    ingredients: [
      { name: "Firm White Fish (Cod or Mahi-Mahi)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "GF All-Purpose Flour", quantity: "¾", unit: "cup", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Red Cabbage (shredded)", quantity: "1.5", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Sour Cream", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Chipotle Peppers in Adobo", quantity: "1", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil (for frying)", quantity: "3", unit: "cups", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pico de Gallo", description: "Fresh tomato salsa" },
      { name: "Lime Wedges", description: "Essential for squeezing over" },
    ],
  },
  {
    id: 75, // Mexican Shrimp Ceviche
    instructions: "1. Peel, devein, and finely chop raw shrimp. Place in a glass bowl.\n2. Cover completely with fresh lime juice. Let cure in fridge 20–30 minutes, stirring once, until shrimp turns fully pink and opaque.\n3. Drain excess lime juice, saving 2 tbsp.\n4. Mix in diced tomatoes, red onion, cucumber, jalapeño, cilantro, and the reserved lime juice.\n5. Season with salt and a pinch of dried oregano.\n6. Serve in small cups or tostadas with avocado slices.",
    ingredients: [
      { name: "Large Shrimp (raw)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Roma Tomatoes", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "¼", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Jalapeño", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Oregano", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Tostadas", description: "Crispy fried corn tortillas" },
      { name: "Hot Sauce", description: "Valentina or Cholula on the side" },
    ],
  },
  {
    id: 77, // Shrimp Tacos (GF)
    instructions: "1. Season shrimp with cumin, chili powder, garlic powder, smoked paprika, salt, and a drizzle of olive oil.\n2. Cook in a hot skillet over medium-high heat 1–2 minutes per side until pink and slightly charred.\n3. Make lime crema: mix sour cream, lime juice, and a pinch of salt.\n4. Warm corn tortillas on a dry skillet.\n5. Fill each tortilla with 3–4 shrimp. Top with shredded purple cabbage, pico de gallo, and a drizzle of lime crema.\n6. Finish with fresh cilantro and lime wedges.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Purple Cabbage (shredded)", quantity: "1.5", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Sour Cream", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Pico de Gallo", description: "Fresh tomato and jalapeño salsa" },
      { name: "Guacamole", description: "Fresh avocado dip" },
    ],
  },
  {
    id: 86, // Carnitas Tacos
    instructions: "1. Cut pork shoulder into large chunks. Season with salt, cumin, oregano, and pepper.\n2. Place in a large pot with orange juice, lime juice, garlic, onion, bay leaves, and lard (or oil). Add just enough water to barely cover.\n3. Bring to a boil then cook uncovered over medium heat 1.5–2 hours until liquid is nearly completely evaporated and pork is frying in its own fat.\n4. Increase heat and let pork fry in the fat until deeply golden and crispy.\n5. Shred pork with two forks. Serve in warm corn tortillas with diced white onion, cilantro, and salsa.",
    ingredients: [
      { name: "Pork Shoulder (bone-in)", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Orange Juice", quantity: "½", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "White Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "3", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Corn Tortillas", quantity: "16", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Salsa Roja", description: "Smooth red tomato chili salsa" },
      { name: "Pickled Jalapeños", description: "Tangy pickled jalapeño rings" },
    ],
  },
  {
    id: 92, // Mexican Chipotle Pork Chops
    instructions: "1. Make chipotle marinade: blend chipotle peppers, adobo sauce, garlic, cumin, lime juice, olive oil, and salt.\n2. Coat pork chops in marinade; refrigerate 1–2 hours.\n3. Heat a skillet or grill over medium-high heat. Cook pork chops 4–5 minutes per side until caramelized and cooked to 145°F.\n4. Rest 3 minutes.\n5. Serve drizzled with any remaining pan juices. Garnish with cilantro and lime wedges.",
    ingredients: [
      { name: "Bone-in Pork Chops", quantity: "4", unit: "chops", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Chipotle Peppers in Adobo", quantity: "2", unit: "whole", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Mexican Street Corn (Elote)", description: "Grilled corn with mayo, cotija, and chili powder" },
      { name: "Mexican Rice", description: "Tomato-simmered seasoned rice" },
    ],
  },
  {
    id: 110, // Mexican Enchiladas Verdes
    instructions: "1. Make salsa verde: roast tomatillos, jalapeño, and garlic under broiler 5–8 minutes until charred. Blend with cilantro, onion, and broth.\n2. Warm enchilada filling: mix sautéed black beans, corn, zucchini, and cumin.\n3. Dip corn tortillas briefly in warm salsa verde, then fill with veggie mixture and roll.\n4. Arrange seam-side down in a greased baking dish. Pour remaining salsa verde over the top. Top with shredded Oaxacan cheese.\n5. Bake at 375°F for 20–25 minutes until cheese is melted and bubbly.\n6. Serve topped with sour cream, diced onion, and fresh cilantro.",
    ingredients: [
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Tomatillos", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Jalapeño", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Black Beans (canned)", quantity: "15", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Corn Kernels", quantity: "1", unit: "cup", category: "Frozen", isCommonPantryItem: false },
      { name: "Zucchini", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Oaxacan Cheese or Mozzarella", quantity: "1.5", unit: "cups shredded", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Sour Cream", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Mexican Rice", description: "Tomato rice as a side" },
      { name: "Refried Beans", description: "Creamy seasoned pinto beans" },
    ],
  },
  {
    id: 117, // Mushroom Tacos
    instructions: "1. Clean and slice mushrooms (portobello, cremini, or king oyster). Toss with olive oil, cumin, smoked paprika, chili powder, garlic powder, salt, and pepper.\n2. Roast mushrooms at 425°F for 20–25 minutes until deeply caramelized, stirring once halfway.\n3. Warm corn tortillas on a dry skillet.\n4. Fill tortillas with mushrooms. Top with pickled red onion, cotija cheese crumbles, avocado slices, and a squeeze of lime.\n5. Finish with fresh cilantro and your favorite salsa.",
    ingredients: [
      { name: "Mixed Mushrooms (Portobello, Cremini)", quantity: "1.5", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Avocado", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Cotija Cheese", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pickled Red Onion", description: "Quick-pickled in lime juice and apple cider vinegar" },
      { name: "Salsa Verde", description: "Tomatillo green salsa" },
    ],
  },
  {
    id: 141, // Baja Fish Tostadas
    instructions: "1. Make the Baja crema: mix mayonnaise, sour cream, lime juice, garlic, and a pinch of salt.\n2. Season fish with cumin, paprika, garlic powder, salt, and pepper. Dip in flour then egg wash then seasoned breadcrumbs.\n3. Pan-fry in ½ inch of oil 3–4 minutes per side until golden and cooked through.\n4. Drain and cut into strips.\n5. Spread refried beans on crispy tostada shells. Top with shredded cabbage, fried fish, and Baja crema.\n6. Finish with pico de gallo, sliced jalapeño, and lime wedges.",
    ingredients: [
      { name: "Firm White Fish (Cod or Tilapia)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Tostada Shells", quantity: "8", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Refried Beans", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Cabbage (shredded)", quantity: "1.5", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Mayonnaise", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sour Cream", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "All-Purpose Flour", quantity: "½", unit: "cup", category: "Grains & Bread", isCommonPantryItem: true },
      { name: "Egg", quantity: "1", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Pico de Gallo", description: "Fresh tomato jalapeño salsa" },
      { name: "Lime Wedges", description: "For squeezing" },
    ],
  },
  {
    id: 150, // Pozole Rojo
    instructions: "1. Cover pork shoulder and pork bones with water; bring to a boil and skim. Add onion, garlic, and bay leaves. Simmer 1.5 hours until pork is tender.\n2. Toast dried guajillo and ancho chilies; soak in hot water. Blend with garlic, cumin, and oregano into a smooth red chile sauce.\n3. Remove pork; shred. Strain broth.\n4. Fry chile sauce in a pot with oil 3 minutes. Add broth and hominy; bring to a simmer.\n5. Add shredded pork and season with salt and dried oregano. Simmer 20 more minutes.\n6. Serve in bowls topped with shredded cabbage, radishes, lime, dried oregano, and tostadas.",
    ingredients: [
      { name: "Pork Shoulder", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Canned Hominy", quantity: "29", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Dried Guajillo Chilies", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Ancho Chilies", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano (Mexican)", quantity: "1.5", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Bay Leaves", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Cabbage (shredded)", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Radishes", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lime", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Tostadas", description: "Crispy corn tortillas for scooping" },
      { name: "Pickled Jalapeños", description: "Tangy pickled peppers" },
    ],
  },
  {
    id: 154, // Grilled Swordfish Tacos
    instructions: "1. Make the marinade: olive oil, lime juice, garlic, cumin, chili powder, and a pinch of cayenne. Marinate swordfish steaks 20 minutes.\n2. Grill over medium-high heat 3–4 minutes per side until grill marks appear and fish is just cooked through.\n3. Rest 2 minutes, then cut into bite-sized chunks.\n4. Warm corn tortillas on the grill.\n5. Fill tortillas with swordfish chunks, shredded cabbage, mango salsa, and avocado crema.\n6. Finish with a squeeze of lime and fresh cilantro.",
    ingredients: [
      { name: "Swordfish Steaks", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Red Cabbage (shredded)", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Ripe Mango", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Sour Cream", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Mango Salsa", description: "Diced mango, jalapeño, red onion, and cilantro" },
      { name: "Lime Wedges", description: "For squeezing over the tacos" },
    ],
  },
];

async function run() {
  let count = 0;
  for (const patch of patches) {
    await db.delete(ingredientsTable).where(eq(ingredientsTable.mealId, patch.id));
    if (patch.sides && patch.sides.length > 0) {
      await db.delete(sidesTable).where(eq(sidesTable.mealId, patch.id));
    }

    await db.update(mealsTable)
      .set({ instructions: patch.instructions })
      .where(eq(mealsTable.id, patch.id));

    if (patch.ingredients.length > 0) {
      await db.insert(ingredientsTable).values(
        patch.ingredients.map((ing) => ({ ...ing, mealId: patch.id }))
      );
    }

    if (patch.sides && patch.sides.length > 0) {
      await db.insert(sidesTable).values(
        patch.sides.map((s) => ({ ...s, mealId: patch.id }))
      );
    }

    count++;
    if (count % 10 === 0) console.log(`  ${count}/${patches.length} done…`);
  }
  console.log(`✅ Seeded ingredients for ${count} meals (Indian + Italian + Mediterranean + Mexican).`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
