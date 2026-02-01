import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Mail, Lock, User as UserIcon, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/supabaseClient';

interface AuthProps {
    onLogin: (role: UserRole) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<UserRole>(UserRole.RECOVERING);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await authService.signIn(email, password);
            } else {
                await authService.signUp(email, password, name, role);
            }

            onLogin(role);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Recovery'}
                    </h2>
                    <p className="text-slate-500">
                        {isLogin ? 'Continue your journey to wellness' : 'Start your new chapter today'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Your Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole(UserRole.RECOVERING)}
                                    className={`p-3 text-sm rounded-xl border transition-all ${role === UserRole.RECOVERING
                                            ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold'
                                            : 'border-slate-200 text-slate-600'
                                        }`}
                                >
                                    Recovering User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole(UserRole.MENTOR)}
                                    className={`p-3 text-sm rounded-xl border transition-all ${role === UserRole.MENTOR
                                            ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold'
                                            : 'border-slate-200 text-slate-600'
                                        }`}
                                >
                                    Recovered Mentor
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                            </>
                        ) : (
                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-teal-600 font-semibold hover:underline"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center space-x-1">
                        <ShieldCheck size={12} />
                        <span>Secure, private, and encrypted login.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
