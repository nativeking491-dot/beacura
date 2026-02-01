import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to detect if input is phone or email
export const isPhoneNumber = (input: string): boolean => {
    // Match common phone patterns (digits, spaces, +, -, parentheses)
    return /^[\d\s\+\-\(\)]+$/.test(input) && input.replace(/\D/g, '').length >= 10;
};

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
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    // Send OTP to email or phone
    async signInWithOTP(emailOrPhone: string) {
        const isPhone = isPhoneNumber(emailOrPhone);

        if (isPhone) {
            // Phone OTP (requires Twilio setup in Supabase)
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: emailOrPhone
            });
            if (error) throw error;
            return { data, type: 'phone' as const };
        } else {
            // Email OTP
            const { data, error } = await supabase.auth.signInWithOtp({
                email: emailOrPhone,
                options: {
                    shouldCreateUser: true
                }
            });
            if (error) throw error;
            return { data, type: 'email' as const };
        }
    },

    // Verify OTP code
    async verifyOTP(emailOrPhone: string, token: string, name?: string, role?: string) {
        const isPhone = isPhoneNumber(emailOrPhone);

        let data, error;
        if (isPhone) {
            const response = await supabase.auth.verifyOtp({
                phone: emailOrPhone,
                token,
                type: 'sms'
            });
            data = response.data;
            error = response.error;
        } else {
            const response = await supabase.auth.verifyOtp({
                email: emailOrPhone,
                token,
                type: 'email'
            });
            data = response.data;
            error = response.error;
        }

        if (error) throw error;

        // If new user and profile info provided, create profile
        if (data.user && name && role) {
            const { data: existingProfile } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!existingProfile) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        phone: isPhone ? emailOrPhone : null,
                        name,
                        role: role === 'MENTOR' ? 'RECOVERED_MENTOR' : 'RECOVERING_USER'
                    });

                if (profileError) {
                    console.error('Error creating user profile:', profileError);
                }
            }
        }

        return data;
    },

    // Sign in with Google OAuth
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) throw error;
        return data;
    },

    // Send password reset OTP/link
    async resetPassword(emailOrPhone: string) {
        const isPhone = isPhoneNumber(emailOrPhone);

        if (isPhone) {
            // Send OTP to phone for password reset
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: emailOrPhone
            });
            if (error) throw error;
            return { data, type: 'phone' as const };
        } else {
            // Send password reset email
            const { data, error } = await supabase.auth.resetPasswordForEmail(emailOrPhone, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            return { data, type: 'email' as const };
        }
    },

    // Update password (after reset verification)
    async updatePassword(newPassword: string) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
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
