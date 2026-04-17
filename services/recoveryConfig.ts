import type { RecoveryCategory } from "../context/OnboardingContext";

// ─── Category-Aware Recovery Configuration ───────────────────────────────────
// This central config provides dynamic labels, milestones, and win-log options
// for every recovery category, so the Dashboard and components adapt automatically.

export interface CategoryConfig {
  streakLabel: string;         // "Sobriety" | "Healing" | "Recovery" | "Journey"
  streakUnit: string;          // "clean" | "forward" | "recovering" | "growing"
  winButtonText: string;       // What the big green win-log button says
  winOptions: string[];        // Options in the win-logger modal
  chartLabel: string;          // What the chart tracks (e.g., "cravings" → "difficult moments")
  greetingSuffix: string;      // Day X — <suffix>
  whyImHerePrompt: string;     // Prompt for the "Why I'm Here" card
  dailyEncouragement: string[];// Rotating daily motivational messages
  color: string;               // Primary accent color
  emoji: string;               // Category emoji
  milestones: Record<number, {
    emoji: string;
    title: string;
    science: string;
    color: string;
  }>;
}

const CONFIGS: Record<RecoveryCategory, CategoryConfig> = {
  substance_addiction: {
    streakLabel: "Sobriety",
    streakUnit: "clean",
    winButtonText: "🌟 I Survived a Craving — Log My Win",
    winOptions: [
      "Resisted a craving",
      "Avoided a trigger situation",
      "Called someone instead",
      "Used a healthy coping strategy",
      "Made it through a hard night",
      "Attended a support meeting",
    ],
    chartLabel: "cravings",
    greetingSuffix: "you're building momentum. That quiet strength you feel? That's real.",
    whyImHerePrompt: "Write your personal reason for staying clean — it will appear here every time you open the app.",
    dailyEncouragement: [
      "Every sober moment is a victory. You're rewriting your story.",
      "Your brain is literally healing right now. Keep going.",
      "The cravings lie. Your future self is cheering you on.",
    ],
    color: "#8b5cf6",
    emoji: "🧬",
    milestones: {
      1: { emoji: "🌱", title: "24 Hours Clean", science: "Your blood pressure is already normalizing. Every hour counts.", color: "#10b981" },
      3: { emoji: "⚡", title: "3 Days Clean", science: "The acute withdrawal peak is passing. Your brain is stabilizing.", color: "#6366f1" },
      7: { emoji: "🌟", title: "One Week Clean", science: "Your sleep is improving. Dopamine receptors are beginning to repair.", color: "#f59e0b" },
      14: { emoji: "💪", title: "Two Weeks Clean", science: "Anxiety and depression symptoms are measurably easing.", color: "#0d9488" },
      30: { emoji: "🏆", title: "30 Days Clean!", science: "Your brain has significantly rewired. Cravings are less frequent.", color: "#f97316" },
      60: { emoji: "🔥", title: "60 Days Clean!", science: "Prefrontal cortex function is substantially restored.", color: "#ec4899" },
      90: { emoji: "👑", title: "90 Days Clean!", science: "You've completed the most critical window of early recovery.", color: "#8b5cf6" },
    },
  },

  love_failure: {
    streakLabel: "Healing",
    streakUnit: "forward",
    winButtonText: "💜 I Chose Myself Today — Log My Win",
    winOptions: [
      "Didn't check their social media",
      "Didn't send that text",
      "Went out and did something for myself",
      "Talked to a friend instead of isolating",
      "Deleted old photos or messages",
      "Set a healthy boundary",
      "Felt okay being alone",
    ],
    chartLabel: "difficult moments",
    greetingSuffix: "your heart is healing. The pain won't last forever, but your growth will.",
    whyImHerePrompt: "Write a letter to your future self about why you deserve better — it will appear here to remind you.",
    dailyEncouragement: [
      "Heartbreak is proof you loved deeply. Healing is proof you're strong.",
      "You are not broken. You are breaking through.",
      "The best relationship you'll ever have is the one with yourself.",
    ],
    color: "#ec4899",
    emoji: "💔",
    milestones: {
      1: { emoji: "🌱", title: "First Day Forward", science: "Your brain's attachment system is in overdrive. This is the hardest day — and you made it.", color: "#ec4899" },
      3: { emoji: "💪", title: "3 Days Strong", science: "Cortisol levels from heartbreak begin dropping after 72 hours of no contact.", color: "#f59e0b" },
      7: { emoji: "🌟", title: "One Week of Freedom", science: "Your prefrontal cortex is regaining control over emotional decisions.", color: "#8b5cf6" },
      14: { emoji: "⚡", title: "Two Weeks of Growth", science: "Your brain is forming new neural pathways that don't include them.", color: "#06b6d4" },
      30: { emoji: "🏆", title: "30 Days Forward!", science: "Studies show 30 days of no contact reduces emotional attachment by 40%.", color: "#10b981" },
      60: { emoji: "🔥", title: "60 Days of Self-Love!", science: "Your identity is restructuring. You're becoming someone new — and stronger.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Healed!", science: "Neuroscience shows 90 days is enough to break most emotional addiction patterns.", color: "#a855f7" },
    },
  },

  physical_injury: {
    streakLabel: "Recovery",
    streakUnit: "recovering",
    winButtonText: "🦴 I Moved My Body — Log My Progress",
    winOptions: [
      "Completed my exercises",
      "Pain was lower than yesterday",
      "Achieved a new range of motion",
      "Walked further than before",
      "Skipped painkillers today",
      "Slept without pain",
    ],
    chartLabel: "pain episodes",
    greetingSuffix: "your body is rebuilding itself stronger. Every small movement is progress.",
    whyImHerePrompt: "Write your recovery goal — it will appear here as your daily reminder.",
    dailyEncouragement: [
      "Your body heals at its own pace. Trust the process.",
      "The tissue you're rebuilding today will be stronger than what was there before.",
      "Pain is temporary. The strength you're building is permanent.",
    ],
    color: "#10b981",
    emoji: "🦴",
    milestones: {
      1: { emoji: "🌱", title: "Day 1: First Steps", science: "Inflammatory healing has begun. Your body is already sending repair cells to the injury.", color: "#10b981" },
      3: { emoji: "❄️", title: "3 Days of Care", science: "Controlled movement increases blood flow by 25%, bringing nutrients to the injury site.", color: "#06b6d4" },
      7: { emoji: "🏗️", title: "One Week Strong", science: "New collagen fibers are being laid down. Gentle movement helps align them properly.", color: "#6366f1" },
      14: { emoji: "🚶", title: "Two Weeks Moving", science: "The proliferative healing phase peaks now. New tissue is forming rapidly.", color: "#8b5cf6" },
      30: { emoji: "💪", title: "30 Days of Progress!", science: "At 4 weeks, collagen fibers reorganize along lines of stress — your exercises are literally shaping stronger tissue.", color: "#f59e0b" },
      60: { emoji: "🔥", title: "60 Days Strong!", science: "Repaired tissue has 50-60% of its original strength. Progressive overload produces the most gains now.", color: "#f97316" },
      90: { emoji: "🏆", title: "90 Days Recovered!", science: "Tissue reaches 80-90% of original strength. Full rehab reduces re-injury rates by 65%.", color: "#ec4899" },
    },
  },

  grief_loss: {
    streakLabel: "Journey",
    streakUnit: "breathing",
    winButtonText: "🕊️ I Honored My Feelings — Log My Moment",
    winOptions: [
      "Let myself cry without judgment",
      "Shared a memory of them",
      "Reached out to someone who understands",
      "Did something they would have loved",
      "Wrote in my journal",
      "Allowed myself to feel joy without guilt",
    ],
    chartLabel: "grief waves",
    greetingSuffix: "grief comes in waves. You're learning to ride them with grace.",
    whyImHerePrompt: "Write something about who you're honoring — their memory lives here.",
    dailyEncouragement: [
      "Grief is the price of love. Your pain shows how deeply you cared.",
      "There's no timeline for grief. Be gentle with yourself today.",
      "They would be proud of you for still showing up.",
    ],
    color: "#6366f1",
    emoji: "🕊️",
    milestones: {
      1: { emoji: "🕯️", title: "First Day Breathing", science: "Acute grief activates the same brain regions as physical pain. Just breathing through it is an achievement.", color: "#6366f1" },
      3: { emoji: "💙", title: "3 Days of Courage", science: "Your body's stress response (cortisol, adrenaline) begins to stabilize after the initial shock.", color: "#06b6d4" },
      7: { emoji: "🌿", title: "One Week of Gentleness", science: "Sleep disruption from grief begins to improve. Your body needs rest to process emotions.", color: "#10b981" },
      14: { emoji: "🌅", title: "Two Weeks of Honoring", science: "Your brain is beginning to integrate the loss, making space for both sadness and daily function.", color: "#f59e0b" },
      30: { emoji: "🌻", title: "30 Days of Remembrance", science: "The amygdala's hyperactive grief response is calming. You're learning to carry the loss, not drown in it.", color: "#ec4899" },
      60: { emoji: "🌈", title: "60 Days of Growth", science: "Post-traumatic growth research shows meaningful personal development often begins around this time.", color: "#f97316" },
      90: { emoji: "⭐", title: "90 Days of Strength", science: "Studies show that by 90 days, most people find a 'new normal' — not forgetting, but learning to live alongside the loss.", color: "#8b5cf6" },
    },
  },

  mental_health: {
    streakLabel: "Progress",
    streakUnit: "growing",
    winButtonText: "🧠 I Did Something Brave — Log My Win",
    winOptions: [
      "Left the house today",
      "Practiced a breathing exercise",
      "Challenged a negative thought",
      "Asked for help",
      "Completed a task I was avoiding",
      "Set a boundary",
      "Took my medication",
    ],
    chartLabel: "anxiety moments",
    greetingSuffix: "you showed up today, and that matters more than you know.",
    whyImHerePrompt: "Write what you're working toward — it will appear here as your daily anchor.",
    dailyEncouragement: [
      "Your brain is not broken. It's been hurt, and it's learning to heal.",
      "Small steps are still steps. You're moving forward.",
      "Asking for help is strength, not weakness.",
    ],
    color: "#06b6d4",
    emoji: "🧠",
    milestones: {
      1: { emoji: "🌱", title: "Day 1: Showing Up", science: "Acknowledging you need support is the most powerful first step there is.", color: "#06b6d4" },
      3: { emoji: "💡", title: "3 Days Aware", science: "Consistent self-awareness for 72 hours begins creating new neural patterns.", color: "#6366f1" },
      7: { emoji: "🌟", title: "One Week Present", science: "After 7 days of practice, your brain begins defaulting to healthier thought patterns.", color: "#f59e0b" },
      14: { emoji: "⚡", title: "Two Weeks Strong", science: "Studies show 14 days of consistent coping practice reduces symptom severity by 20-30%.", color: "#10b981" },
      30: { emoji: "🏆", title: "30 Days of Growth!", science: "A month of intentional mental health work creates measurable structural brain changes.", color: "#ec4899" },
      60: { emoji: "🔥", title: "60 Days Resilient!", science: "At 60 days, new coping strategies become automatic. Your resilience is transforming.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Thriving!", science: "Research shows 90 days of consistent effort can fundamentally change your relationship with mental health.", color: "#8b5cf6" },
    },
  },

  burnout_stress: {
    streakLabel: "Balance",
    streakUnit: "balanced",
    winButtonText: "🔥 I Set a Boundary — Log My Win",
    winOptions: [
      "Left work on time",
      "Said no to an extra task",
      "Took a real break",
      "Put my phone away for 1+ hours",
      "Did something just for fun",
      "Got 7+ hours of sleep",
    ],
    chartLabel: "stress spikes",
    greetingSuffix: "you're learning to protect your energy. That's not selfish — it's essential.",
    whyImHerePrompt: "Write what balance means to you — it will appear here as your daily intention.",
    dailyEncouragement: [
      "You are not a machine. Rest is productive.",
      "The world can wait. Your wellbeing cannot.",
      "Boundaries are not walls. They're bridges to a sustainable life.",
    ],
    color: "#f59e0b",
    emoji: "🔥",
    milestones: {
      1: { emoji: "🛑", title: "Day 1: The Pause", science: "Recognizing burnout is the critical first step. Your nervous system is thanking you.", color: "#f59e0b" },
      3: { emoji: "😴", title: "3 Days Resting", science: "After 72 hours of reduced stress, cortisol levels begin to normalize.", color: "#06b6d4" },
      7: { emoji: "🌿", title: "One Week of Calm", science: "A week of boundary-setting begins restoring the prefrontal cortex's executive function.", color: "#10b981" },
      14: { emoji: "⚡", title: "Two Weeks Recharged", science: "Sleep quality improves significantly. Your body's inflammatory markers start dropping.", color: "#6366f1" },
      30: { emoji: "🏆", title: "30 Days Balanced!", science: "One month of sustainable habits rewires your stress response. You're literally different.", color: "#ec4899" },
      60: { emoji: "🌟", title: "60 Days Thriving!", science: "Burnout recovery is well underway. Your motivation and creativity are returning.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Free!", science: "Full burnout recovery typically takes 3 months. You've done it.", color: "#8b5cf6" },
    },
  },

  trauma: {
    streakLabel: "Healing",
    streakUnit: "healing",
    winButtonText: "🌱 I Felt Safe Today — Log My Moment",
    winOptions: [
      "Practiced a grounding technique",
      "Didn't dissociate during stress",
      "Talked about what happened",
      "Set a boundary around my triggers",
      "Slept without nightmares",
      "Allowed myself to feel",
    ],
    chartLabel: "flashback episodes",
    greetingSuffix: "safety is something you're rebuilding. You're doing incredibly brave work.",
    whyImHerePrompt: "Write what safety means to you — it will appear here as your daily anchor.",
    dailyEncouragement: [
      "You survived the worst thing that ever happened to you. You can survive today.",
      "Healing from trauma is not linear. Every step counts.",
      "Your body kept the score. Now you're learning to rewrite it.",
    ],
    color: "#14b8a6",
    emoji: "🌱",
    milestones: {
      1: { emoji: "🕯️", title: "Day 1: Choosing Healing", science: "Deciding to face trauma activates the brain's safety-seeking systems. This is courage.", color: "#14b8a6" },
      3: { emoji: "💚", title: "3 Days Grounded", science: "Regular grounding exercises begin calming the hyperactive amygdala.", color: "#10b981" },
      7: { emoji: "🌿", title: "One Week of Safety", science: "Your nervous system begins learning that the danger has passed.", color: "#06b6d4" },
      14: { emoji: "🌅", title: "Two Weeks of Trust", science: "The window of tolerance for difficult emotions begins to widen.", color: "#f59e0b" },
      30: { emoji: "🏆", title: "30 Days Brave!", science: "Trauma processing creates new, healthier neural pathways alongside the old ones.", color: "#ec4899" },
      60: { emoji: "🔥", title: "60 Days Resilient!", science: "Neuroplasticity research shows the brain physically restructures around healing.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Transformed!", science: "Many trauma survivors report experiencing post-traumatic growth by this point.", color: "#8b5cf6" },
    },
  },

  eating_disorder: {
    streakLabel: "Freedom",
    streakUnit: "free",
    winButtonText: "🍃 I Nourished My Body — Log My Win",
    winOptions: [
      "Ate a full meal without guilt",
      "Didn't body-check today",
      "Unfollowed a toxic fitness account",
      "Skipped the calorie count",
      "Ate intuitively",
      "Wore something I felt good in",
    ],
    chartLabel: "urge episodes",
    greetingSuffix: "you deserve to nourish yourself. Food is not the enemy — it's fuel for your best life.",
    whyImHerePrompt: "Write what a healthy relationship with food looks like for you.",
    dailyEncouragement: [
      "Your body is not a project. It's a home.",
      "Eating is not earning or punishing. It's living.",
      "You are so much more than a number on a scale.",
    ],
    color: "#84cc16",
    emoji: "🍃",
    milestones: {
      1: { emoji: "🌱", title: "Day 1: Nourishing", science: "Choosing recovery activates your brain's reward system in healthy ways.", color: "#84cc16" },
      3: { emoji: "💚", title: "3 Days Gentle", science: "Blood sugar stabilization begins, reducing mood swings and cravings.", color: "#10b981" },
      7: { emoji: "🌟", title: "One Week of Self-Love", science: "Your metabolism begins recalibrating. Your body is learning to trust you again.", color: "#f59e0b" },
      14: { emoji: "⚡", title: "Two Weeks Free", science: "Gut health begins improving, which directly affects mood and anxiety levels.", color: "#06b6d4" },
      30: { emoji: "🏆", title: "30 Days Nourished!", science: "One month of consistent eating normalizes hunger/fullness hormones (ghrelin, leptin).", color: "#ec4899" },
      60: { emoji: "🔥", title: "60 Days Intuitive!", science: "Your relationship with food is physically rewiring in the brain's reward centers.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Liberated!", science: "90 days is a significant milestone in breaking habitual disordered eating patterns.", color: "#8b5cf6" },
    },
  },

  self_harm: {
    streakLabel: "Safety",
    streakUnit: "safe",
    winButtonText: "💚 I Used My Toolkit — Log My Win",
    winOptions: [
      "Used ice or rubber band instead",
      "Called my crisis contact",
      "Wrote in my journal",
      "Did a breathing exercise",
      "Waited 15 minutes and the urge passed",
      "Reached out to someone",
    ],
    chartLabel: "urge moments",
    greetingSuffix: "every moment you choose safety is a victory. You are worth protecting.",
    whyImHerePrompt: "Write a promise to yourself — it will appear here when you need it most.",
    dailyEncouragement: [
      "You are not your urges. You are the one who resists them.",
      "Every safe day is proof that you are stronger than the darkness.",
      "Your scars tell a story of survival, not weakness.",
    ],
    color: "#22c55e",
    emoji: "💚",
    milestones: {
      1: { emoji: "💚", title: "One Day Safe", science: "Your body's stress hormones begin to normalize without the harm response.", color: "#22c55e" },
      3: { emoji: "🌱", title: "3 Days Safe", science: "The urge-to-act neural pathway weakens with each day you resist.", color: "#10b981" },
      7: { emoji: "🌟", title: "One Week Safe", science: "Alternative coping strategies are forming new, healthier neural connections.", color: "#f59e0b" },
      14: { emoji: "⚡", title: "Two Weeks Safe", science: "Your brain is learning that safety feels better than the temporary relief of harm.", color: "#06b6d4" },
      30: { emoji: "🏆", title: "30 Days Safe!", science: "A full month of safety significantly weakens the automated self-harm response.", color: "#ec4899" },
      60: { emoji: "🔥", title: "60 Days Safe!", science: "Your emotional regulation capacity has measurably improved.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days Safe!", science: "Three months of safety creates lasting neurological change. You did this.", color: "#8b5cf6" },
    },
  },

  other: {
    streakLabel: "Growth",
    streakUnit: "growing",
    winButtonText: "✨ I Made Progress — Log My Win",
    winOptions: [
      "Took a step toward my goal",
      "Practiced self-care",
      "Connected with someone",
      "Learned something new",
      "Faced a fear",
      "Found a moment of peace",
    ],
    chartLabel: "setbacks",
    greetingSuffix: "you're on a path of growth. Every step forward counts.",
    whyImHerePrompt: "Write your intention — it will appear here as your daily compass.",
    dailyEncouragement: [
      "Growth is messy. You're doing it anyway.",
      "You don't have to have it all figured out. Just show up.",
      "The fact that you're here means you haven't given up.",
    ],
    color: "#a855f7",
    emoji: "✨",
    milestones: {
      1: { emoji: "🌱", title: "Day 1: Beginning", science: "Starting is the hardest part. You've already done the most important thing.", color: "#a855f7" },
      3: { emoji: "💡", title: "3 Days In", science: "Consistency for 72 hours creates the initial momentum for lasting change.", color: "#06b6d4" },
      7: { emoji: "🌟", title: "One Week of Commitment", science: "A week of intentional effort begins rewiring habitual patterns in the brain.", color: "#f59e0b" },
      14: { emoji: "⚡", title: "Two Weeks Strong", science: "Research shows 14 days is when new behaviors start feeling more natural.", color: "#10b981" },
      30: { emoji: "🏆", title: "30 Days of Transformation!", science: "A month of effort creates measurable changes in brain structure and behavior.", color: "#ec4899" },
      60: { emoji: "🔥", title: "60 Days of Growth!", science: "Two months in, your new patterns are becoming your default mode.", color: "#f97316" },
      90: { emoji: "👑", title: "90 Days — New You!", science: "Three months is the gold standard for habit formation. You've transformed.", color: "#8b5cf6" },
    },
  },
};

/**
 * Get the full category config for a given recovery category.
 * Falls back to "other" if the category is unknown.
 */
export function getCategoryConfig(category: RecoveryCategory | null | undefined): CategoryConfig {
  if (!category || !CONFIGS[category]) return CONFIGS.other;
  return CONFIGS[category];
}

/**
 * Get milestone days array from a category config.
 */
export function getMilestoneDays(config: CategoryConfig): number[] {
  return Object.keys(config.milestones).map(Number).sort((a, b) => a - b);
}
