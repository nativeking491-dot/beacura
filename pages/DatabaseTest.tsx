import React, { useEffect, useState } from "react";
import { supabase, chatService } from "../services/supabaseClient";
import { CheckCircle, XCircle, AlertCircle, Database, Loader2 } from "lucide-react";

interface TestResult {
    name: string;
    status: "success" | "error" | "warning" | "loading";
    message: string;
    count?: number;
}

const DatabaseTest: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const addResult = (result: TestResult) => {
        setResults((prev) => [...prev, result]);
    };

    const runTests = async () => {
        setIsRunning(true);
        setResults([]);

        // Test 1: Environment Variables
        addResult({
            name: "Environment Variables",
            status: "loading",
            message: "Checking configuration...",
        });

        const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (hasUrl && hasKey) {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Environment Variables"
                        ? {
                            ...r,
                            status: "success",
                            message: "Environment variables configured correctly",
                        }
                        : r
                )
            );
        } else {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Environment Variables"
                        ? {
                            ...r,
                            status: "error",
                            message: `Missing: ${!hasUrl ? "VITE_SUPABASE_URL " : ""}${!hasKey ? "VITE_SUPABASE_ANON_KEY" : ""}`,
                        }
                        : r
                )
            );
            setIsRunning(false);
            return;
        }

        // Test 2: Users Table
        addResult({
            name: "Users Table",
            status: "loading",
            message: "Connecting to users table...",
        });

        try {
            const { count, error } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true });

            if (error) throw error;

            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Users Table"
                        ? {
                            ...r,
                            status: "success",
                            message: `Connected successfully`,
                            count: count || 0,
                        }
                        : r
                )
            );
        } catch (error: any) {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Users Table"
                        ? {
                            ...r,
                            status: "error",
                            message: error.message || "Connection failed",
                        }
                        : r
                )
            );
        }

        // Test 3: Chat Messages Table
        addResult({
            name: "Chat Messages Table",
            status: "loading",
            message: "Checking chat_messages table...",
        });

        try {
            const { count, error } = await supabase
                .from("chat_messages")
                .select("*", { count: "exact", head: true });

            if (error) throw error;

            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Chat Messages Table"
                        ? {
                            ...r,
                            status: "success",
                            message: `Table exists and accessible`,
                            count: count || 0,
                        }
                        : r
                )
            );
        } catch (error: any) {
            const isTableMissing = error.code === "42P01";
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Chat Messages Table"
                        ? {
                            ...r,
                            status: isTableMissing ? "warning" : "error",
                            message: isTableMissing
                                ? "Table does not exist - migration required"
                                : error.message,
                        }
                        : r
                )
            );
        }

        // Test 4: Chat Sessions Table
        addResult({
            name: "Chat Sessions Table",
            status: "loading",
            message: "Checking chat_sessions table...",
        });

        try {
            const { count, error } = await supabase
                .from("chat_sessions")
                .select("*", { count: "exact", head: true });

            if (error) throw error;

            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Chat Sessions Table"
                        ? {
                            ...r,
                            status: "success",
                            message: `Table exists and accessible`,
                            count: count || 0,
                        }
                        : r
                )
            );
        } catch (error: any) {
            const isTableMissing = error.code === "42P01";
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Chat Sessions Table"
                        ? {
                            ...r,
                            status: isTableMissing ? "warning" : "error",
                            message: isTableMissing
                                ? "Table does not exist - migration required"
                                : error.message,
                        }
                        : r
                )
            );
        }

        // Test 5: Crisis Logs Table
        addResult({
            name: "Crisis Logs Table",
            status: "loading",
            message: "Checking crisis_logs table...",
        });

        try {
            const { count, error } = await supabase
                .from("crisis_logs")
                .select("*", { count: "exact", head: true });

            if (error) throw error;

            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Crisis Logs Table"
                        ? {
                            ...r,
                            status: "success",
                            message: `Table exists and accessible`,
                            count: count || 0,
                        }
                        : r
                )
            );
        } catch (error: any) {
            setResults((prev) =>
                prev.map((r) =>
                    r.name === "Crisis Logs Table"
                        ? {
                            ...r,
                            status: "error",
                            message: error.message || "Connection failed",
                        }
                        : r
                )
            );
        }

        setIsRunning(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const getIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle className="text-emerald-500" size={24} />;
            case "error":
                return <XCircle className="text-rose-500" size={24} />;
            case "warning":
                return <AlertCircle className="text-amber-500" size={24} />;
            case "loading":
                return <Loader2 className="text-blue-500 animate-spin" size={24} />;
            default:
                return <Database className="text-slate-400" size={24} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
                return "bg-emerald-50 border-emerald-200";
            case "error":
                return "bg-rose-50 border-rose-200";
            case "warning":
                return "bg-amber-50 border-amber-200";
            case "loading":
                return "bg-blue-50 border-blue-200";
            default:
                return "bg-slate-50 border-slate-200";
        }
    };

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;
    const warningCount = results.filter((r) => r.status === "warning").length;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl">
                            <Database className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Database Connectivity Test
                            </h1>
                            <p className="text-slate-500">
                                Verifying Supabase connection and table accessibility
                            </p>
                        </div>
                    </div>

                    {!isRunning && results.length > 0 && (
                        <div className="flex items-center space-x-4 mt-6">
                            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="text-2xl font-bold text-emerald-700">
                                    {successCount}
                                </div>
                                <div className="text-xs text-emerald-600">Passed</div>
                            </div>
                            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="text-2xl font-bold text-amber-700">
                                    {warningCount}
                                </div>
                                <div className="text-xs text-amber-600">Warnings</div>
                            </div>
                            <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-4">
                                <div className="text-2xl font-bold text-rose-700">
                                    {errorCount}
                                </div>
                                <div className="text-xs text-rose-600">Failed</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Results */}
                <div className="space-y-4">
                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            className={`bg-white rounded-2xl shadow-sm border-2 ${getStatusColor(result.status)} p-6 transition-all`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">{getIcon(result.status)}</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                                        {result.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm">{result.message}</p>
                                    {result.count !== undefined && (
                                        <p className="text-slate-500 text-xs mt-2">
                                            Records: <span className="font-mono font-bold">{result.count}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Migration Warning */}
                {warningCount > 0 && !isRunning && (
                    <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-2">
                                    Migration Required
                                </h3>
                                <p className="text-amber-800 text-sm mb-3">
                                    Some tables are missing. You need to run the database migration:
                                </p>
                                <ol className="text-amber-800 text-sm space-y-1 list-decimal list-inside">
                                    <li>Open Supabase SQL Editor</li>
                                    <li>
                                        Copy contents from{" "}
                                        <code className="bg-amber-100 px-2 py-1 rounded">
                                            database-migrations/chat_messages.sql
                                        </code>
                                    </li>
                                    <li>Execute the SQL</li>
                                    <li>Refresh this page to verify</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Retry Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={runTests}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {isRunning ? "Running Tests..." : "Run Tests Again"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatabaseTest;
