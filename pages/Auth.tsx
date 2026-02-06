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
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<
        "RECOVERING_USER" | "MENTOR"
    >("RECOVERING_USER");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Sign In
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

                const { user } = await authService.signUp(
                    email,
                    password,
                    name,
                    selectedRole,
                );

                if (user) {
                    onLogin(
                        selectedRole === "MENTOR" ? UserRole.MENTOR : UserRole.RECOVERING,
                    );
                    navigate("/dashboard");
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            const msg = err.message || "";

            // Enhanced error messages
            if (msg.includes("Rate limit")) {
                setError("Too many attempts. Please wait a few moments before trying again.");
            } else if (msg.includes("Invalid login credentials")) {
                // Supabase generic error for security, covering both cases
                setError("Entered wrong password or No Account Found. Please Sign Up if you are new.");
            } else if (msg.includes("User not found") || msg.includes("not registered")) {
                setError("No account found. Please Sign Up.");
            } else if (msg.includes("Incorrect password") || msg.includes("password")) {
                setError("Entered wrong password.");
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
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                            <Heart className="text-white" size={40} fill="currentColor" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2">
                        {isLogin ? "Welcome Back!" : "Start Your Journey"}
                    </h2>
                    <p className="text-center text-teal-100">
                        {isLogin
                            ? "Continue your path to recovery"
                            : "Join our supportive community"}
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    {error && (
                        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-4 py-3 rounded-lg mb-6 flex items-start space-x-3 animate-in fade-in duration-200">
                            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                {/* Full Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-slate-50"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        I am a...
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("RECOVERING_USER")}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "RECOVERING_USER"
                                                    ? "border-teal-500 bg-teal-50 text-teal-700"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            <Sparkles size={20} className="mx-auto mb-1" />
                                            <div className="text-xs font-medium">Recovering User</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("MENTOR")}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "MENTOR"
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            <Heart size={20} className="mx-auto mb-1" />
                                            <div className="text-xs font-medium">Mentor</div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-3.5 text-slate-400"
                                    size={20}
                                />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-slate-50"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-3.5 text-slate-400"
                                    size={20}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-slate-50"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Minimum 6 characters required
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-200"
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
                        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <p className="text-xs text-teal-700 text-center">
                                By creating an account, you agree to our terms and privacy
                                policy
                            </p>
                        </div>
                    )}
                </div>

                {/* Toggle Section */}
                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setEmail("");
                            setPassword("");
                            setName("");
                        }}
                        className="text-sm text-teal-600 font-semibold hover:text-teal-800 transition-colors flex items-center space-x-1"
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

            {/* Footer Support Text */}
            <div className="mt-6 text-center max-w-md">
                <p className="text-sm text-slate-500">
                    Need help? We're here 24/7. Your journey matters to us. 💚
                </p>
            </div>
        </div>
    );
};

export default Auth;
