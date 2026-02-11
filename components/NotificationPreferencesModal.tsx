import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "../services/supabaseClient";

interface NotificationPreferencesModalProps {
  userId: string | undefined;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<
  NotificationPreferencesModalProps
> = ({ userId, onClose }) => {
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    email_daily_summary: true,
    email_craving_tips: true,
    email_achievements: true,
    email_mentor_messages: true,
    push_enabled: true,
    push_reminders: true,
    push_motivation: true,
    sms_enabled: false,
    sms_crisis_alerts: true,
    frequency: "daily", // daily, weekly, never
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    if (!userId) return;
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(`notif_prefs_${userId}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
        return;
      }

      // Fallback: try database (if table exists)
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setPreferences(data);
        // Cache to localStorage
        localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.log("No existing preferences, using defaults");
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      // Save to localStorage (always works)
      localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(preferences));

      // Try to save to database as well (if table exists)
      try {
        await supabase
          .from("notification_preferences")
          .upsert(
            { user_id: userId, ...preferences },
            { onConflict: "user_id" }
          );
      } catch (dbError) {
        console.log("Database table doesn't exist yet, using localStorage only");
      }

      alert("✅ Notification preferences updated!");
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell size={28} />
            <h2 className="text-2xl font-bold">Notification Preferences</h2>
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
          {/* Frequency */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-lg">
              Communication Frequency
            </h3>
            <div className="space-y-2">
              {[
                { value: "daily", label: "📅 Daily - Get updates every day" },
                { value: "weekly", label: "📆 Weekly - Summaries on Mondays" },
                { value: "never", label: "🤐 Never - Turn off all notifications" },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={preferences.frequency === option.value}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Email Notifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📧</span>
              </div>
              <h3 className="font-bold text-slate-900">Email Notifications</h3>
            </div>

            <div className="space-y-2 pl-10">
              {[
                {
                  key: "email_enabled",
                  label: "Enable email notifications",
                },
                {
                  key: "email_daily_summary",
                  label: "Daily recovery summary",
                  sub: "Get a recap of your progress",
                },
                {
                  key: "email_craving_tips",
                  label: "Craving management tips",
                  sub: "Helpful strategies when you need them",
                },
                {
                  key: "email_achievements",
                  label: "Milestone celebrations",
                  sub: "Congratulations on reaching goals",
                },
                {
                  key: "email_mentor_messages",
                  label: "Mentor messagess",
                  sub: "When your mentor sends you a message",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {item.label}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSetting(item.key as keyof typeof preferences)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${(preferences as any)[item.key]
                        ? "bg-blue-600"
                        : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${(preferences as any)[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Push Notifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📱</span>
              </div>
              <h3 className="font-bold text-slate-900">Push Notifications</h3>
            </div>

            <div className="space-y-2 pl-10">
              {[
                {
                  key: "push_enabled",
                  label: "Enable push notifications",
                },
                {
                  key: "push_reminders",
                  label: "Daily check-in reminders",
                  sub: "Stay accountable with daily prompts",
                },
                {
                  key: "push_motivation",
                  label: "Motivational messages",
                  sub: "Inspiring quotes and encouragement",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {item.label}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSetting(item.key as keyof typeof preferences)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${(preferences as any)[item.key]
                        ? "bg-green-600"
                        : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${(preferences as any)[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* SMS Notifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📀</span>
              </div>
              <h3 className="font-bold text-slate-900">SMS Alerts</h3>
            </div>

            <div className="space-y-2 pl-10">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    Enable SMS (text messages)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standard message rates apply
                  </p>
                </div>
                <button
                  onClick={() => toggleSetting("sms_enabled")}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${preferences.sms_enabled ? "bg-red-600" : "bg-slate-300"
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${preferences.sms_enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              {preferences.sms_enabled && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      🚨 Crisis alerts via SMS
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Always enabled for safety
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
            <p className="text-xs text-yellow-900">
              <strong>💡 Tip:</strong> We only send notifications based on your
              preferences. You can disable all notifications, but we recommend
              keeping crisis and mentor message alerts on.
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
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};
