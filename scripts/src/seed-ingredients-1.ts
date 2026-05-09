// Seed ingredients + instructions for American & Asian meals that currently have none
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

interface Ing { name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean; }
interface Side { name: string; description: string; }
interface Patch { id: number; instructions: string; ingredients: Ing[]; sides?: Side[]; }

const patches: Patch[] = [
  // ── AMERICAN ────────────────────────────────────────────────────────────────
  {
    id: 23, // Peruvian Roasted Chicken (Pollo a la Brasa)
    instructions: "1. Blend garlic, cumin, paprika, oregano, soy sauce, lime juice, aji amarillo paste, and olive oil into a marinade.\n2. Pat chicken dry and rub marinade all over and under the skin. Marinate at least 4 hours, ideally overnight.\n3. Preheat oven to 425°F (220°C).\n4. Place chicken breast-side up on a rack in a roasting pan.\n5. Roast 20 minutes, then reduce heat to 375°F (190°C) and continue roasting 55–65 minutes until internal temp reaches 165°F.\n6. Rest 10 minutes before carving. Serve with aji verde sauce.",
    ingredients: [
      { name: "Whole Chicken", quantity: "4", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Aji Amarillo Paste", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Aji Verde (Green Sauce)", description: "Blended jalapeño, cilantro, mayo, and lime" },
      { name: "Roasted Potatoes", description: "Crispy wedges tossed in cumin and olive oil" },
    ],
  },
  {
    id: 25, // Jerk Chicken
    instructions: "1. Blend scotch bonnet pepper, green onions, garlic, thyme, allspice, cinnamon, ginger, soy sauce, brown sugar, lime juice, and olive oil into a smooth jerk marinade.\n2. Score chicken pieces and rub marinade deep into cuts. Marinate at least 4 hours.\n3. Preheat grill to medium-high. Grill chicken 6–8 minutes per side until charred and cooked through to 165°F.\n4. Rest 5 minutes. Serve with rice and peas and fried plantains.",
    ingredients: [
      { name: "Chicken Thighs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Scotch Bonnet Pepper", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "6", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "2", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Allspice", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cinnamon", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Brown Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Rice and Peas", description: "Jamaican-style rice cooked in coconut milk with kidney beans" },
      { name: "Fried Plantains", description: "Sweet ripe plantains pan-fried until caramelized" },
    ],
  },
  {
    id: 30, // Honey Garlic Chicken Thighs
    instructions: "1. Season chicken thighs with salt and pepper.\n2. Heat oil in oven-safe skillet over medium-high heat. Sear chicken skin-side down 5–6 minutes until golden; flip and sear 2 minutes more.\n3. Remove chicken and sauté minced garlic in the drippings 30 seconds.\n4. Whisk together honey, soy sauce, apple cider vinegar, and chicken broth; pour into skillet.\n5. Return chicken skin-side up. Transfer pan to 400°F oven and bake 20 minutes until internal temp reaches 165°F.\n6. Spoon pan sauce over chicken before serving.",
    ingredients: [
      { name: "Bone-in Chicken Thighs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Honey", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Apple Cider Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Chicken Broth", quantity: "¼", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Broccoli", description: "Lightly seasoned broccoli florets" },
      { name: "Jasmine Rice", description: "Fluffy steamed rice to absorb the sauce" },
    ],
  },
  {
    id: 32, // Buffalo Chicken Lettuce Wraps
    instructions: "1. Cook chicken in a pot of simmering water until cooked through, about 15 minutes. Shred with two forks.\n2. In a skillet over medium heat, melt butter, then stir in hot sauce and a pinch of garlic powder.\n3. Toss shredded chicken in the buffalo sauce until coated.\n4. Separate butter lettuce leaves. Fill each leaf with buffalo chicken.\n5. Top with crumbled blue cheese, thinly sliced celery, and a drizzle of ranch dressing.\n6. Serve immediately.",
    ingredients: [
      { name: "Boneless Chicken Breast", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Frank's RedHot Sauce", quantity: "⅓", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter Lettuce", quantity: "1", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Blue Cheese Crumbles", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Ranch Dressing", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Carrot Sticks", description: "Crisp carrot batons served alongside for dipping" },
      { name: "Extra Buffalo Sauce", description: "For dipping or drizzling" },
    ],
  },
  {
    id: 40, // Brazilian Picanha Steak
    instructions: "1. Score the fat cap of the picanha in a crosshatch pattern without cutting into the meat.\n2. Season generously with coarse sea salt on all sides.\n3. Fold the steak into a C-shape fat-side out and skewer, or cook flat.\n4. Grill over high heat, fat-side down first, 4–5 minutes until fat renders and chars.\n5. Flip and cook 4–5 minutes per side for medium-rare (internal 130°F).\n6. Rest 5 minutes, then slice against the grain. Serve with chimichurri.",
    ingredients: [
      { name: "Picanha (Sirloin Cap)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coarse Sea Salt", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Black Pepper", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Chimichurri Sauce", description: "Fresh parsley, garlic, olive oil, and red wine vinegar sauce" },
      { name: "Brazilian Rice", description: "Garlic-infused white rice" },
    ],
  },
  {
    id: 41, // Argentinian Chimichurri Steak
    instructions: "1. Make chimichurri: finely chop parsley, garlic, and red chili; combine with olive oil, red wine vinegar, oregano, salt, and pepper. Let rest 30 minutes.\n2. Pat steaks dry and season generously with salt and pepper.\n3. Heat a cast-iron skillet over high heat until smoking. Add oil.\n4. Cook steaks 3–4 minutes per side for medium-rare. Baste with butter and garlic in the last minute.\n5. Rest 5 minutes, then serve drizzled with chimichurri.",
    ingredients: [
      { name: "Ribeye Steaks", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Flat-Leaf Parsley", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Red Chili Flakes", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Red Wine Vinegar", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "⅓", unit: "cup", category: "Oils", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Grilled Asparagus", description: "Lightly charred asparagus with olive oil and salt" },
      { name: "Roasted Potatoes", description: "Crispy halved potatoes with herbs" },
    ],
  },
  {
    id: 44, // Peruvian Lomo Saltado
    instructions: "1. Cut beef into thin strips and marinate in soy sauce and vinegar 15 minutes.\n2. In a wok over very high heat, add oil and sear beef strips 2–3 minutes until browned; remove.\n3. In same wok, stir-fry onion and tomatoes 2 minutes.\n4. Return beef, add garlic, aji amarillo paste, and soy sauce; toss together.\n5. Add french fries directly to the wok and toss everything together.\n6. Finish with cilantro and serve over white rice.",
    ingredients: [
      { name: "Beef Sirloin", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Tomatoes", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Aji Amarillo Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Red Wine Vinegar", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "French Fries (frozen)", quantity: "2", unit: "cups", category: "Frozen", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Fluffy white rice to serve alongside" },
    ],
  },
  {
    id: 48, // Beef Chili (GF)
    instructions: "1. Brown ground beef in a large pot over medium-high heat; drain excess fat.\n2. Add diced onion and bell pepper; sauté 3–4 minutes.\n3. Stir in garlic, chili powder, cumin, smoked paprika, and oregano; cook 1 minute.\n4. Add crushed tomatoes, beef broth, and drained kidney beans.\n5. Bring to a boil, reduce heat, and simmer uncovered 40–45 minutes, stirring occasionally.\n6. Season with salt, pepper, and a dash of hot sauce. Serve with desired toppings.",
    ingredients: [
      { name: "Ground Beef", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Chili Powder", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Crushed Tomatoes", quantity: "28", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Beef Broth", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Kidney Beans", quantity: "15", unit: "oz can", category: "Canned Goods", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Shredded Cheddar", description: "Sharp cheddar cheese for topping" },
      { name: "Sour Cream", description: "Cool dollop on top of each bowl" },
      { name: "Tortilla Chips", description: "For scooping the chili" },
    ],
  },
  {
    id: 50, // Steak Frites (GF)
    instructions: "1. Cut potatoes into ¼-inch sticks; soak in cold water 30 minutes, then pat dry.\n2. Fry potatoes in 350°F oil for 5 minutes (blanch); remove and raise oil to 375°F.\n3. Season steaks with salt and pepper. Heat a cast-iron pan over high heat with a drizzle of oil.\n4. Cook steaks 3–4 minutes per side for medium-rare. Add butter, garlic, and thyme; baste steaks.\n5. Rest steaks 5 minutes.\n6. Fry potatoes again at 375°F for 2–3 minutes until golden and crispy. Season immediately with salt.\n7. Serve steak with frites and a dollop of herb butter.",
    ingredients: [
      { name: "Ribeye or Strip Steak", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Russet Potatoes", quantity: "2", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "4", unit: "cups", category: "Oils", isCommonPantryItem: true },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "3", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Herb Butter", description: "Compound butter with parsley and garlic" },
      { name: "Dijon Mustard", description: "Classic French condiment for dipping" },
    ],
  },
  {
    id: 52, // Braised Short Ribs (GF)
    instructions: "1. Season short ribs generously with salt and pepper.\n2. Heat oil in a Dutch oven over high heat. Sear ribs on all sides until deeply browned, about 3–4 minutes per side. Remove.\n3. Sauté onion, carrot, and celery in the same pot 5 minutes.\n4. Add garlic, tomato paste, and cook 1 minute.\n5. Pour in red wine, scraping up browned bits, then add beef broth, thyme, rosemary, and bay leaf.\n6. Return ribs, cover, and braise in 325°F oven 2.5–3 hours until fall-off-the-bone tender.\n7. Skim fat from braising liquid and reduce on stovetop to a rich sauce.",
    ingredients: [
      { name: "Bone-in Beef Short Ribs", quantity: "4", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Carrots", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato Paste", quantity: "2", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
      { name: "Dry Red Wine", quantity: "1", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Beef Broth", quantity: "2", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "4", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Rosemary", quantity: "2", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Creamy Mashed Potatoes", description: "Buttery whipped potatoes to serve with the braising sauce" },
      { name: "Roasted Root Vegetables", description: "Caramelized parsnips and carrots" },
    ],
  },
  {
    id: 58, // Baked Cod with Herb Crust (GF)
    instructions: "1. Preheat oven to 400°F. Line a baking sheet with parchment.\n2. Pat cod fillets dry and place on prepared pan. Season with salt and pepper.\n3. Mix breadcrumbs (or almond flour for GF), parsley, garlic, olive oil, lemon zest, and Parmesan.\n4. Press the crust mixture firmly onto the top of each fillet.\n5. Bake 15–18 minutes until crust is golden and fish flakes easily.\n6. Squeeze fresh lemon juice over the top and serve immediately.",
    ingredients: [
      { name: "Cod Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Almond Flour", quantity: "⅓", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Parmesan Cheese", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Asparagus", description: "Tender asparagus with olive oil and lemon" },
      { name: "Lemon Rice Pilaf", description: "Fluffy rice with lemon zest and herbs" },
    ],
  },
  {
    id: 59, // Grilled Halibut with Mango Salsa
    instructions: "1. Make the mango salsa: combine diced mango, red onion, jalapeño, cilantro, lime juice, and a pinch of salt. Refrigerate.\n2. Brush halibut fillets with olive oil and season with salt, pepper, and cumin.\n3. Preheat grill to medium-high and oil the grates.\n4. Grill halibut 4–5 minutes per side until it flakes easily and grill marks form.\n5. Transfer to plates and top generously with mango salsa.\n6. Serve with lime wedges.",
    ingredients: [
      { name: "Halibut Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Ripe Mango", quantity: "2", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Jalapeño", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Coconut Rice", description: "Creamy rice cooked in coconut milk" },
      { name: "Black Bean Salad", description: "Black beans with corn, lime, and cilantro" },
    ],
  },
  {
    id: 60, // Peruvian Ceviche
    instructions: "1. Cut fresh fish into ½-inch cubes and place in a glass bowl.\n2. Squeeze enough lime juice over fish to fully submerge it. Add salt and let cure 10–15 minutes, stirring occasionally, until fish turns opaque.\n3. Drain most of the lime juice, reserving 2 tablespoons.\n4. Mix in thinly sliced red onion, aji amarillo paste, fresh ginger, and cilantro.\n5. Season with salt and pepper. Spoon into bowls and serve immediately with choclo corn and sweet potato.",
    ingredients: [
      { name: "Firm White Fish (Sea Bass or Flounder)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Aji Amarillo Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "½", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Peruvian Corn (Choclo)", description: "Large-kernel Peruvian corn kernels" },
      { name: "Boiled Sweet Potato", description: "Sliced boiled sweet potato served alongside" },
    ],
  },
  {
    id: 64, // Baked Lemon Garlic Tilapia
    instructions: "1. Preheat oven to 400°F.\n2. Pat tilapia fillets dry and place in a greased baking dish.\n3. In a small bowl, mix melted butter, minced garlic, lemon juice, lemon zest, paprika, parsley, salt, and pepper.\n4. Spoon butter mixture over each fillet.\n5. Bake uncovered 15–18 minutes until fish flakes easily with a fork.\n6. Garnish with fresh parsley and lemon slices. Serve immediately.",
    ingredients: [
      { name: "Tilapia Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Green Beans", description: "Tender green beans with a squeeze of lemon" },
      { name: "White Rice", description: "Fluffy steamed rice" },
    ],
  },
  {
    id: 67, // Blackened Cajun Salmon
    instructions: "1. Mix paprika, cayenne, onion powder, garlic powder, thyme, oregano, salt, and pepper to make blackening spice.\n2. Pat salmon fillets dry. Brush with melted butter and press blackening spice firmly onto the top of each fillet.\n3. Heat a cast-iron skillet over high heat until smoking hot. Add a thin film of oil.\n4. Place salmon spice-side down; cook 3–4 minutes without moving until a dark crust forms.\n5. Flip and cook another 2–3 minutes until salmon is just cooked through. Serve with lemon wedges.",
    ingredients: [
      { name: "Salmon Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cayenne Pepper", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Onion Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Thyme", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Dried Oregano", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Lemon", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Cajun Dirty Rice", description: "Spiced rice with bell pepper and green onion" },
      { name: "Coleslaw", description: "Creamy vinegar coleslaw" },
    ],
  },
  {
    id: 69, // Pan-Seared Trout with Brown Butter
    instructions: "1. Pat trout fillets dry and season with salt and pepper.\n2. Heat oil in a skillet over medium-high heat until shimmering.\n3. Place fillets skin-side down; press gently with a spatula to prevent curling. Cook 3–4 minutes until skin is crispy.\n4. Flip and cook 1–2 minutes more until just cooked through.\n5. Remove fish. Wipe pan and add butter; cook over medium heat 2–3 minutes until it turns golden-brown and smells nutty.\n6. Add capers and lemon juice to the brown butter, swirl, then pour over fish. Garnish with parsley.",
    ingredients: [
      { name: "Rainbow Trout Fillets", quantity: "4", unit: "fillets", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Capers", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Baby Potatoes", description: "Crispy halved potatoes with herbs" },
      { name: "Wilted Spinach", description: "Garlic-sautéed spinach" },
    ],
  },
  {
    id: 72, // Garlic Butter Shrimp
    instructions: "1. Pat shrimp dry and season with salt, pepper, and paprika.\n2. Heat butter and olive oil in a large skillet over medium-high heat.\n3. Add minced garlic and cook 30 seconds until fragrant.\n4. Add shrimp in a single layer; cook 1–2 minutes per side until pink and curled.\n5. Deglaze pan with white wine or chicken broth, scraping up any bits.\n6. Finish with lemon juice and parsley. Serve immediately.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Dry White Wine", quantity: "¼", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Parsley", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Bread", description: "For soaking up the garlic butter sauce" },
      { name: "Angel Hair Pasta", description: "Tossed lightly with olive oil" },
    ],
  },
  {
    id: 73, // Cajun Shrimp and Cauliflower Grits
    instructions: "1. Make cauliflower grits: steam cauliflower florets until very tender. Blend with cream cheese, butter, and cheddar until smooth. Season with salt.\n2. Season shrimp with Cajun spice, paprika, and garlic powder.\n3. Cook bacon in a skillet until crispy; remove and crumble. Reserve drippings.\n4. Sauté shrimp in bacon drippings 1–2 minutes per side.\n5. Add bell pepper, garlic, and tomatoes; sauté 3 minutes.\n6. Spoon shrimp mixture over cauliflower grits and top with crumbled bacon.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cauliflower", quantity: "1", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Cream Cheese", quantity: "4", unit: "oz", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Cheddar Cheese", quantity: "½", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Bacon", quantity: "4", unit: "strips", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Cajun Seasoning", quantity: "2", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Hot Sauce", description: "Louisiana-style hot sauce on the side" },
    ],
  },
  {
    id: 80, // Peel and Eat Cajun Shrimp Boil
    instructions: "1. Fill a large pot with water; bring to a boil. Add Cajun seasoning, Old Bay, garlic, and lemon halves.\n2. Add baby potatoes and cook 8 minutes.\n3. Add corn cobs (halved) and cook 5 minutes more.\n4. Add smoked sausage slices and cook 3 minutes.\n5. Add shrimp and cook 2–3 minutes until pink.\n6. Drain everything and spread on a newspaper-lined table. Garnish with parsley and serve with cocktail sauce and lemon wedges.",
    ingredients: [
      { name: "Large Shrimp (shell-on)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Baby Potatoes", quantity: "1", unit: "lb", category: "Produce", isCommonPantryItem: false },
      { name: "Corn on the Cob", quantity: "3", unit: "ears", category: "Produce", isCommonPantryItem: false },
      { name: "Smoked Andouille Sausage", quantity: "12", unit: "oz", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Old Bay Seasoning", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Cajun Seasoning", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic", quantity: "1", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Cocktail Sauce", description: "Classic shrimp cocktail dipping sauce" },
      { name: "Crusty Bread", description: "For soaking up the seasoned butter" },
    ],
  },
  {
    id: 85, // Kalua Pork (Hawaiian)
    instructions: "1. Use a knife to pierce pork shoulder all over. Rub liquid smoke, Hawaiian sea salt, and garlic all over.\n2. Wrap pork tightly in banana leaves (if available) or foil.\n3. Place in slow cooker; cook on LOW 16–18 hours until incredibly tender and falling apart.\n4. Alternatively, cook in a Dutch oven at 325°F for 8 hours covered.\n5. Shred pork with two forks, mixing in the cooking juices.\n6. Serve over rice with macaroni salad.",
    ingredients: [
      { name: "Pork Shoulder (Butt)", quantity: "4", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Hawaiian Sea Salt", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Liquid Smoke", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Banana Leaves (optional)", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Fluffy white rice, essential with Kalua pork" },
      { name: "Hawaiian Macaroni Salad", description: "Creamy elbow macaroni salad" },
    ],
  },
  {
    id: 105, // Sweet Potato Black Bean Bowls
    instructions: "1. Preheat oven to 425°F. Cube sweet potatoes, toss with olive oil, cumin, smoked paprika, salt, and pepper.\n2. Roast sweet potatoes 25–30 minutes until caramelized, flipping halfway.\n3. Warm black beans in a saucepan with garlic, cumin, and lime juice.\n4. Build bowls: rice, roasted sweet potato, black beans, avocado slices.\n5. Top with fresh salsa, cilantro, and a drizzle of chipotle crema (sour cream + chipotle in adobo).",
    ingredients: [
      { name: "Sweet Potatoes", quantity: "2", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Black Beans (canned)", quantity: "15", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Avocado", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sour Cream", quantity: "¼", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Chipotle Peppers in Adobo", quantity: "1", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Cooked Brown Rice", quantity: "2", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Olive Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Fresh Salsa", description: "Diced tomato, onion, and jalapeño salsa" },
      { name: "Lime Wedges", description: "For squeezing over the bowl" },
    ],
  },
  {
    id: 128, // Tofu Scramble Breakfast Bowl
    instructions: "1. Press extra-firm tofu 15 minutes to remove excess moisture. Crumble into bite-sized pieces.\n2. Heat oil in a skillet over medium heat. Add crumbled tofu and cook 3–4 minutes.\n3. Add turmeric, nutritional yeast, garlic powder, and onion powder; stir to coat evenly.\n4. Push tofu to one side; sauté diced bell pepper, spinach, and cherry tomatoes 2–3 minutes.\n5. Combine everything; season with salt, pepper, and a splash of soy sauce.\n6. Serve in bowls over roasted sweet potato or whole grains. Top with avocado.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Nutritional Yeast", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garlic Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Baby Spinach", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Cherry Tomatoes", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Olive Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Roasted Sweet Potato", description: "Cubed and oven-roasted sweet potato" },
      { name: "Whole Grain Toast", description: "Toasted sprouted grain bread" },
    ],
  },
  {
    id: 137, // Lobster Roll (GF)
    instructions: "1. Cook lobster tails in boiling salted water 6–8 minutes until opaque and red. Let cool, then remove meat and chop into large chunks.\n2. In a bowl, mix lobster with mayonnaise, lemon juice, celery, chives, salt, and white pepper.\n3. Use lettuce leaves as the GF wrap, or serve in GF hot dog buns.\n4. Melt butter in a skillet and toast the buns if using.\n5. Fill each bun/lettuce cup generously. Garnish with chives and a sprinkle of paprika.",
    ingredients: [
      { name: "Lobster Tails", quantity: "4", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Mayonnaise", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Chives", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Lemon Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter Lettuce", quantity: "8", unit: "leaves", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Kettle Chips", description: "Classic potato chips alongside" },
      { name: "Lemon Wedges", description: "Fresh lemon for squeezing" },
    ],
  },
  {
    id: 138, // Smash Burgers (GF)
    instructions: "1. Divide ground beef into 2-oz balls (do not season yet).\n2. Heat a cast-iron griddle or skillet over high heat until smoking. Place a ball of beef on the hot surface.\n3. Immediately smash flat with a spatula or burger press; season with salt and pepper.\n4. Cook 1.5–2 minutes until edges are very crispy. Flip and immediately add cheese; cook 30 seconds more.\n5. Stack two smashed patties per burger.\n6. Serve on toasted GF buns with your choice of toppings: pickles, onion, mustard, ketchup, special sauce.",
    ingredients: [
      { name: "Ground Beef (80/20)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "American Cheese", quantity: "4", unit: "slices", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "GF Brioche Buns", quantity: "4", unit: "whole", category: "Bakery", isCommonPantryItem: false },
      { name: "Dill Pickles", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "White Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Yellow Mustard", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Ketchup", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Butter", quantity: "2", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crispy Shoestring Fries", description: "Thin-cut GF fries seasoned with sea salt" },
      { name: "Milkshake", description: "Classic vanilla or chocolate shake" },
    ],
  },
  {
    id: 139, // Pulled Chicken Tacos
    instructions: "1. Season chicken breasts with cumin, smoked paprika, garlic powder, chili powder, salt, and pepper.\n2. Cook in slow cooker on LOW 6–7 hours with chicken broth, diced tomatoes, and garlic.\n3. Shred chicken with two forks and mix with the cooking liquid.\n4. Warm corn tortillas in a dry skillet.\n5. Fill each tortilla with pulled chicken. Top with shredded cabbage, pickled red onion, avocado crema, and fresh cilantro.",
    ingredients: [
      { name: "Boneless Chicken Breast", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cumin", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Chili Powder", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Diced Tomatoes (canned)", quantity: "14", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Corn Tortillas", quantity: "12", unit: "whole", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Red Cabbage", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Avocado", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Pickled Red Onion", description: "Quick-pickled in lime juice and vinegar" },
      { name: "Lime Crema", description: "Sour cream blended with lime juice and zest" },
    ],
  },
  {
    id: 140, // Clam Chowder (GF)
    instructions: "1. Cook diced bacon in a large pot until crispy; remove and set aside. Reserve 2 tbsp drippings.\n2. Sauté onion and celery in drippings 4 minutes. Add garlic and cook 1 minute.\n3. Add diced potatoes, clam juice, and chicken broth. Simmer 12–15 minutes until potatoes are tender.\n4. Stir in heavy cream and canned clams with their juice. Heat through but do not boil.\n5. Thicken by mashing some potatoes against the side of the pot.\n6. Season with salt, white pepper, and fresh thyme. Garnish with bacon and parsley.",
    ingredients: [
      { name: "Canned Clams", quantity: "3", unit: "6.5oz cans", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Russet Potatoes", quantity: "3", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Bacon", quantity: "6", unit: "strips", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Clam Juice", quantity: "8", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Fresh Thyme", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Oyster Crackers (GF)", description: "Gluten-free crackers for topping the soup" },
      { name: "Sourdough Bread Bowl (optional)", description: "Traditional for non-GF serving" },
    ],
  },
  {
    id: 142, // Chicken and Waffle (GF)
    instructions: "1. Make GF waffles: whisk GF flour blend, baking powder, egg, milk, and melted butter until smooth. Cook in a preheated waffle iron.\n2. For the chicken: season tenders with salt, paprika, garlic powder, and cayenne. Dip in egg wash then GF breadcrumbs.\n3. Fry chicken in 350°F oil 5–6 minutes until golden and cooked through.\n4. Make honey hot sauce: mix hot sauce, honey, and butter.\n5. Stack waffle and fried chicken, drizzle with honey hot sauce and maple syrup.",
    ingredients: [
      { name: "Chicken Tenders", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "GF All-Purpose Flour Blend", quantity: "1.5", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "GF Breadcrumbs", quantity: "1", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Eggs", quantity: "3", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Milk", quantity: "1", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Butter", quantity: "4", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Hot Sauce", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Honey", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Maple Syrup", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Smoked Paprika", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Coleslaw", description: "Creamy vinegar slaw" },
      { name: "Pickle Spears", description: "Dill pickles alongside" },
    ],
  },
  {
    id: 146, // Duck Confit (GF)
    instructions: "1. Rub duck legs all over with salt, black pepper, thyme, bay leaf, and garlic. Cure in refrigerator 12–24 hours.\n2. Rinse off the cure. Place duck legs in a deep baking dish, cover completely with duck fat or olive oil.\n3. Bake at 275°F for 2.5–3 hours until meat is very tender and pulling away from the bone.\n4. Remove duck from fat. Heat a skillet over high heat; place duck legs skin-side down and sear 3–4 minutes until skin is shatteringly crispy.\n5. Serve immediately with lentils or roasted potatoes.",
    ingredients: [
      { name: "Duck Legs", quantity: "4", unit: "whole", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Duck Fat (or Olive Oil)", quantity: "2", unit: "cups", category: "Oils", isCommonPantryItem: false },
      { name: "Coarse Salt", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Thyme", quantity: "5", unit: "sprigs", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "French Lentils", description: "Green lentils with shallots and herbs" },
      { name: "Frisée Salad", description: "Bitter greens with warm bacon vinaigrette" },
    ],
  },
  {
    id: 153, // Prawn Bisque
    instructions: "1. Sauté prawn shells in butter until bright pink, about 3 minutes. Add onion, carrot, celery, and garlic; cook 5 minutes.\n2. Add tomato paste, brandy, and cook 2 minutes. Add fish broth and bay leaf; simmer 20 minutes.\n3. Strain stock, discarding shells and vegetables. Return stock to pot.\n4. Sauté prawn meat in butter 2 minutes. Reserve some for garnish.\n5. Blend remaining prawns with the stock until smooth. Add heavy cream and heat gently.\n6. Season with cayenne, salt, and white pepper. Finish with a drizzle of cream and reserved prawns.",
    ingredients: [
      { name: "Large Prawns (shells on)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Onion", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Celery", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Tomato Paste", quantity: "2", unit: "tbsp", category: "Canned Goods", isCommonPantryItem: true },
      { name: "Brandy", quantity: "3", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Fish Broth", quantity: "4", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Heavy Cream", quantity: "¾", unit: "cup", category: "Dairy & Eggs", isCommonPantryItem: false },
      { name: "Butter", quantity: "3", unit: "tbsp", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Cayenne Pepper", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Crusty Baguette", description: "Sliced French bread for dipping" },
      { name: "Croutons", description: "Garlic-butter croutons for topping" },
    ],
  },

  // ── ASIAN ────────────────────────────────────────────────────────────────────
  {
    id: 18, // Thai Basil Chicken (Pad Krapow Gai)
    instructions: "1. Heat oil in a wok over high heat. Add garlic and Thai chilies; stir-fry 30 seconds.\n2. Add ground chicken; stir-fry breaking apart until cooked through, about 4 minutes.\n3. Add oyster sauce, fish sauce, soy sauce, and sugar; stir to combine.\n4. Remove from heat and fold in fresh Thai basil leaves until just wilted.\n5. Serve immediately over jasmine rice. Top with a fried egg.",
    ingredients: [
      { name: "Ground Chicken", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Fresh Thai Basil", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Red Chilies", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Oyster Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Fluffy steamed Thai jasmine rice" },
      { name: "Fried Egg", description: "Crispy-edged fried egg on top of each bowl" },
    ],
  },
  {
    id: 22, // Chicken Larb (Thai Salad)
    instructions: "1. Toast rice in a dry skillet over medium heat until golden, about 3 minutes. Grind to a coarse powder in a mortar or spice grinder.\n2. Cook ground chicken in a skillet with a small splash of water or broth until just cooked; break up chunks.\n3. Remove from heat. Stir in fish sauce, lime juice, chili flakes, shallots, and lemongrass.\n4. Fold in toasted rice powder, fresh mint, and cilantro.\n5. Taste and adjust lime and fish sauce. Serve on butter lettuce.",
    ingredients: [
      { name: "Ground Chicken", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Jasmine Rice (dry)", quantity: "2", unit: "tbsp", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Shallots", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "1", unit: "stalk", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Red Chili Flakes", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Mint", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Butter Lettuce", quantity: "1", unit: "head", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Sticky Rice", description: "Thai glutinous sticky rice for scooping the larb" },
      { name: "Sliced Cucumbers", description: "Cool cucumber slices to balance the heat" },
    ],
  },
  {
    id: 28, // Chicken Adobo
    instructions: "1. Combine soy sauce, vinegar, bay leaves, black peppercorns, and garlic in a pot. Add chicken pieces; marinate 30 minutes.\n2. Bring mixture to a boil, then reduce to a simmer. Cook uncovered 25 minutes.\n3. Remove chicken and reserve the braising liquid.\n4. Heat oil in a skillet over medium-high heat. Fry chicken pieces 3–4 minutes per side until golden and slightly caramelized.\n5. Reduce the braising liquid in the pot until slightly thickened. Pour over chicken.\n6. Serve with steamed rice and garnish with green onions.",
    ingredients: [
      { name: "Chicken Thighs and Drumsticks", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "White Cane Vinegar", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "6", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "3", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Whole Black Peppercorns", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Essential for soaking up the adobo sauce" },
      { name: "Pickled Cucumber Salad", description: "Crisp cucumbers in rice vinegar dressing" },
    ],
  },
  {
    id: 29, // Chicken Satay
    instructions: "1. Make marinade: blend lemongrass, garlic, turmeric, coriander, cumin, coconut milk, soy sauce, and brown sugar.\n2. Cut chicken into strips, toss in marinade, and refrigerate at least 2 hours.\n3. Thread onto soaked bamboo skewers.\n4. Make peanut sauce: cook peanut butter, coconut milk, soy sauce, lime juice, chili flakes, and a bit of sugar in a small saucepan.\n5. Grill skewers over high heat 3–4 minutes per side.\n6. Serve with peanut sauce, cucumber relish, and jasmine rice.",
    ingredients: [
      { name: "Chicken Breast", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Ground Coriander", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Coconut Milk", quantity: "½", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Peanut Butter", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Brown Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Peanut Dipping Sauce", description: "Creamy peanut sauce with coconut milk and lime" },
      { name: "Cucumber Relish", description: "Quick-pickled cucumber and shallot relish" },
    ],
  },
  {
    id: 34, // Teriyaki Chicken
    instructions: "1. Make teriyaki sauce: combine soy sauce, mirin, sake, and sugar in a small saucepan; simmer 5 minutes until slightly thickened. Set aside.\n2. Score chicken thighs on the skin side and season lightly with salt.\n3. Place skin-side down in a cold skillet, then turn heat to medium. Cook 8–10 minutes until skin is crispy.\n4. Flip chicken and pour half the teriyaki sauce over. Cook 5–7 minutes until cooked through.\n5. Add remaining sauce and glaze chicken, turning to coat.\n6. Slice and serve over rice with sesame seeds and green onions.",
    ingredients: [
      { name: "Bone-in Chicken Thighs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sake", quantity: "2", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Japanese Rice", description: "Short-grain sticky rice" },
      { name: "Pickled Ginger", description: "Sliced pickled ginger for palate cleansing" },
    ],
  },
  {
    id: 35, // Vietnamese Lemongrass Chicken
    instructions: "1. Mince lemongrass, garlic, shallots, and chilies. Mix with fish sauce, sugar, and a pinch of turmeric.\n2. Toss chicken thighs in the marinade; marinate 30 minutes.\n3. Heat oil in a large skillet over medium-high heat. Add lemongrass pieces and cook 1 minute.\n4. Add chicken and cook 5–6 minutes per side until caramelized and cooked through.\n5. Add a splash of water to deglaze; let it reduce to a sticky glaze.\n6. Garnish with sliced chilies and serve over rice.",
    ingredients: [
      { name: "Chicken Thighs (boneless)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Turmeric", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Thai Red Chilies", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed fragrant Thai rice" },
      { name: "Bean Sprout Salad", description: "Fresh sprouts with lime dressing" },
    ],
  },
  {
    id: 37, // Beef Pho (Pho Bo)
    instructions: "1. Char onion and ginger halves directly over a gas flame or under a broiler until blackened. Rinse.\n2. In a large pot, combine beef bones, charred onion, ginger, star anise, cinnamon, cloves, cardamom, coriander seeds, and fish sauce. Cover with water.\n3. Bring to a boil, skim foam, then simmer 3+ hours. Strain broth and season with salt, fish sauce, and rock sugar.\n4. Cook rice noodles according to package directions.\n5. Thinly slice raw beef. Place noodles in bowls and top with raw beef. Ladle boiling broth over to cook the beef.\n6. Serve with bean sprouts, Thai basil, lime, jalapeño, and hoisin/sriracha.",
    ingredients: [
      { name: "Beef Bones (marrow and knuckle)", quantity: "3", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Beef Eye of Round (thinly sliced)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "White Onion", quantity: "1", unit: "large", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "3", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Star Anise", quantity: "5", unit: "whole", category: "Pantry", isCommonPantryItem: false },
      { name: "Cinnamon Stick", quantity: "2", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Rock Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Flat Rice Noodles", quantity: "1", unit: "lb", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Bean Sprouts", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "1", unit: "bunch", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Hoisin Sauce", description: "For stirring into the broth" },
      { name: "Sriracha", description: "Chili sauce for heat" },
    ],
  },
  {
    id: 39, // Korean Beef Bulgogi Bowls
    instructions: "1. Slice beef very thinly (place in freezer 15 minutes first for easier slicing). Mix soy sauce, sesame oil, brown sugar, grated Asian pear, minced garlic, ginger, and black pepper. Marinate beef 30–60 minutes.\n2. Heat a skillet or grill pan over very high heat. Cook beef in batches, 1–2 minutes per side, until charred at the edges.\n3. Serve over steamed rice. Top with sautéed spinach, shredded carrots, and a fried egg if desired.\n4. Drizzle with gochujang-sesame sauce and garnish with sesame seeds and green onions.",
    ingredients: [
      { name: "Beef Ribeye or Sirloin (thinly sliced)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "4", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Brown Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Asian Pear", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Gochujang Paste", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Short-Grain Rice", description: "Korean-style sticky rice" },
      { name: "Kimchi", description: "Fermented spicy cabbage" },
    ],
  },
  {
    id: 42, // Beef Rendang
    instructions: "1. Blend shallots, garlic, ginger, galangal, lemongrass, red chilies, and turmeric into a smooth paste.\n2. Toast desiccated coconut in a dry pan until golden brown; set aside.\n3. Fry the spice paste in oil over medium heat 5 minutes until fragrant.\n4. Add beef chunks and stir to coat. Add coconut milk, kaffir lime leaves, and lemongrass stalks.\n5. Bring to a boil, then simmer uncovered over low heat 2–3 hours, stirring often, until liquid is fully absorbed and beef is very dark and tender.\n6. Fold in toasted coconut at the end. Serve with steamed rice.",
    ingredients: [
      { name: "Beef Chuck (cut into chunks)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1.5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Shallots", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "2", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Galangal", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Red Chilies", quantity: "8", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Desiccated Coconut", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "5", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Turmeric", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Jasmine Rice", description: "Fragrant rice to absorb the rich rendang" },
      { name: "Acar (Pickled Vegetables)", description: "Sweet and sour pickled cucumber and carrot" },
    ],
  },
  {
    id: 46, // Beef Tataki
    instructions: "1. Rub beef tenderloin with soy sauce, garlic, and sesame oil. Let rest 15 minutes.\n2. Heat a heavy skillet over very high heat. Sear beef on all sides, about 30 seconds per side — it should be deeply browned outside but raw inside.\n3. Immediately transfer to an ice bath for 1 minute to stop cooking, then pat dry.\n4. Wrap tightly in plastic and refrigerate 1 hour.\n5. Slice beef very thinly across the grain.\n6. Arrange on a plate with ponzu sauce, thinly sliced green onion, daikon, and sesame seeds.",
    ingredients: [
      { name: "Beef Tenderloin", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Ponzu Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Daikon Radish", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Ponzu Dipping Sauce", description: "Citrus soy sauce for dipping" },
      { name: "Shredded Daikon", description: "Crisp daikon as a bed for the tataki" },
    ],
  },
  {
    id: 49, // Vietnamese Beef Salad (Goi Bo)
    instructions: "1. Make dressing: combine fish sauce, lime juice, sugar, garlic, and bird's eye chili. Adjust to taste.\n2. Sear beef thinly sliced sirloin in a hot oiled skillet 1–2 minutes for rare. Let cool slightly, then slice.\n3. Combine shredded cabbage, bean sprouts, thinly sliced red onion, and shredded carrot in a large bowl.\n4. Toss vegetables with dressing, then fold in beef slices.\n5. Top with crushed peanuts, fried shallots, fresh mint, and cilantro.\n6. Serve immediately at room temperature.",
    ingredients: [
      { name: "Beef Sirloin (thinly sliced)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Napa Cabbage", quantity: "2", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Red Onion", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Bean Sprouts", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "3", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fresh Mint", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Roasted Peanuts", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
      { name: "Fried Shallots", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Prawn Crackers", description: "Light crackers served alongside" },
    ],
  },
  {
    id: 54, // Galbi (Korean Short Ribs)
    instructions: "1. Make marinade: combine soy sauce, brown sugar, Asian pear, sesame oil, garlic, ginger, and green onion. Marinate short ribs at least 4 hours or overnight.\n2. Bring ribs to room temperature before cooking.\n3. Grill over high heat 3–4 minutes per side until caramelized and slightly charred.\n4. Alternatively, broil on high in oven 4–5 minutes per side.\n5. Slice between bones and serve immediately with steamed rice and banchan.",
    ingredients: [
      { name: "Flanken-Style Beef Short Ribs", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Brown Sugar", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: true },
      { name: "Asian Pear", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "4", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Ssam Lettuce Wraps", description: "Perilla and butter lettuce leaves for wrapping the ribs" },
      { name: "Kimchi", description: "Fermented cabbage kimchi" },
    ],
  },
  {
    id: 56, // Miso Glazed Salmon
    instructions: "1. Whisk together white miso paste, mirin, sake, and sugar until smooth to make the glaze.\n2. Pat salmon fillets dry and coat generously with miso glaze. Let marinate at least 30 minutes.\n3. Preheat broiler to high. Place salmon on a foil-lined baking sheet.\n4. Broil 6–8 minutes until glaze is caramelized and bubbling. Watch carefully to avoid burning.\n5. Serve over steamed rice with sesame seeds and sliced green onions.",
    ingredients: [
      { name: "Salmon Fillets", quantity: "4", unit: "6-oz fillets", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "White Miso Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sake", quantity: "1", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Japanese Rice", description: "Short-grain rice" },
      { name: "Blanched Bok Choy", description: "Steamed bok choy with sesame oil" },
    ],
  },
  {
    id: 57, // Thai Fish Curry (Gaeng Pa)
    instructions: "1. Heat coconut oil in a wok over medium-high heat. Add red curry paste and cook 2 minutes until fragrant.\n2. Add lemongrass, galangal, and kaffir lime leaves; stir-fry 1 minute.\n3. Pour in coconut milk and fish broth; bring to a simmer.\n4. Add fish chunks and vegetables (eggplant, bell pepper, zucchini); cook 5–7 minutes.\n5. Season with fish sauce, palm sugar, and lime juice.\n6. Finish with Thai basil and serve over jasmine rice.",
    ingredients: [
      { name: "Firm White Fish Fillets", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Red Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Thai Eggplant", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Palm Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "To serve alongside the curry" },
    ],
  },
  {
    id: 65, // Ahi Tuna Poke Bowl
    instructions: "1. Make the marinade: combine soy sauce, sesame oil, ginger, and a pinch of red pepper flakes.\n2. Cube ahi tuna into ¾-inch pieces. Toss gently with marinade; refrigerate 15 minutes.\n3. Cook sushi rice per package instructions. Season with rice vinegar, sugar, and salt while warm.\n4. Assemble bowls: rice base, seasoned tuna, avocado, edamame, cucumber, shredded carrot, and seaweed salad.\n5. Drizzle with sriracha mayo and sprinkle with sesame seeds and furikake.",
    ingredients: [
      { name: "Sushi-Grade Ahi Tuna", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Sushi Rice", quantity: "1.5", unit: "cups dry", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Avocado", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Edamame", quantity: "½", unit: "cup", category: "Frozen", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Rice Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sriracha", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mayonnaise", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Furikake Seasoning", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Miso Soup", description: "Light miso broth with tofu and wakame" },
      { name: "Wonton Chips", description: "Crispy wonton chips for scooping" },
    ],
  },
  {
    id: 70, // Vietnamese Caramelized Fish (Ca Kho To)
    instructions: "1. In a clay pot or heavy skillet, cook sugar and 1 tbsp water over medium heat until it becomes a deep amber caramel.\n2. Add fish sauce, garlic, shallots, and black pepper. Stir briefly.\n3. Add fish steaks and enough coconut water to almost cover.\n4. Braise over low heat 25–30 minutes, turning fish occasionally, until liquid reduces to a thick caramel glaze.\n5. Garnish with sliced chili and green onion. Serve in the pot with steamed rice.",
    ingredients: [
      { name: "Catfish or Salmon Steaks", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Coconut Water", quantity: "¾", unit: "cup", category: "Beverages", isCommonPantryItem: false },
      { name: "Black Pepper", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Thai Red Chili", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Essential for soaking up the caramel sauce" },
    ],
  },
  {
    id: 74, // Thai Lemongrass Shrimp
    instructions: "1. Pound lemongrass, garlic, shallots, galangal, and chilies in a mortar into a rough paste.\n2. Heat oil in a wok over high heat. Fry the paste 2 minutes until very fragrant.\n3. Add shrimp and stir-fry 2–3 minutes until pink.\n4. Season with fish sauce, palm sugar, and a splash of lime juice.\n5. Toss in kaffir lime leaves and Thai basil; cook 30 seconds more.\n6. Serve over jasmine rice.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Galangal", quantity: "1", unit: "inch piece", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Chilies", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed fragrant rice" },
      { name: "Thai Cucumber Salad", description: "Sliced cucumber in sweet-sour dressing" },
    ],
  },
  {
    id: 78, // Vietnamese Shrimp Spring Rolls (Fresh)
    instructions: "1. Cook shrimp in boiling salted water 2 minutes; peel and halve lengthwise.\n2. Soak rice vermicelli per package; drain.\n3. Fill a large bowl with warm water. Dip one rice paper sheet 10–15 seconds until pliable.\n4. Lay on a damp cutting board. Place 2–3 shrimp halves pink-side down, then add vermicelli, lettuce, carrot, cucumber, mint, and cilantro.\n5. Fold sides in and roll tightly. Repeat.\n6. Serve with peanut dipping sauce or nuoc cham.",
    ingredients: [
      { name: "Medium Shrimp", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Rice Paper Wrappers", quantity: "16", unit: "sheets", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Rice Vermicelli", quantity: "2", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Butter Lettuce", quantity: "8", unit: "leaves", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Mint", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Peanut Butter", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Hoisin Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Nuoc Cham", description: "Tangy Vietnamese dipping sauce with fish sauce and lime" },
      { name: "Peanut Hoisin Sauce", description: "Creamy peanut and hoisin dipping sauce" },
    ],
  },
  {
    id: 82, // Shrimp Fried Rice (GF)
    instructions: "1. Cook and cool rice (day-old rice works best). Spread on a sheet pan and refrigerate if fresh.\n2. Season shrimp with salt, pepper, and garlic powder. Stir-fry in a hot wok with oil 1–2 minutes; remove.\n3. In the same wok over high heat, scramble 2 eggs; remove.\n4. Add more oil, sauté garlic and green onion whites 30 seconds.\n5. Add cold rice; press against the wok and stir-fry 3–4 minutes until toasted.\n6. Add soy sauce, sesame oil, and oyster sauce. Return shrimp and eggs; toss everything. Garnish with green onion tops and sesame seeds.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Cooked Long-Grain Rice (cold)", quantity: "3", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "4", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Oyster Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Egg Drop Soup", description: "Light silky soup with corn and egg ribbons" },
    ],
  },
  {
    id: 84, // Honey Sriracha Shrimp
    instructions: "1. Pat shrimp dry; toss with garlic powder, salt, and pepper.\n2. Whisk together honey, sriracha, soy sauce, rice vinegar, and sesame oil for the sauce.\n3. Heat oil in a large skillet over medium-high heat. Cook shrimp 1–2 minutes per side until pink.\n4. Pour sauce over shrimp; cook 1–2 minutes until sauce thickens and coats shrimp.\n5. Garnish with sesame seeds and sliced green onions. Serve over rice.",
    ingredients: [
      { name: "Large Shrimp (peeled & deveined)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Honey", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sriracha", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Rice Vinegar", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "1", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Jasmine Rice", description: "Fluffy rice to serve the shrimp over" },
      { name: "Sautéed Snow Peas", description: "Crisp-tender snow peas with garlic" },
    ],
  },
  {
    id: 87, // Vietnamese Caramelized Pork (Thit Kho)
    instructions: "1. In a clay pot or pot, cook sugar until it melts into a dark caramel. Add fish sauce and shallots; stir.\n2. Add pork belly pieces and stir to coat with caramel.\n3. Pour in coconut water to cover. Add peeled hard-boiled eggs.\n4. Bring to a boil, skim foam, then reduce heat to a low simmer.\n5. Braise uncovered 1 hour until pork is tender and broth is rich and glossy.\n6. Adjust seasoning with fish sauce and pepper. Serve over steamed rice.",
    ingredients: [
      { name: "Pork Belly (cut into 2-inch pieces)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Hard-Boiled Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Coconut Water", quantity: "1.5", unit: "cups", category: "Beverages", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Shallots", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Black Pepper", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Essential accompaniment" },
      { name: "Pickled Mustard Greens", description: "Tangy fermented greens to cut the richness" },
    ],
  },
  {
    id: 88, // Korean Dwaeji Bulgogi
    instructions: "1. Make marinade: blend gochujang, soy sauce, sesame oil, sugar, Asian pear, garlic, and ginger.\n2. Slice pork thinly against the grain. Toss in marinade; refrigerate 1–2 hours.\n3. Heat a large skillet or grill pan over very high heat. Cook pork in batches without overcrowding, 2–3 minutes per side.\n4. Once caramelized, add sliced onion and scallions; toss together briefly.\n5. Serve in lettuce wraps with rice, kimchi, and sliced garlic.",
    ingredients: [
      { name: "Pork Belly or Shoulder (thinly sliced)", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Gochujang Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sugar", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Asian Pear", quantity: "¼", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Ssam Lettuce", description: "Butter lettuce for wrapping" },
      { name: "Kimchi", description: "Fermented cabbage for serving" },
    ],
  },
  {
    id: 89, // Filipino Lechon Kawali
    instructions: "1. Boil pork belly in salted water with garlic, bay leaves, and peppercorns for 45 minutes until cooked through.\n2. Remove pork and let cool completely on a wire rack. Pat very dry and refrigerate uncovered 2–4 hours for crispier skin.\n3. Heat oil in a deep pot or wok to 375°F.\n4. Carefully lower pork belly into hot oil. Fry 10–12 minutes until skin is golden and blistered.\n5. Remove and drain. Let rest 5 minutes, then chop into pieces.\n6. Serve with lechon sauce or vinegar dipping sauce.",
    ingredients: [
      { name: "Pork Belly (slab)", quantity: "2", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Garlic", quantity: "4", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "3", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Whole Peppercorns", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Salt", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "4", unit: "cups", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Lechon Sauce", description: "Sweet and tangy liver-based dipping sauce" },
      { name: "Steamed White Rice", description: "Essential Filipino accompaniment" },
    ],
  },
  {
    id: 90, // Char Siu (Chinese BBQ Pork)
    instructions: "1. Mix hoisin sauce, honey, soy sauce, Shaoxing wine, five-spice powder, garlic, and red food coloring (optional) to make the char siu marinade.\n2. Coat pork tenderloin strips in marinade; refrigerate overnight or at least 4 hours.\n3. Preheat oven to 425°F. Place pork on a rack over a foil-lined pan.\n4. Roast 25 minutes. Brush with extra marinade, then broil 3–5 minutes until caramelized and slightly charred.\n5. Rest 5 minutes, then slice. Brush with remaining honey-glaze.",
    ingredients: [
      { name: "Pork Tenderloin", quantity: "1.5", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Hoisin Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Honey", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Shaoxing Wine", quantity: "2", unit: "tbsp", category: "Beverages", isCommonPantryItem: false },
      { name: "Five-Spice Powder", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Bao Buns", description: "Soft steamed buns to fill with char siu" },
      { name: "Cucumber Slices", description: "Cool, crisp cucumber" },
    ],
  },
  {
    id: 94, // Asian Pork Lettuce Wraps
    instructions: "1. Heat oil in a skillet over medium-high heat. Add garlic and ginger; cook 30 seconds.\n2. Add ground pork; cook breaking apart until browned, about 5 minutes.\n3. Stir in hoisin sauce, soy sauce, rice vinegar, and chili garlic sauce. Cook 2 minutes.\n4. Add water chestnuts and green onions; toss together.\n5. Spoon pork mixture into butter lettuce cups. Top with shredded carrot, julienned cucumber, and crushed peanuts.\n6. Drizzle with extra hoisin and serve.",
    ingredients: [
      { name: "Ground Pork", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Butter Lettuce", quantity: "1", unit: "head", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Hoisin Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Rice Vinegar", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Chili Garlic Sauce", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Water Chestnuts (canned)", quantity: "8", unit: "oz", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Roasted Peanuts", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed rice on the side" },
      { name: "Wonton Soup", description: "Light broth with pork wontons" },
    ],
  },
  {
    id: 98, // Thai Green Curry with Tofu
    instructions: "1. Heat coconut oil in a wok over medium heat. Fry green curry paste 2 minutes until fragrant.\n2. Add thick coconut milk and stir until smooth. Add kaffir lime leaves and lemongrass.\n3. Add firm tofu cubes and simmer 3 minutes.\n4. Add sliced zucchini, bell pepper, and snap peas; cook 4–5 minutes until tender.\n5. Season with fish sauce (or soy sauce for vegan), palm sugar, and lime juice.\n6. Stir in Thai basil and serve over jasmine rice.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Green Curry Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Zucchini", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Snap Peas", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "4", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "1", unit: "stalk", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Thai Basil", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Fragrant steamed rice" },
      { name: "Roti or Naan", description: "Flatbread for scooping" },
    ],
  },
  {
    id: 99, // Korean Sundubu Jjigae
    instructions: "1. In an earthenware or heavy pot, heat sesame oil over medium heat. Add garlic, gochugaru, and anchovy broth.\n2. Add kimchi and cook 3 minutes.\n3. Pour in dashima (kelp) broth; bring to a boil.\n4. Add soft tofu by large spoonfuls directly into the broth.\n5. Add zucchini slices and mushrooms; cook 5 minutes.\n6. Crack an egg directly into the simmering stew. Cook until just set. Season with fish sauce and salt.",
    ingredients: [
      { name: "Soft Silken Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Kimchi", quantity: "½", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Gochugaru (Korean Chili Flakes)", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Anchovy Broth or Vegetable Broth", quantity: "2", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Zucchini", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Mushrooms", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Egg", quantity: "1", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Fish Sauce", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed Rice", description: "Short-grain Korean rice" },
      { name: "Banchan (Korean Side Dishes)", description: "Assorted small dishes like spinach namul and bean sprouts" },
    ],
  },
  {
    id: 107, // Thai Mango Sticky Rice
    instructions: "1. Rinse glutinous rice until water runs clear; soak 4 hours or overnight. Steam in a bamboo steamer over boiling water 20–25 minutes until tender.\n2. Heat coconut milk, sugar, and salt until sugar dissolves. Reserve half for sauce.\n3. Pour warm coconut milk mixture over cooked rice; stir gently. Cover and let absorb 10 minutes.\n4. Peel and slice ripe mangoes.\n5. Serve sticky rice mounded alongside sliced mango. Pour reserved coconut sauce over. Top with sesame seeds or crispy mung beans.",
    ingredients: [
      { name: "Thai Glutinous Rice", quantity: "1.5", unit: "cups", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1.5", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Ripe Ataulfo Mangoes", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Sugar", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: true },
      { name: "Salt", quantity: "¼", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Extra Coconut Sauce", description: "Warm sauce poured tableside" },
    ],
  },
  {
    id: 115, // Japanese Agedashi Tofu
    instructions: "1. Gently drain silken or soft tofu; cut into 2-inch cubes. Pat completely dry with paper towels.\n2. Make dashi broth: simmer dashi broth, mirin, and soy sauce together for 3 minutes.\n3. Coat tofu lightly in potato starch or cornstarch.\n4. Heat oil to 350°F. Fry tofu cubes 3–4 minutes until lightly golden and crispy.\n5. Place tofu in bowls, ladle warm broth around.\n6. Top with grated daikon, sliced green onion, grated ginger, and katsuobushi (bonito flakes).",
    ingredients: [
      { name: "Silken Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Potato Starch or Cornstarch", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: true },
      { name: "Dashi Broth", quantity: "1", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Mirin", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Daikon Radish (grated)", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Katsuobushi (Bonito Flakes)", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "3", unit: "cups", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Miso Soup", description: "Traditional light miso soup" },
      { name: "Steamed Japanese Rice", description: "Short-grain rice" },
    ],
  },
  {
    id: 120, // Mapo Tofu
    instructions: "1. Heat oil in a wok over medium heat. Fry doubanjiang paste 1–2 minutes until fragrant and oil turns red.\n2. Add ground pork; cook breaking apart until browned.\n3. Add garlic, ginger, and fermented black beans; stir-fry 1 minute.\n4. Pour in chicken broth; bring to a simmer.\n5. Gently add soft tofu cubes; simmer 3–4 minutes without stirring too much.\n6. Thicken with cornstarch slurry. Finish with sesame oil, Sichuan peppercorn oil, and green onions.",
    ingredients: [
      { name: "Soft Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Ground Pork", quantity: "¼", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Doubanjiang (Chili Bean Paste)", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fermented Black Beans", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "¾", unit: "cup", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Cornstarch", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sichuan Peppercorns (ground)", quantity: "½", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Sesame Oil", quantity: "1", unit: "tsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "Essential to balance the spice" },
      { name: "Cucumber Salad", description: "Cool smashed cucumber salad" },
    ],
  },
  {
    id: 121, // Adobo-Style Tofu
    instructions: "1. Press extra-firm tofu 20 minutes; cut into 1-inch cubes.\n2. Combine soy sauce, vinegar, garlic, bay leaves, and peppercorns in a bowl. Add tofu; marinate 30 minutes.\n3. Heat oil in a skillet over medium-high. Remove tofu from marinade and fry 3–4 minutes per side until golden. Remove.\n4. Pour marinade into the same skillet; simmer 5 minutes until slightly reduced.\n5. Return tofu, toss to coat, and cook 1–2 minutes more.\n6. Serve over rice with green onions.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "White Vinegar", quantity: "¼", unit: "cup", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "5", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Bay Leaves", quantity: "3", unit: "whole", category: "Pantry", isCommonPantryItem: true },
      { name: "Whole Peppercorns", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Steamed White Rice", description: "For serving with the tofu" },
    ],
  },
  {
    id: 122, // Crispy Sesame Tofu
    instructions: "1. Press extra-firm tofu 30 minutes; cube into 1-inch pieces. Pat very dry.\n2. Toss tofu in cornstarch until fully coated.\n3. Heat ½ inch of oil in a skillet over medium-high. Fry tofu cubes 3–4 minutes per side until golden and crispy. Drain.\n4. Make sauce: combine soy sauce, sesame oil, honey, garlic, ginger, and rice vinegar.\n5. In a wok, heat sauce briefly, add tofu, and toss to coat.\n6. Serve over rice, top with sesame seeds and sliced green onion.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Cornstarch", quantity: "3", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Honey", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "½", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Rice Vinegar", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "½", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Broccoli", description: "Simply steamed broccoli florets" },
      { name: "Jasmine Rice", description: "Fluffy steamed rice" },
    ],
  },
  {
    id: 124, // Miso Soup with Tofu and Seaweed
    instructions: "1. Bring water to a simmer (do not boil). Add dashi powder or a piece of kombu; steep 5 minutes.\n2. Cut silken tofu into small cubes. Cut rehydrated wakame into bite-sized pieces.\n3. Ladle a cup of warm broth into a bowl; dissolve white miso paste by whisking until smooth. Add back to pot.\n4. Gently add tofu and wakame. Heat through gently — do not boil.\n5. Ladle into bowls and garnish with thinly sliced green onion.",
    ingredients: [
      { name: "Silken Tofu", quantity: "7", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "White Miso Paste", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Dashi Powder or Kombu", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Dried Wakame Seaweed", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Water", quantity: "4", unit: "cups", category: "Pantry", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Japanese Rice", description: "Short-grain rice" },
      { name: "Pickled Daikon", description: "Sliced pickled daikon radish" },
    ],
  },
  {
    id: 125, // Korean Dubu Jorim
    instructions: "1. Cut tofu into ½-inch slices; pat very dry.\n2. Fry tofu in a thin film of oil in a non-stick skillet, 2–3 minutes per side until golden. Remove.\n3. Mix gochugaru, soy sauce, sesame oil, garlic, sugar, and a splash of water to make the sauce.\n4. In the same skillet, add sauce and let it bubble 1 minute.\n5. Return tofu slices and spoon sauce over each piece. Cook 2 minutes until glazed.\n6. Garnish with sesame seeds, green onion, and a drizzle of sesame oil.",
    ingredients: [
      { name: "Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Gochugaru (Korean Chili Flakes)", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Garlic", quantity: "2", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "2", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Rice", description: "Korean short-grain rice" },
      { name: "Doenjang Jjigae", description: "Fermented soybean paste soup" },
    ],
  },
  {
    id: 126, // Vietnamese Lemongrass Tofu
    instructions: "1. Press extra-firm tofu 20 minutes; cut into cubes.\n2. Pound or finely mince lemongrass, garlic, shallots, and chilies.\n3. Heat oil over high heat. Fry tofu until golden and crispy on all sides, about 5 minutes. Remove.\n4. In same pan, fry lemongrass mixture 2 minutes.\n5. Return tofu; add fish sauce (or soy sauce), sugar, and a splash of water. Stir to glaze.\n6. Garnish with Thai basil and chili slices. Serve over rice.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Shallots", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Red Chilies", quantity: "2", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sugar", quantity: "1", unit: "tsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Thai Basil", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Vegetable Oil", quantity: "3", unit: "tbsp", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed rice to serve alongside" },
    ],
  },
  {
    id: 127, // Tofu and Vegetable Green Curry
    instructions: "1. Heat oil in a wok. Fry green curry paste 2 minutes until fragrant.\n2. Add coconut milk and stir until combined. Add lemongrass and kaffir lime leaves.\n3. Add cubed firm tofu; simmer 5 minutes.\n4. Add broccoli, bell pepper, and snow peas; cook 4 minutes until crisp-tender.\n5. Season with soy sauce, palm sugar, and lime juice.\n6. Stir in Thai basil and serve over rice.",
    ingredients: [
      { name: "Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Green Curry Paste", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Broccoli Florets", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Red Bell Pepper", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Snow Peas", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "1", unit: "stalk", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Thai Basil", quantity: "½", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "1", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Fragrant steamed rice" },
    ],
  },
  {
    id: 129, // General Tso Tofu
    instructions: "1. Press and cube extra-firm tofu; coat in cornstarch.\n2. Fry tofu in ½ inch of oil until crispy and golden. Drain.\n3. Make sauce: whisk soy sauce, rice vinegar, hoisin, sugar, cornstarch, garlic, and ginger.\n4. Sauté dried chilies in a little oil 30 seconds, then pour in sauce; bring to a simmer.\n5. Add tofu and toss to coat. Cook until sauce thickens and glazes the tofu.\n6. Garnish with sesame seeds and green onions. Serve over rice.",
    ingredients: [
      { name: "Extra-Firm Tofu", quantity: "14", unit: "oz", category: "Pantry", isCommonPantryItem: false },
      { name: "Cornstarch", quantity: "¼", unit: "cup", category: "Pantry", isCommonPantryItem: true },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Rice Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Hoisin Sauce", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Sugar", quantity: "2", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Dried Red Chilies", quantity: "6", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Vegetable Oil", quantity: "½", unit: "cup", category: "Oils", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Steamed Broccoli", description: "Classic side with General Tso" },
      { name: "Steamed White Rice", description: "Fluffy white rice" },
    ],
  },
  {
    id: 149, // Japanese Soba Noodle Salad
    instructions: "1. Cook soba noodles per package directions; rinse under cold water immediately and drain.\n2. Make dressing: combine soy sauce, sesame oil, rice vinegar, mirin, ginger, and a dash of sriracha.\n3. Toss cold noodles with dressing, shredded carrots, cucumber, edamame, and green onions.\n4. Divide into bowls. Top with soft-boiled egg halves, sliced avocado, and nori strips.\n5. Sprinkle with sesame seeds and serve cold.",
    ingredients: [
      { name: "Soba Noodles", quantity: "8", unit: "oz", category: "Grains & Bread", isCommonPantryItem: false },
      { name: "Edamame (shelled)", quantity: "½", unit: "cup", category: "Frozen", isCommonPantryItem: false },
      { name: "Carrot", quantity: "1", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Cucumber", quantity: "½", unit: "medium", category: "Produce", isCommonPantryItem: false },
      { name: "Avocado", quantity: "1", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Rice Vinegar", quantity: "2", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Mirin", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Nori Sheets", quantity: "2", unit: "sheets", category: "Pantry", isCommonPantryItem: false },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Eggs", quantity: "2", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Miso Soup", description: "Light miso broth" },
    ],
  },
  {
    id: 151, // Tom Kha Gai (Coconut Chicken Soup)
    instructions: "1. Bring chicken broth to a simmer. Add lemongrass, galangal slices, and kaffir lime leaves; simmer 5 minutes.\n2. Add coconut milk; stir and bring back to a gentle simmer.\n3. Add chicken slices and mushrooms; cook 5–6 minutes until chicken is cooked through.\n4. Season with fish sauce, lime juice, and a pinch of sugar.\n5. Add Thai chilies for heat; adjust to taste.\n6. Ladle into bowls and top with cilantro, sliced red chili, and a squeeze of fresh lime.",
    ingredients: [
      { name: "Boneless Chicken Breast (sliced)", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Coconut Milk", quantity: "1", unit: "can", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Chicken Broth", quantity: "2", unit: "cups", category: "Canned Goods", isCommonPantryItem: false },
      { name: "Lemongrass", quantity: "2", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Galangal", quantity: "6", unit: "slices", category: "Produce", isCommonPantryItem: false },
      { name: "Kaffir Lime Leaves", quantity: "5", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Mushrooms (oyster or button)", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Fish Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: false },
      { name: "Lime Juice", quantity: "2", unit: "tbsp", category: "Produce", isCommonPantryItem: false },
      { name: "Thai Chilies", quantity: "3", unit: "whole", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Cilantro", quantity: "¼", unit: "cup", category: "Produce", isCommonPantryItem: false },
    ],
    sides: [
      { name: "Jasmine Rice", description: "Steamed rice to serve with the soup" },
    ],
  },
  {
    id: 152, // Egg Roll in a Bowl (GF)
    instructions: "1. Brown ground pork in a large skillet over medium-high heat. Drain excess fat.\n2. Add garlic and ginger; cook 1 minute.\n3. Add shredded cabbage and carrots; stir-fry 4–5 minutes until slightly softened.\n4. Season with soy sauce, sesame oil, rice vinegar, and a pinch of red pepper flakes.\n5. Toss in green onions and cook 1 minute more.\n6. Serve topped with a fried egg, sriracha drizzle, and sesame seeds.",
    ingredients: [
      { name: "Ground Pork", quantity: "1", unit: "lb", category: "Meat & Seafood", isCommonPantryItem: false },
      { name: "Napa Cabbage (shredded)", quantity: "4", unit: "cups", category: "Produce", isCommonPantryItem: false },
      { name: "Carrots (shredded)", quantity: "1", unit: "cup", category: "Produce", isCommonPantryItem: false },
      { name: "Garlic", quantity: "3", unit: "cloves", category: "Produce", isCommonPantryItem: false },
      { name: "Fresh Ginger", quantity: "1", unit: "tsp", category: "Produce", isCommonPantryItem: false },
      { name: "Soy Sauce", quantity: "3", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Sesame Oil", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Rice Vinegar", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
      { name: "Green Onions", quantity: "3", unit: "stalks", category: "Produce", isCommonPantryItem: false },
      { name: "Eggs", quantity: "4", unit: "whole", category: "Dairy & Eggs", isCommonPantryItem: true },
      { name: "Sesame Seeds", quantity: "1", unit: "tbsp", category: "Pantry", isCommonPantryItem: true },
      { name: "Sriracha", quantity: "1", unit: "tbsp", category: "Condiments & Sauces", isCommonPantryItem: true },
    ],
    sides: [
      { name: "Cauliflower Rice", description: "Low-carb alternative base" },
    ],
  },
];

async function run() {
  let count = 0;
  for (const patch of patches) {
    // Remove existing ingredients and sides for this meal
    await db.delete(ingredientsTable).where(eq(ingredientsTable.mealId, patch.id));
    if (patch.sides && patch.sides.length > 0) {
      await db.delete(sidesTable).where(eq(sidesTable.mealId, patch.id));
    }

    // Update instructions
    await db.update(mealsTable)
      .set({ instructions: patch.instructions })
      .where(eq(mealsTable.id, patch.id));

    // Insert ingredients
    if (patch.ingredients.length > 0) {
      await db.insert(ingredientsTable).values(
        patch.ingredients.map((ing) => ({ ...ing, mealId: patch.id }))
      );
    }

    // Insert sides if provided
    if (patch.sides && patch.sides.length > 0) {
      await db.insert(sidesTable).values(
        patch.sides.map((s) => ({ ...s, mealId: patch.id }))
      );
    }

    count++;
    if (count % 10 === 0) console.log(`  ${count}/${patches.length} done…`);
  }
  console.log(`✅ Seeded ingredients for ${count} meals (American + Asian).`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
