import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Settings, Volume2, VolumeX, X, Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { generateLocalResponse } from '../services/localChatService';
import { voiceCommandEngine } from '../services/voiceCommandEngine';

type AvatarType = 'aira' | 'kai';
type SpeakEventDetail = { text: string };
type GenerateEventDetail = { context: string };

declare global {
  interface WindowEventMap {
    'avatar-speak': CustomEvent<SpeakEventDetail>;
    'avatar-generate-speak': CustomEvent<GenerateEventDetail>;
  }
}

const STORAGE_KEYS = {
  muted: 'beacura_avatar_muted',
  type: 'beacura_avatar_type',
  voiceURI: 'beacura_avatar_voiceURI',
} as const;

const AVATAR_META: Record<AvatarType, {
  name: string;
  image: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  pitch: number;
  defaultLang: string;
}> = {
  aira: {
    name: 'Aira',
    image: '/dr_aira.png',
    accentText: 'text-fuchsia-400',
    accentBorder: 'border-fuchsia-500/70',
    accentBg: 'bg-fuchsia-500',
    pitch: 1.18,
    defaultLang: 'en-US',
  },
  kai: {
    name: 'Kai',
    image: '/dr_kai.png',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/70',
    accentBg: 'bg-emerald-500',
    defaultLang: 'en-US',
  },
};

const PATH_MESSAGES: Record<string, (name: string, t: any) => string> = {
  '/dashboard': (name, t) => t('avatar.greeting_dashboard', { name, defaultValue: `Good to see you, ${name}. You showed up today.` }),
  '/journal': (_name, t) => t('avatar.greeting_journal', { defaultValue: 'This space is yours completely. No judgment, just honesty.' }),
  '/chat': (_name, t) => t('avatar.greeting_chat', { defaultValue: "I'm here. Whatever you're carrying right now, you do not have to carry it alone." }),
  '/counseling': (_name, t) => t('avatar.greeting_counseling', { defaultValue: "Real human support is powerful. You're making a strong choice." }),
  '/health': (_name, t) => t('avatar.greeting_health', { defaultValue: "Your body is working to heal. Let's give it what it needs." }),
  '/exercise': (_name, t) => t('avatar.greeting_exercise', { defaultValue: 'Movement heals. Even five minutes counts today.' }),
  '/profile': (_name, t) => t('avatar.greeting_profile', { defaultValue: 'Your personal space. Reflect on your progress here.' }),
};

const FALLBACK_GREETING = 'I am right here with you.';
const AUTO_CLOSE_MS = 4500;
const MUTED_CLOSE_MS = 5000;
const ROUTE_SPEAK_DELAY_MS = 220;
const THINKING_MIN_MS = 550;

function getStoredAvatarType(): AvatarType {
  const stored = localStorage.getItem(STORAGE_KEYS.type);
  return stored === 'kai' ? 'kai' : 'aira';
}

function getStoredMuted(): boolean {
  return localStorage.getItem(STORAGE_KEYS.muted) === 'true';
}

function getLanguageTag(language: string, fallback: string): string {
  const base = (language || '').split('-')[0];
  if (!base) return fallback;
  if (base === 'en') return 'en-US';
  if (base === 'es') return 'es-MX';
  if (base === 'ja') return 'ja-JP';
  return fallback;
}

function pickVoice(voices: SpeechSynthesisVoice[], avatarType: AvatarType, language: string): SpeechSynthesisVoice | undefined {
  const langBase = (language || 'en').split('-')[0];

  const languageMatch = voices.filter(v => v.lang?.toLowerCase().startsWith(langBase.toLowerCase()));
  const anyEnglish = voices.filter(v => v.lang?.toLowerCase().startsWith('en'));
  const pool = languageMatch.length > 0 ? languageMatch : anyEnglish.length > 0 ? anyEnglish : voices;

  const storedURI = localStorage.getItem(STORAGE_KEYS.voiceURI);
  if (storedURI) {
    const stored = voices.find(v => v.voiceURI === storedURI);
    if (stored) return stored;
  }

  const femaleHints = ['female', 'samantha', 'victoria', 'google us english female', 'google uk english female'];
  const maleHints = ['male', 'daniel', 'alex', 'google us english male', 'google uk english male'];
  const hints = avatarType === 'aira' ? femaleHints : maleHints;

  const hinted = pool.find(v => hints.some(h => v.name?.toLowerCase().includes(h)));
  if (hinted) return hinted;

  return pool[0] ?? voices[0];
}

