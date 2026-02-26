import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/supabaseClient";
import { UserRole } from "../types";
import {
    Heart, Mail, Lock, User, ArrowRight, Loader2,
    AlertCircle, Eye, EyeOff, Sparkles, Users,
    CheckCircle, RefreshCw, KeyRound,
} from "lucide-react";

interface AuthProps {
    onLogin: (role: UserRole) => void;
}

// ── Password Strength ────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: "Too short", color: "bg-rose-500" },
        { label: "Weak", color: "bg-rose-400" },
        { label: "Fair", color: "bg-amber-400" },
        { label: "Good", color: "bg-teal-400" },
        { label: "Strong", color: "bg-emerald-500" },
    ];
    return { score, ...map[score] };
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
            setResendError("Could not resend. Please wait a moment and try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl shadow-teal-500/30 mb-6 mx-auto">
                    <Mail size={40} className="text-white" />
                </div>

                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">
                    Check your inbox
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">We sent a confirmation link to:</p>
                <p className="font-bold text-teal-600 dark:text-teal-400 text-lg mb-6 break-all">{email}</p>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-5 text-left">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-2">📬 3 quick steps:</p>
                    <ol className="space-y-1 text-sm text-emerald-600 dark:text-emerald-400 list-decimal list-inside">
                        <li>Open the email from <strong>Beacura</strong></li>
                        <li>Click <strong>"Confirm your email"</strong></li>
                        <li>Return here and sign in</li>
                    </ol>
                </div>

                <p className="text-xs text-slate-400 mb-5">
                    Can't find it? Check your <strong>spam / junk</strong> folder.
                </p>

                {resent ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-500 font-semibold text-sm mb-4 animate-in fade-in">
                        <CheckCircle size={16} />
                        <span>Email sent! Check your inbox.</span>
                    </div>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors disabled:opacity-50 mb-4"
                    >
                        {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {resending ? "Sending..." : "Resend verification email"}
                    </button>
                )}

                {resendError && <p className="text-xs text-rose-500 mb-4">{resendError}</p>}

                <button
                    onClick={onBack}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white font-bold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
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

// ── Forgot Password Screen ───────────────────────────────────────────
const ForgotPasswordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const { error: resetError } = await (await import("../services/supabaseClient")).supabase
                .auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
            if (resetError) throw resetError;
            setSent(true);
        } catch (err: any) {
            setError("Could not send reset email. Please check the address and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 dark:bg-violet-500/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white mb-6 shadow-lg shadow-violet-500/30">
                        <KeyRound size={30} />
                    </div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">
                        Reset your password
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Enter your email and we'll send a reset link straight to your inbox.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-base mb-4 animate-in fade-in">
                            <CheckCircle size={20} />
                            <span>Reset link sent!</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">Check your inbox (and spam folder).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                    placeholder="hello@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-violet-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <button
                    onClick={onBack}
                    className="w-full mt-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                    ← Back to Sign In
                </button>
            </div>
        </div>
    );
};

// ── Main Auth Component ───────────────────────────────────────────────
type AuthScreen = "form" | "verify" | "forgot";

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const mounted = useRef(true);
    const [screen, setScreen] = useState<AuthScreen>("form");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"RECOVERING_USER" | "MENTOR">("RECOVERING_USER");
    const [verificationEmail, setVerificationEmail] = useState<string>("");

    const strength = !isLogin && password.length > 0 ? getStrength(password) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!isLogin && name.trim().length < 2) {
            setError("Please enter your full name (at least 2 characters).");
            return;
        }
        if (!isLogin && password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { user } = await authService.signIn(email, password);
                if (user && mounted.current) {
                    onLogin(UserRole.RECOVERING);
                    navigate("/dashboard");
                }
            } else {
                const { user, session } = await authService.signUp(email, password, name.trim(), selectedRole);

                if (!mounted.current) return;

                if (user && !session) {
                    setVerificationEmail(email);
                    setScreen("verify");
                    return;
                }
                if (user && session) {
                    onLogin(selectedRole === "MENTOR" ? UserRole.MENTOR : UserRole.RECOVERING);
                    navigate("/dashboard");
                }
            }
        } catch (err: any) {
            if (!mounted.current) return;
            const msg = err.message || "";
            if (msg.includes("Rate limit") || msg.includes("rate limit")) {
                setError("Too many attempts. Please wait 15–60 minutes.");
            } else if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
                setError("Incorrect email or password. Please try again.");
            } else if (msg.includes("Email not confirmed") || msg.includes("email_not_confirmed")) {
                setError("Please verify your email before signing in. Check your inbox.");
            } else if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user_already_exists")) {
                setError("An account with this email already exists. Sign in instead.");
            } else {
                setError(msg || "Something went wrong. Please try again.");
            }
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(v => !v);
        setError(null);
        setEmail("");
        setPassword("");
        setName("");
    };

    // ── Screen routing ───────────────────────────────────────────────
    if (screen === "verify") {
        return (
            <VerificationScreen
                email={verificationEmail}
                onBack={() => {
                    setScreen("form");
                    setIsLogin(true);
                    setEmail(verificationEmail);
                    setPassword("");
                }}
            />
        );
    }

    if (screen === "forgot") {
        return <ForgotPasswordScreen onBack={() => setScreen("form")} />;
    }

    // ── Auth Form ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[140px]" />
                <div className="absolute -bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white mb-6 shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform duration-300">
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
                    {/* Error banner */}
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl mb-5 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Sign-up only fields */}
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
                                            onChange={e => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                            placeholder="Your full name"
                                            minLength={2}
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">I am joining as...</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {([
                                            { value: "RECOVERING_USER", icon: <Sparkles size={20} />, label: "Recovering" },
                                            { value: "MENTOR", icon: <Users size={20} />, label: "Mentor" },
                                        ] as const).map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setSelectedRole(opt.value)}
                                                className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 text-xs font-bold
                                                    ${selectedRole === opt.value
                                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                                        : "border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-500"}`}
                                            >
                                                {opt.icon}
                                                <span className="uppercase tracking-wider">{opt.label}</span>
                                            </button>
                                        ))}
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
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                    placeholder="hello@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={() => setScreen("forgot")}
                                        className="text-xs font-bold text-teal-500 hover:text-teal-600 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                                    placeholder="••••••••"
                                    minLength={6}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-3.5 text-slate-400 hover:text-teal-500 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password strength bar (sign-up only) */}
                            {strength && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength.score ? strength.color : "bg-slate-100 dark:bg-slate-700"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-semibold ml-0.5 transition-colors ${strength.score <= 1 ? "text-rose-400" : strength.score === 2 ? "text-amber-400" : "text-emerald-500"}`}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /><span>{isLogin ? "Signing In..." : "Creating Account..."}</span></>
                            ) : (
                                <><span>{isLogin ? "Sign In" : "Create Account"}</span><ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    {/* Toggle sign in / sign up */}
                    <div className="mt-7 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
                        <button
                            type="button"
                            onClick={switchMode}
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
