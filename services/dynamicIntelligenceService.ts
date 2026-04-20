import { GoogleGenAI } from "@google/genai";
import { AIContext } from "./geminiService";

export interface DynamicMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepTime: string;
  keyNutrients: string[];
  ingredients: string[];
  recoveryBenefit: string;
}

export interface DailyHealthPlan {
  breakfast: DynamicMeal;
  lunch: DynamicMeal;
  dinner: DynamicMeal;
  dailyFocus: {
    title: string;
    description: string;
    benefit: string;
  };
  exercise: {
    focus: string;
    benefit: string;
    exercises: Array<{ name: string; duration: string; instruction: string }>;
  };
}

export const getDynamicIntelligence = async (context: AIContext, language: string = 'en'): Promise<DailyHealthPlan | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    
    const prompt = `Generate a culturally appropriate, highly specific daily health, diet, and exercise recovery plan for a person in addiction recovery.
    User Context:
    - Name: ${context.name || 'Friend'}
    - Streak: ${context.current_streak || 0} days
    - Language: ${language}

    The meal plan must be rich in dopamine-repairing nutrients (omega-3s, tyrosine, complex carbs).
    Return ONLY valid JSON matching this exact structure, with no markdown, no \`\`\`json wrappers. 
    Translate the content strings into ${language}.
    
    Structure:
    {
      "breakfast": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "prepTime": "", "keyNutrients": [], "ingredients": [], "recoveryBenefit": "" },
      "lunch": { ... },
      "dinner": { ... },
      "dailyFocus": { "title": "", "description": "", "benefit": "" },
      "exercise": { "focus": "", "benefit": "", "exercises": [ { "name": "", "duration": "", "instruction": "" } ] }
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash", // fast and smart enough for JSON schema
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    // Attempt parse
    const data: DailyHealthPlan = JSON.parse(text.trim());
    return data;
  } catch (error) {
    console.error("Dynamic Intelligence Error:", error);
    return null;
  }
};

export const generateBreakthroughQuote = async (context: AIContext, language: string = 'en'): Promise<string> => {
  try {
     const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
     const prompt = `Write exactly 1 short, deeply profound, non-cliche 'Breakthrough Moment' thought for someone in addiction recovery (Day ${context.current_streak || 0}). 
Language: ${language}.
It should sound like a sudden realization of self-worth or cognitive clarity. Max 20 words. No quotes. No hashtags.`;
     
     const response = await ai.models.generateContent({
       model: "gemini-3-flash",
       contents: prompt
     });
     
     return response.text || "Every breath forward rewires the mind.";
  } catch(e) {
     return "Every breath forward rewires the mind.";
  }
};
