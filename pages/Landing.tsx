import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Sparkles,
  PhoneCall,
  Heart,
  Award,
  ArrowRight,
  CheckCircle,
  Zap,
  Brain,
  Star,
} from "lucide-react";

// Animated counter hook
const useCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

const StatCard = ({ value, suffix, label, icon: Icon, color }: any) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="bento-card rounded-2xl p-6 text-center group hover-lift">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" />
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon: Icon, gradient, delay }: any) => (
  <div
    className="bento-card rounded-2xl p-6 group hover-lift relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`} />
    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-amber-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex flex-col items-center -mx-4 md:-mx-8 overflow-hidden">

      {/* ==================== HERO ==================== */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">

        {/* Aurora orbs */}
        <div className="orb w-72 h-72 bg-amber-300 -top-16 -left-16 opacity-30" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-300 top-1/4 -right-24 opacity-20" style={{ animationDelay: '2s' }} />
        <div className="orb w-64 h-64 bg-teal-300 bottom-0 left-1/4 opacity-25" style={{ animationDelay: '4s' }} />
        <div className="orb w-48 h-48 bg-indigo-300 bottom-1/4 right-1/3 opacity-20" style={{ animationDelay: '1s' }} />

        {/* Badge */}
        <div className="animate-in" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm font-semibold text-amber-600 mb-8 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-glow-pulse" />
            <span>✦ There is hope for a better tomorrow</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="animate-in max-w-4xl" style={{ animationDelay: '100ms' }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="gradient-text-amber">Recovery is</span>
            <br />
            <span className="text-slate-800 dark:text-slate-100">a journey.</span>
            <br />
            <span className="text-slate-600 dark:text-slate-300 text-4xl md:text-5xl font-bold">We provide the compass.</span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className="animate-in max-w-2xl" style={{ animationDelay: '200ms' }}>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            A comprehensive digital ecosystem designed to bridge the gap between
            clinical treatment and long-term sustainable recovery.
          </p>
        </div>

        {/* CTAs */}
        <div className="animate-in flex flex-col sm:flex-row gap-4 justify-center mb-16" style={{ animationDelay: '300ms' }}>
          <Link
            to="/auth"
            className="btn-primary px-8 py-4 text-base font-bold flex items-center space-x-2 group"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Start Your Journey</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/learn-more"
            className="glass px-8 py-4 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center space-x-2"
          >
            <span>Learn More</span>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="animate-in flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400" style={{ animationDelay: '400ms' }}>
          {["No credit card required", "Free to start", "HIPAA compliant"].map((t) => (
            <div key={t} className="flex items-center space-x-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-slate-400 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-slate-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="w-full max-w-5xl px-4 -mt-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard value={5000} suffix="+" label="Active Community Members" icon={Users} color="bg-gradient-to-br from-amber-400 to-orange-500" />
          <StatCard value={85} suffix="%" label="Progressive Success Rate" icon={Zap} color="bg-gradient-to-br from-teal-400 to-emerald-500" />
          <StatCard value={24} suffix="/7" label="Instant AI Support" icon={Brain} color="bg-gradient-to-br from-violet-500 to-indigo-600" />
        </div>
      </section>

      {/* ==================== ABOUT ==================== */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <div className="bento-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="orb w-64 h-64 bg-amber-200 -bottom-16 -right-16 opacity-30" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Our Mission</span>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
              Built for the moments between sessions.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Beacura was born from a simple realization:{" "}
              <span className="font-bold text-amber-600">the hardest part of recovery happens between therapy sessions</span>.
              We built this platform to ensure that no one has to navigate the complexities of addiction alone.
              By combining real-time progress tracking with a supportive digital community, Beacura transforms
              recovery from a solitary struggle into a shared success.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Science-backed", "Community-driven", "Privacy-first", "Always available"].map((tag) => (
                <span key={tag} className="glass-subtle px-4 py-1.5 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300">
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="w-full max-w-6xl px-4 mb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm font-semibold text-teal-600 mb-4">
            <Sparkles size={14} />
            <span>Everything you need</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Your complete recovery toolkit
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base">
            We've combined technology and human empathy to create the ultimate recovery ecosystem.
          </p>
        </div>

        {/* Bento Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            title="Wellness Milestones"
            desc="Track more than just days sober—monitor sleep quality, mood patterns, and social reintegration."
            icon={Award}
            gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            delay={0}
          />
          <FeatureCard
            title="Safe-Space Community"
            desc="A moderated, anonymous environment where you can share experiences without stigma."
            icon={Users}
            gradient="bg-gradient-to-br from-teal-400 to-emerald-500"
            delay={50}
          />
          <FeatureCard
            title="Crisis Mode"
            desc="One-tap access to emergency hotlines and localized support centers when you need them most."
            icon={PhoneCall}
            gradient="bg-gradient-to-br from-rose-400 to-red-500"
            delay={100}
          />
          <FeatureCard
            title="AI Companion"
            desc="24/7 conversational AI to help with cravings, anxiety, and motivation—always there for you."
            icon={Sparkles}
            gradient="bg-gradient-to-br from-violet-500 to-indigo-600"
            delay={150}
          />
          <FeatureCard
            title="Health Plans"
            desc="Science-backed nutrition and exercise plans customized to help your body and mind heal."
            icon={Shield}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            delay={200}
          />
          <FeatureCard
            title="Private & Secure"
            desc="Your data is end-to-end encrypted. Optional anonymous mode protects your privacy completely."
            icon={Star}
            gradient="bg-gradient-to-br from-pink-500 to-rose-500"
            delay={250}
          />
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
          {/* Inner orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500 rounded-full blur-[100px] opacity-10" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500 rounded-full blur-[100px] opacity-10" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Heart fill="white" size={28} className="text-white" />
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Begin your comeback story today
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Join thousands of people who have found strength, community, and hope through Beacura.
            </p>
            <Link to="/auth" className="btn-primary inline-flex items-center space-x-2 px-8 py-4 text-base">
              <Sparkles size={18} />
              <span>Get Started — It's Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full bg-slate-900 dark:bg-black text-slate-400 py-12 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 text-amber-400 mb-6">
            <Heart fill="currentColor" size={20} />
            <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-white text-lg">Beacura</span>
          </div>
          <div className="glass-dark rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">⚠ Emergency Support</p>
            <p className="text-white font-medium text-sm leading-relaxed">
              If you are in immediate danger or experiencing a medical emergency, please call your local
              emergency services <strong>(911 in the US)</strong> or a crisis hotline immediately.
            </p>
          </div>
          <p className="text-xs text-slate-600">
            © 2024 Beacura Platform. Not a replacement for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
