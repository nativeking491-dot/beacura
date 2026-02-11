import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../services/supabaseClient";
import {
  Users,
  TrendingUp,
  Award,
  Activity,
  Loader2,
  UserCheck,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Shield,
  X,
  BarChart3,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface UserStats {
  totalUsers: number;
  recoveringUsers: number;
  mentors: number;
  admins: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  averageStreak: number;
  totalPoints: number;
  activeToday: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  streak: number;
  points: number;
  created_at: string;
  last_login?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<RecentUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<RecentUser | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    recoveringUsers: 0,
    mentors: 0,
    admins: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    averageStreak: 0,
    totalPoints: 0,
    activeToday: 0,
  });
  const [allUsers, setAllUsers] = useState<RecentUser[]>([]);

  // Verify admin access on component mount
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session?.data?.session?.user?.id) {
          console.warn("No active session");
          navigate("/auth");
          return;
        }

        // Get user profile to verify admin role
        const { data: profile, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.data.session.user.id)
          .single();

        if (error || !profile) {
          console.error("Could not verify admin status:", error);
          navigate("/dashboard");
          return;
        }

        if (profile.role !== "ADMIN") {
          console.warn("User is not an admin");
          navigate("/dashboard");
          return;
        }

        console.log("✅ Admin verified, loading dashboard");
        setAdminVerified(true);

        // Load stats after admin verification
        await fetchStats();
      } catch (error) {
        console.error("Admin verification error:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!adminVerified) return;

    // Debounce timer for fetchStats
    let refreshTimer: NodeJS.Timeout;

    // Set up real-time subscription to listen for changes
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User data changed:', payload);

          // Debounce refresh to avoid overwriting optimistic updates
          // Wait 1 second before refreshing to allow optimistic updates to settle
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            console.log('Refreshing stats after database change...');
            fetchStats();
          }, 1000);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error, will fall back to manual refresh');
        }
      });

    return () => {
      clearTimeout(refreshTimer);
      channel.unsubscribe();
    };
  }, [adminVerified]);

  const fetchStats = async () => {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      if (users && users.length > 0) {
        console.log(`Fetched ${users.length} users from database`);

        const totalUsers = users.length;
        const recoveringUsers = users.filter(
          (u) => u.role === "RECOVERING_USER",
        ).length;
        const mentors = users.filter(
          (u) => u.role === "RECOVERED_MENTOR",
        ).length;
        const admins = users.filter((u) => u.role === "ADMIN").length;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsersThisWeek = users.filter(
          (u) => new Date(u.created_at) > oneWeekAgo,
        ).length;

        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const newUsersThisMonth = users.filter(
          (u) => new Date(u.created_at) > oneMonthAgo,
        ).length;

        const regularUsers = users.filter((u) => u.role !== "ADMIN");
        const averageStreak =
          regularUsers.length > 0
            ? Math.round(
              regularUsers.reduce((sum, u) => sum + (u.streak || 0), 0) /
              regularUsers.length,
            )
            : 0;

        const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
        const activeToday = users.filter(
          (u) => u.role !== "ADMIN" && (u.streak || 0) > 0,
        ).length;

        setStats({
          totalUsers,
          recoveringUsers,
          mentors,
          admins,
          newUsersThisWeek,
          newUsersThisMonth,
          averageStreak,
          totalPoints,
          activeToday,
        });

        // Clear and set the filtered users list
        setAllUsers(users);
        console.log("✅ Dashboard updated successfully");
      } else {
        console.log("No users found in database");
        setAllUsers([]);
      }
    } catch (error) {
      console.error("❌ Error fetching admin stats:", error);
      // Don't show alert on every error - just log it
      // Users can use the Refresh button if data doesn't load
    }
  };

  const handleUpdateUser = async (updatedUser: RecentUser) => {
    try {
      // Optimistic update: Update UI immediately
      setAllUsers(prevUsers =>
        prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );
      setEditingUser(null);

      // Then update database
      const { error } = await supabase
        .from("users")
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          streak: updatedUser.streak,
          points: updatedUser.points,
        })
        .eq("id", updatedUser.id);

      if (error) {
        // Revert optimistic update on error
        await fetchStats();
        throw error;
      }

      // Success! Optimistic update stays
      alert("✅ User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("❌ Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Optimistic update: Remove from UI immediately
      setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setDeletingUser(null);

      // Then delete from database (cascade delete will handle related records)
      const { error: profileError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (profileError) {
        // Revert optimistic update on error
        await fetchStats();
        throw profileError;
      }

      // Note: Auth user deletion requires admin service role key
      // For now, we only delete the profile. The auth user becomes orphaned but harmless.
      // To fully delete auth users, you need to set up a Supabase Edge Function with service role.

      // Refresh stats to recalculate counts
      await fetchStats();
      alert("✅ User profile deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("❌ Failed to delete user. Please try again.");
    }
  };

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
    subtitle,
    statId,
  }: any) => (
    <div
      onClick={() => setSelectedStat(statId)}
      className={`${theme === "dark"
        ? "bg-slate-800 border-slate-700 hover:border-slate-600"
        : `${bgColor || "bg-white"} border-slate-100`
        } p-6 rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              } mb-1`}
          >
            {label}
          </p>
          <p className={`text-4xl font-bold ${color} mb-2`}>
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p
              className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-500"
                }`}
            >
              {subtitle}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-3 flex items-center font-medium">
            <BarChart3 size={14} className="mr-1" />
            Click for details
          </p>
        </div>
        <div
          className={`p-4 rounded-xl ${color} ${theme === "dark" ? "bg-opacity-20" : "bg-opacity-10"
            } backdrop-blur-sm`}
        >
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  const getChartData = (statType: string) => {
    switch (statType) {
      case "total":
        return {
          title: "Total Users Growth",
          data: [
            { name: "Week 1", users: Math.max(0, stats.totalUsers - 3) },
            { name: "Week 2", users: Math.max(0, stats.totalUsers - 2) },
            { name: "Week 3", users: Math.max(0, stats.totalUsers - 1) },
            { name: "Current", users: stats.totalUsers },
          ],
          type: "line",
        };
      case "recovering":
        return {
          title: "User Distribution",
          data: [
            {
              name: "Recovering Users",
              value: stats.recoveringUsers,
              fill: "#14b8a6",
            },
            { name: "Mentors", value: stats.mentors, fill: "#f59e0b" },
            { name: "Admins", value: stats.admins, fill: "#f43f5e" },
          ],
          type: "pie",
        };
      case "growth":
        return {
          title: "User Growth Metrics",
          data: [
            { name: "This Week", count: stats.newUsersThisWeek },
            { name: "This Month", count: stats.newUsersThisMonth },
            { name: "Active Today", count: stats.activeToday },
          ],
          type: "bar",
        };
      case "engagement":
        return {
          title: "Engagement Metrics",
          data: [
            { name: "Avg Streak", value: stats.averageStreak },
            { name: "Active Users", value: stats.activeToday },
            {
              name: "Total Points/100",
              value: Math.round(stats.totalPoints / 100),
            },
          ],
          type: "bar",
        };
      default:
        return null;
    }
  };

  const StatModal = ({
    statId,
    onClose,
  }: {
    statId: string;
    onClose: () => void;
  }) => {
    const chartData = getChartData(statId);
    if (!chartData) return null;

    // Get specific user lists based on stat type
    const getDetailedData = () => {
      switch (statId) {
        case "total":
          return {
            title: "User Growth Analysis",
            users: allUsers.slice(0, 10),
            metrics: [
              {
                label: "Total Registered",
                value: stats.totalUsers,
                icon: Users,
              },
              {
                label: "This Week",
                value: stats.newUsersThisWeek,
                icon: TrendingUp,
              },
              {
                label: "This Month",
                value: stats.newUsersThisMonth,
                icon: Calendar,
              },
              {
                label: "Growth Rate",
                value: `${stats.totalUsers > 0 ? Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100) : 0}%`,
                icon: Activity,
              },
            ],
          };
        case "recovering":
          return {
            title: "User Role Distribution",
            users: allUsers
              .filter((u) => u.role === "RECOVERING_USER")
              .slice(0, 10),
            metrics: [
              {
                label: "Recovering Users",
                value: stats.recoveringUsers,
                icon: UserCheck,
              },
              { label: "Mentors", value: stats.mentors, icon: Award },
              { label: "Admins", value: stats.admins, icon: Shield },
              {
                label: "Avg Streak (Recovery)",
                value: Math.round(
                  allUsers
                    .filter((u) => u.role === "RECOVERING_USER")
                    .reduce((sum, u) => sum + u.streak, 0) /
                  Math.max(stats.recoveringUsers, 1),
                ),
                icon: Activity,
              },
            ],
          };
        case "growth":
          return {
            title: "Growth & Activity Metrics",
            users: allUsers.filter((u) => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(u.created_at) > weekAgo;
            }),
            metrics: [
              {
                label: "New This Week",
                value: stats.newUsersThisWeek,
                icon: Calendar,
              },
              {
                label: "New This Month",
                value: stats.newUsersThisMonth,
                icon: Calendar,
              },
              {
                label: "Active Today",
                value: stats.activeToday,
                icon: Activity,
              },
              {
                label: "Activation Rate",
                value: `${stats.totalUsers > 0 ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0}%`,
                icon: TrendingUp,
              },
            ],
          };
        case "engagement":
          return {
            title: "User Engagement Details",
            users: allUsers
              .filter((u) => u.streak > 0)
              .sort((a, b) => b.streak - a.streak)
              .slice(0, 10),
            metrics: [
              {
                label: "Average Streak",
                value: stats.averageStreak,
                icon: Activity,
              },
              {
                label: "Total Points",
                value: stats.totalPoints.toLocaleString(),
                icon: Award,
              },
              {
                label: "Active Users",
                value: stats.activeToday,
                icon: UserCheck,
              },
              {
                label: "Engagement Rate",
                value: `${stats.totalUsers > 0 ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0}%`,
                icon: TrendingUp,
              },
            ],
          };
        default:
          return null;
      }
    };

    const detailedData = getDetailedData();

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white rounded-t-2xl flex justify-between items-center z-10">
            <div>
              <h2 className="text-3xl font-bold">{chartData.title}</h2>
              <p className="text-purple-100 mt-1">{detailedData?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Chart Section */}
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Visual Analytics
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                {chartData.type === "line" ? (
                  <LineChart data={chartData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                    />
                  </LineChart>
                ) : chartData.type === "pie" ? (
                  <PieChart>
                    <Pie
                      data={chartData.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <BarChart data={chartData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Key Metrics Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {detailedData?.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon size={24} className="text-purple-600" />
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed User Table */}
            {detailedData && detailedData.users.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                  {statId === "total"
                    ? "Recent Users"
                    : statId === "recovering"
                      ? "Recovering Users"
                      : statId === "growth"
                        ? "New Users This Week"
                        : "Top Engaged Users"}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Role
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Streak
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Points
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedData.users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-slate-100 dark:border-slate-600 ${index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-700"
                            }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {user.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-sm font-mono">
                            {user.email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === "ADMIN"
                                ? "bg-rose-100 text-rose-700"
                                : user.role === "RECOVERED_MENTOR"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {user.role === "ADMIN"
                                ? "👑"
                                : user.role === "RECOVERED_MENTOR"
                                  ? "🏆"
                                  : "💚"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-amber-600">
                            {user.streak} 🔥
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-indigo-600">
                            {user.points.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-sm">
                            {new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {detailedData.users.length >= 10 && (
                  <p className="text-sm text-slate-500 mt-3 text-center">
                    Showing top 10 users
                  </p>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white">
              <h3 className="text-lg font-bold mb-4">Platform Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-purple-100 mb-1">Total Impact</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-purple-200 mt-1">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-purple-100 mb-1">Growth Rate</p>
                  <p className="text-3xl font-bold">
                    {stats.totalUsers > 0
                      ? Math.round(
                        (stats.newUsersThisWeek / stats.totalUsers) * 100,
                      )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-purple-200 mt-1">Weekly</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-purple-100 mb-1">Active Rate</p>
                  <p className="text-3xl font-bold">
                    {stats.totalUsers > 0
                      ? Math.round((stats.activeToday / stats.totalUsers) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-purple-200 mt-1">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditUserModal = () => {
    if (!editingUser) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setEditingUser(null)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Edit size={28} />
              <h2 className="text-2xl font-bold">Edit User</h2>
            </div>
            <button
              onClick={() => setEditingUser(null)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Role
              </label>
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="RECOVERING_USER">💚 Recovering User</option>
                <option value="RECOVERED_MENTOR">🏆 Recovered Mentor</option>
                <option value="ADMIN">👑 Admin</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Streak (days)
                </label>
                <input
                  type="number"
                  value={editingUser.streak}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      streak: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={editingUser.points}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleUpdateUser(editingUser)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="px-6 py-3 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = () => {
    if (!deletingUser) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setDeletingUser(null)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={28} />
              <h2 className="text-2xl font-bold">Confirm Delete</h2>
            </div>
            <button
              onClick={() => setDeletingUser(null)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8">
            <p className="text-slate-700 dark:text-slate-200 text-lg mb-2">
              Are you sure you want to delete this user?
            </p>
            <div className="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-4 rounded-r-lg mb-6">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {deletingUser.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                {deletingUser.email}
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action cannot be undone. All user data will be permanently
              removed.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteUser(deletingUser.id)}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-rose-700 hover:to-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 size={20} />
                <span>Delete User</span>
              </button>
              <button
                onClick={() => setDeletingUser(null)}
                className="px-6 py-3 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !adminVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="animate-spin text-purple-600 mx-auto mb-4"
            size={56}
          />
          <p className="text-slate-500 font-medium">
            {!adminVerified ? "Verifying admin access..." : "Loading admin dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {selectedStat && (
        <StatModal
          statId={selectedStat}
          onClose={() => setSelectedStat(null)}
        />
      )}
      <EditUserModal />
      <DeleteConfirmModal />

      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 -m-8 mb-8 p-8 text-white rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield size={32} />
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Complete platform overview and user management
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-6 py-3 rounded-xl transition-all font-semibold flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          statId="total"
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          subtitle="All registered accounts"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          statId="recovering"
          icon={UserCheck}
          label="Recovering Users"
          value={stats.recoveringUsers}
          subtitle="Main user category"
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          statId="growth"
          icon={Award}
          label="Mentors"
          value={stats.mentors}
          subtitle="Recovered mentors helping"
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          statId="engagement"
          icon={Shield}
          label="Admins"
          value={stats.admins}
          subtitle="System administrators"
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          statId="growth"
          icon={Calendar}
          label="New This Week"
          value={stats.newUsersThisWeek}
          subtitle="Last 7 days"
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          statId="growth"
          icon={Calendar}
          label="New This Month"
          value={stats.newUsersThisMonth}
          subtitle="Last 30 days"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          statId="engagement"
          icon={Activity}
          label="Active Today"
          value={stats.activeToday}
          subtitle="Users with active streaks"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          statId="engagement"
          icon={TrendingUp}
          label="Avg. Streak"
          value={stats.averageStreak}
          subtitle={`${stats.totalPoints.toLocaleString()} total points`}
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
      </div>

      {/* User Management Table */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-slate-900">
            All Users ({filteredUsers.length})
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="RECOVERING_USER">Recovering Users</option>
                <option value="RECOVERED_MENTOR">Mentors</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-slate-700">
                  #
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-700">
                  Name
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-700">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-700">
                  Role
                </th>
                <th className="text-right py-4 px-6 font-bold text-slate-700">
                  Streak
                </th>
                <th className="text-right py-4 px-6 font-bold text-slate-700">
                  Points
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-700">
                  Joined
                </th>
                <th className="text-center py-4 px-6 font-bold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 hover:bg-purple-50 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900">
                      {user.name}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                    {user.email}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${user.role === "ADMIN"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : user.role === "RECOVERED_MENTOR"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                    >
                      {user.role === "ADMIN"
                        ? "👑 Admin"
                        : user.role === "RECOVERED_MENTOR"
                          ? "🏆 Mentor"
                          : "💚 User"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-amber-600 text-lg">
                      {user.streak} 🔥
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-indigo-600 text-lg">
                      {user.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Edit user"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 text-lg">
              No users found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
