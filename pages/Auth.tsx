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
    RefreshCw,
} from "lucide-react";

interface AuthProps {
    onLogin: (role: UserRole) => void;
}

// ── Email Verification Screen ────────────────────────────────────────
const VerificationScreen: React.FC<{ email: string; onBack: () => void }> = ({ email, onBack }) => {
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);

    const handleResend = async () => {
        setResending(true);
        setResendError(null);
        try {
            await authService.resendVerificationEmail(email);
            setResent(true);
        } catch {
            setResendError("Could not resend. Please try again in a moment.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-10 text-center">
                {/* Animated mail icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl shadow-teal-500/30 mb-6 mx-auto animate-bounce-slow">
                    <Mail size={40} className="text-white" />
                </div>

                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">
                    Verify your email
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                    We sent a confirmation link to:
                </p>
                <p className="font-bold text-teal-600 dark:text-teal-400 text-lg mb-6 break-all">{email}</p>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6 text-left">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                        📬 Steps to complete sign-up:
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-emerald-600 dark:text-emerald-400 list-decimal list-inside">
                        <li>Open the email from Beacura</li>
                        <li>Click <strong>"Confirm your email"</strong></li>
                        <li>You'll be redirected back here to sign in</li>
                    </ol>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                    Check your <strong>spam / junk</strong> folder if you don't see it within 2 minutes.
                </p>

                {resent ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-4 animate-in fade-in">
                        <CheckCircle size={16} />
                        <span>New verification email sent!</span>
                    </div>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors disabled:opacity-50 mb-4"
                    >
                        {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                        {resending ? "Sending..." : "Resend verification email"}
                    </button>
                )}

                {resendError && (
                    <p className="text-xs text-rose-500 mb-4">{resendError}</p>
                )}

                <button
                    onClick={onBack}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white font-bold text-base shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
                >
                    Back to Sign In
                </button>
            </div>

            <p className="mt-6 text-sm text-slate-400 relative z-10">
                We're so glad you're here <Heart size={13} className="inline text-rose-400" fill="currentColor" />
            </p>
        </div>
    );
};

// ── Main Auth Component ───────────────────────────────────────────────
const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"RECOVERING_USER" | "MENTOR">("RECOVERING_USER");
    // null = form view; string = show verification screen for this email
    const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

    // ── Email/Password Submit ────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                try {
                    const exists = await authService.checkEmailExists(email);
                    if (!exists) throw new Error("Email not registered");
                } catch (checkError: any) {
                    if (checkError.message === "Email not registered") throw checkError;
                }

                const { user } = await authService.signIn(email, password);
                if (user) {
                    onLogin(UserRole.RECOVERING);
                    navigate("/dashboard");
                }
            } else {
                if (password.length < 6) throw new Error("Password must be at least 6 characters long");

                const { user, session } = await authService.signUp(email, password, name, selectedRole);

                if (user && !session) {
                    // Show verification screen
                    setVerificationEmail(email);
                    return;
                }

                if (user && session) {
                    onLogin(selectedRole === "MENTOR" ? UserRole.MENTOR : UserRole.RECOVERING);
                    navigate("/dashboard");
                }
            }
        } catch (err: any) {
            const msg = err.message || "";
            if (msg.includes("Rate limit")) {
                setError("Too many attempts. Please wait 15–60 minutes.");
            } else if (msg.includes("Invalid login credentials")) {
                setError("Incorrect password. Please try again.");
            } else if (msg.includes("Email not confirmed")) {
                setError("Please verify your email before signing in. Check your inbox.");
            } else if (msg.includes("Email not registered") || msg.includes("User not found")) {
                setError("No account found with this email. Please sign up.");
            } else if (msg.includes("already registered") || msg.includes("already exists")) {
                setError("An account with this email already exists. Please sign in.");
            } else {
                setError(msg || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Show verification screen ─────────────────────────────────────
    if (verificationEmail) {
        return (
            <VerificationScreen
                email={verificationEmail}
                onBack={() => {
                    setVerificationEmail(null);
                    setIsLogin(true);
                    setEmail(verificationEmail);
                    setPassword("");
                }}
            />
        );
    }

    // ── Auth Form ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[140px]" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[120px]" style={{ animationDelay: '4s' }} />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-teal-900/5 dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white mb-6 shadow-lg shadow-teal-500/30 transform hover:scale-105 transition-transform duration-300">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
                        {isLogin ? "Welcome Back" : "Start Your Journey"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {isLogin
                            ? "Continue your path to recovery in a safe space"
                            : "Join our supportive and healing community"}
                    </p>
                </div>

                <div className="px-8 pb-8">
                    {/* Error */}
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl mb-5 flex items-start space-x-3 animate-in fade-in zoom-in-95 duration-200">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">I am a...</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setSelectedRole("RECOVERING_USER")}
                                            className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 text-xs font-bold
                                                ${selectedRole === "RECOVERING_USER"
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-500"}`}>
                                            <Sparkles size={20} className={selectedRole === "RECOVERING_USER" ? "animate-pulse" : ""} />
                                            <span className="uppercase tracking-wider">Recovering</span>
                                        </button>
                                        <button type="button" onClick={() => setSelectedRole("MENTOR")}
                                            className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 text-xs font-bold
                                                ${selectedRole === "MENTOR"
                                                    ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                                    : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-500"}`}>
                                            <Users size={20} />
                                            <span className="uppercase tracking-wider">Mentor</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                    placeholder="hello@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-400 hover:text-teal-500 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Must be at least 6 characters</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full mt-2 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-7 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
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

            <p className="mt-8 text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10 flex items-center gap-2">
                We're so glad you're here <Heart size={14} className="text-rose-400" fill="currentColor" />
            </p>
        </div>
    );
};

export default Auth;
