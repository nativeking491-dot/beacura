import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingContext, RecoveryCategory } from "../context/OnboardingContext";
import { supabase } from "../services/supabaseClient";
import { ArrowRight, ArrowLeft, Check, Sparkles, Heart } from "lucide-react";
import { useToast } from "../context/ToastContext";

// ─── Recovery Category Definitions ──────────────────────────────────────────
interface CategoryOption {
  value: RecoveryCategory;
  label: string;
  emoji: string;
  color: string;
  description: string;
  focuses: string[];
  triggerOptions: string[];
  goalPlaceholder: string;
  day30Placeholder: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: "substance_addiction",
    label: "Substance Recovery",
    emoji: "🧬",
    color: "#8b5cf6",
    description: "Alcohol, drugs, nicotine, or other substance dependence",
    focuses: ["Alcohol", "Opioids", "Cocaine", "Methamphetamine", "Cannabis", "Prescription Drugs", "Nicotine", "Gambling", "Behavioral Addiction", "Other"],
    triggerOptions: ["Stress or anxiety", "Boredom", "Social pressure", "Specific people", "Specific places", "Emotional pain", "Celebrations", "Financial worry", "Health issues", "Relationship problems"],
    goalPlaceholder: "e.g., Stay sober for 6 months, rebuild family trust...",
    day30Placeholder: "e.g., Complete first month clean, attend 5 support meetings...",
  },
  {
    value: "love_failure",
    label: "Heartbreak Recovery",
    emoji: "💔",
    color: "#ec4899",
    description: "Breakup, divorce, unrequited love, or relationship loss",
    focuses: ["Breakup", "Divorce", "Unrequited love", "Betrayal / Cheating", "Long-distance separation", "Family rejection", "Toxic relationship recovery", "Other"],
    triggerOptions: ["Seeing their photos", "Mutual friends", "Social media", "Specific places you visited together", "Songs or movies", "Loneliness at night", "Dating apps", "Anniversaries / special dates", "Overthinking", "Fear of being alone"],
    goalPlaceholder: "e.g., Find inner peace, stop checking their social media, rediscover myself...",
    day30Placeholder: "e.g., Go 30 days without contacting them, start a new hobby, reconnect with friends...",
  },
  {
    value: "physical_injury",
    label: "Physical Injury Recovery",
    emoji: "🦴",
    color: "#10b981",
    description: "Surgery recovery, sports injury, accident, or chronic pain",
    focuses: ["Post-surgery recovery", "Sports injury", "Car accident", "Work injury", "Chronic pain", "Back injury", "Joint replacement", "Fracture recovery", "Other"],
    triggerOptions: ["Overexertion", "Cold weather", "Sitting too long", "Lifting heavy objects", "Stress tension", "Poor sleep position", "Skipping exercises", "Comparing to pre-injury ability", "Fear of re-injury", "Frustration with slow progress"],
    goalPlaceholder: "e.g., Regain 90% mobility, return to sport, live pain-free...",
    day30Placeholder: "e.g., Complete daily exercises, reduce pain by 50%, walk without aid...",
  },
  {
    value: "grief_loss",
    label: "Grief & Loss",
    emoji: "🕊️",
    color: "#6366f1",
    description: "Death of a loved one, pet loss, or significant life loss",
    focuses: ["Death of a parent", "Death of a spouse/partner", "Death of a child", "Death of a friend", "Pet loss", "Miscarriage / pregnancy loss", "Loss of a relationship", "Loss of identity or purpose", "Other"],
    triggerOptions: ["Anniversaries", "Holidays", "Their belongings", "Empty spaces in the home", "Family gatherings", "Similar-looking strangers", "Dreams about them", "Unsaid words / regrets", "Loneliness", "Others moving on"],
    goalPlaceholder: "e.g., Find peace with the loss, honor their memory, stop feeling guilty...",
    day30Placeholder: "e.g., Journal about my feelings, talk to a counselor, create a memory ritual...",
  },
  {
    value: "mental_health",
    label: "Mental Health",
    emoji: "🧠",
    color: "#06b6d4",
    description: "Depression, anxiety, PTSD, OCD, or other mental health challenges",
    focuses: ["Depression", "Anxiety / Panic disorder", "PTSD", "OCD", "Bipolar disorder", "Social anxiety", "Phobias", "ADHD management", "Anger management", "Other"],
    triggerOptions: ["Negative self-talk", "Social situations", "Work pressure", "Lack of sleep", "News / media", "Conflict with others", "Feeling trapped", "Physical symptoms", "Money worries", "Comparison to others"],
    goalPlaceholder: "e.g., Manage anxiety without medication, go out socially once a week...",
    day30Placeholder: "e.g., Establish a morning routine, practice meditation daily, call a friend 3x a week...",
  },
  {
    value: "burnout_stress",
    label: "Burnout & Stress",
    emoji: "🔥",
    color: "#f59e0b",
    description: "Work exhaustion, academic pressure, or chronic stress",
    focuses: ["Work burnout", "Academic burnout", "Caregiver fatigue", "Creative burnout", "Entrepreneurial exhaustion", "Parenting overwhelm", "Financial stress", "Other"],
    triggerOptions: ["Email / Slack notifications", "Monday mornings", "Deadlines", "Feeling unappreciated", "Comparison to peers", "Sleep deprivation", "Saying yes to everything", "Lack of boundaries", "Perfectionism", "Screen overload"],
    goalPlaceholder: "e.g., Set healthy work-life boundaries, sleep 8 hours, rediscover passion...",
    day30Placeholder: "e.g., Leave work by 6pm, take weekends off, start exercising 3x per week...",
  },
  {
    value: "trauma",
    label: "Trauma Recovery",
    emoji: "🌱",
    color: "#14b8a6",
    description: "Processing trauma from abuse, violence, or traumatic events",
    focuses: ["Childhood trauma", "Domestic violence", "Sexual assault", "Emotional abuse", "Bullying", "War / combat trauma", "Witnessing violence", "Natural disaster", "Accident trauma", "Other"],
    triggerOptions: ["Loud noises", "Specific smells", "Being touched unexpectedly", "Dark or confined spaces", "Certain people or authority figures", "Nightmares / flashbacks", "Feeling powerless", "News about similar events", "Vulnerability / intimacy", "Trust situations"],
    goalPlaceholder: "e.g., Feel safe in my own body, build healthy relationships, sleep without nightmares...",
    day30Placeholder: "e.g., Start therapy, practice grounding techniques daily, identify 3 safe spaces...",
  },
  {
    value: "eating_disorder",
    label: "Eating Disorder Recovery",
    emoji: "🍃",
    color: "#84cc16",
    description: "Anorexia, bulimia, binge eating, or body image issues",
    focuses: ["Anorexia", "Bulimia", "Binge eating", "Orthorexia", "Body dysmorphia", "Emotional eating", "Restrictive eating", "Other"],
    triggerOptions: ["Mirrors / body checking", "Social media body images", "Comments about weight", "Clothes fitting differently", "Eating in public", "Calorie counting", "Skipping meals", "Stressful days", "Weighing yourself", "Diet culture content"],
    goalPlaceholder: "e.g., Develop a healthy relationship with food, eat intuitively, stop purging...",
    day30Placeholder: "e.g., Eat 3 meals a day, unfollow toxic fitness accounts, attend 4 therapy sessions...",
  },
  {
    value: "self_harm",
    label: "Self-Harm Recovery",
    emoji: "💚",
    color: "#22c55e",
    description: "Recovering from self-harm behaviors",
    focuses: ["Cutting", "Self-injury", "Risky behavior", "Emotional self-punishment", "Other"],
    triggerOptions: ["Overwhelming emotions", "Feeling numb", "Rejection", "Self-hatred", "Conflict with loved ones", "Feeling out of control", "Loneliness", "Academic / work failure", "Shame spirals", "Seeing scars"],
    goalPlaceholder: "e.g., Find alternative coping methods, go 6 months without self-harm...",
    day30Placeholder: "e.g., Use crisis toolkit every time, tell one trusted person, attend weekly therapy...",
  },
  {
    value: "other",
    label: "Other Recovery",
    emoji: "✨",
    color: "#a855f7",
    description: "Any other struggle you're working through",
    focuses: ["Personal growth", "Life transition", "Identity crisis", "Career change", "Immigration / culture shock", "Other"],
    triggerOptions: ["Uncertainty about the future", "Comparison to others", "Feeling lost", "Imposter syndrome", "Social isolation", "Change fatigue", "Lack of purpose", "Overwhelm", "Financial instability", "Fear of failure"],
    goalPlaceholder: "e.g., Find clarity about my path, build a new support system...",
    day30Placeholder: "e.g., Explore 3 new activities, journal daily, connect with a mentor...",
  },
];

