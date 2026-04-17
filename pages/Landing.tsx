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
  Play,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

// ─── Particles ───────────────────────────────────────────────────────────────
const PARTICLE_CONFIG = [
  { size: 4, color: 'rgba(245,158,11,0.5)', duration: 18, left: 10, delay: 0 },
  { size: 6, color: 'rgba(20,184,166,0.4)', duration: 22, left: 25, delay: 3 },
  { size: 3, color: 'rgba(244,63,94,0.4)', duration: 16, left: 40, delay: 1 },
  { size: 5, color: 'rgba(99,102,241,0.4)', duration: 20, left: 55, delay: 5 },
  { size: 4, color: 'rgba(245,158,11,0.35)', duration: 25, left: 70, delay: 2 },
  { size: 7, color: 'rgba(20,184,166,0.3)', duration: 19, left: 85, delay: 4 },
  { size: 3, color: 'rgba(244,63,94,0.5)', duration: 14, left: 92, delay: 7 },
  { size: 5, color: 'rgba(168,85,247,0.4)', duration: 21, left: 15, delay: 6 },
];

// ─── India Mental Health Data Ticker ───────────────────────────────────────────────
const TICKER_ITEMS = [
  { quote: '"62% of young adults report heartbreak-induced depressive episodes."', author: "NIMHANS Study" },
  { quote: '"1 in 3 Indians experience severe trauma. PTSD is highly underdiagnosed."', author: "WHO Report 2024" },
  { quote: '"52% of IT professionals report severe burnout and exhaustion."', author: "AIIMS Survey" },
  { quote: '"Only 1 in 100 people seeking addiction treatment receive formal support."', author: "Ministry of Social Justice" },
  { quote: '"Depression rates in injury recovery patients are 3x the general population."', author: "Medical Journal" },
  { quote: '"We are not alone. 30,000+ people found support tonight."', author: "Beacura Live Data" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "After my divorce, I felt completely shattered. Beacura gave me daily structure, helped me track my emotions, and the AI was there at 2 AM when I couldn't sleep.",
    name: "Priya K.",
    streak: 47,
    avatar: "P",
    color: "#ec4899",
  },
  {
    quote: "Post knee-surgery rehab felt impossible until I found the guided exercises here. The body map and pain journal let me see real, measurable progress every week.",
    name: "Carlos T.",
    streak: 63,
    avatar: "C",
    color: "#10b981",
  },
  {
    quote: "I struggled with burnout for 3 years and never talked about it. This platform understood that recovery isn't just physical — it's mental, emotional, everything.",
    name: "Rahul M.",
    streak: 90,
    avatar: "R",
    color: "#8b5cf6",
  },
];

// ─── How it works ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign Up & Get Onboarded",
    desc: "A quick 2-minute onboarding personalizes your recovery plan based on your stage and goals.",
    icon: Sparkles,
    color: "#f59e0b",
  },
  {
    step: "02",
    title: "Track & Connect Daily",
    desc: "Complete your daily check-in, log how you feel, and chat with your AI companion whenever you need support.",
    icon: TrendingUp,
    color: "#0d9488",
  },
  {
    step: "03",
    title: "Grow & Achieve",
    desc: "Earn badges, hit milestones, connect with mentors, and watch your streak — and your life — transform.",
    icon: Award,
    color: "#8b5cf6",
  },
];

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

// ─── Animated counter hook ────────────────────────────────────────────────────
const useCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
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
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

// ─── Typewriter hook ──────────────────────────────────────────────────────────
const useTypewriter = (words: string[], speed = 100, pause = 2000) => {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), speed);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx(w => (w + 1) % words.length);
    }
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  useEffect(() => {
    setDisplayed(words[wordIdx].slice(0, charIdx));
  }, [charIdx, wordIdx, words]);

  return displayed;
};

