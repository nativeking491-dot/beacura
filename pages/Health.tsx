import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FOOD_TIPS, WEEKLY_MEAL_PLAN, WEEKLY_EXERCISE_PLAN } from "../constants";
import {
  Utensils,
  Droplets,
  Apple,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Brain,
  RefreshCcw,
  Loader2,
  Calendar,
  Dumbbell,
  CheckSquare,
  Square,
  Flame,
  Sun,
  Play,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { generateLocalResponse } from "../services/localChatService";

// ─── Comprehensive meal detail database ────────────────────────────────────
const MEAL_DETAILS: Record<string, {
  image: string;
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
  fiber: number;   // g
  prepTime: string;
  keyNutrients: string[];
  ingredients: string[];
  recoveryBenefit: string;
  cookLink: string;
  cookLinkLabel: string;
}> = {
  // ── MONDAY ──────────────────────────────────────────────────
  "oatmeal with walnuts": {
    image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&auto=format&fit=crop&q=70",
    calories: 380, protein: 10, carbs: 52, fat: 14, fiber: 8,
    prepTime: "10 min",
    keyNutrients: ["Beta-glucan", "Omega-3 (ALA)", "Manganese", "Antioxidants"],
    ingredients: ["½ cup rolled oats", "1 cup water or oat milk", "¼ cup walnuts", "½ cup blueberries", "1 tsp honey", "Pinch of cinnamon"],
    recoveryBenefit: "Oats stabilize blood sugar and mood. Walnuts provide Omega-3 fatty acids that reduce neuroinflammation caused by substance use. Blueberries contain anthocyanins that protect dopamine neurons.",
    cookLink: "https://www.youtube.com/results?search_query=oatmeal+with+walnuts+blueberries+healthy",
    cookLinkLabel: "Watch: How to Make It",
  },
  "grilled salmon with quinoa": {
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=70",
    calories: 520, protein: 42, carbs: 38, fat: 18, fiber: 5,
    prepTime: "25 min",
    keyNutrients: ["EPA/DHA Omega-3", "Complete Protein", "Magnesium", "Zinc"],
    ingredients: ["150g salmon fillet", "½ cup quinoa", "2 cups spinach", "1 tbsp olive oil", "Lemon juice", "Garlic clove", "Salt & pepper"],
    recoveryBenefit: "Salmon's EPA/DHA directly rebuilds brain cell membranes damaged by addiction. Quinoa provides all essential amino acids needed for neurotransmitter synthesis. Spinach offers folate for dopamine regulation.",
    cookLink: "https://www.youtube.com/results?search_query=grilled+salmon+quinoa+spinach+healthy",
    cookLinkLabel: "Watch: How to Make It",
  },
  "turkey stir-fry": {
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=70",
    calories: 490, protein: 38, carbs: 44, fat: 12, fiber: 6,
    prepTime: "20 min",
    keyNutrients: ["Tryptophan", "Selenium", "B6", "Chromium"],
    ingredients: ["200g ground turkey", "1 cup broccoli florets", "½ cup brown rice (cooked)", "2 tbsp low-sodium soy sauce", "1 tsp sesame oil", "Ginger, garlic"],
    recoveryBenefit: "Turkey is the richest dietary source of Tryptophan, which the brain converts to Serotonin and Melatonin — improving mood and sleep quality during early recovery.",
    cookLink: "https://www.youtube.com/results?search_query=turkey+stir+fry+broccoli+brown+rice+healthy",
    cookLinkLabel: "Watch: How to Make It",
  },
  // ── TUESDAY ─────────────────────────────────────────────────
  "greek yogurt with chia seeds": {
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=70",
    calories: 290, protein: 18, carbs: 32, fat: 9, fiber: 7,
    prepTime: "5 min",
    keyNutrients: ["Probiotics", "Calcium", "Omega-3 (ALA)", "Tyrosine"],
    ingredients: ["¾ cup full-fat Greek yogurt", "1 tbsp chia seeds", "1 tsp raw honey", "Sprinkle of cinnamon", "Optional: mixed berries"],
    recoveryBenefit: "Greek yogurt's probiotics directly improve the gut-brain axis, reducing anxiety. Chia seeds slow glucose absorption preventing sugar crashes that trigger cravings. Tyrosine in yogurt is the precursor to Dopamine.",
    cookLink: "https://www.youtube.com/results?search_query=greek+yogurt+chia+seeds+healthy+breakfast",
    cookLinkLabel: "Watch: How to Prepare",
  },
  "lentil soup with whole grain": {
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=70",
    calories: 420, protein: 22, carbs: 58, fat: 6, fiber: 14,
    prepTime: "35 min",
    keyNutrients: ["Folate", "Iron", "Fiber", "Slow-release carbs"],
    ingredients: ["1 cup red lentils", "1 carrot (diced)", "1 celery stalk", "1 onion", "2 garlic cloves", "Cumin, turmeric", "2 slices whole grain bread"],
    recoveryBenefit: "Lentils are one of the highest-folate foods. Folate deficiency is nearly universal in heavy alcohol/drug use and directly impairs serotonin synthesis. This meal begins restoring it.",
    cookLink: "https://www.youtube.com/results?search_query=lentil+soup+healthy+recipe+easy",
    cookLinkLabel: "Watch: How to Make It",
  },
  "baked chicken breast": {
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=70",
    calories: 460, protein: 48, carbs: 42, fat: 8, fiber: 5,
    prepTime: "50 min",
    keyNutrients: ["Complete protein", "B3 (Niacin)", "Selenium", "Potassium"],
    ingredients: ["200g chicken breast", "1 medium sweet potato", "Olive oil", "Paprika, garlic powder", "Rosemary", "Salt & pepper"],
    recoveryBenefit: "Chicken provides Niacin (B3), essential for NAD+ production — the molecule that detoxifies the body and repairs DNA. Sweet potato's complex carbs fuel the brain without causing energy crashes.",
    cookLink: "https://www.youtube.com/results?search_query=baked+chicken+breast+sweet+potato+healthy",
    cookLinkLabel: "Watch: How to Make It",
  },
  // ── WEDNESDAY ───────────────────────────────────────────────
  "green smoothie": {
    image: "https://images.unsplash.com/photo-1638176066736-aaa6a2e1d551?w=600&auto=format&fit=crop&q=70",
    calories: 310, protein: 22, carbs: 44, fat: 4, fiber: 6,
    prepTime: "5 min",
    keyNutrients: ["Chlorophyll", "Potassium", "Protein", "Vitamin K"],
    ingredients: ["1 cup kale leaves", "1 banana (frozen)", "1 scoop protein powder", "1 cup almond milk", "½ tsp ginger", "Ice"],
    recoveryBenefit: "Kale contains sulforaphane which activates the Nrf2 pathway — the body's master detox switch. This helps the liver process and expel residual toxins from substance use more efficiently.",
    cookLink: "https://www.youtube.com/results?search_query=green+smoothie+kale+banana+protein+detox",
    cookLinkLabel: "Watch: How to Blend",
  },
  "chickpea salad": {
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=70",
    calories: 390, protein: 16, carbs: 46, fat: 16, fiber: 12,
    prepTime: "10 min",
    keyNutrients: ["Fiber", "Folate", "Healthy fats (MUFA)", "Vitamin E"],
    ingredients: ["1 can chickpeas (drained)", "½ avocado (diced)", "Cherry tomatoes", "Cucumber", "Red onion", "Lemon juice", "Olive oil", "Parsley"],
    recoveryBenefit: "Avocado's monounsaturated fats rebuild myelin — the insulating sheath around nerve cells often damaged by chronic substance use. Chickpeas are exceptionally high in B6, critical for GABA and serotonin.",
    cookLink: "https://www.youtube.com/results?search_query=chickpea+avocado+salad+healthy+recipe",
    cookLinkLabel: "Watch: How to Make It",
  },
  // ── THURSDAY ────────────────────────────────────────────────
  "scrambled eggs with spinach": {
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=70",
    calories: 340, protein: 26, carbs: 8, fat: 22, fiber: 3,
    prepTime: "10 min",
    keyNutrients: ["Choline", "Lutein", "Iron", "Vitamin D"],
    ingredients: ["3 eggs", "1 cup fresh spinach", "30g feta cheese (crumbled)", "1 tbsp olive oil", "Salt, pepper, garlic"],
    recoveryBenefit: "Eggs are the #1 dietary source of Choline, which the brain uses to make acetylcholine — the neurotransmitter central to memory and learning that is depleted by drug use. Spinach's iron addresses anaemia common in recovery.",
    cookLink: "https://www.youtube.com/results?search_query=scrambled+eggs+spinach+feta+healthy+breakfast",
    cookLinkLabel: "Watch: How to Cook",
  },
  // ── FRIDAY ──────────────────────────────────────────────────
  "almond butter toast": {
    image: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=600&auto=format&fit=crop&q=70",
    calories: 350, protein: 12, carbs: 42, fat: 16, fiber: 6,
    prepTime: "5 min",
    keyNutrients: ["Vitamin E", "Magnesium", "B6", "Healthy fats"],
    ingredients: ["2 slices sprouted grain bread", "2 tbsp almond butter", "1 banana (sliced)", "Drizzle of honey", "Sprinkle of chia seeds"],
    recoveryBenefit: "Almonds are the richest food source of Vitamin E, a potent antioxidant that repairs oxidative damage in the central nervous system. Magnesium calms the nervous system and helps with anxiety and insomnia.",
    cookLink: "https://www.youtube.com/results?search_query=almond+butter+toast+banana+healthy+breakfast",
    cookLinkLabel: "Watch: How to Assemble",
  },
  "shrimp pasta": {
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop&q=70",
    calories: 530, protein: 36, carbs: 54, fat: 14, fiber: 4,
    prepTime: "25 min",
    keyNutrients: ["B12", "Zinc", "Iodine", "Selenium"],
    ingredients: ["150g shrimp (peeled)", "200g whole wheat pasta", "3 garlic cloves", "1 zucchini (sliced)", "2 tbsp olive oil", "Lemon zest", "Parsley", "Red chilli flakes"],
    recoveryBenefit: "Shrimp is exceptionally high in B12 and Iodine, both critical for thyroid function and nerve conduction. Many people in long-term recovery have depleted B12 stores, causing the numbness and fatigue they misattribute to other causes.",
    cookLink: "https://www.youtube.com/results?search_query=shrimp+pasta+garlic+olive+oil+zucchini+healthy",
    cookLinkLabel: "Watch: How to Make It",
  },
  // ── SATURDAY ────────────────────────────────────────────────
  "smoothie bowl with pumpkin seeds": {
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=70",
    calories: 380, protein: 14, carbs: 56, fat: 12, fiber: 9,
    prepTime: "10 min",
    keyNutrients: ["Zinc", "Magnesium", "Probiotics", "Fiber"],
    ingredients: ["1 frozen banana", "½ cup frozen berries", "½ cup Greek yogurt", "¼ cup almond milk", "Toppings: pumpkin seeds, granola, fresh fruit"],
    recoveryBenefit: "Pumpkin seeds are exceptionally high in Zinc and Magnesium. Zinc deficiency is extremely common after heavy drug or alcohol use and directly impairs immune function and wound healing. Zinc also co-factors hundreds of enzyme reactions.",
    cookLink: "https://www.youtube.com/results?search_query=smoothie+bowl+pumpkin+seeds+healthy+recipe",
    cookLinkLabel: "Watch: How to Make It",
  },
  "veggie burger": {
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=70",
    calories: 440, protein: 20, carbs: 52, fat: 14, fiber: 10,
    prepTime: "20 min",
    keyNutrients: ["Plant protein", "Iron", "B12 (fortified)", "Fiber"],
    ingredients: ["1 veggie burger patty", "Wholegrain bun", "2 cups kale", "Olive oil", "Lemon juice", "Walnuts", "Parmesan or nutritional yeast"],
    recoveryBenefit: "A high-fiber plant-based meal feeds beneficial gut bacteria. Research shows that the microbiome directly controls GABA levels in the brain — restoring it reduces anxiety and cravings.",
    cookLink: "https://www.youtube.com/results?search_query=veggie+burger+kale+salad+healthy",
    cookLinkLabel: "Watch: How to Cook",
  },
  "miso glazed tofu": {
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=70",
    calories: 360, protein: 24, carbs: 28, fat: 16, fiber: 5,
    prepTime: "30 min",
    keyNutrients: ["Isoflavones", "Probiotics", "Calcium", "Complete amino acids"],
    ingredients: ["300g firm tofu (pressed)", "2 tbsp white miso paste", "1 tbsp mirin", "1 tsp sesame oil", "Bok choy", "Sesame seeds", "Ginger"],
    recoveryBenefit: "Miso contains live cultures (probiotics) and isoflavones that reduce systemic inflammation — a key driver of depression in recovery. Tofu provides all essential amino acids including Tryptophan for serotonin synthesis.",
    cookLink: "https://www.youtube.com/results?search_query=miso+glazed+tofu+bok+choy+recipe",
    cookLinkLabel: "Watch: How to Make It",
  },
  // ── SUNDAY ──────────────────────────────────────────────────
  "buckwheat pancakes": {
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=70",
    calories: 400, protein: 14, carbs: 62, fat: 10, fiber: 6,
    prepTime: "20 min",
    keyNutrients: ["Rutin", "Magnesium", "Lysine", "Complex carbs"],
    ingredients: ["1 cup buckwheat flour", "1 egg", "¾ cup milk", "1 tsp baking powder", "Pinch of salt", "Mixed berries for topping", "Maple syrup (1 tsp)"],
    recoveryBenefit: "Buckwheat contains Rutin, a flavonoid that strengthens capillary walls and reduces brain fog. Unlike wheat flour, it causes a much lower glycaemic spike, preventing the energy crashes that are a common craving trigger.",
    cookLink: "https://www.youtube.com/results?search_query=buckwheat+pancakes+mixed+berries+healthy+recipe",
    cookLinkLabel: "Watch: How to Make It",
  },
};

// ─── Fuzzy match meal name to MEAL_DETAILS key ──────────────────────────────
function getMealDetails(mealName: string) {
  const lower = mealName.toLowerCase();
  for (const key of Object.keys(MEAL_DETAILS)) {
    if (lower.includes(key) || key.split(" ").filter(w => w.length > 4).every(w => lower.includes(w))) {
      return MEAL_DETAILS[key];
    }
  }
  return null;
}

// ─── Meal Image lookup (same as before) ─────────────────────────────────────
function getMealImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("oatmeal") || n.includes("oat")) return "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format&fit=crop&q=70";
  if (n.includes("yogurt")) return "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=70";
  if (n.includes("smoothie bowl")) return "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=70";
  if (n.includes("smoothie")) return "https://images.unsplash.com/photo-1638176066736-aaa6a2e1d551?w=500&auto=format&fit=crop&q=70";
  if (n.includes("egg") || n.includes("scrambled")) return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=70";
  if (n.includes("almond") || n.includes("toast")) return "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=500&auto=format&fit=crop&q=70";
  if (n.includes("pancake")) return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=70";
  if (n.includes("salmon")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=70";
  if (n.includes("lentil") || n.includes("soup")) return "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=70";
  if (n.includes("chickpea") || n.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=70";
  if (n.includes("tuna") || n.includes("wrap")) return "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=70";
  if (n.includes("quinoa") || n.includes("bowl")) return "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=70";
  if (n.includes("veggie") || n.includes("burger")) return "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=70";
  if (n.includes("bean") || n.includes("chili")) return "https://images.unsplash.com/photo-1547461777-ebaea5f35edb?w=500&auto=format&fit=crop&q=70";
  if (n.includes("turkey") || n.includes("stir")) return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=70";
  if (n.includes("chicken") || n.includes("baked")) return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=70";
  if (n.includes("shrimp") || n.includes("pasta")) return "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop&q=70";
  if (n.includes("tofu") || n.includes("miso")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=70";
  if (n.includes("beef") || n.includes("taco")) return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=70";
  if (n.includes("cod") || n.includes("fish")) return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=70";
  return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=70";
}

const Health: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const [glasses, setGlasses] = useState(0);
  const [isGeneratingSnack, setIsGeneratingSnack] = useState(false);
  const [aiSnack, setAiSnack] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [dailyMeals, setDailyMeals] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [justDrank, setJustDrank] = useState(false);
  // Meal detail modal
  const [selectedMeal, setSelectedMeal] = useState<{ name: string; type: string } | null>(null);

  const currentPlan = WEEKLY_MEAL_PLAN[activeDayIdx];
  const currentExercisePlan = WEEKLY_EXERCISE_PLAN[activeDayIdx];

  const getTodayKey = () => `daily_log_${new Date().toDateString()}`;

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedData = localStorage.getItem(todayKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGlasses(parsed.water || 0);
      setDailyMeals(parsed.meals || { breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises(parsed.exercises || []);
    } else {
      setGlasses(0);
      setDailyMeals({ breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises([]);
    }
  }, []);

  const saveData = (newGlasses: number, newMeals: any, newExercises: string[]) => {
    const todayKey = getTodayKey();
    localStorage.setItem(todayKey, JSON.stringify({ water: newGlasses, meals: newMeals, exercises: newExercises }));
  };

  const handleDrinkWater = () => {
    if (glasses < 12) {
      const newAmount = glasses + 1;
      setGlasses(newAmount);
      saveData(newAmount, dailyMeals, completedExercises);
      setJustDrank(true);
      setTimeout(() => setJustDrank(false), 1000);
    }
  };

  const handleMealChange = (type: "breakfast" | "lunch" | "dinner", value: string) => {
    const newMeals = { ...dailyMeals, [type]: value };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
  };

  const toggleExercise = (exerciseName: string) => {
    let newExercises;
    if (completedExercises.includes(exerciseName)) {
      newExercises = completedExercises.filter((e) => e !== exerciseName);
    } else {
      newExercises = [...completedExercises, exerciseName];
    }
    setCompletedExercises(newExercises);
    saveData(glasses, dailyMeals, newExercises);
  };

  const getCustomSnack = async () => {
    setIsGeneratingSnack(true);
    const response = await generateLocalResponse("I need a healthy recovery snack nutrition", user?.streak || 0, user?.name || "Friend");
    setAiSnack(response);
    setIsGeneratingSnack(false);
  };

  const handleLogAllMeals = () => {
    const newMeals = {
      breakfast: currentPlan.meals.breakfast,
      lunch: currentPlan.meals.lunch,
      dinner: currentPlan.meals.dinner,
    };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
  };

  const waterPct = Math.round((glasses / 12) * 100);
  const exercisePct = currentExercisePlan.exercises.length
    ? Math.round((completedExercises.length / currentExercisePlan.exercises.length) * 100)
    : 0;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== HEADER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-300 rounded-full blur-3xl opacity-20" />
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Brain Recovery Active</span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Health <span className="gradient-text-teal">&</span> Diet
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track your nutrition and movement for holistic recovery.</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-subtle px-4 py-2 rounded-xl text-center border border-teal-100/60">
              <p className="text-xs text-slate-400">Movement</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-teal-600">{exercisePct}<span className="text-sm">%</span></p>
            </div>
            <div className="glass-subtle px-4 py-2 rounded-xl text-center border border-blue-100/60">
              <p className="text-xs text-slate-400">Hydration</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-blue-600">{waterPct}<span className="text-sm">%</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* =================== EXERCISE SECTION =================== */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-10" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Dumbbell size={18} className="text-amber-400" />
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-white text-lg">
                  Today's Movement{" "}
                  <span className="text-amber-400">&mdash; {currentExercisePlan.focus}</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm">{currentExercisePlan.benefit}</p>
            </div>

            {/* Progress Ring-style badge */}
            <div className="relative flex items-center space-x-3 glass-dark px-4 py-2 rounded-xl">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={exercisePct === 100 ? "#34d399" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray={`${exercisePct * 0.94247} 94.247`}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{exercisePct}%</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-white font-bold">
                  {completedExercises.length}<span className="text-slate-400 font-normal">/{currentExercisePlan.exercises.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentExercisePlan.exercises.map((ex: any, idx: number) => {
              const isDone = completedExercises.includes(ex.name);
              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer group overflow-hidden
                    ${isDone
                      ? "bg-emerald-500/15 border-emerald-500/30"
                      : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]"
                    }`}
                >
                  {isDone && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`font-bold text-base leading-tight ${isDone ? "text-emerald-300" : "text-white"}`}>{ex.name}</h4>
                      <button
                        onClick={() => toggleExercise(ex.name)}
                        className={`flex-shrink-0 ml-2 transition-all ${isDone ? "text-emerald-400 scale-110" : "text-slate-500 hover:text-white"}`}
                      >
                        {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1.5 mb-3">
                      <Flame size={11} className="text-orange-400" />
                      <span className="text-xs font-semibold text-slate-400">{ex.duration}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{ex.instruction}</p>
                    <button
                      onClick={() => navigate(`/exercise-timer/${idx}`)}
                      className={`flex items-center space-x-1.5 text-xs font-bold transition-all ${isDone ? "text-emerald-400" : "text-amber-400 hover:text-amber-300"}`}
                    >
                      <Play size={11} />
                      <span>Start Timer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== TRACKING ROW =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Water Tracker */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                <Droplets size={18} className="text-white" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-800 dark:text-slate-100">Hydration</h3>
                <p className="text-xs text-slate-400">Daily water intake</p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
              {glasses}/12
            </span>
          </div>

          {/* Liquid bar */}
          <div className="relative mb-5">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
              <div
                className="h-full rounded-2xl transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${waterPct}%`,
                  background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
                }}
              >
                <div className="absolute inset-0 shimmer-effect rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              {[0, 3, 6, 9, 12].map(n => (
                <span key={n} className="text-[10px] text-slate-400">{n}</span>
              ))}
            </div>
          </div>

          {/* Glass dots */}
          <div className="grid grid-cols-6 gap-2 mb-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`h-9 rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${i < glasses
                  ? "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-md shadow-blue-100 dark:shadow-none scale-100"
                  : "bg-slate-100 dark:bg-slate-800 scale-90 opacity-60"
                  }`}
              >
                {i < glasses ? "💧" : ""}
              </div>
            ))}
          </div>

          <button
            onClick={handleDrinkWater}
            disabled={glasses === 12}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${glasses === 12
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20 cursor-default"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-0.5 hover:shadow-blue-300 dark:hover:shadow-none"
              }`}
          >
            <Droplets size={17} className={justDrank ? "animate-bounce" : ""} />
            <span>{glasses === 12 ? "✓ Fully Hydrated!" : `Drink a Glass · +5 XP`}</span>
          </button>
        </div>

        {/* Meal Logging */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                <Utensils size={18} className="text-white" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-800 dark:text-slate-100">Today's Intake</h3>
                <p className="text-xs text-slate-400">Log what you're eating</p>
              </div>
            </div>
            <button
              onClick={handleLogAllMeals}
              className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors border border-amber-100 dark:border-amber-500/20"
            >
              Log Plan
            </button>
          </div>

          <div className="space-y-3">
            {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
              const icons: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
              const labels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
              return (
                <div key={meal}>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>{icons[meal]}</span>
                    <span>{labels[meal]}</span>
                  </label>
                  <input
                    type="text"
                    value={dailyMeals[meal]}
                    onChange={(e) => handleMealChange(meal, e.target.value)}
                    placeholder={`e.g. ${currentPlan.meals[meal as keyof typeof currentPlan.meals]}`}
                    className="input-glow w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================== DIET PLAN =================== */}
      <section className="bento-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-lg">Suggested Diet Plan</h2>
              <p className="text-xs text-slate-400">Click any meal for full details — Science-backed for recovery</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-0.5">
            {WEEKLY_MEAL_PLAN.map((item, idx) => (
              <button key={item.day} onClick={() => setActiveDayIdx(idx)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap min-w-[48px] ${activeDayIdx === idx ? "bg-white dark:bg-slate-700 text-amber-600 shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <span className="opacity-60">{item.day.substring(0, 3).toUpperCase()}</span>
                <span>{idx === todayIdx ? "●" : item.day.substring(0, 2)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
              const configs = {
                breakfast: { icon: "🌅", label: "Breakfast", gradient: "from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10", border: "border-amber-100 dark:border-amber-500/20", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-400" },
                lunch: { icon: "☀️", label: "Lunch", gradient: "from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10", border: "border-teal-100 dark:border-teal-500/20", text: "text-teal-700 dark:text-teal-400", ring: "ring-teal-400" },
                dinner: { icon: "🌙", label: "Dinner", gradient: "from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10", border: "border-indigo-100 dark:border-indigo-500/20", text: "text-indigo-700 dark:text-indigo-400", ring: "ring-indigo-400" },
              };
              const c = configs[meal];
              const mealName = currentPlan.meals[meal as keyof typeof currentPlan.meals];
              const imgUrl = getMealImage(mealName);
              const details = getMealDetails(mealName);

              return (
                <div key={meal}
                  onClick={() => setSelectedMeal({ name: mealName, type: c.label })}
                  className={`relative group bg-gradient-to-br ${c.gradient} border ${c.border} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:ring-2 ${c.ring}`}>

                  {/* Food image strip on hover */}
                  <div className="relative h-28 overflow-hidden">
                    <img src={imgUrl} alt={mealName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=70"; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm ${c.text}`}>
                      {c.icon} {c.label}
                    </span>
                    {details && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        🔥 {details.calories} kcal
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug mb-2">{mealName}</p>
                    {details && (
                      <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-400 mb-3">
                        <span>🥩 {details.protein}g protein</span>
                        <span>🌾 {details.carbs}g carbs</span>
                        <span>⏱ {details.prepTime}</span>
                      </div>
                    )}
                    <p className={`text-[10px] font-bold ${c.text} flex items-center gap-1`}>
                      <span>Click for full details</span><ChevronRight size={11} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== MEAL DETAIL MODAL =================== */}
      {selectedMeal && (() => {
        const details = getMealDetails(selectedMeal.name);
        const imgUrl = details?.image || getMealImage(selectedMeal.name);
        const macros = details ? [
          { label: "Calories", value: details.calories, unit: "kcal", color: "bg-orange-400", pct: Math.min(100, (details.calories / 700) * 100) },
          { label: "Protein", value: details.protein, unit: "g", color: "bg-blue-400", pct: Math.min(100, (details.protein / 60) * 100) },
          { label: "Carbs", value: details.carbs, unit: "g", color: "bg-amber-400", pct: Math.min(100, (details.carbs / 80) * 100) },
          { label: "Fat", value: details.fat, unit: "g", color: "bg-rose-400", pct: Math.min(100, (details.fat / 40) * 100) },
          { label: "Fiber", value: details.fiber, unit: "g", color: "bg-emerald-400", pct: Math.min(100, (details.fiber / 25) * 100) },
        ] : [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMeal(null)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
              onClick={(e) => e.stopPropagation()}>

              {/* Hero image */}
              <div className="relative h-52 flex-shrink-0 overflow-hidden rounded-t-3xl">
                <img src={imgUrl} alt={selectedMeal.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button onClick={() => setSelectedMeal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{selectedMeal.type}</p>
                  <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-white font-extrabold text-xl leading-tight">{selectedMeal.name}</h3>
                  {details && <p className="text-white/60 text-xs mt-0.5">⏱ Prep time: {details.prepTime}</p>}
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* Macro bars */}
                {details && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nutrition per serving</h4>
                    <div className="space-y-2">
                      {macros.map(m => (
                        <div key={m.label} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-14 flex-shrink-0">{m.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${m.pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-16 text-right">{m.value} {m.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Nutrients */}
                {details && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Nutrients</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {details.keyNutrients.map(n => (
                        <span key={n} className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20">{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {details && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ingredients</h4>
                    <ul className="grid grid-cols-2 gap-1">
                      {details.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recovery Benefit */}
                {details && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">🧠 Recovery Science</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{details.recoveryBenefit}</p>
                  </div>
                )}

                {/* Cook reference link */}
                {details && (
                  <a href={details.cookLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                    <span>▶</span>
                    <span>{details.cookLinkLabel}</span>
                    <ChevronRight size={14} />
                  </a>
                )}

                {!details && (
                  <div className="text-center text-slate-400 text-sm py-4">
                    <p className="font-bold">{selectedMeal.name}</p>
                    <p className="text-xs mt-1">Full nutrition details coming soon for this meal.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* =================== NUTRITION INSIGHT =================== */}
      <section className="relative overflow-hidden bento-card rounded-2xl p-6 md:p-8">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-300 rounded-full blur-3xl opacity-15" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-300 rounded-full blur-2xl opacity-15" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-100 dark:shadow-none flex-shrink-0">
            <Brain size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                {WEEKLY_MEAL_PLAN[activeDayIdx].day}'s Focus
              </span>
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {FOOD_TIPS[activeDayIdx].title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5 max-w-2xl">
              {FOOD_TIPS[activeDayIdx].description}
            </p>
            <div className="glass-subtle inline-flex items-start gap-3 px-4 py-3 rounded-xl border border-white/60">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">Key Benefit</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{FOOD_TIPS[activeDayIdx].benefits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Snack Generator */}
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <button
              onClick={getCustomSnack}
              disabled={isGeneratingSnack}
              className="btn-primary px-5 py-2.5 text-sm flex items-center space-x-2"
            >
              {isGeneratingSnack ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              <span>{isGeneratingSnack ? "Generating..." : "Get AI Snack Suggestion"}</span>
            </button>
            {aiSnack && (
              <div className="glass-subtle flex-1 px-4 py-3 rounded-xl border border-white/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {aiSnack}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Health;