export const AvatarCharacter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { t, i18n } = useTranslation();

  const [isMuted, setIsMuted] = useState<boolean>(() => (typeof window !== 'undefined' ? getStoredMuted() : false));
  const [avatarType, setAvatarType] = useState<AvatarType>(() => (typeof window !== 'undefined' ? getStoredAvatarType() : 'aira'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false);
  const [isListeningToMic, setIsListeningToMic] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speakTimerRef = useRef<number | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);
  const pendingSpeakIdRef = useRef(0);
  const prevPathRef = useRef<string>('');
  const lastSpokenAtRef = useRef<number>(0);
  const voicesReadyRef = useRef(false);

  const theme = AVATAR_META[avatarType];
  const avatarName = theme.name;
  const avatarImg = theme.image;

  const clearTimers = useCallback(() => {
    if (speakTimerRef.current) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (autoCloseTimerRef.current) {
      window.clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const closeBubbleLater = useCallback((delay = AUTO_CLOSE_MS) => {
    if (autoCloseTimerRef.current) window.clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, delay);
  }, []);

  const speak = useCallback((speechText: string, options?: { autoCloseMs?: number; forceOpen?: boolean }) => {
    const text = speechText?.trim();
    if (!text) return;

    const autoCloseMs = options?.autoCloseMs ?? AUTO_CLOSE_MS;
    const forceOpen = options?.forceOpen ?? true;

    setMessage(text);
    if (forceOpen) setIsOpen(true);

    clearTimers();

    if (!synthRef.current || isMuted) {
      closeBubbleLater(autoCloseMs);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = getLanguageTag(i18n.language, theme.defaultLang);
    utterance.lang = lang;

    const voices = synthRef.current.getVoices();
    const preferredVoice = pickVoice(voices, avatarType, i18n.language) ?? undefined;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang; // Force alignment
      localStorage.setItem(STORAGE_KEYS.voiceURI, preferredVoice.voiceURI);
    }

    utterance.rate = 0.9;
    utterance.pitch = theme.pitch;
    utterance.volume = 0.95;

    const speakId = ++pendingSpeakIdRef.current;
    setIsLoadingSpeech(true);
    synthRef.current.cancel();

    utterance.onstart = () => {
      if (speakId !== pendingSpeakIdRef.current) return;
      setIsLoadingSpeech(false);
      setIsSpeaking(true);
      lastSpokenAtRef.current = Date.now();
    };

    utterance.onend = () => {
      if (speakId !== pendingSpeakIdRef.current) return;
      setIsSpeaking(false);
      setIsLoadingSpeech(false);
      closeBubbleLater(autoCloseMs);
    };

    utterance.onerror = () => {
      if (speakId !== pendingSpeakIdRef.current) return;
      setIsSpeaking(false);
      setIsLoadingSpeech(false);
      closeBubbleLater(MUTED_CLOSE_MS);
    };

    synthRef.current.speak(utterance);
  }, [avatarType, clearTimers, closeBubbleLater, i18n.language, isMuted, theme.defaultLang, theme.pitch]);

  const speakDelayed = useCallback((text: string, delay = ROUTE_SPEAK_DELAY_MS) => {
    clearTimers();
    speakTimerRef.current = window.setTimeout(() => speak(text), delay);
  }, [clearTimers, speak]);

  const toggleAvatar = useCallback(() => {
    const nextType: AvatarType = avatarType === 'aira' ? 'kai' : 'aira';
    setAvatarType(nextType);
    localStorage.setItem(STORAGE_KEYS.type, nextType);
    speak(`Hello, I am Dr. ${AVATAR_META[nextType].name}.`);
  }, [avatarType, speak]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem(STORAGE_KEYS.muted, String(nextMuted));

    if (nextMuted && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsLoadingSpeech(false);
      clearTimers();
    }
  }, [clearTimers, isMuted]);

  useEffect(() => {
    voiceCommandEngine.setListeningStateCallback(setIsListeningToMic);
    voiceCommandEngine.setCallback((result) => {
        if (!isVisible || isMuted) return;
        
        if (result.intent === 'navigate' && result.target) {
            speak(`I will open that for you.`, { autoCloseMs: 3000 });
            navigate(result.target);
        } else if (result.intent === 'sos') {
            speak("I am right here. Emergency protocols initiated.");
            const sosEvent = new CustomEvent('open-sos');
            window.dispatchEvent(sosEvent);
        } else if (result.intent === 'chat') {
            speak("Opening chat connection.", { autoCloseMs: 3000 });
            navigate('/chat');
        } else {
            // Unrecognized command but hotword used, we can query gemini
            const generateEvent = new CustomEvent('avatar-generate-speak', { detail: { context: `User said: ${result.rawText}` } });
            window.dispatchEvent(generateEvent);
        }
    });
  }, [navigate, speak, isVisible, isMuted]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    clearTimers();
    setIsSpeaking(false);
    setIsLoadingSpeech(false);
  }, [clearTimers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const refreshVoices = () => {
        voicesReadyRef.current = true;
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) refreshVoices();
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [clearTimers]);

  useEffect(() => {
    const handleSpeak = (e: WindowEventMap['avatar-speak']) => {
      if (!isVisible) return;
      speak(e.detail?.text ?? '');
    };

    const handleGenerate = async (e: WindowEventMap['avatar-generate-speak']) => {
      if (!isVisible || isMuted) return;

      const context = e.detail?.context?.trim();
      if (!context) return;

      const requestId = ++pendingSpeakIdRef.current;
      setIsLoadingSpeech(true);
      setIsSpeaking(true);

      const startedAt = Date.now();
      try {
        const prompt = `You are a warm, deeply empathetic recovery doctor guide (${avatarType}). The user is looking at or hovering over a feature. Describe extremely warmly in exactly one short sentence why this is helpful: ${context}`;
        const apiResponse = await generateLocalResponse(prompt, user?.streak || 0, user?.name || 'Friend');
        if (requestId !== pendingSpeakIdRef.current) return;

        const elapsed = Date.now() - startedAt;
        const wait = Math.max(THINKING_MIN_MS - elapsed, 0);
        window.setTimeout(() => {
          if (requestId !== pendingSpeakIdRef.current) return;
          speak(apiResponse, { autoCloseMs: AUTO_CLOSE_MS, forceOpen: true });
        }, wait);
      } catch (err) {
        console.error(err);
        if (requestId === pendingSpeakIdRef.current) {
          setIsSpeaking(false);
          setIsLoadingSpeech(false);
        }
      }
    };

    window.addEventListener('avatar-speak', handleSpeak as EventListener);
    window.addEventListener('avatar-generate-speak', handleGenerate as EventListener);

    return () => {
      window.removeEventListener('avatar-speak', handleSpeak as EventListener);
      window.removeEventListener('avatar-generate-speak', handleGenerate as EventListener);
    };
  }, [avatarType, isMuted, isVisible, speak, user?.name, user?.streak]);

  useEffect(() => {
    if (!isVisible) return;
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    const firstName = user?.name?.trim().split(/\s+/)[0] || 'friend';
    const matchedPath = Object.keys(PATH_MESSAGES).find(path => location.pathname.startsWith(path));

    const nextMessage = matchedPath
      ? PATH_MESSAGES[matchedPath](firstName, t)
      : t('avatar.greeting_default', { defaultValue: FALLBACK_GREETING });

    speakDelayed(nextMessage);
  }, [isVisible, location.pathname, speakDelayed, t, user?.name]);

  const ariaLabel = useMemo(() => {
    return `Dr. ${avatarName} assistant`;
  }, [avatarName]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[100px] right-6 z-[60] flex flex-col items-end pointer-events-none">
      {/* Speech Bubble */}
      <div
        className={`mb-4 relative pointer-events-auto transition-all duration-500 ease-out origin-bottom-right
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3 pointer-events-none'}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="max-w-[300px] rounded-t-2xl rounded-bl-2xl rounded-br-sm border border-white/10 bg-slate-950/90 p-4 shadow-[0_8px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] ${theme.accentText}`}>
              <Sparkles size={12} className={isSpeaking || isLoadingSpeech ? 'animate-pulse' : ''} />
              Dr. {avatarName}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close assistant message"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-sm leading-relaxed font-medium text-slate-200">
            {message}
          </p>

          <div className={`absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-white/10 bg-slate-950/90`} />
        </div>
      </div>

      {/* Avatar + Controls */}
      <div className="flex items-end gap-3 pointer-events-auto group">
        <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/75 p-1 opacity-0 shadow-xl backdrop-blur-md transition-all translate-y-[-10%] group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => voiceCommandEngine.toggle()}
            className={`rounded-xl p-2 transition-colors ${isListeningToMic ? 'bg-violet-500/20 text-violet-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            title="JARVIS Voice Control"
            aria-label="Toggle autonomous voice control"
          >
            {isListeningToMic ? <Mic size={16} className="animate-pulse" /> : <MicOff size={16} />}
          </button>
          <button
            type="button"
            onClick={toggleAvatar}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Switch Guide"
            aria-label="Switch guide"
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title={isMuted ? t('avatar.unmute') : t('avatar.mute')}
            aria-label={isMuted ? 'Unmute avatar' : 'Mute avatar'}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl p-2 text-rose-400 transition-colors hover:bg-white/10 hover:text-rose-300"
            title={t('avatar.dismiss')}
            aria-label="Dismiss avatar"
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className="relative h-24 w-24 overflow-visible rounded-3xl outline-none transition-transform hover:scale-105 focus-visible:scale-105 md:h-32 md:w-32"
          aria-label={ariaLabel}
          aria-pressed={isOpen}
        >
          <div
            className={`absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300 scale-105 border-2 ${theme.accentBorder} ${isSpeaking || isLoadingSpeech ? 'animate-ping opacity-100' : 'opacity-0 border-transparent'}`}
            style={{ animationDuration: '1.5s' }}
          />

          <div
            className={`absolute inset-0 rounded-3xl blur-xl transition-opacity duration-1000 ${theme.accentBg} ${isSpeaking || isLoadingSpeech ? 'opacity-60' : 'opacity-20'}`}
          />

          <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/20 bg-slate-800 shadow-2xl">
            <img
              src={avatarImg}
              alt={`Dr. ${avatarName}`}
              className={`h-full w-full object-cover transition-transform duration-[2000ms] ease-in-out ${isSpeaking || isLoadingSpeech ? 'scale-110 translate-y-1' : 'scale-100 translate-y-0'}`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </button>
      </div>
    </div>
  );
};