// ─── Word by word split text component ───────────────────────────────────────
const SplitText: React.FC<{ text: string; className?: string; baseDelay?: number }> = ({
  text, className = "", baseDelay = 0,
}) => {
  const words = text.split(" ");
  return (
    <span className={className} style={{ perspective: "600px" }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-reveal"
          style={{ animationDelay: `${baseDelay + i * 80}ms`, marginRight: "0.28em" }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

// ─── Testimonial carousel ─────────────────────────────────────────────────────
const TestimonialCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[active];
  return (
    <div className="relative overflow-hidden">
      <div
        key={active}
        className="bento-card rounded-3xl p-8 spotlight-card animate-in text-center"
      >
        {/* Avatar */}
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div
            className="absolute inset-0 rounded-full blur-lg opacity-60 animate-glow-pulse"
            style={{ background: t.color }}
          />
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-extrabold shadow-xl"
            style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
          >
            {t.avatar}
          </div>
        </div>

        <blockquote className="text-slate-700 dark:text-slate-200 text-base md:text-lg font-medium leading-relaxed mb-6 italic">
          "{t.quote}"
        </blockquote>

        <div className="flex items-center justify-center gap-3">
          <p className="font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
          >
            🔥 {t.streak} days
          </span>
        </div>
      </div>

      {/* Dot controls */}
      <div className="flex justify-center gap-2 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              background: i === active ? "#f59e0b" : "#e2e8f0",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, icon: Icon, color }: any) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="bento-card rounded-2xl p-6 text-center group tilt-card scroll-reveal-scale shine-on-hover spotlight-card">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon size={22} className="text-white relative z-10" />
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 animate-count-up">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ title, desc, icon: Icon, gradient, delay }: any) => (
  <div
    className="bento-card rounded-2xl p-6 group card-3d relative overflow-hidden scroll-reveal shine-on-hover spotlight-card"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${gradient} opacity-10 group-hover:opacity-25 transition-all duration-700 blur-2xl group-hover:scale-125`} />
    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative`}>
      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon size={20} className="text-white relative z-10" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-amber-600 transition-colors animated-underline">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const Landing: React.FC = () => {
  const typewriterText = useTypewriter(
    ['strength.', 'hope.', 'healing.', 'clarity.', 'peace.', 'freedom.'],
    90, 2200
  );

  useScrollReveal();

  return (
    <div className="flex flex-col items-center -mx-4 md:-mx-8 overflow-hidden">

      {/* ==================== HERO ==================== */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">

        {/* Floating particles */}
        {PARTICLE_CONFIG.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              bottom: '-20px',
            }}
          />
        ))}

        {/* Morph blobs */}
        <div className="absolute top-1/4 -left-24 w-64 h-64 bg-amber-300 opacity-20 blur-3xl morph-blob" />
        <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-teal-300 opacity-15 blur-3xl morph-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200 opacity-10 blur-3xl morph-blob" style={{ animationDelay: '5s' }} />

        {/* Aurora orbs */}
        <div className="orb w-72 h-72 bg-amber-300 -top-16 -left-16 opacity-30" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-300 top-1/4 -right-24 opacity-20" style={{ animationDelay: '2s' }} />
        <div className="orb w-64 h-64 bg-teal-300 bottom-0 left-1/4 opacity-25" style={{ animationDelay: '4s' }} />
        <div className="orb w-48 h-48 bg-indigo-300 bottom-1/4 right-1/3 opacity-20" style={{ animationDelay: '1s' }} />

        {/* Live Crisis Counter badge */}
        <div className="animate-in bounce-in mb-8" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center space-x-2.5 glass px-5 py-2.5 rounded-full text-sm font-semibold text-rose-400 shadow-sm glow-on-hover">
            <span className="relative flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping opacity-75" />
            </span>
            <span style={{ fontFamily: 'Sora, sans-serif' }}>
              <span className="text-white font-bold">14,208</span> people reached out for help tonight
            </span>
          </div>
        </div>

        {/* Main headline — word-by-word reveal */}
        <div className="mb-6 max-w-4xl" style={{ perspective: "800px" }}>
          <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-5xl md:text-7xl font-extrabold leading-tight">
            <SplitText text="Recovery is" className="gradient-text-amber block" baseDelay={100} />
            <SplitText text="a journey" className="text-slate-800 dark:text-slate-100 block" baseDelay={300} />
            <span className="text-slate-600 dark:text-slate-300 text-4xl md:text-5xl font-bold block mt-2">
              <SplitText text="toward" className="inline" baseDelay={480} />
              {' '}
              <span className="gradient-text-teal">{typewriterText}</span>
              <span className="cursor-blink" />
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className="animate-in max-w-2xl" style={{ animationDelay: '600ms' }}>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            Whether you're healing from heartbreak, recovering from injury, managing grief, overcoming
            addiction, or rebuilding after burnout — Beacura is your companion for every kind of recovery.
          </p>
        </div>

        {/* CTAs */}
        <div className="animate-in flex flex-col sm:flex-row gap-4 justify-center mb-12" style={{ animationDelay: '700ms' }}>
          <Link
            to="/auth"
            className="btn-primary magnetic-btn px-8 py-4 text-base font-bold flex items-center space-x-2 group shine-on-hover relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            <Sparkles size={18} className="group-hover:rotate-12 group-hover:scale-125 transition-transform duration-300 relative z-10" />
            <span className="relative z-10">Start Your Journey</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
          </Link>
          <Link
            to="/learn-more"
            className="glass magnetic-btn px-8 py-4 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center space-x-2 glow-on-hover"
          >
            <Play size={15} className="opacity-70" />
            <span>See How It Works</span>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="animate-in flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400" style={{ animationDelay: '800ms' }}>
          {["No credit card required", "Free to start", "HIPAA compliant"].map((t, i) => (
            <div key={t} className="flex items-center space-x-1.5 bounce-in" style={{ animationDelay: `${900 + i * 80}ms` }}>
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

      {/* ==================== SOCIAL PROOF TICKER ==================== */}
      <div className="w-full overflow-hidden py-4 mb-12 border-y border-slate-100 dark:border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
        <div className="marquee-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-8 flex-shrink-0">
              <span className="text-amber-400 text-lg">✦</span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.quote}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">— {item.author}</span>
            </div>
          ))}
        </div>
      </div>



      {/* ==================== SCENARIO SELECTOR ==================== */}
      <section className="w-full max-w-6xl px-4 mb-24 z-10 relative">
        <div className="text-center mb-12 scroll-reveal text-reveal">
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 z-10 relative border-b border-transparent inline-block pb-1">
            What are you <span className="gradient-text-teal">healing</span> from?
          </h2>
          <p className="text-slate-400 text-lg">Select a path to see how Beacura can guide you.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { id: 'heartbreak', emoji: '💔', title: 'Heartbreak', desc: 'Relationship loss & untangling your life', color: 'bg-rose-500', shadow: 'rgba(244,63,94,0.4)', stats: '62% of young adults face this' },
            { id: 'grief', emoji: '🕊️', title: 'Grief', desc: 'Navigating life after losing a loved one', color: 'bg-indigo-500', shadow: 'rgba(99,102,241,0.4)', stats: '10-15% experience complicated grief' },
            { id: 'burnout', emoji: '🔥', title: 'Burnout', desc: 'Work exhaustion & restoring energy boundaries', color: 'bg-orange-500', shadow: 'rgba(249,115,22,0.4)', stats: '52% IT sector burnout rate' },
            { id: 'ptsd', emoji: '🛡️', title: 'Trauma & PTSD', desc: 'Grounding techniques & trigger management', color: 'bg-purple-500', shadow: 'rgba(168,85,247,0.4)', stats: '1 in 3 experience severe trauma' },
            { id: 'addiction', emoji: '🧠', title: 'Addiction', desc: 'Craving tracking & relapse prevention', color: 'bg-amber-500', shadow: 'rgba(245,158,11,0.4)', stats: 'Only 1% get formal support' },
            { id: 'injury', emoji: '🦵', title: 'Physical Injury', desc: 'Pain logging & nervous system regulation', color: 'bg-emerald-500', shadow: 'rgba(16,185,129,0.4)', stats: '3x higher depression risk' }
          ].map((scenario, i) => (
            <Link to={`/auth?path=${scenario.id}`} key={scenario.id} className="group relative block scroll-reveal scroll-reveal-scale h-full" style={{ transitionDelay: `${i * 100}ms` }}>
              {/* Card wrapper */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0" style={{ backgroundColor: scenario.shadow.replace('0.4', '0.2') }}></div>
              <div className="relative z-10 glass bento-card rounded-3xl p-6 h-full flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl spotlight-card overflow-hidden">
                {/* Background glow in card */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${scenario.color} opacity-10 blur-3xl group-hover:opacity-30 transition-all duration-500 group-hover:scale-150`}></div>
                
                <div>
                  <div className="text-4xl mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 transform origin-bottom-left inline-block">
                    {scenario.emoji}
                  </div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {scenario.desc}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="w-full h-[1px] bg-white/10 mb-3 group-hover:bg-white/20 transition-colors"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: scenario.shadow.replace('0.4', '1') }}>
                      {scenario.stats}
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Subtle CTA under cards */}
        <div className="text-center mt-10 scroll-reveal">
           <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
             Not sure? Start with a general assessment <ArrowRight size={14} />
           </Link>
        </div>
      </section>

      {/* ==================== ABOUT ==================== */}
      <section className="w-full max-w-5xl px-4 mb-24 z-10 relative">
        <div className="bento-card rounded-3xl p-8 md:p-12 relative overflow-hidden scroll-reveal spotlight-card">
          <div className="orb w-64 h-64 bg-amber-200 -bottom-16 -right-16 opacity-30" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-2 mb-4 scroll-reveal-left">
              <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Our Mission</span>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight scroll-reveal stagger-1">
              Built for the moments between sessions.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 scroll-reveal stagger-2">
              Beacura was born from a simple realization:{" "}
              <span className="font-bold text-amber-600">the hardest part of recovery happens between sessions</span>.
              Whether you're healing from heartbreak, rebuilding after injury, grieving a loss, battling burnout, or overcoming
              addiction — we built this platform to ensure no one heals alone. By combining real-time progress tracking with
              AI support and a caring community, Beacura transforms recovery into a shared journey toward wholeness.
            </p>
            <div className="flex flex-wrap gap-3 scroll-reveal stagger-3">
              {["Science-backed", "Community-driven", "Privacy-first", "Always available"].map((tag, i) => (
                <span key={tag} className="glass-subtle px-4 py-1.5 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 glow-on-hover bounce-in" style={{ animationDelay: `${i * 80}ms` }}>
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <div className="text-center mb-12 scroll-reveal">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm font-semibold text-violet-600 mb-4 glow-on-hover">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>Simple to start</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            How it works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base">
            Three steps to a completely different life.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-amber-300 via-violet-400 to-teal-400 opacity-40 z-0" style={{ left: '20%', right: '20%' }} />

          {HOW_IT_WORKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className={`bento-card rounded-2xl p-6 relative scroll-reveal stagger-${i + 1} spotlight-card text-center`}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`, boxShadow: `0 8px 24px ${item.color}40` }}
                >
                  <Icon size={28} className="text-white" />
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md"
                    style={{ background: '#0f172a', fontFamily: 'Sora, sans-serif' }}
                  >
                    {item.step}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="w-full max-w-6xl px-4 mb-24">
        <div className="text-center mb-12 scroll-reveal">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm font-semibold text-teal-600 mb-4 glow-on-hover">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>Everything you need</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Your complete recovery toolkit
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base">
            We've combined technology and human empathy to create the ultimate recovery ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard title="Wellness Milestones" desc="Track more than just days—monitor sleep quality, mood patterns, pain levels, and social connections as you heal." icon={Award} gradient="bg-gradient-to-br from-amber-400 to-orange-500" delay={0} />
          <FeatureCard title="Safe-Space Community" desc="A moderated, anonymous environment where you can share experiences without stigma." icon={Users} gradient="bg-gradient-to-br from-teal-400 to-emerald-500" delay={80} />
          <FeatureCard title="Crisis Mode" desc="One-tap access to emergency hotlines and localized support centers when you need them most." icon={PhoneCall} gradient="bg-gradient-to-br from-rose-400 to-red-500" delay={160} />
          <FeatureCard title="AI Companion" desc="24/7 conversational AI to help with difficult moments, anxiety, and motivation—always there for you." icon={MessageCircle} gradient="bg-gradient-to-br from-violet-500 to-indigo-600" delay={240} />
          <FeatureCard title="Health Plans" desc="Science-backed nutrition and exercise plans customized to help your body and mind heal." icon={Shield} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" delay={320} />
          <FeatureCard title="Private & Secure" desc="Your data is end-to-end encrypted. Optional anonymous mode protects your privacy completely." icon={Star} gradient="bg-gradient-to-br from-pink-500 to-rose-500" delay={400} />
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="w-full max-w-3xl px-4 mb-24 scroll-reveal">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm font-semibold text-rose-600 mb-4 glow-on-hover">
            <Heart size={14} className="animate-glow-pulse" />
            <span>Real stories</span>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Lives transformed
          </h2>
        </div>
        <TestimonialCarousel />
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="w-full max-w-5xl px-4 mb-24 scroll-reveal">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>

          {/* Animated grid bg */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          {/* Inner orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500 rounded-full blur-[100px] opacity-10 animate-float" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500 rounded-full blur-[100px] opacity-10 animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500 rounded-full blur-[80px] opacity-8 morph-blob" />

          <div className="relative z-10">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 blur-lg opacity-60 animate-glow-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                <Heart fill="white" size={28} className="text-white" />
              </div>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Begin your comeback story today
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Join thousands of people who have found strength, community, and hope through Beacura.
            </p>
            <Link to="/auth" className="btn-primary magnetic-btn inline-flex items-center space-x-2 px-8 py-4 text-base shine-on-hover group">
              <Sparkles size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Get Started — It's Free</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full bg-slate-900 dark:bg-black text-slate-400 py-12 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 text-amber-400 mb-6">
            <Heart fill="currentColor" size={20} className="animate-glow-pulse" />
            <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-white text-lg">Beacura</span>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4 mb-8">
            {["𝕏", "Instagram", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="glass-dark px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:border-amber-400/40 transition-all duration-200"
              >
                {s}
              </a>
            ))}
          </div>

          <div className="glass-dark rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">⚠ Emergency Support</p>
            <p className="text-white font-medium text-sm leading-relaxed">
              If you are in immediate danger or experiencing a medical emergency, please call your local
              emergency services <strong>(911 in the US)</strong> or a crisis hotline immediately.
            </p>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Beacura Platform. Not a replacement for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
