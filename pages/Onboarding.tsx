import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingContext } from "../context/OnboardingContext";
import { supabase } from "../services/supabaseClient";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useContext(OnboardingContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  interface Question {
    key: string;
    question: string;
    type: "select" | "text" | "multi-select" | "list";
    options?: string[];
    placeholder?: string;
  }

  interface StepDefinition {
    title: string;
    description: string;
    questions: Question[];
  }

  const steps: StepDefinition[] = [
    {
      title: "Your Addiction Journey",
      description: "Help us understand your starting point",
      questions: [
        {
          key: "sobriety_substance",
          question: "What substance or behavior are you recovering from?",
          type: "select",
          options: [
            "Alcohol",
            "Opioids",
            "Cocaine",
            "Methamphetamine",
            "Cannabis",
            "Prescription Drugs",
            "Other Drugs",
            "Behavioral Addiction",
            "Gambling",
            "Other",
          ],
        },
        {
          key: "duration_addicted",
          question: "How long were you struggling with this?",
          type: "select",
          options: [
            "Less than 6 months",
            "6 months to 1 year",
            "1-3 years",
            "3-5 years",
            "5-10 years",
            "More than 10 years",
          ],
        },
      ],
    },
    {
      title: "Your Recovery Goals",
      description: "Define what success looks like for you",
      questions: [
        {
          key: "primary_goal",
          question: "What's your primary recovery goal?",
          type: "text",
          placeholder: "e.g., Stay clean for 6 months, rebuild relationships with family...",
        },
        {
          key: "day_30_goal",
          question: "What would success look like in 30 days?",
          type: "text",
          placeholder: "e.g., Complete first week sober, attend 5 counseling sessions...",
        },
      ],
    },
    {
      title: "Identify Your Triggers",
      description: "Understanding your triggers helps you avoid them",
      questions: [
        {
          key: "main_triggers",
          question: "What are your biggest triggers? (select all that apply)",
          type: "multi-select",
          options: [
            "Stress or anxiety",
            "Boredom",
            "Social pressure",
            "Specific people",
            "Specific places",
            "Emotional pain",
            "Celebrations or success",
            "Financial worry",
            "Health issues",
            "Relationship problems",
          ],
        },
      ],
    },
    {
      title: "Your Support Network",
      description: "Recovery is easier with support",
      questions: [
        {
          key: "support_network",
          question: "Who supports your recovery?",
          type: "text",
          placeholder: "e.g., My partner, my sister, best friend John, my therapist...",
        },
        {
          key: "coping_strategies",
          question: "What coping strategies have worked for you?",
          type: "text",
          placeholder:
            "e.g., Exercise, meditation, talking to friends, hobbies, journaling...",
        },
      ],
    },
    {
      title: "Your Preferences",
      description: "Customize your experience",
      questions: [
        {
          key: "preferred_reminder_times",
          question: "When should we send you motivational reminders?",
          type: "multi-select",
          options: ["Morning (6-9 AM)", "Afternoon (12-3 PM)", "Evening (5-8 PM)", "Night (8-11 PM)"],
        },
      ],
    },
  ];

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        alert("Please sign in first");
        navigate("/auth");
        return;
      }

      // Update user profile with onboarding data
      const { error } = await supabase
        .from("users")
        .update({
          onboarding_data: JSON.stringify(onboarding),
          onboarding_completed: true,
        })
        .eq("id", session.data.session.user.id);

      if (error) throw error;

      alert(
        "✅ Onboarding complete! Welcome to your recovery journey! 💪"
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step - 1];
  const isStepComplete = currentStep.questions.every(
    (q) => (onboarding as any)[q.key]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {currentStep.title}
              </h2>
              <p className="text-slate-600 mt-2">{currentStep.description}</p>
            </div>
            <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200">
              Step {step}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8 border border-slate-100">
          <div className="space-y-8">
            {currentStep.questions.map((q, idx) => (
              <div key={idx} className="animate-in fade-in">
                <label className="block text-lg font-semibold text-slate-900 mb-4">
                  {q.question}
                </label>

                {q.type === "select" && (
                  <select
                    value={(onboarding as any)[q.key] || ""}
                    onChange={(e) =>
                      updateOnboarding(q.key as any, e.target.value)
                    }
                    className="w-full p-4 border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                  >
                    <option value="">Choose an option...</option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {q.type === "text" && (
                  <textarea
                    value={(onboarding as any)[q.key] || ""}
                    onChange={(e) =>
                      updateOnboarding(q.key as any, e.target.value)
                    }
                    placeholder={q.placeholder}
                    rows={3}
                    className="w-full p-4 border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-medium"
                  />
                )}

                {q.type === "multi-select" && (
                  <div className="space-y-3">
                    {q.options?.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={
                            ((onboarding as any)[q.key] || []).includes(opt)
                          }
                          onChange={(e) => {
                            const current = (onboarding as any)[q.key] || [];
                            if (e.target.checked) {
                              updateOnboarding(q.key as any, [
                                ...current,
                                opt,
                              ]);
                            } else {
                              updateOnboarding(
                                q.key as any,
                                current.filter((i: string) => i !== opt)
                              );
                            }
                          }}
                          className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                        />
                        <span className="ml-3 font-medium text-slate-700">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={step === 1 ? handleCancel : () => setStep(Math.max(1, step - 1))}
            className="flex items-center space-x-2 px-8 py-4 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} />
            <span>{step === 1 ? "Cancel" : "Back"}</span>
          </button>

          <div className="flex gap-4">
            {/* Visual step indicator */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${i < step ? "w-6 bg-amber-500" : i === step - 1 ? "w-3 bg-amber-400" : "w-2 bg-slate-300"
                    }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (step === totalSteps) {
                  handleSubmit();
                } else {
                  if (isStepComplete) setStep(step + 1);
                  else alert("Please complete all fields before continuing");
                }
              }}
              disabled={loading || !isStepComplete}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
            >
              <span>
                {loading
                  ? "Saving..."
                  : step === totalSteps
                    ? "Complete"
                    : "Next"}
              </span>
              {step === totalSteps ? (
                <Check size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            💡 This helps us personalize your recovery journey. You can change
            these anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
