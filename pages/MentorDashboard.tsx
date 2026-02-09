import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useUser } from "../context/UserContext";
import { Calendar, Users, Star, Clock, ArrowLeft } from "lucide-react";

interface MentorProfile {
  id: string;
  bio: string;
  sobriety_years: number;
  specialties: string[];
  verification_status: string;
  rating: number;
  max_users: number;
  current_users: number;
}

interface MentorSession {
  id: string;
  user_id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  session_type: string;
}

interface Stats {
  total_sessions: number;
  avg_rating: number;
  current_users: number;
}

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_sessions: 0,
    avg_rating: 0,
    current_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadMentorData();
  }, [user?.id]);

  const loadMentorData = async () => {
    try {
      // Get mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentors")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (mentorError) {
        if (mentorError.code === "PGRST116") {
          // No mentor profile found
          navigate("/dashboard");
          return;
        }
        throw mentorError;
      }

      setMentor(mentorData);

      // Get upcoming sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("mentor_id", user?.id)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData);

      // Calculate stats
      const { data: completedSessions } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("mentor_id", user?.id)
        .eq("status", "completed");

      const avgRating =
        completedSessions && completedSessions.length > 0
          ? (
              completedSessions.reduce((sum, s) => sum + (s.user_rating || 0), 0) /
              completedSessions.length
            ).toFixed(1)
          : 0;

      setStats({
        total_sessions: completedSessions?.length || 0,
        avg_rating: parseFloat(String(avgRating)),
        current_users: mentorData?.current_users || 0,
      });
    } catch (error) {
      console.error("Error loading mentor data:", error);
      alert("Error loading mentor dashboard");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (session: MentorSession) => {
    // Navigate to a session page (chat or video) — route should handle type
    navigate(`/mentor/session/${session.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-slate-600">Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center py-20">
          <p className="text-slate-600 text-lg">Not a verified mentor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Mentor Dashboard
              </h1>
              <p className="text-slate-600">
                Making a difference in recovery, one person at a time.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200">
              <Star size={24} className="text-amber-500 fill-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-700">
                  {stats.avg_rating}
                </div>
                <div className="text-xs text-amber-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Mentor Info */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Sobriety</p>
              <p className="text-2xl font-bold text-slate-900">
                {mentor.sobriety_years} years
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Status</p>
              <p className="text-lg font-bold">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Verified
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Upcoming Sessions</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">{sessions.length}</p>
            <p className="text-sm text-slate-500 mt-2">Next week</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Users className="text-amber-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Active Mentees</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {stats.current_users}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {mentor.max_users - stats.current_users} slots available
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="text-amber-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Total Sessions</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {stats.total_sessions}
            </p>
            <p className="text-sm text-slate-500 mt-2">Completed</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            📅 Upcoming Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No upcoming sessions. You're all caught up! ✨
              </p>
              <p className="text-slate-400 text-sm mt-2">
                New mentees will be matched with you soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">
                      Session with User
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>
                          {new Date(session.scheduled_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {session.session_type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinSession(session)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
                    title={`Join ${session.session_type} session`}
                  >
                    Join {session.session_type === "video" ? "Call" : "Chat"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specialties */}
        {mentor.specialties && mentor.specialties.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              🎯 Your Specialties
            </h2>
            <div className="flex flex-wrap gap-3">
              {mentor.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
