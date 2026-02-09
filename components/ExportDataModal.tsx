import React, { useState } from "react";
import { X, Download, FileJson, FileText } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import {
  exportRecoveryData,
  downloadDataAsJSON,
  downloadDataAsCSV,
} from "../services/dataExport";

interface ExportDataModalProps {
  userId: string | undefined;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  userId,
  userName,
  userEmail,
  onClose,
}) => {
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportJSON = async () => {
    if (!userId) return;
    setExporting(true);

    try {
      const data = await exportRecoveryData(userId);
      if (!data) throw new Error("Failed to export data");

      downloadDataAsJSON(data, userName);
      alert("✅ Data exported as JSON!");
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!userId) return;
    setExporting(true);

    try {
      const data = await exportRecoveryData(userId);
      if (!data) throw new Error("Failed to export data");

      downloadDataAsCSV(data, userName);
      alert("✅ Data exported as CSV!");
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || !deleting) return;

    setDeleting(true);
    try {
      // First, delete all user data
      await Promise.all([
        supabase.from("craving_logs").delete().eq("user_id", userId),
        supabase.from("activity_logs").delete().eq("user_id", userId),
        supabase.from("mood_logs").delete().eq("user_id", userId),
        supabase.from("crisis_logs").delete().eq("user_id", userId),
        supabase.from("badges").delete().eq("user_id", userId),
        supabase.from("mentor_sessions").delete().eq("user_id", userId),
        supabase.from("privacy_settings").delete().eq("user_id", userId),
        supabase
          .from("notification_preferences")
          .delete()
          .eq("user_id", userId),
        supabase.from("users").delete().eq("id", userId),
      ]);

      // Then delete auth user
      await supabase.auth.admin.deleteUser(userId);

      alert(
        "✅ Your account and all data have been permanently deleted. Redirecting..."
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(
        "Failed to delete account. Please contact support@recovery.com for assistance."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download size={28} />
            <h2 className="text-2xl font-bold">Data Export & Privacy</h2>
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
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              📥 Export Your Data
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Download all your recovery data including cravings, mood logs,
              activities, badges, and progress. This is useful for:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="text-sm text-slate-600 flex items-start space-x-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Keeping a backup of your recovery journey</span>
              </li>
              <li className="text-sm text-slate-600 flex items-start space-x-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Importing into other health apps</span>
              </li>
              <li className="text-sm text-slate-600 flex items-start space-x-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Sharing with your doctor or counselor</span>
              </li>
              <li className="text-sm text-slate-600 flex items-start space-x-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>GDPR data portability rights</span>
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                className="p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 transition disabled:opacity-50 flex flex-col items-center space-y-2"
              >
                <FileJson size={24} className="text-amber-600" />
                <span className="font-semibold text-sm text-slate-900">
                  {exporting ? "Exporting..." : "Export as JSON"}
                </span>
                <span className="text-xs text-slate-500">
                  Machine-readable format
                </span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 transition disabled:opacity-50 flex flex-col items-center space-y-2"
              >
                <FileText size={24} className="text-amber-600" />
                <span className="font-semibold text-sm text-slate-900">
                  {exporting ? "Exporting..." : "Export as CSV"}
                </span>
                <span className="text-xs text-slate-500">
                  Spreadsheet format
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Account Deletion */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              🗑️ Delete Your Account
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Permanently delete your account and all associated data. This
              action is <strong>irreversible</strong>.
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full p-4 border-2 border-red-200 rounded-xl bg-red-50 hover:bg-red-100 transition text-red-700 font-semibold"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4 p-6 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="space-y-3">
                  <p className="font-bold text-slate-900">
                    ⚠️ Are you absolutely sure?
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    This will:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="text-sm text-red-700 flex items-start space-x-2">
                      <span>✕</span>
                      <span>Delete all your recovery logs and progress</span>
                    </li>
                    <li className="text-sm text-red-700 flex items-start space-x-2">
                      <span>✕</span>
                      <span>Remove your profile and badges</span>
                    </li>
                    <li className="text-sm text-red-700 flex items-start space-x-2">
                      <span>✕</span>
                      <span>Cancel any active mentor relationships</span>
                    </li>
                    <li className="text-sm text-red-700 flex items-start space-x-2">
                      <span>✕</span>
                      <span>Permanently delete your account</span>
                    </li>
                  </ul>

                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Type your email to confirm:
                    </p>
                    <input
                      type="text"
                      placeholder={userEmail}
                      disabled
                      className="w-full p-3 bg-white border-2 border-red-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="p-3 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="p-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Yes, Delete Everything"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-900 font-semibold">
              💡 Tip: Export your data before deleting to keep a personal copy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
