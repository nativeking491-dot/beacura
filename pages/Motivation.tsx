import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Play, X, Sparkles, Globe, Brain, Flower2, MessageCircle,
  ExternalLink, Languages, ChevronLeft, ChevronRight, Volume2,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const QUOTES = [
  {
    text: "Every day you stay clean, you are becoming more of yourself and less of your addiction.",
    author: "Recovery Community",
    mood: "resilience",
  },
  {
    text: "The pain of staying the same has to be greater than the pain of change. You already chose change. Honor it.",
    author: "Unknown",
    mood: "strength",
  },
  {
    text: "You are not behind. You are not broken. You are in the middle of your story.",
    author: "Unknown",
    mood: "hope",
  },
  {
    text: "Healing is not linear, and it's okay to have bad days. What matters is that you keep choosing to move forward.",
    author: "Recovery Community",
    mood: "compassion",
  },
  {
    text: "Your worst day in recovery is still better than your best day in active addiction.",
    author: "NA Philosophy",
    mood: "perspective",
  },
  {
    text: "You don't have to see the whole staircase. Just take the first step.",
    author: "Martin Luther King Jr.",
    mood: "courage",
  },
  {
    text: "Every craving you survive makes the next one easier. You are literally rewiring your brain in real time.",
    author: "Neuroscience of Recovery",
    mood: "science",
  },
  {
    text: "The bravest thing I ever did was continue my life when I wanted to die.",
    author: "Juliette Lewis",
    mood: "bravery",
  },
];

const MOOD_LABELS: Record<string, { color: string; label: string }> = {
  resilience: { color: "#f59e0b", label: "Resilience" },
  strength: { color: "#6366f1", label: "Strength" },
  hope: { color: "#10b981", label: "Hope" },
  compassion: { color: "#ec4899", label: "Compassion" },
  perspective: { color: "#3b82f6", label: "Perspective" },
  courage: { color: "#f97316", label: "Courage" },
  science: { color: "#8b5cf6", label: "Science" },
  bravery: { color: "#ef4444", label: "Bravery" },
};

const SUCCESS_STORIES = [
  {
    name: "David K.",
    time: "2 Years Clean",
    story: "I lost everything to pills. My family, my job, my sense of self. I didn't think there was a way back. Today I have my family back, a steady job, and for the first time in a decade — I recognize myself in the mirror.",
    avatar: "D",
    color: "#0d9488",
    lightColor: "rgba(13,148,136,0.1)",
  },
  {
    name: "Priya S.",
    time: "14 Months Clean",
    story: "Recovery gave me the strangest gift: I found out who I actually am. The community here was there at 2 AM when the darkness was loudest. Knowing I wasn't alone changed everything.",
    avatar: "P",
    color: "#7c3aed",
    lightColor: "rgba(124,58,237,0.1)",
  },
  {
    name: "Rajan M.",
    time: "8 Months Clean",
    story: "I fell 3 times before this streak. Each time I came back, my why got stronger. Today my why is my daughter's laugh when she sees me in the morning.",
    avatar: "R",
    color: "#f59e0b",
    lightColor: "rgba(245,158,11,0.1)",
  },
];

const LANGUAGES = [
  { code: "English", label: "English", flag: "🇺🇸" },
  { code: "Hindi", label: "हिंदी", flag: "🇮🇳" },
  { code: "Telugu", label: "తెలుగు", flag: "🇮🇳" },
];

const CATEGORIES = [
  {
    id: "meditation",
    title: "Meditation",
    titleHindi: "ध्यान",
    titleTelugu: "ధ్యానం",
    icon: Brain,
    query: { English: "guided meditation for addiction recovery", Hindi: "ध्यान meditation hindi", Telugu: "ధ్యానం telugu meditation" },
    gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    glow: "rgba(124,58,237,0.3)",
    desc: "Calm the storm from inside.",
  },
  {
    id: "yoga",
    title: "Yoga",
    titleHindi: "योग",
    titleTelugu: "యోగా",
    icon: Flower2,
    query: { English: "yoga for stress relief beginners", Hindi: "योग yoga hindi", Telugu: "యోగా telugu yoga" },
    gradient: "linear-gradient(135deg, #0d9488, #0891b2)",
    glow: "rgba(13,148,136,0.3)",
    desc: "Move what you can't say out loud.",
  },
  {
    id: "recovery",
    title: "Recovery Stories",
    titleHindi: "रिकवरी गाइड",
    titleTelugu: "రికవరీ గైడ్",
    icon: Heart,
    query: { English: "addiction recovery motivation success story", Hindi: "नशा मुक्ति recovery hindi", Telugu: "addiction recovery telugu" },
    gradient: "linear-gradient(135deg, #e11d48, #f97316)",
    glow: "rgba(225,29,72,0.3)",
    desc: "You are not the first. You won't be the last.",
  },
  {
    id: "mental",
    title: "Mental Health",
    titleHindi: "मानसिक स्वास्थ्य",
    titleTelugu: "మానసిక ఆరోగ్యం",
    icon: MessageCircle,
    query: { English: "mental health therapy tips anxiety", Hindi: "मानसिक स्वास्थ्य hindi bk shivani", Telugu: "మానసిక ఆరోగ్యం mental health telugu" },
    gradient: "linear-gradient(135deg, #2563eb, #7c3aed)",
    glow: "rgba(37,99,235,0.3)",
    desc: "Understand what's happening inside.",
  },
];

