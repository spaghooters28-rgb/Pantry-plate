import { db, pantryItemsTable } from "@workspace/db";

const pantryItems = [
  { name: "Eggs", category: "Dairy & Eggs", quantity: "12", inStock: true },
  { name: "Milk", category: "Dairy & Eggs", quantity: "1 gallon", inStock: true },
  { name: "Butter", category: "Dairy & Eggs", quantity: "1 lb", inStock: true },
  { name: "Cheddar Cheese", category: "Dairy & Eggs", quantity: "8 oz", inStock: true },
  { name: "Greek Yogurt", category: "Dairy & Eggs", quantity: "32 oz", inStock: true },
  { name: "All-Purpose Flour", category: "Grains & Bread", quantity: "5 lb", inStock: true },
  { name: "Rice", category: "Grains & Bread", quantity: "2 lb", inStock: true },
  { name: "Pasta", category: "Grains & Bread", quantity: "1 lb", inStock: true },
  { name: "Breadcrumbs", category: "Grains & Bread", quantity: "1 cup", inStock: true },
  { name: "Oats", category: "Grains & Bread", quantity: "2 lb", inStock: true },
  { name: "Chicken Breast", category: "Meat & Seafood", quantity: "2 lb", inStock: true },
  { name: "Ground Beef", category: "Meat & Seafood", quantity: "1 lb", inStock: true },
  { name: "Salmon", category: "Meat & Seafood", quantity: "1 lb", inStock: true },
  { name: "Garlic", category: "Produce", quantity: "1 head", inStock: true },
  { name: "Onion", category: "Produce", quantity: "3", inStock: true },
  { name: "Tomatoes", category: "Produce", quantity: "4", inStock: true },
  { name: "Spinach", category: "Produce", quantity: "5 oz", inStock: true },
  { name: "Lemon", category: "Produce", quantity: "3", inStock: true },
  { name: "Bell Pepper", category: "Produce", quantity: "2", inStock: true },
  { name: "Carrots", category: "Produce", quantity: "1 lb", inStock: true },
  { name: "Broccoli", category: "Produce", quantity: "1 head", inStock: true },
  { name: "Potatoes", category: "Produce", quantity: "3 lb", inStock: true },
  { name: "Olive Oil", category: "Oils", quantity: "500ml", inStock: true },
  { name: "Vegetable Oil", category: "Oils", quantity: "1 L", inStock: true },
  { name: "Soy Sauce", category: "Condiments & Sauces", quantity: "1 bottle", inStock: true },
  { name: "Hot Sauce", category: "Condiments & Sauces", quantity: "1 bottle", inStock: true },
  { name: "Tomato Sauce", category: "Canned Goods", quantity: "2 cans", inStock: true },
  { name: "Diced Tomatoes", category: "Canned Goods", quantity: "2 cans", inStock: true },
  { name: "Chicken Broth", category: "Canned Goods", quantity: "2 cans", inStock: true },
  { name: "Black Beans", category: "Canned Goods", quantity: "2 cans", inStock: true },
  { name: "Coconut Milk", category: "Canned Goods", quantity: "1 can", inStock: true },
  { name: "Basil", category: "Pantry", quantity: "1 bunch", inStock: false },
  { name: "Salt", category: "Pantry", quantity: "26 oz", inStock: true },
  { name: "Black Pepper", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Cumin", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Paprika", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Chili Powder", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Oregano", category: "Pantry", quantity: "1 oz", inStock: true },
  { name: "Garlic Powder", category: "Pantry", quantity: "3 oz", inStock: true },
  { name: "Onion Powder", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Cinnamon", category: "Pantry", quantity: "2 oz", inStock: true },
  { name: "Sugar", category: "Pantry", quantity: "4 lb", inStock: true },
  { name: "Brown Sugar", category: "Pantry", quantity: "2 lb", inStock: true },
  { name: "Honey", category: "Condiments & Sauces", quantity: "12 oz", inStock: true },
  { name: "Baking Powder", category: "Pantry", quantity: "1 can", inStock: true },
  { name: "Baking Soda", category: "Pantry", quantity: "1 box", inStock: true },
  { name: "Cornstarch", category: "Pantry", quantity: "1 lb", inStock: true },
  { name: "Sesame Oil", category: "Oils", quantity: "8 oz", inStock: true },
  { name: "Ginger", category: "Produce", quantity: "4 oz", inStock: true },
];

async function seed() {
  console.log("Seeding pantry items…");

  // Clear existing pantry items first to avoid duplicates
  await db.delete(pantryItemsTable);

  const inserted = await db.insert(pantryItemsTable).values(
    pantryItems.map((item) => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      inStock: item.inStock,
      notes: null,
    }))
  ).returning();

  console.log(`✅ Inserted ${inserted.length} pantry items.`);
  console.log(`   In stock: ${inserted.filter((i) => i.inStock).length}`);
  console.log(`   Depleted: ${inserted.filter((i) => !i.inStock).length}`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
