import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useUser } from "../context/UserContext";
import {
  Settings,
  Shield,
  Award,
  Calendar,
  Mail,
  Edit2,
  ShieldCheck,
  MapPin,
  Loader2,
} from "lucide-react";
import { ThemePicker } from "../components/ThemePicker";

const Profile: React.FC = () => {
  const { user, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when user loads
  React.useEffect(() => {
    if (user?.name) setEditedName(user.name);
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!editedName.trim()) {
      alert("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: editedName })
        .eq("id", user.id);

      if (error) throw error;

      alert("✅ Profile updated successfully!");
      setIsEditing(false);
      // Ideally refresh user context or just rely on local state update if simple
      window.location.reload(); // Simple reload to fetch fresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  // Handle case when user data is not available
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-slate-500">Unable to load profile data.</p>
        <button
          onClick={() => (window.location.href = "/auth")}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  const userName = user.name || "User";
  const userEmail = user.email || "email@example.com";
  const userRole = user.role || "RECOVERING_USER";
  const userStreak = user.streak || 0;
  const userPoints = user.points || 0;
  const joinDate = user.created_at ? new Date(user.created_at) : new Date();

  // Default badges
  const badges = [
    { id: "b1", name: "Week One", icon: "Shield" },
    {
      id: "b2",
      name: "First Mentor Call",
      icon: "Award",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
              <Edit2 size={16} />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center gap-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-3xl font-extrabold text-slate-900 bg-slate-50 border-2 border-teal-500 rounded-lg px-4 py-1 focus:outline-none w-full md:w-auto"
                  autoFocus
                />
              ) : (
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
                  {userName}
                </h1>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm mt-2">
              <span className="flex items-center">
                <Mail size={14} className="mr-1" /> {userEmail}
              </span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" /> Joined{" "}
                {joinDate.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold border border-teal-100">
                {userRole === "RECOVERED_MENTOR"
                  ? "Recovered Mentor"
                  : "Recovering User"}
              </span>

              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(user?.name || "");
                    }}
                    disabled={isSaving}
                    className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <Edit2 size={12} /> Edit Profile
                </button>
              )}
            </div>
          </div>
          <button className="bg-slate-50 text-slate-600 p-3 rounded-2xl hover:bg-slate-100 transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recovery Journey Stats */}
        <div className="md:col-span-2 space-y-8">
          <ThemePicker />

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Recovery Journey</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-teal-600 mb-1">
                  {userStreak}
                </p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Days Clean
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-indigo-600 mb-1">
                  {userPoints}
                </p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Points Earned
                </p>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {userStreak < 7
                    ? "Level 1: Beginner"
                    : userStreak < 30
                      ? "Level 2: Fighter"
                      : userStreak < 90
                        ? "Level 3: Champion"
                        : "Level 4: Warrior"}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {Math.min(userPoints, 1000)} / 1000 XP to Next Level
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full shadow-lg shadow-teal-100"
                  style={{
                    width: `${Math.min((userPoints / 1000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">
              Badges & Accomplishments
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-all hover:shadow-md"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300
                      ${index === 0
                        ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30 ring-4 ring-teal-50"
                        : "bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 ring-4 ring-teal-50"}
                    `}
                  >
                    <Award size={28} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-800">
                    {badge.name}
                  </p>
                </div>
              ))}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl border-2 border-dashed border-slate-200 justify-center group hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 text-slate-300 group-hover:text-teal-400 transition-colors">
                  <Shield size={24} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-teal-500 transition-colors">
                  Next Milestone: 30 Days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl hover:bg-slate-50 flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-700">
                  Privacy Settings
                </span>
                <Settings
                  size={16}
                  className="text-slate-400 group-hover:text-teal-600"
                />
              </button>
              <button className="w-full text-left p-4 rounded-xl hover:bg-slate-50 flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-700">
                  Notification Preferences
                </span>
                <Mail
                  size={16}
                  className="text-slate-400 group-hover:text-teal-600"
                />
              </button>
              <button className="w-full text-left p-4 rounded-xl hover:bg-slate-50 flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-700">
                  Export Recovery Data
                </span>
                <Award
                  size={16}
                  className="text-slate-400 group-hover:text-teal-600"
                />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Anonymous Mentor</h4>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                Want to help others? Switch your role to mentor once you reach
                the 1-year milestone.
              </p>
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed"
              >
                Become a Mentor (Locked)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
