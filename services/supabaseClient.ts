import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
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
                data: { name, role }
            }
        });

        if (error) throw error;

        // Create user profile in public.users table
        if (data.user) {
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    name,
                    role: role === 'MENTOR' ? 'RECOVERED_MENTOR' : 'RECOVERING_USER'
                });

            if (profileError) {
                console.error('Error creating user profile:', profileError);
            }
        }

        return data;
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        // First check if user exists in database
        const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (userCheckError || !existingUser) {
            throw new Error('Email not registered. Please sign up first.');
        }

        // If user exists, proceed with login
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // Provide user-friendly error message
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Incorrect password. Please try again.');
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Get current user profile
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

