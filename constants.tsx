
import React from 'react';
import { Shield, Award, Heart, Activity, Coffee, Brain } from 'lucide-react';
import { UserRole, Badge, Mentor, FoodTip } from './types';

export const MOCK_USER = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: UserRole.RECOVERING,
  streak: 15,
  points: 1250,
  badges: [
    { id: 'b1', name: 'Week One', icon: 'Shield', color: 'text-blue-500' },
    { id: 'b2', name: 'First Mentor Call', icon: 'Award', color: 'text-yellow-500' }
  ],
  joinDate: '2024-01-15'
};

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Dr. Anjali Chhabria',
    experience: '25+ Years Exp',
    rating: 4.9,
    specialty: ['Psychiatry', 'De-addiction', 'Anxiety'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'm2',
    name: 'Dr. Harish Shetty',
    experience: '30+ Years Exp',
    rating: 5.0,
    specialty: ['Community Mental Health', 'Rehabilitation'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'm3',
    name: 'Dr. Shyam Bhat',
    experience: '20+ Years Exp',
    rating: 4.8,
    specialty: ['Integrative Medicine', 'Holistic Recovery'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop'
  }
];

export const FOOD_TIPS: FoodTip[] = [
  {
    title: 'Complex Carbohydrates',
    description: 'Whole grains, beans, and vegetables provide stable energy.',
    benefits: 'Reduces mood swings and irritability common in early recovery.'
  },
  {
    title: 'Protein-Rich Snacks',
    description: 'Lean meats, nuts, and yogurt contain amino acids.',
    benefits: 'Helps repair brain tissue and balances neurotransmitters.'
  },
  {
    title: 'Hydration Focus',
    description: 'Drink at least 12 glasses of water daily.',
    benefits: 'Flushes out toxins and helps prevent headaches.'
  }
];

export const WEEKLY_MEAL_PLAN = [
  {
    day: "Monday",
    theme: "Brain Recovery",
    meals: {
      breakfast: "Oatmeal with Walnuts & Blueberries",
      lunch: "Grilled Salmon with Quinoa & Spinach",
      dinner: "Turkey Stir-fry with Broccoli & Brown Rice",
      benefit: "High in Omega-3s and Tryptophan to support mood and brain repair."
    }
  },
  {
    day: "Tuesday",
    theme: "Energy Balance",
    meals: {
      breakfast: "Greek Yogurt with Chia Seeds & Honey",
      lunch: "Lentil Soup with Whole Grain Toast",
      dinner: "Baked Chicken Breast with Sweet Potato",
      benefit: "Sustained glucose release to prevent mid-day irritability."
    }
  },
  {
    day: "Wednesday",
    theme: "Detox Support",
    meals: {
      breakfast: "Green Smoothie (Kale, Banana, Protein Powder)",
      lunch: "Chickpea Salad with Avocado & Lemon",
      dinner: "Cod with Asparagus & Roasted Carrots",
      benefit: "High fiber and antioxidants to help the liver flush out toxins."
    }
  },
  {
    day: "Thursday",
    theme: "Stress Reduction",
    meals: {
      breakfast: "Scrambled Eggs with Spinach & Feta",
      lunch: "Tuna Wrap with Sprouted Grain Tortilla",
      dinner: "Lean Beef Tacos with Black Beans & Cabbage",
      benefit: "Rich in Magnesium and Zinc to lower cortisol levels."
    }
  },
  {
    day: "Friday",
    theme: "Nerve Repair",
    meals: {
      breakfast: "Almond Butter Toast with Banana Slices",
      lunch: "Quinoa Bowl with Roasted Beets & Goat Cheese",
      dinner: "Shrimp Pasta with Garlic, Olive Oil & Zucchini",
      benefit: "B-Vitamins focus to support the central nervous system."
    }
  },
  {
    day: "Saturday",
    theme: "Digestive Health",
    meals: {
      breakfast: "Smoothie Bowl with Pumpkin Seeds",
      lunch: "Veggie Burger with a Side Kale Salad",
      dinner: "Miso Glazed Tofu with Bok Choy",
      benefit: "Probiotics and prebiotics to restore gut microbiome balance."
    }
  },
  {
    day: "Sunday",
    theme: "Overall Vitality",
    meals: {
      breakfast: "Buckwheat Pancakes with Mixed Berries",
      lunch: "Mixed Bean Chili with Cornbread",
      dinner: "Roasted Turkey with Steamed Green Beans",
      benefit: "Complete proteins and diverse minerals for physical strength."
    }
  }
];

export const MEDICAL_FAQS = [
  {
    q: "How can I manage physical withdrawal symptoms?",
    a: "Focus on rest, hydration, and light exercise. Consult a physician for safe tapering if necessary."
  },
  {
    q: "When should I seek emergency medical help?",
    a: "If you experience seizures, high fever, severe chest pain, or hallucinations, call emergency services immediately."
  }
];
