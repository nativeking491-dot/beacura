/**
 * Utility functions for meal reminders based on current time
 */

export interface MealReminder {
  type: "breakfast" | "lunch" | "dinner" | "snack" | null;
  title: string;
  message: string;
  icon: string;
  tips: string[];
}

/**
 * Determine what meal reminder to show based on current time
 */
export const getMealReminder = (): MealReminder => {
  const currentHour = new Date().getHours();

  // Breakfast: 6 AM - 10 AM
  if (currentHour >= 6 && currentHour < 10) {
    return {
      type: "breakfast",
      title: "🌅 Good Morning!",
      message: "Don't skip breakfast! A healthy morning meal is crucial for your recovery.",
      icon: "🥣",
      tips: [
        "Eat within 1 hour of waking up to kickstart your metabolism",
        "Include protein, whole grains, and fruits for sustained energy",
        "Stay hydrated - drink a glass of water first thing",
        "Avoid sugary cereals - opt for oatmeal or whole grain toast",
      ],
    };
  }

  // Lunch: 11 AM - 2 PM
  if (currentHour >= 11 && currentHour < 14) {
    return {
      type: "lunch",
      title: "🌞 Lunchtime!",
      message: "Time for a nutritious lunch to keep your energy levels up.",
      icon: "🥗",
      tips: [
        "Include a balance of protein, vegetables, and healthy carbs",
        "Eat slowly and mindfully - take at least 20 minutes",
        "Pack your lunch the night before for healthier choices",
        "Include colorful vegetables for maximum nutrients",
      ],
    };
  }

  // Dinner: 5 PM - 8 PM
  if (currentHour >= 17 && currentHour < 20) {
    return {
      type: "dinner",
      title: "🌙 Dinner Time!",
      message: "Prepare a healthy dinner for a restful evening.",
      icon: "🍽️",
      tips: [
        "Eat dinner at least 2-3 hours before bedtime",
        "Choose lighter options - avoid heavy or fried foods",
        "Include lean protein and plenty of vegetables",
        "Stay hydrated but limit fluids close to bedtime",
      ],
    };
  }

  // Snack time: 3 PM - 4 PM or 9 PM - 10 PM
  if ((currentHour >= 15 && currentHour < 16) || (currentHour >= 21 && currentHour < 22)) {
    return {
      type: "snack",
      title: "🍎 Snack Time!",
      message: "A healthy snack can boost your energy and mood.",
      icon: "🥜",
      tips: [
        "Choose protein-rich snacks like nuts, yogurt, or cheese",
        "Avoid processed sugary snacks - opt for fruits",
        "Keep healthy snacks readily available",
        "Drink water if you feel hungry - sometimes thirst is mistaken for hunger",
      ],
    };
  }

  // No specific meal time
  return {
    type: null,
    title: "Welcome!",
    message: "Welcome back! Remember to maintain healthy eating habits.",
    icon: "❤️",
    tips: [
      "Stay consistent with your meal times",
      "Drink plenty of water throughout the day",
      "Plan your meals ahead for better choices",
      "Take care of yourself on your recovery journey",
    ],
  };
};

/**
 * Get time-based greeting
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};