const DURATION_OPTIONS = [
  "Less than a month",
  "1-3 months",
  "3-6 months",
  "6 months to 1 year",
  "1-3 years",
  "3-5 years",
  "5+ years",
  "I'm not sure",
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useContext(OnboardingContext);
  const [step, setStep] = useState(0); // 0 = category selection
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const totalSteps = 6; // 0=category, 1=focus, 2=goals, 3=triggers, 4=support, 5=preferences

  const selectedCategory = CATEGORIES.find(c => c.value === onboarding.recovery_category);

  const handleCancel = () => navigate("/dashboard");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        showToast("Please sign in first", "warning");
        navigate("/auth");
        return;
      }
      const { error } = await supabase
        .from("users")
        .update({
          onboarding_data: JSON.stringify(onboarding),
          onboarding_completed: true,
        })
        .eq("id", session.data.session.user.id);

      if (error) throw error;
      showToast("Welcome to your recovery journey! 💪", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding:", error);
      showToast("Failed to save preferences. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!onboarding.recovery_category;
      case 1: return !!onboarding.specific_focus && !!onboarding.duration_struggling;
      case 2: return !!onboarding.primary_goal;
      case 3: return onboarding.main_triggers.length > 0;
      case 4: return true; // optional
      case 5: return true; // optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === totalSteps - 1) {
      handleSubmit();
    } else if (canProceed()) {
      setStep(step + 1);
    } else {
      showToast("Please complete the required fields", "warning");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #070711 0%, #0e0d1c 40%, #0f172a 100%)' }}>
      <div className="max-w-2xl w-full">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-violet-400" fill="currentColor" />
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white">Beacura</span>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              Step {step + 1} / {totalSteps}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((step + 1) / totalSteps) * 100}%`,
                background: selectedCategory
                  ? `linear-gradient(90deg, ${selectedCategory.color}, #8b5cf6)`
                  : 'linear-gradient(90deg, #8b5cf6, #6366f1)',
              }}
            />
          </div>
        </div>

        {/* ═══════════ STEP 0: Category Selection ═══════════ */}
        {step === 0 && (
          <div className="animate-in space-y-6">
            <div className="text-center mb-8">
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                What brings you here?
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Everyone's journey is different. Select the area you'd like support with — we'll personalize everything for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.map(cat => {
                const isSelected = onboarding.recovery_category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => updateOnboarding("recovery_category", cat.value)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 group ${
                      isSelected
                        ? 'border-opacity-60 scale-[1.02] shadow-xl'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    style={isSelected ? {
                      borderColor: `${cat.color}80`,
                      background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}05)`,
                      boxShadow: `0 8px 32px ${cat.color}20`,
                    } : {
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)`,
                          border: `1px solid ${cat.color}30`,
                        }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-100">{cat.label}</p>
                        <p className="text-[11px] text-slate-400 leading-snug">{cat.description}</p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto flex-shrink-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: cat.color }}>
                            <Check size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ STEP 1: Specific Focus & Duration ═══════════ */}
        {step === 1 && selectedCategory && (
          <div className="animate-in space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedCategory.emoji}</span>
                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white">
                  Tell Us More
                </h2>
              </div>
              <p className="text-slate-400 text-sm">This helps us tailor your experience</p>
            </div>

            <div className="bento-card rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  What specifically are you dealing with?
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.focuses.map(focus => {
                    const isSelected = onboarding.specific_focus === focus;
                    return (
                      <button
                        key={focus}
                        onClick={() => updateOnboarding("specific_focus", focus)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        style={isSelected ? {
                          background: `linear-gradient(135deg, ${selectedCategory.color}, ${selectedCategory.color}bb)`,
                          boxShadow: `0 4px 16px ${selectedCategory.color}30`,
                        } : {}}
                      >
                        {focus}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  How long have you been dealing with this?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map(d => {
                    const isSelected = onboarding.duration_struggling === d;
                    return (
                      <button
                        key={d}
                        onClick={() => updateOnboarding("duration_struggling", d)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                            : 'text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: Goals ═══════════ */}
        {step === 2 && selectedCategory && (
          <div className="animate-in space-y-6">
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white mb-1">
                Your Goals
              </h2>
              <p className="text-slate-400 text-sm">Define what healing looks like for you</p>
            </div>

            <div className="bento-card rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  What's your main recovery goal?
                </label>
                <textarea
                  value={onboarding.primary_goal || ""}
                  onChange={e => updateOnboarding("primary_goal", e.target.value)}
                  placeholder={selectedCategory.goalPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none input-glow resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  What would progress look like in 30 days? <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={onboarding.day_30_goal || ""}
                  onChange={e => updateOnboarding("day_30_goal", e.target.value)}
                  placeholder={selectedCategory.day30Placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none input-glow resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: Triggers ═══════════ */}
        {step === 3 && selectedCategory && (
          <div className="animate-in space-y-6">
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white mb-1">
                Your Triggers
              </h2>
              <p className="text-slate-400 text-sm">Understanding triggers helps you manage them</p>
            </div>

            <div className="bento-card rounded-2xl p-6">
              <label className="block text-sm font-bold text-slate-200 mb-3">
                What triggers your struggle? <span className="text-slate-500 font-normal">(select all that apply)</span>
              </label>
              <div className="space-y-2">
                {selectedCategory.triggerOptions.map(trigger => {
                  const isSelected = onboarding.main_triggers.includes(trigger);
                  return (
                    <button
                      key={trigger}
                      onClick={() => {
                        if (isSelected) {
                          updateOnboarding("main_triggers", onboarding.main_triggers.filter((t: string) => t !== trigger));
                        } else {
                          updateOnboarding("main_triggers", [...onboarding.main_triggers, trigger]);
                        }
                      }}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-violet-400 bg-violet-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium">{trigger}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 4: Support & Coping ═══════════ */}
        {step === 4 && selectedCategory && (
          <div className="animate-in space-y-6">
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white mb-1">
                Your Support System
              </h2>
              <p className="text-slate-400 text-sm">Recovery is easier when you're not alone</p>
            </div>

            <div className="bento-card rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  Who supports you? <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={(onboarding.support_network as any) || ""}
                  onChange={e => updateOnboarding("support_network", e.target.value)}
                  placeholder="e.g., My partner, therapist, best friend, support group..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none input-glow resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-3">
                  What coping strategies work for you? <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={(onboarding.coping_strategies as any) || ""}
                  onChange={e => updateOnboarding("coping_strategies", e.target.value)}
                  placeholder="e.g., Exercise, journaling, meditation, calling a friend, deep breathing..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none input-glow resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 5: Preferences ═══════════ */}
        {step === 5 && (
          <div className="animate-in space-y-6">
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white mb-1">
                Reminders
              </h2>
              <p className="text-slate-400 text-sm">When should we check in with you?</p>
            </div>

            <div className="bento-card rounded-2xl p-6">
              <label className="block text-sm font-bold text-slate-200 mb-3">
                Preferred reminder times
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Morning (6-9 AM)", "Afternoon (12-3 PM)", "Evening (5-8 PM)", "Night (8-11 PM)"].map(time => {
                  const isSelected = onboarding.preferred_reminder_times.includes(time);
                  return (
                    <button
                      key={time}
                      onClick={() => {
                        if (isSelected) {
                          updateOnboarding("preferred_reminder_times", onboarding.preferred_reminder_times.filter((t: string) => t !== time));
                        } else {
                          updateOnboarding("preferred_reminder_times", [...onboarding.preferred_reminder_times, time]);
                        }
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {selectedCategory && (
              <div className="rehab-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Your Recovery Path</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Category</p>
                    <p className="text-sm font-bold text-slate-100">{selectedCategory.emoji} {selectedCategory.label}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Focus</p>
                    <p className="text-sm font-bold text-slate-100">{onboarding.specific_focus || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ Navigation ═══════════ */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={step === 0 ? handleCancel : () => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
            <span>{step === 0 ? "Skip" : "Back"}</span>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background: i < step
                    ? selectedCategory?.color || '#8b5cf6'
                    : i === step
                    ? selectedCategory?.color || '#8b5cf6'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading || !canProceed()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shine-on-hover"
            style={{
              background: `linear-gradient(135deg, ${selectedCategory?.color || '#8b5cf6'}, ${selectedCategory?.color || '#6366f1'}bb)`,
              boxShadow: `0 4px 20px ${selectedCategory?.color || '#8b5cf6'}30`,
            }}
          >
            <span>{loading ? "Saving..." : step === totalSteps - 1 ? "Complete" : "Next"}</span>
            {step === totalSteps - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          💡 This helps us personalize your journey. You can change these anytime in settings.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
