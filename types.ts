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

// ─── Physical Rehabilitation Types ──────────────────────────────────────────

export type BodyRegion =
  | "head"
  | "neck"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_wrist"
  | "right_wrist"
  | "upper_back"
  | "lower_back"
  | "chest"
  | "abdomen"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle";

export type InjuryType =
  | "fracture"
  | "sprain"
  | "post_surgery"
  | "chronic_pain"
  | "muscle_tear"
  | "tendinitis"
  | "arthritis"
  | "disc_herniation"
  | "ligament_injury"
  | "rotator_cuff"
  | "other";

export type PainType =
  | "sharp"
  | "dull"
  | "burning"
  | "throbbing"
  | "aching"
  | "tingling"
  | "stiffness"
  | "shooting";

export type ActivityContext =
  | "at_rest"
  | "during_exercise"
  | "after_sleep"
  | "during_work"
  | "walking"
  | "lifting"
  | "sitting"
  | "standing";

export type RecoveryPhase =
  | "protection"      // Week 1: Protect & rest
  | "gentle_movement" // Weeks 2-4
  | "strengthening"   // Weeks 4-8
  | "full_recovery";  // Weeks 8-12+

export interface PhysioExercise {
  id: string;
  name: string;
  targetRegion: BodyRegion;
  reps: number;
  sets: number;
  holdSeconds: number;
  restSeconds: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  benefit: string;
  instructions: ExerciseStep[];
  icon: string; // emoji
  color: string;
}

export interface ExerciseStep {
  text: string;
  duration: number; // seconds
  type: "action" | "hold" | "rest" | "transition";
}

export interface PainLog {
  id: string;
  user_id: string;
  region: BodyRegion;
  severity: number; // 0-10
  painType: PainType;
  activityContext: ActivityContext;
  mood: string; // emoji
  notes: string;
  created_at: string;
}

export interface RehabSession {
  id: string;
  user_id: string;
  exercises: PhysioExercise[];
  totalDuration: number;
  completedReps: number;
  painBefore: number;
  painAfter: number;
  bodyRegion: BodyRegion;
  created_at: string;
}

export interface RecoveryPlan {
  id: string;
  user_id: string;
  injuryType: InjuryType;
  bodyRegion: BodyRegion;
  phase: RecoveryPhase;
  startDate: string;
  exercises: PhysioExercise[];
  milestones: RecoveryMilestone[];
  progressPercent: number;
}

export interface RecoveryMilestone {
  id: string;
  title: string;
  description: string;
  scienceFact: string;
  emoji: string;
  color: string;
  targetDay: number;
  completed: boolean;
  completedAt?: string;
}

export interface BodyRegionStatus {
  region: BodyRegion;
  painLevel: number; // 0-10
  recoveryPercent: number; // 0-100
  injuryType?: InjuryType;
  phase: RecoveryPhase;
  lastUpdated: string;
}
