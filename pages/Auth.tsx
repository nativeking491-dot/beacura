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
} from "lucide-react";
import { getMealReminder, MealReminder } from "../services/mealReminder";
import { MealReminderModal } from "../components/MealReminderModal";

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
    const [showPassword, setShowPassword] = useState(false);
    const [mealReminder, setMealReminder] = useState<MealReminder | null>(null);
    const [selectedRole, setSelectedRole] = useState<
        "RECOVERING_USER" | "MENTOR"
    >("RECOVERING_USER");
    const [gender, setGender] = useState<"male" | "female" | "other" | "prefer_not_to_say" | "">("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Check if email exists first (requested feature)
                try {
                    const exists = await authService.checkEmailExists(email);
                    if (!exists) {
                        throw new Error("Email not registered");
                    }
                } catch (checkError: any) {
                    if (checkError.message === "Email not registered") {
                        throw checkError;
                    }
                    // If check fails silently, proceed to try login anyway
                    console.log("Email check skipped:", checkError);
                }

                // Sign In
                const { user } = await authService.signIn(email, password);

                if (user) {
                    onLogin(UserRole.RECOVERING);
                    // Show meal reminder before navigating
                    const reminder = getMealReminder();
                    setMealReminder(reminder);
                }
            } else {
                // Sign Up
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters long");
                }

                const { user } = await authService.signUp(
                    email,
                    password,
                    name,
                    selectedRole
                );

                if (user) {
                    onLogin(
                        selectedRole === "MENTOR" ? UserRole.MENTOR : UserRole.RECOVERING,
                    );
                    // Show meal reminder before navigating
                    const reminder = getMealReminder();
                    setMealReminder(reminder);
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            const msg = err.message || "";

            // Enhanced error messages
            if (msg.includes("Rate limit")) {
                setError("Security Alert: Too many attempts. Please wait 15-60 minutes or use a different email address.");
            } else if (msg.includes("Invalid login credentials")) {
                // Supabase generic error for security, covering both cases
                setError("Login Failed: Incorrect password.");
            } else if (msg.includes("Email not registered") || msg.includes("User not found") || msg.includes("not registered")) {
                setError("Email not registered. Please sign up.");
            } else if (msg.includes("Incorrect password") || msg.includes("password")) {
                // Catch-all for password related errors
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

    const handleReminderClose = () => {
        setMealReminder(null);
        // Navigate to dashboard after reminder is closed
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col justify-center items-center p-0">
            {/* Diagonal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none"></div>

            {/* Meal Reminder Modal */}
            {mealReminder && (
                <MealReminderModal
                    reminder={mealReminder}
                    onClose={handleReminderClose}
                />
            )}

            <div className="w-full h-screen md:w-auto md:h-auto md:max-w-md relative z-10 bg-gradient-to-b from-slate-900 to-slate-800 md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border md:border-slate-700 flex flex-col">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 md:p-8 text-white md:rounded-t-3xl">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                            <Heart className="text-white" size={40} fill="currentColor" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-3xl font-bold text-center mb-2">
                        {isLogin ? "Welcome Back!" : "Start Your Journey"}
                    </h2>
                    <p className="text-center text-amber-100">
                        {isLogin
                            ? "Continue your path to recovery"
                            : "Join our supportive community"}
                    </p>
                </div>

                {/* Form Section */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {error && (
                        <div className="bg-rose-900/30 border-l-4 border-rose-500 text-rose-200 px-4 py-3 rounded-lg mb-6 flex items-start space-x-3 animate-in fade-in duration-200">
                            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                {/* Full Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User
                                            className="absolute left-3 top-3.5 text-slate-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-800 text-white placeholder-slate-400"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        I am a...
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("RECOVERING_USER")}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "RECOVERING_USER"
                                                ? "border-amber-500 bg-amber-500/20 text-amber-300"
                                                : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
                                                }`}
                                        >
                                            <Sparkles size={20} className="mx-auto mb-1" />
                                            <div className="text-xs font-medium">Recovering User</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("MENTOR")}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "MENTOR"
                                                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                                                : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
                                                }`}
                                        >
                                            <Heart size={20} className="mx-auto mb-1" />
                                            <div className="text-xs font-medium">Mentor</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Gender Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-3">
                                        Gender Identity
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: "male", label: "👨 Male", icon: "👨" },
                                            { id: "female", label: "👩 Female", icon: "👩" },
                                            { id: "other", label: "✨ Other", icon: "✨" },
                                            { id: "prefer_not_to_say", label: "🤐 Prefer Not to Say", icon: "🤐" },
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setGender(option.id as any)}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${gender === option.id
                                                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                                                    : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">{option.icon}</div>
                                                <div className="text-xs font-medium">{option.label.split(" ").slice(1).join(" ")}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-3.5 text-slate-500"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-800 text-white placeholder-slate-400"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-3.5 text-slate-500"
                                    size={20}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-800 text-white placeholder-slate-400"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Minimum 6 characters required
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>
                                        {isLogin ? "Signing In..." : "Creating Account..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Success Message for Sign Up */}
                    {!isLogin && (
                        <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                            <p className="text-xs text-amber-200 text-center">
                                By creating an account, you agree to our terms and privacy
                                policy
                            </p>
                        </div>
                    )}
                </div>

                {/* Toggle Section */}
                <div className="bg-slate-800 md:bg-slate-800/0 px-6 md:px-8 py-4 md:py-5 border-t md:border-t border-slate-700 md:border-slate-700 flex justify-center md:rounded-b-3xl">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setEmail("");
                            setPassword("");
                            setName("");
                            setGender("");
                        }}
                        className="text-sm text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center space-x-1"
                    >
                        <span>
                            {isLogin
                                ? "Don't have an account? "
                                : "Already have an account? "}
                        </span>
                        <span className="underline">{isLogin ? "Sign up" : "Sign in"}</span>
                    </button>
                </div>
            </div>

            {/* Footer Support Text - Desktop Only */}
            <div className="hidden md:block mt-6 text-center max-w-md relative z-10">
                <p className="text-sm text-slate-400">
                    Need help? We're here 24/7. Your journey matters to us. 💚
                </p>
            </div>
        </div>
    );
};

export default Auth;

