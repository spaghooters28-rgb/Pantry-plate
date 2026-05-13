const BRAND_KEYWORDS: Record<string, string[]> = {
  "Beverages": [
    "dr pepper", "dr. pepper", "coca-cola", "coca cola", "diet coke", "mountain dew",
    "7up", "7-up", "sierra mist", "canada dry", "schweppes", "a&w", "barq's", "mug root beer",
    "gatorade", "powerade", "bodyarmor", "body armor", "prime hydration",
    "red bull", "monster energy", "celsius", "rockstar", "bang energy", "reign energy",
    "snapple", "arizona tea", "honest tea", "gold peak", "lipton", "bigelow",
    "tropicana", "minute maid", "simply orange", "ocean spray", "welch's", "capri sun",
    "kool-aid", "hawaiian punch", "sunny d", "sunny delight",
    "lacroix", "bubly", "spindrift", "liquid death", "topo chico", "san pellegrino",
    "perrier", "voss", "smartwater", "vitaminwater", "core water", "fiji water",
    "starbucks bottled", "dunkin bottled", "cold brew bottle",
    "heineken", "corona", "budweiser", "bud light", "miller lite", "coors light",
    "modelo", "dos equis", "stella artois", "blue moon", "guinness", "white claw",
    "truly hard", "hard seltzer", "mike's hard", "smirnoff ice",
  ],
  "Snacks": [
    "lay's", "lays", "doritos", "cheetos", "fritos", "pringles", "ruffles", "tostitos",
    "funyuns", "sunchips", "sun chips", "bugles", "combos",
    "goldfish crackers", "pepperidge farm goldfish",
    "triscuit", "wheat thins", "ritz crackers", "club crackers", "cheez-it", "cheez it",
    "oreo", "chips ahoy", "nutter butter", "nilla wafer", "fig newton",
    "kind bar", "clif bar", "rxbar", "larabar", "nature valley", "kind granola",
    "boom chicka pop", "skinny pop", "popcorners", "popchips", "pirate's booty",
    "slim jim", "jack link's", "jack links", "old wisconsin",
  ],
  "Condiments & Sauces": [
    "frank's redhot", "franks redhot", "frank's red hot",
    "tabasco", "cholula", "tapatio", "valentina", "el yucateco", "texas pete",
    "heinz ketchup", "hunt's ketchup",
    "hellmann's", "hellmans", "miracle whip", "best foods mayo",
    "grey poupon", "french's mustard", "gulden's",
    "hidden valley ranch", "ken's dressing", "newman's own dressing",
    "sweet baby ray's", "stubb's bbq", "stubbs bbq", "kraft bbq",
    "a.1. sauce", "a1 sauce", "lea & perrins", "lea and perrins",
    "pace salsa", "tostitos salsa", "herdez", "del monte salsa",
    "classico", "prego", "ragu", "bertolli",
  ],
  "Cleaning": [
    "tide pods", "tide detergent", "tide to go",
    "dawn dish", "palmolive dish", "cascade dishwasher", "finish dishwasher",
    "mr. clean", "mr clean", "lysol", "clorox", "pine-sol", "pinesol",
    "febreze", "fabreze", "swiffer", "oxiclean",
    "bounce dryer", "downy fabric", "gain detergent",
    "windex", "formula 409", "soft scrub", "comet cleaner",
    "ziploc", "hefty bags", "hefty trash", "glad trash", "great value trash",
    "bounty paper", "scott paper", "viva paper",
    "arm & hammer detergent", "all detergent",
  ],
  "Personal Care": [
    "pantene", "head & shoulders", "head and shoulders", "tresemme", "suave shampoo",
    "dove shampoo", "dove soap", "dove body wash",
    "axe body", "old spice", "degree deodorant", "secret deodorant", "ban deodorant",
    "gillette", "schick", "venus razor", "dollar shave",
    "colgate", "crest toothpaste", "sensodyne", "arm & hammer toothpaste",
    "listerine", "scope mouthwash", "act mouthwash",
    "neutrogena", "olay", "aveeno", "cetaphil", "cerave", "lubriderm",
    "nivea lotion", "vaseline", "aquaphor",
    "coppertone", "banana boat", "neutrogena sunscreen",
    "chapstick", "carmex", "burt's bees lip",
    "advil", "tylenol", "motrin", "aleve", "nyquil", "dayquil", "benadryl", "zyrtec", "claritin",
    "band-aid", "bandaid", "neosporin",
    "cottonelle", "charmin", "quilted northern", "angel soft",
  ],
  "Desserts": [
    "ben & jerry's", "ben and jerry's", "haagen-dazs", "haagen dazs", "breyers ice cream",
    "turkey hill", "blue bell ice cream", "talenti", "klondike bar",
    "reese's", "reeses", "snickers", "kit kat", "twix", "milky way", "3 musketeers",
    "m&m's", "m&ms", "skittles", "starburst candy", "nerds candy", "sour patch",
    "hershey's", "hersheys", "ghirardelli", "lindt chocolate", "cadbury", "toblerone",
    "jell-o pudding", "jell-o gelatin", "swiss miss", "hot cocoa mix",
    "little debbie", "hostess", "entenmann's",
  ],
  "Dairy & Eggs": [
    "kraft singles", "kraft cheese", "velveeta", "philadelphia cream cheese",
    "land o' lakes", "land o lakes", "cabot creamery", "tillamook cheese",
    "horizon organic", "organic valley", "kerrygold",
    "chobani", "fage yogurt", "yoplait", "dannon", "siggi's",
    "silk milk", "oatly", "almond breeze", "califia farms", "ripple milk",
    "daisy sour cream", "breakstone's",
  ],
  "Meat & Seafood": [
    "tyson chicken", "perdue chicken", "foster farms", "bell & evans",
    "jennie-o", "jennie o", "butterball turkey",
    "oscar mayer", "ball park franks", "hebrew national", "applegate",
    "jimmy dean", "hillshire farm", "jones sausage", "johnsonville",
    "boar's head", "boars head", "land o' frost",
    "gorton's fish", "gortons", "van de kamp's",
  ],
  "Grains & Bread": [
    "wonder bread", "dave's killer bread", "nature's own", "arnold bread",
    "pepperidge farm bread", "sara lee bread", "thomas' english", "thomas english",
    "mission tortilla", "old el paso tortilla", "la tortilla factory",
    "ben's original", "uncle ben's", "uncle bens", "zatarain's", "zatarains",
    "barilla pasta", "ronzoni", "de cecco",
    "quaker oats", "quaker oatmeal",
    "cheerios", "frosted flakes", "honey nut cheerios", "cinnamon toast crunch",
    "kellogg's", "kelloggs", "general mills cereal", "post cereal",
  ],
  "Canned Goods": [
    "campbell's soup", "campbells soup", "progresso soup", "amy's soup",
    "pacific foods", "imagine broth",
    "hunt's tomatoes", "hunts tomatoes", "muir glen", "del monte canned",
    "rotel tomatoes", "goya beans", "bush's beans", "bushs beans",
    "green giant canned", "le sueur", "birds eye canned",
    "bumble bee tuna", "starkist", "chicken of the sea",
    "dole fruit", "del monte fruit",
  ],
  "Pantry": [
    "skippy peanut", "jif peanut", "peter pan peanut", "justin's nut",
    "nutella", "smucker's", "smuckers",
    "karo syrup", "domino sugar", "c&h sugar",
    "crisco", "wesson oil", "pompeian olive", "california olive ranch",
    "mccormick spice", "badia spice", "morton salt", "diamond crystal salt",
    "arm & hammer baking", "clabber girl",
    "bob's red mill", "king arthur flour",
  ],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Produce": [
    "apple", "banana", "orange", "lemon", "lime", "grape", "berry", "berries", "tomato", "potato",
    "onion", "garlic", "carrot", "broccoli", "spinach", "lettuce", "kale", "cucumber", "bell pepper",
    "zucchini", "mushroom", "avocado", "celery", "corn", "pea", "basil", "parsley", "cilantro",
    "mint", "ginger", "jalapeño", "chile", "chili", "squash", "melon", "watermelon", "mango",
    "pineapple", "strawberry", "blueberry", "raspberry", "cherry", "peach", "plum", "pear",
    "arugula", "cabbage", "chard", "beet", "radish", "turnip", "asparagus", "artichoke",
    "eggplant", "leek", "scallion", "shallot", "yam", "sweet potato", "fennel", "cauliflower",
    "bok choy", "edamame", "snap peas", "green bean", "okra", "plantain", "herb", "fresh herb",
  ],
  "Meat & Seafood": [
    "chicken", "beef", "pork", "turkey", "lamb", "duck", "veal", "steak", "bacon", "ham",
    "sausage", "salmon", "tuna", "shrimp", "fish", "cod", "tilapia", "halibut", "crab",
    "lobster", "scallop", "clam", "mussel", "anchovy", "sardine", "trout", "catfish",
    "meatball", "ground beef", "ground turkey", "brisket", "rib", "tenderloin", "filet",
    "pepperoni", "salami", "prosciutto", "chorizo", "kielbasa", "hot dog", "deli meat",
  ],
  "Dairy & Eggs": [
    "milk", "cheese", "butter", "yogurt", "cream", "egg", "sour cream", "cream cheese",
    "mozzarella", "cheddar", "parmesan", "feta", "brie", "ricotta", "cottage cheese",
    "whipped cream", "half and half", "kefir", "ghee", "gouda", "swiss", "provolone",
    "almond milk", "oat milk", "soy milk", "heavy cream",
  ],
  "Grains & Bread": [
    "bread", "rice", "pasta", "flour", "oat", "cereal", "quinoa", "barley", "wheat",
    "noodle", "tortilla", "pita", "bagel", "cracker", "granola", "couscous", "polenta",
    "panko", "breadcrumb", "bun", "roll", "baguette", "wrap", "rye", "sourdough", "oatmeal",
  ],
  "Bakery": [
    "cake", "cookie", "brownie", "croissant", "donut", "pie", "tart", "pastry", "muffin",
    "cupcake", "cheesecake", "scone", "danish", "cinnamon roll", "macaron",
  ],
  "Canned Goods": [
    "canned", "can of", "tomato sauce", "tomato paste", "coconut milk", "broth", "stock",
    "soup", "beans in", "lentils in", "chickpeas in", "tuna in", "sardines in",
    "pumpkin puree", "condensed milk", "evaporated milk",
  ],
  "Condiments & Sauces": [
    "ketchup", "mustard", "mayo", "mayonnaise", "dressing", "salsa", "relish", "hot sauce",
    "soy sauce", "vinegar", "sriracha", "worcestershire", "teriyaki", "barbecue", "bbq",
    "hoisin", "fish sauce", "oyster sauce", "tahini", "pesto", "marinara", "aioli",
    "ranch", "honey mustard", "sweet chili", "buffalo sauce",
  ],
  "Snacks": [
    "chips", "popcorn", "pretzel", "trail mix", "granola bar", "protein bar", "jerky",
    "rice cake", "pita chip", "tortilla chip", "cheese cracker", "nut mix", "sunflower seed",
  ],
  "Desserts": [
    "ice cream", "gelato", "sorbet", "chocolate bar", "candy", "gummy", "pudding", "jello",
    "popsicle", "frozen yogurt", "caramel", "marshmallow", "whipped topping",
  ],
  "Beverages": [
    "coke", "pepsi", "sprite", "fanta", "root beer", "ginger ale",
    "juice", "soda", "coffee", "tea", "wine", "beer", "lemonade", "kombucha", "sports drink",
    "energy drink", "coconut water", "sparkling water", "lager", "ale", "cider", "espresso",
    "cold brew", "protein shake", "smoothie mix", "electrolyte",
  ],
  "Frozen": [
    "frozen", "popsicle", "frozen pizza", "frozen meal", "frozen vegetable",
    "frozen fruit", "frozen waffle", "frozen burrito",
  ],
  "Pantry": [
    "oil", "olive oil", "vegetable oil", "sesame oil", "coconut oil", "sugar", "honey",
    "syrup", "maple syrup", "jam", "jelly", "peanut butter", "almond butter",
    "nut", "almond", "cashew", "walnut", "pecan", "pistachio", "peanut", "seed",
    "raisin", "dried fruit", "spice", "cinnamon", "cumin", "paprika", "turmeric", "oregano",
    "thyme", "rosemary", "baking soda", "baking powder", "yeast", "cocoa", "vanilla",
    "salt", "black pepper", "ground pepper", "corn starch", "gelatin",
  ],
  "Cleaning": [
    "dish soap", "laundry detergent", "laundry liquid", "bleach", "all-purpose cleaner",
    "sponge", "scrub brush", "paper towel", "trash bag", "garbage bag",
    "plastic wrap", "aluminum foil", "parchment paper", "ziploc bag", "storage bag",
    "toilet paper", "tissue", "napkin", "disinfecting wipe", "cleaning wipe",
    "dryer sheet", "fabric softener", "stain remover",
  ],
  "Personal Care": [
    "shampoo", "conditioner", "body wash", "bar soap", "toothpaste", "deodorant", "lotion",
    "moisturizer", "sunscreen", "razor", "cotton ball", "cotton swab", "band aid", "vitamin",
    "mouthwash", "floss", "lip balm", "face wash", "toner", "serum",
  ],
};

export function detectCategory(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (lower.length < 2) return null;
  for (const [category, brands] of Object.entries(BRAND_KEYWORDS)) {
    if (brands.some((b) => lower.includes(b))) return category;
  }
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return null;
}
