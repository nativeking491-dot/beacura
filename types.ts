export enum UserRole {
  RECOVERING = "Recovering User",
  MENTOR = "Recovered Mentor",
  ADMIN = "Admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  streak: number;
  points: number;
  badges: Badge[];
  joinDate: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  session_id?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  last_message_at?: string;
}

export interface Mentor {
  id: string;
  name: string;
  experience: string;
  rating: number;
  specialty: string[];
  avatar: string;
}

export interface FoodTip {
  title: string;
  description: string;
  benefits: string;
}
