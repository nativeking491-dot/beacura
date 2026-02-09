import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "../services/supabaseClient";

interface PrivacySettingsModalProps {
  userId: string | undefined;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  userId,
  onClose,
}) => {
  const [settings, setSettings] = useState({
    profile_visibility: "private", // private, friends, public
    show_streak: true,
    show_badges: true,
    allow_mentor_requests: true,
    data_collection: true,
    analytics: true,
    allow_contact: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.log("No existing privacy settings, using defaults");
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("privacy_settings")
        .upsert(
          { user_id: userId, ...settings },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      alert("✅ Privacy settings saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      alert("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock size={28} />
            <h2 className="text-2xl font-bold">Privacy Settings</h2>
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
          {/* Profile Visibility */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-lg">
              Profile Visibility
            </h3>
            <div className="space-y-2">
              {[
                {
                  value: "private",
                  label: "🔒 Private - Only you can see your profile",
                },
                {
                  value: "friends",
                  label: "👥 Friends Only - Only mentors can see",
                },
                {
                  value: "public",
                  label: "🌍 Public - Everyone can see your profile",
                },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={settings.profile_visibility === option.value}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile_visibility: e.target.value,
                      }))
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-slate-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Privacy Toggles */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Data Privacy</h3>

            {[
              {
                key: "show_streak",
                label: "Show my streak publicly",
                description: "Allow others to see your current streak",
              },
              {
                key: "show_badges",
                label: "Show my badges",
                description: "Display achievements on your profile",
              },
              {
                key: "allow_mentor_requests",
                label: "Allow mentor requests",
                description: "Let other users request to be mentored by you",
              },
              {
                key: "data_collection",
                label: "Share anonymous data for research",
                description: "Help improve recovery outcomes (no personal info)",
              },
              {
                key: "analytics",
                label: "Allow analytics tracking",
                description: "Help us understand how you use the app",
              },
              {
                key: "allow_contact",
                label: "Allow support team contact",
                description: "We may reach out if issues are detected",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof typeof settings)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    (settings as any)[item.key]
                      ? "bg-amber-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      (settings as any)[item.key] ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200"></div>

          {/* GDPR Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>📋 GDPR Compliance:</strong> You can export your data or
              request deletion anytime. Your privacy is our priority. We never
              sell your data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex gap-3 justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};
