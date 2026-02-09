import React from "react";
import { Shield, Award, Heart, Activity, Coffee, Brain, Pill, AlertCircle, HeartPulse, Zap, Thermometer, AlertTriangle } from "lucide-react";
import { UserRole, Badge, Mentor, FoodTip } from "./types";

export const MOCK_USER = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: UserRole.RECOVERING,
  streak: 15,
  points: 1250,
  badges: [
    { id: "b1", name: "Week One", icon: "Shield", color: "text-blue-500" },
    {
      id: "b2",
      name: "First Mentor Call",
      icon: "Award",
      color: "text-yellow-500",
    },
  ],
  joinDate: "2024-01-15",
};

export const MOCK_MENTORS: Mentor[] = [
  {
    id: "m1",
    name: "Dr. Anjali Chhabria",
    experience: "25+ Years Exp",
    rating: 4.9,
    specialty: ["Psychiatry", "De-addiction", "Anxiety"],
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m2",
    name: "Dr. Harish Shetty",
    experience: "30+ Years Exp",
    rating: 5.0,
    specialty: ["Community Mental Health", "Rehabilitation"],
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m3",
    name: "Dr. Shyam Bhat",
    experience: "20+ Years Exp",
    rating: 4.8,
    specialty: ["Integrative Medicine", "Holistic Recovery"],
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m4",
    name: "Dr. Priya Menon",
    experience: "18+ Years Exp",
    rating: 4.9,
    specialty: ["Addiction Psychiatry", "Cognitive Behavioral Therapy"],
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m5",
    name: "Dr. Rajesh Kumar",
    experience: "22+ Years Exp",
    rating: 4.7,
    specialty: ["Family Therapy", "Relationship Counseling"],
    avatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m6",
    name: "Dr. Neha Sharma",
    experience: "15+ Years Exp",
    rating: 4.8,
    specialty: ["Trauma Specialist", "PTSD Treatment"],
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m7",
    name: "Dr. Vikram Singh",
    experience: "28+ Years Exp",
    rating: 5.0,
    specialty: ["Clinical Psychology", "Behavioral Addiction"],
    avatar:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "m8",
    name: "Dr. Aisha Patel",
    experience: "12+ Years Exp",
    rating: 4.9,
    specialty: ["Relapse Prevention", "Mindfulness Therapy"],
    avatar:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop",
  },
];

export const FOOD_TIPS: FoodTip[] = [
  {
    title: "Complex Carbohydrates",
    description: "Whole grains, beans, and vegetables provide stable energy.",
    benefits: "Reduces mood swings and irritability common in early recovery.",
  },
  {
    title: "Protein-Rich Snacks",
    description: "Lean meats, nuts, and yogurt contain amino acids (Tyrosine).",
    benefits: "Helps repair brain tissue and balances neurotransmitters.",
  },
  {
    title: "Hydration Focus",
    description: "Drink at least 12 glasses of water daily.",
    benefits: "Flushes out toxins and helps prevent headaches.",
  },
  {
    title: "Gut-Brain Connection",
    description: "Fermented foods like kimchi, sauerkraut, and yogurt.",
    benefits: "90% of serotonin is made in the gut. A healthy gut means a stable mood.",
  },
  {
    title: "Magnesium Boosters",
    description: "Spinach, pumpkin seeds, and almonds.",
    benefits: "Natural muscle relaxant that helps with insomnia and restless legs.",
  },
  {
    title: "Antioxidant Power",
    description: "Dark berries (blueberries, blackberries) and dark chocolate.",
    benefits: "Protects brain cells from oxidative stress caused by past substance use.",
  },
  {
    title: "Sugar Management",
    description: "Avoid spikes by pairing fruit with fats (like nut butter).",
    benefits: "Prevents the 'crash' that can often trigger cravings.",
  },
];

