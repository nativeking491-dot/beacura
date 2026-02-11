import React from "react";
import { useUser } from "../context/UserContext";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "./Dashboard";
import { Navigate } from "react-router-dom";

const DashboardRouter: React.FC = () => {
    const { user, loading } = useUser();

    // Show loading while user context is loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // If no user is authenticated, redirect to auth
    if (!user) {
        return <Navigate to="/auth" />;
    }

    // Use UserContext to determine admin status
    const isAdmin = user.role === "ADMIN";

    console.log("🎯 DashboardRouter - User role:", user.role, "isAdmin:", isAdmin);

    // Render appropriate dashboard based on role
    return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

export default DashboardRouter;
