import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) throw error;

    // Create user profile in public.users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        name,
        role: role === "MENTOR" ? "RECOVERED_MENTOR" : "RECOVERING_USER",
        streak: 0,
        points: 0,
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        throw profileError; // Throw error so signup fails properly
      }
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    // Attempt to sign in directly - Supabase Auth will handle if user doesn't exist
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        throw new Error(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else if (error.message.includes("Email not confirmed")) {
        throw new Error("Please confirm your email address before signing in.");
      }
      throw error;
    }

    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Chat message helper functions
export const chatService = {
  // Create a new chat session
  async createNewChatSession(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  },

  // Save a chat message
  async saveChatMessage(
    userId: string,
    sender: "user" | "ai",
    message: string,
    sessionId: string
  ) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        sender,
        message,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update session's last_message_at
    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);

    return data;
  },

  // Get chat history for a user
  async getChatHistory(
    userId: string,
    sessionId?: string,
    limit: number = 100
  ) {
    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Get all sessions for a user
  async getUserSessions(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get the most recent session for a user
  async getLatestSession(userId: string) {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Delete a chat session and all its messages
  async deleteChatSession(sessionId: string) {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
  },
};