export const WEEKLY_MEAL_PLAN = [
  {
    day: "Monday",
    theme: "Brain Recovery",
    meals: {
      breakfast: "Oatmeal with Walnuts & Blueberries",
      lunch: "Grilled Salmon with Quinoa & Spinach",
      dinner: "Turkey Stir-fry with Broccoli & Brown Rice",
      benefit:
        "High in Omega-3s and Tryptophan to support mood and brain repair.",
    },
  },
  {
    day: "Tuesday",
    theme: "Energy Balance",
    meals: {
      breakfast: "Greek Yogurt with Chia Seeds & Honey",
      lunch: "Lentil Soup with Whole Grain Toast",
      dinner: "Baked Chicken Breast with Sweet Potato",
      benefit: "Sustained glucose release to prevent mid-day irritability.",
    },
  },
  {
    day: "Wednesday",
    theme: "Detox Support",
    meals: {
      breakfast: "Green Smoothie (Kale, Banana, Protein Powder)",
      lunch: "Chickpea Salad with Avocado & Lemon",
      dinner: "Cod with Asparagus & Roasted Carrots",
      benefit:
        "High fiber and antioxidants to help the liver flush out toxins.",
    },
  },
  {
    day: "Thursday",
    theme: "Stress Reduction",
    meals: {
      breakfast: "Scrambled Eggs with Spinach & Feta",
      lunch: "Tuna Wrap with Sprouted Grain Tortilla",
      dinner: "Lean Beef Tacos with Black Beans & Cabbage",
      benefit: "Rich in Magnesium and Zinc to lower cortisol levels.",
    },
  },
  {
    day: "Friday",
    theme: "Nerve Repair",
    meals: {
      breakfast: "Almond Butter Toast with Banana Slices",
      lunch: "Quinoa Bowl with Roasted Beets & Goat Cheese",
      dinner: "Shrimp Pasta with Garlic, Olive Oil & Zucchini",
      benefit: "B-Vitamins focus to support the central nervous system.",
    },
  },
  {
    day: "Saturday",
    theme: "Digestive Health",
    meals: {
      breakfast: "Smoothie Bowl with Pumpkin Seeds",
      lunch: "Veggie Burger with a Side Kale Salad",
      dinner: "Miso Glazed Tofu with Bok Choy",
      benefit: "Probiotics and prebiotics to restore gut microbiome balance.",
    },
  },
  {
    day: "Sunday",
    theme: "Overall Vitality",
    meals: {
      breakfast: "Buckwheat Pancakes with Mixed Berries",
      lunch: "Mixed Bean Chili with Cornbread",
      dinner: "Roasted Turkey with Steamed Green Beans",
      benefit: "Complete proteins and diverse minerals for physical strength.",
    },
  },
];

export const MEDICAL_FAQS = [
  {
    q: "How can I manage physical withdrawal symptoms?",
    a: "Focus on rest, hydration, and light exercise. Consult a physician for safe tapering if necessary.",
  },
  {
    q: "When should I seek emergency medical help?",
    a: "If you experience seizures, high fever, severe chest pain, or hallucinations, call emergency services immediately.",
  },
  {
    q: "Why can't I sleep? (Insomnia)",
    a: "Your brain's ability to regulate sleep cycles was disrupted. It takes time to reset. Avoid caffeine after noon and screens 1 hour before bed.",
  },
  {
    q: "What is PAWS (Post-Acute Withdrawal Syndrome)?",
    a: "PAWS involves symptoms like brain fog, mood swings, and anxiety that can persist for months after quitting. It is a sign your brain is healing.",
  },
  {
    q: "Is my liver permanently damaged?",
    a: "The liver has amazing regenerative properties. Abstinence, a healthy diet, and avoiding processed foods allow it to heal significantly over time.",
  },
  {
    q: "Why do I feel 'flat' or bored (Anhedonia)?",
    a: "Your dopamine receptors were downregulated to protect the brain. They are currently 'numb'. They will regenerate, but it requires patience and small joys.",
  },
  {
    q: "Can exercise really help?",
    a: "Yes. Aerobic exercise increases BDNF (Brain-Derived Neurotrophic Factor), which repairs neurons and creates new neural pathways.",
  },
];

export const COMMON_SYMPTOMS = [
  {
    title: "Sleep Disturbance",
    icon: "Pill",
    desc: "Insomnia or vivid dreams are common as your brain recalibrates.",
    tip: "Try the 4-7-8 breathing technique before bed.",
  },
  {
    title: "Physical Aches",
    icon: "AlertCircle",
    desc: "Muscle tension and flu-like symptoms are typical early on.",
    tip: "Warm baths with Epsom salts can help relax muscles.",
  },
  {
    title: "Emotional Swings",
    icon: "HeartPulse",
    desc: "Anxiety and irritability often peak within the first 72 hours.",
    tip: "This is temporary. Distract yourself with 5 minutes of focused activity.",
  },
  {
    title: "Brain Fog",
    icon: "Brain",
    desc: "Temporary difficulty focusing or remembering things.",
    tip: "Write things down. Don't multitask. Your brain is healing.",
  },
  {
    title: "Tremors & Shakes",
    icon: "Activity",
    desc: "Fine motor control issues caused by nervous system over-excitation.",
    tip: "Avoid caffeine. Keep blood sugar stable with small, frequent meals.",
  },
  {
    title: "Temperature Flashes",
    icon: "Thermometer",
    desc: "Sudden sweating or chills as your body regulates temperature.",
    tip: "Dress in layers and stay hydrated to replace lost fluids.",
  },
  {
    title: "Intense Cravings",
    icon: "Zap",
    desc: "Sudden urges to use, often triggered by stress or cues.",
    tip: "Play the tape forward. How will you feel 1 hour after using?",
  },
];

export const RECOVERY_DOS = [
  { text: "Maintain a consistent sleep schedule (7-9 hours).", icon: "Moon" },
  { text: "Communicate symptoms to a medical professional.", icon: "Stethoscope" },
  { text: "Practice deep breathing when cravings peak.", icon: "Wind" },
  { text: "Surround yourself with clean, positive influences.", icon: "ShieldCheck" },
  { text: "Eat protein-rich meals to stabilize mood.", icon: "Utensils" },
  { text: "Exercise daily to boost natural dopamine.", icon: "Activity" },
  { text: "Connect with a mentor or support group.", icon: "Users" },
];

