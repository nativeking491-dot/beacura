// Data export service for GDPR/privacy compliance
import { supabase } from "./supabaseClient";

export interface ExportedData {
  user: any;
  cravings: any[];
  mood: any[];
  activity: any[];
  sessions: any[];
  badges: any[];
  progress: any[];
}

export const exportRecoveryData = async (userId: string | undefined): Promise<ExportedData | null> => {
  if (!userId) return null;

  try {
    // Fetch all user data
    const [
      { data: userData },
      { data: cravingData },
      { data: moodData },
      { data: activityData },
      { data: sessionData },
      { data: badgeData },
      { data: progressData },
    ] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("craving_logs").select("*").eq("user_id", userId),
      supabase.from("mood_logs").select("*").eq("user_id", userId),
      supabase.from("activity_logs").select("*").eq("user_id", userId),
      supabase.from("mentor_sessions").select("*").eq("user_id", userId),
      supabase.from("badges").select("*").eq("user_id", userId),
      supabase.from("progress").select("*").eq("user_id", userId),
    ]);

    const exportedData: ExportedData = {
      user: userData,
      cravings: cravingData || [],
      mood: moodData || [],
      activity: activityData || [],
      sessions: sessionData || [],
      badges: badgeData || [],
      progress: progressData || [],
    };

    return exportedData;
  } catch (error) {
    console.error("Error exporting data:", error);
    return null;
  }
};

export const downloadDataAsJSON = (data: ExportedData, userName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `recovery-data-${userName}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadDataAsCSV = (data: ExportedData, userName: string) => {
  // Create CSV with summary and detailed logs
  let csv = "Recovery Platform Data Export\n";
  csv += `Exported: ${new Date().toLocaleString()}\n`;
  csv += `User: ${data.user?.name} (${data.user?.email})\n\n`;

  // User Summary
  csv += "USER SUMMARY\n";
  csv += `Name,Email,Role,Streak,Points,Joined\n`;
  csv += `${data.user?.name},${data.user?.email},${data.user?.role},${data.user?.streak},${data.user?.points},${data.user?.created_at}\n\n`;

  // Craving Logs
  csv += "CRAVING LOGS\n";
  csv += `Date,Severity,Trigger,Coping Strategy,Outcome\n`;
  data.cravings.forEach((log) => {
    csv += `${log.created_at},${log.severity},"${log.trigger}","${log.coping_strategy_used}",${log.outcome}\n`;
  });
  csv += "\n";

  // Mood Logs
  csv += "MOOD LOGS\n";
  csv += `Date,Mood Score,Energy Level,Sleep Quality,Notes\n`;
  data.mood.forEach((log) => {
    csv += `${log.created_at},${log.mood_score},${log.energy_level},${log.sleep_quality},"${log.notes}"\n`;
  });
  csv += "\n";

  // Activity Logs
  csv += "ACTIVITY LOGS\n";
  csv += `Date,Activity Type,Duration (min),Notes\n`;
  data.activity.forEach((log) => {
    csv += `${log.created_at},${log.activity_type},${log.duration_minutes},"${log.notes}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `recovery-data-${userName}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