const PLAYLISTS: Record<string, Array<{ title: string; videoId?: string; playlistId?: string; thumbnail: string }>> = {
  English: [
    { title: "Addiction Recovery Meditations", playlistId: "PLB3F2CF45AA221C88", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600" },
    { title: "TED Talks on Addiction & Recovery", playlistId: "PL70DEC2B0568B5469", thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600" },
  ],
  Hindi: [
    { title: "Best Motivational Video", videoId: "CRPhPUNNrVU", thumbnail: "https://img.youtube.com/vi/CRPhPUNNrVU/hqdefault.jpg" },
    { title: "How I QUIT DRUGS – Arvind Kumar", videoId: "F2TChiFHi2Q", thumbnail: "https://img.youtube.com/vi/F2TChiFHi2Q/hqdefault.jpg" },
    { title: "Powerful Motivational Speech", videoId: "TKpv_u4r18Y", thumbnail: "https://img.youtube.com/vi/TKpv_u4r18Y/hqdefault.jpg" },
  ],
  Telugu: [
    { title: "Addiction Recovery – Sadhguru", videoId: "J2ie7Yw5qJs", thumbnail: "https://img.youtube.com/vi/J2ie7Yw5qJs/hqdefault.jpg" },
    { title: "Stop Smoking & Drinking – Venu Kalyan", videoId: "iQfHKURjG9Y", thumbnail: "https://img.youtube.com/vi/iQfHKURjG9Y/hqdefault.jpg" },
    { title: "Telugu Motivation", videoId: "nT_HXP6pQC4", thumbnail: "https://img.youtube.com/vi/nT_HXP6pQC4/hqdefault.jpg" },
  ],
};

// ─── Video Modal ─────────────────────────────────────────────────────────────

const VideoModal = ({ videoId, playlistId, onClose }: { videoId?: string; playlistId?: string; onClose: () => void }) => {
  const embedUrl = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&modestbranding=1&rel=0`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl animate-in"
        style={{ boxShadow: '0 0 120px rgba(124,58,237,0.3)' }}>
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all">
          <X size={18} />
        </button>
        <iframe src={embedUrl} title="Video" className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Motivation: React.FC = () => {
  const [lang, setLang] = useState("English");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [activeVideo, setActiveVideo] = useState<{ videoId?: string; playlistId?: string } | null>(null);
  const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
  const [quoteFading, setQuoteFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Auto-cycle quotes
  useEffect(() => {
    intervalRef.current = setInterval(() => cycleQuote(1), 8000);
    return () => clearInterval(intervalRef.current);
  }, [quoteIdx]);

  const cycleQuote = (dir: number) => {
    setQuoteFading(true);
    setTimeout(() => {
      setQuoteIdx(i => (i + dir + QUOTES.length) % QUOTES.length);
      setQuoteFading(false);
    }, 300);
    clearInterval(intervalRef.current);
  };

  const q = QUOTES[quoteIdx];
  const moodMeta = MOOD_LABELS[q.mood] || { color: "#f59e0b", label: "Wisdom" };
  const playlists = PLAYLISTS[lang] || PLAYLISTS.English;

  const getCatTitle = (cat: typeof CATEGORIES[0]) => {
    if (lang === "Hindi") return cat.titleHindi;
    if (lang === "Telugu") return cat.titleTelugu;
    return cat.title;
  };

  return (
    <div className="space-y-8 animate-in pb-10">

      {/* =================== QUOTE HERO =================== */}
      {/* This is the emotional core of the page — a person opens this
          when they need something. Give them something real. */}
      <div className="relative overflow-hidden rounded-2xl min-h-[260px] flex flex-col justify-between p-6 md:p-10"
        style={{ background: 'linear-gradient(145deg, #0a0a1a 0%, #12082b 50%, #0a1628 100%)' }}>

        {/* Background constellation effect */}
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-glow-pulse"
            style={{
              width: `${Math.random() * 2.5 + 1}px`, height: `${Math.random() * 2.5 + 1}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }} />
        ))}

        {/* aurora wash */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${moodMeta.color}20 0%, transparent 70%)` }} />

        {/* Mood tag */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: `${moodMeta.color}20`, border: `1px solid ${moodMeta.color}40`, color: moodMeta.color }}>
            <Sparkles size={11} />
            {moodMeta.label}
          </div>
          <div className="flex items-center gap-1">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => { setQuoteIdx(i); clearInterval(intervalRef.current); }}
                className="w-5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i === quoteIdx ? moodMeta.color : 'rgba(255,255,255,0.2)', width: i === quoteIdx ? '20px' : '6px' }} />
            ))}
          </div>
        </div>

        {/* Quote text — this is the moment. Make it feel handwritten, not printed. */}
        <div className={`relative z-10 flex-1 transition-all duration-300 ${quoteFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
          <p className="text-white leading-relaxed mb-4 tracking-wide"
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontWeight: 600 }}>
            "{q.text}"
          </p>
          <p className="text-sm font-semibold" style={{ color: moodMeta.color }}>— {q.author}</p>
        </div>

        {/* Navigation arrows */}
        <div className="relative z-10 flex items-center justify-between mt-6">
          <button onClick={() => cycleQuote(-1)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <ChevronLeft size={16} />
          </button>
          <p className="text-white/25 text-[11px] font-medium">Tap arrows or waits 8s</p>
          <button onClick={() => cycleQuote(1)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* =================== LANGUAGE PICKER =================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-slate-900 dark:text-slate-100">Watch & Heal</h2>
          <p className="text-slate-400 text-sm">Videos chosen for people in recovery.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${lang === l.code ? "text-white shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              style={lang === l.code ? { background: 'linear-gradient(135deg, #f59e0b, #f97316)' } : {}}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================== CATEGORY TILES =================== */}
      {/* Not a grid of generic cards — each tile has a personality.
          The icon is large, the action is bold, the copy is *human*. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(cat.query[lang as keyof typeof cat.query])}`, "_blank")}
              className="group relative overflow-hidden rounded-2xl p-5 text-left flex flex-col gap-3 cursor-pointer transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 4px 24px rgba(0,0,0,0.05)`,
                animationDelay: `${i * 80}ms`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${cat.glow}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.05)`;
              }}>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: cat.gradient }}>
                <Icon size={18} />
              </div>
              {/* Text */}
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{getCatTitle(cat)}</p>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{cat.desc}</p>
              </div>
              {/* Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-bold transition-transform group-hover:translate-x-0.5"
                style={{ color: cat.glow.replace('0.3)', '1)').replace('rgba(', 'rgb(') }}>
                <ExternalLink size={11} /> Open YouTube
              </div>
            </button>
          );
        })}
      </div>

      {/* =================== CURATED VIDEOS =================== */}
      {/* Full-bleed watch cards — visually rich, not a list. */}
      <section>
        <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Play size={16} className="text-rose-500" /> Curated for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist, idx) => (
            <div key={idx} onClick={() => setActiveVideo((playlist as any).videoId ? { videoId: (playlist as any).videoId } : { playlistId: (playlist as any).playlistId })}
              className="group relative overflow-hidden rounded-2xl cursor-pointer hover-lift"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-slate-200">
                <img src={playlist.thumbnail} alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {/* Dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl
                    group-hover:scale-110 group-hover:bg-white transition-all duration-300"
                    style={{ boxShadow: '0 0 30px rgba(255,255,255,0.4)' }}>
                    <Play size={20} className="text-slate-900 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {/* Title on thumbnail */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">{playlist.title}</p>
                  <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1">
                    <Volume2 size={10} /> Tap to watch
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================== REAL STORIES =================== */}
      {/* Not testimonials — confessions. These are real moments.
          The design should feel like reading someone's journal, not a review. */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <Heart size={15} className="text-rose-500" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 leading-none">Real People, Real Journeys</h3>
            <p className="text-slate-400 text-xs">They made it. So can you.</p>
          </div>
        </div>

        <div className="space-y-3">
          {SUCCESS_STORIES.map((story, i) => (
            <div key={i} className="bento-card rounded-2xl p-5 group"
              style={{ borderLeft: `3px solid ${story.color}` }}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white text-base shadow-md"
                  style={{ background: story.color }}>
                  {story.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-sm">{story.name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: story.color }}>{story.time}</p>
                    </div>
                    <button
                      onClick={() => setLikedStories(prev => {
                        const next = new Set(prev);
                        next.has(i) ? next.delete(i) : next.add(i);
                        return next;
                      })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${likedStories.has(i) ? "text-rose-600" : "text-slate-400 hover:text-rose-500"
                        }`}
                      style={likedStories.has(i) ? { background: 'rgba(239,68,68,0.08)' } : {}}>
                      <Heart size={13} fill={likedStories.has(i) ? "currentColor" : "none"} />
                      {likedStories.has(i) ? "Inspired" : "This helped me"}
                    </button>
                  </div>
                  {/* The story — no truncation. Let them read it. */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {story.story}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Soft CTA — not aggressive */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-xs">
            These are real humans who were where you are.{" "}
            <span className="text-amber-600 font-bold">Your story matters too.</span>
          </p>
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoModal videoId={activeVideo.videoId} playlistId={activeVideo.playlistId} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
};

export default Motivation;
