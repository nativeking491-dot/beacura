import React, { useState } from "react";
import { X, Heart, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../services/supabaseClient";

interface BecameMentorModalProps {
  userId: string | undefined;
  userStreak: number;
  userEmail: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeMentorModal: React.FC<BecameMentorModalProps> = ({
  userId,
  userStreak,
  userEmail,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"check" | "form" | "success">(
    userStreak >= 365 ? "form" : "check"
  );
  const [formData, setFormData] = useState({
    why_mentor: "",
    experience_text: "",
    specialties: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const daysUntilEligible = Math.max(0, 365 - userStreak);
  const isEligible = userStreak >= 365;

  const specialtyOptions = [
    "Alcohol Recovery",
    "Opioid Recovery",
    "Drug Abuse",
    "Behavioral Addiction",
    "Co-dependency",
    "Family Support",
    "Workplace Recovery",
    "Youth Support (18-25)",
  ];

  const handleToggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleSubmit = async () => {
    if (!userId) return;

    if (!formData.why_mentor.trim()) {
      alert("Please tell us why you want to mentor");
      return;
    }

    if (!formData.experience_text.trim()) {
      alert("Please share your recovery experience");
      return;
    }

    if (formData.specialties.length === 0) {
      alert("Please select at least one specialty");
      return;
    }

    setSubmitting(true);

    try {
      // Submit mentor application
      const { error } = await supabase.from("mentor_applications").insert({
        user_id: userId,
        sobriety_years: Math.floor(userStreak / 365),
        why_mentor: formData.why_mentor,
        experience_text: formData.experience_text,
        specialties: formData.specialties,
        status: "submitted",
      });

      if (error) throw error;

      setStep("success");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart size={28} fill="currentColor" />
            <h2 className="text-2xl font-bold">Become a Mentor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {step === "check" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-blue-900">
                      One Year Milestone Required
                    </p>
                    <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                      To become a mentor, you need to have at least 1 year (365
                      days) of continuous sobriety. This ensures you have
                      sufficient recovery experience to guide others.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900">Your Progress</h3>
                <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">
                      Current Streak
                    </span>
                    <span className="text-3xl font-bold text-amber-600">
                      {userStreak}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all rounded-full"
                      style={{ width: `${Math.min((userStreak / 365) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">0 days</span>
                    <span className="text-slate-500">365 days</span>
                  </div>
                </div>
              </div>

              {!isEligible && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-900 font-semibold">
                    ⏳ You'll be eligible in{" "}
                    <span className="font-bold text-amber-600">
                      {daysUntilEligible} days
                    </span>
                    ! Keep up your amazing progress! 💪
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("form")}
                disabled={!isEligible}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isEligible ? "Continue to Application" : "Not Yet Eligible"}
              </button>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                Thank you for wanting to give back to the community! We're
                looking for mentors who are passionate about helping others
                recover.
              </p>

              <div className="space-y-3">
                <label className="block font-bold text-slate-900">
                  Why do you want to be a mentor?
                </label>
                <textarea
                  value={formData.why_mentor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      why_mentor: e.target.value,
                    }))
                  }
                  placeholder="Share your motivation and what inspired you to help others..."
                  rows={3}
                  className="w-full p-4 border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block font-bold text-slate-900">
                  Tell us about your recovery experience
                </label>
                <textarea
                  value={formData.experience_text}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experience_text: e.target.value,
                    }))
                  }
                  placeholder="Share your journey - what you struggled with, how you overcame it, lessons learned..."
                  rows={3}
                  className="w-full p-4 border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="block font-bold text-slate-900">
                  Which areas do you want to mentor in?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => handleToggleSpecialty(specialty)}
                      className={`p-3 rounded-lg border-2 font-semibold text-sm transition ${formData.specialties.includes(specialty)
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-slate-300 bg-white text-slate-700 hover:border-purple-300"
                        }`}
                    >
                      {formData.specialties.includes(specialty) && (
                        <span className="mr-1">✓</span>
                      )}
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-xs text-purple-900">
                  <strong>✓ Next Steps:</strong> We'll review your application
                  and contact you within 48 hours. We may ask follow-up
                  questions before approving you as a mentor.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep("check")}
                  className="p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  Application Submitted! 🎉
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Thank you for wanting to help others on their recovery journey.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-green-700">
                  ✓ What happens next?
                </p>
                <ul className="text-xs text-green-700 space-y-1 text-left">
                  <li>• We'll review your background and experience</li>
                  <li>• You'll receive follow-up questions via email</li>
                  <li>• We'll verify your identity and sobriety</li>
                  <li>• Once approved, you'll receive mentor training</li>
                  <li>• Then you can start helping others!</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                We typically respond within 48 hours. Check your email at{" "}
                <strong>{userEmail}</strong> for updates.
              </p>

              <button
                onClick={onClose}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
