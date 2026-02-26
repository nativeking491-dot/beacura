import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/supabaseClient";
import { UserRole } from "../types";
import {
    Heart,
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Sparkles,
    Users,
    CheckCircle,
} from "lucide-react";

interface AuthProps {
    onLogin: (role: UserRole) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<
        "RECOVERING_USER" | "MENTOR"
    >("RECOVERING_USER");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Check if email exists first
                try {
                    const exists = await authService.checkEmailExists(email);
                    if (!exists) {
                        throw new Error("Email not registered");
                    }
                } catch (checkError: any) {
                    if (checkError.message === "Email not registered") {
                        throw checkError;
                    }
                    console.log("Email check skipped:", checkError);
                }

                const { user } = await authService.signIn(email, password);

                if (user) {
                    onLogin(UserRole.RECOVERING);
                    navigate("/dashboard");
                }
            } else {
                // Sign Up
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters long");
                }

                const { user, session } = await authService.signUp(
                    email,
                    password,
                    name,
                    selectedRole
                );

                if (user && !session) {
                    setSuccess("Account created! Please check your email to confirm your account before signing in.");
                    setIsLogin(true); // Switch to login mode
                    return;
                }

                if (user && session) {
                    onLogin(
                        selectedRole === "MENTOR" ? UserRole.MENTOR : UserRole.RECOVERING,
                    );
                    navigate("/dashboard");
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            const msg = err.message || "";

            if (msg.includes("Rate limit")) {
                setError("Security Alert: Too many attempts. Please wait 15-60 minutes.");
            } else if (msg.includes("Invalid login credentials")) {
                setError("Login Failed: Incorrect password.");
            } else if (msg.includes("Email not confirmed")) {
                setError("Please verify your email address before logging in. Check your inbox (and spam folder).");
            } else if (msg.includes("Email not registered") || msg.includes("User not found") || msg.includes("not registered")) {
                setError("Email not registered. Please sign up.");
            } else if (msg.includes("Incorrect password") || msg.includes("password")) {
                setError("Login Failed: Incorrect password.");
            } else if (msg.includes("already registered") || msg.includes("already exists")) {
                setError("An account with this email already exists. Please sign in instead.");
            } else {
                setError(msg || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Calming animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-teal-900/5 dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white mb-6 shadow-lg shadow-teal-500/30 transform hover:scale-105 transition-transform duration-300">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
                        {isLogin ? "Welcome Back" : "Start Your Journey"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {isLogin
                            ? "Continue your path to recovery in a safe space"
                            : "Join our supportive and healing community"}
                    </p>
                </div>

                {/* Form Section */}
                <div className="px-8 pb-8">
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl mb-6 flex items-start space-x-3 animate-in fade-in zoom-in-95 duration-200">
                            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 px-4 py-3 rounded-xl mb-6 flex items-start space-x-3 animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-5 animate-in slide-in-from-top-4 duration-300 fade-in">
                                {/* Full Name Input */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 shadow-sm"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        I am a...
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("RECOVERING_USER")}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${selectedRole === "RECOVERING_USER"
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                                : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-500 hover:border-slate-200 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <Sparkles size={24} className={selectedRole === "RECOVERING_USER" ? "animate-pulse" : ""} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Recovering</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("MENTOR")}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${selectedRole === "MENTOR"
                                                ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-sm"
                                                : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-500 hover:border-slate-200 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <Users size={24} className={selectedRole === "MENTOR" ? "animate-bounce" : ""} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Mentor</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 shadow-sm"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 shadow-sm"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-teal-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-slate-400 mt-2 ml-1 font-medium">
                                        Must be at least 6 characters long
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={22} />
                                    <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                    <ArrowRight size={22} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Section */}
                    <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                setEmail("");
                                setPassword("");
                                setName("");
                            }}
                            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-teal-500 dark:text-teal-400 underline decoration-2 underline-offset-4">
                                {isLogin ? "Create one here" : "Sign in here"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <p className="mt-8 text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10 flex items-center gap-2">
                We're so glad you're here <Heart size={14} className="text-rose-400" fill="currentColor" />
            </p>
        </div>
    );
};

export default Auth;

