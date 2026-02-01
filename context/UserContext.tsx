import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, supabase } from '../services/supabaseClient';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    streak: number;
    points: number;
    avatar_url?: string;
    created_at?: string;
    isNewUser?: boolean;
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    isNewUser: boolean;
    refreshUser: () => Promise<void>;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const session = await authService.getSession();
            console.log('Session:', session);

            if (!session?.user) {
                console.log('No session found');
                setUser(null);
                setLoading(false);
                return;
            }

            console.log('Fetching user profile for ID:', session.user.id);

            // Fetch user profile from database
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            console.log('Profile query result:', { profile, error });

            if (error && error.code === 'PGRST116') {
                // User not found in database - create new profile
                console.log('Creating new user profile');
                const newProfile: UserProfile = {
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    role: session.user.user_metadata?.role === 'MENTOR' ? 'RECOVERED_MENTOR' : 'RECOVERING_USER',
                    streak: 0,
                    points: 0,
                    created_at: new Date().toISOString()
                };

                const { error: insertError } = await supabase
                    .from('users')
                    .insert(newProfile);

                console.log('Insert result:', insertError);

                if (!insertError) {
                    setUser({ ...newProfile, isNewUser: true });
                    setIsNewUser(true);
                }
            } else if (error) {
                console.error('Database error:', error);
                // Use session data as fallback
                setUser({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    role: 'RECOVERING_USER',
                    streak: 0,
                    points: 0
                });
            } else if (profile) {
                console.log('User profile found:', profile);
                // Check if this is a new user:
                // 1. Account created within last 30 minutes
                // 2. Has zero streak (hasn't started their journey yet)
                const createdAt = new Date(profile.created_at);
                const now = new Date();
                const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
                const isRecentlyCreated = minutesSinceCreation < 30; // 30 minutes window

                setUser(profile);
                // Mark as new user if account is recent AND hasn't built any streak yet
                const isFirstTimeUser = isRecentlyCreated && profile.streak === 0;
                setIsNewUser(isFirstTimeUser);

                console.log('User status:', {
                    minutesSinceCreation,
                    streak: profile.streak,
                    isNewUser: isFirstTimeUser
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback: try to reconstruct user from session if DB fails
            try {
                const session = await authService.getSession();
                if (session?.user) {
                    console.log('Using session fallback due to DB error');
                    const fallbackUser: UserProfile = {
                        id: session.user.id,
                        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                        email: session.user.email || '',
                        role: session.user.user_metadata?.role === 'MENTOR' ? 'RECOVERED_MENTOR' : 'RECOVERING_USER',
                        streak: 0,
                        points: 0,
                        isNewUser: true // Assume new if we can't check DB (or just default)
                    };
                    setUser(fallbackUser);
                    // If we can't verify streak, defaulting to "Welcome" might be safer or just keep it simple
                    // For now, let's set isNewUser to true so they feel welcomed if it's broken
                    setIsNewUser(true);
                }
            } catch (innerError) {
                console.error('Session fallback failed:', innerError);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id);

            if (!error) {
                setUser({ ...user, ...updates });
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    useEffect(() => {
        fetchUserProfile();

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                fetchUserProfile();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsNewUser(false);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, isNewUser, refreshUser: fetchUserProfile, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