export const RECOVERY_DONTS = [
  { text: "Don't go 'cold turkey' without medical supervision.", icon: "AlertTriangle" },
  { text: "Don't self-medicate with other substances.", icon: "Pill" },
  { text: "Avoid isolating yourself when feeling low.", icon: "UserX" },
  { text: "Don't skip meals or neglect hydration.", icon: "Droplets" },
  { text: "Don't visit old 'using spots' to test willpower.", icon: "MapPin" },
  { text: "Don't keep secrets; honesty reduces shame.", icon: "Lock" },
  { text: "Don't ignore HALT triggers (Hungry, Angry, Lonely, Tired).", icon: "BatteryWarning" },
];

export const WEEKLY_EXERCISE_PLAN = [
  {
    day: "Monday",
    focus: "Cardio Kickstart",
    benefit: "Boosts endorphins to combat 'Monday Blue' feelings.",
    exercises: [
      { name: "Brisk Walk/Jog", duration: "20 mins", instruction: "Keep a steady pace. Focus on your breathing." },
      { name: "Jumping Jacks", duration: "3 sets of 15", instruction: "Full arm extension. Lands softly on balls of feet." },
      { name: "High Knees", duration: "30 seconds", instruction: "Drive knees up to waist level while jogging in place." },
    ]
  },
  {
    day: "Tuesday",
    focus: "Upper Body Strength",
    benefit: "Rebuilding physical strength mirrors mental resilience.",
    exercises: [
      { name: "Push-ups (or Wall Push-ups)", duration: "3 sets of 10", instruction: "Keep core tight. Lower chest to floor/wall." },
      { name: "Arm Circles", duration: "1 min each direction", instruction: "Keep arms straight at shoulder height. Small circles." },
      { name: "Plank Shoulder Taps", duration: "20 taps", instruction: "Hold plank position, tap opposite shoulder with hand." },
    ]
  },
  {
    day: "Wednesday",
    focus: "Yoga & Flexibility",
    benefit: "Releases tension stored in muscles from anxiety.",
    exercises: [
      { name: "Child's Pose", duration: "Hold for 2 mins", instruction: "Kneel, sit back on heels, stretch arms forward on floor." },
      { name: "Cat-Cow Stretch", duration: "10 reps", instruction: "On all fours, arch back up (Cat) then dip down (Cow)." },
      { name: "Seated Forward Fold", duration: "Hold for 1 min", instruction: "Legs straight, reach for toes. Breathe deeply." },
    ]
  },
  {
    day: "Thursday",
    focus: "Lower Body Stability",
    benefit: "Grounding exercises help when feeling 'in your head'.",
    exercises: [
      { name: "Bodyweight Squats", duration: "3 sets of 12", instruction: "Feet shoulder-width. Sit back like into a chair." },
      { name: "Lunges", duration: "10 per leg", instruction: "Step forward, lower back knee towards ground. Keep front knee behind toe." },
      { name: "Calf Raises", duration: "3 sets of 15", instruction: "Stand tall, raise heels off ground, lower slowly." },
    ]
  },
  {
    day: "Friday",
    focus: "Core & Balance",
    benefit: "A strong core improves posture and confidence.",
    exercises: [
      { name: "Plank Hold", duration: "30-60 seconds", instruction: "Forearms on ground, body in straight line. Don't let hips sag." },
      { name: "Bicycle Crunches", duration: "20 reps", instruction: "On back, elbow to opposite knee. Focus on rotation." },
      { name: "Single Leg Stand", duration: "30 sec per leg", instruction: "Stand on one foot. Close eyes for extra challenge." },
    ]
  },
  {
    day: "Saturday",
    focus: "Active Fun",
    benefit: "Rediscovering joy in movement without strict regimen.",
    exercises: [
      { name: "Dance / Zumba", duration: "15 mins", instruction: "Put on your favorite upbeat song and just move." },
      { name: "Nature Hike", duration: "30 mins", instruction: "Walk explicitly in a green area. Notice 3 birds/plants." },
      { name: "Stretching", duration: "10 mins", instruction: "Gentle full body stretch to cool down." },
    ]
  },
  {
    day: "Sunday",
    focus: "Rest & Recovery",
    benefit: "Rest is when the muscles (and mind) actually repair.",
    exercises: [
      { name: "Deep Breathing", duration: "5 mins", instruction: "Inhale 4 counts, Hold 4, Exhale 4, Hold 4 (Box Breathing)." },
      { name: "Gentle Neck Rolls", duration: "1 min", instruction: "Slowly roll head from side to side. Release jaw tension." },
      { name: "Leisurely Stroll", duration: "15 mins", instruction: "Slow pace. No headphones. Listen to the world." },
    ]
  },
];
