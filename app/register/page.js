"use client";

import { useState } from "react";
import { useAuth } from "../../components/AuthContext";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import { Loader2, Zap } from "lucide-react";

function FormField({ label, name, type = "text", required = false, value, onChange, placeholder, hint }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{hint}</p>}
            <input
                name={name} type={type} required={required}
                placeholder={placeholder} value={value} onChange={onChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
        </div>
    );
}

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "", roll_number: "", email: "", leetcode_username: "", password: "", confirmPassword: "",
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const { registerRequest } = useAuth();

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });
        
        if (formData.password !== formData.confirmPassword) {
            return setStatus({ type: "error", message: "Passwords do not match." });
        }
        if (!formData.roll_number.trim()) {
            return setStatus({ type: "error", message: "Roll number is required." });
        }
        if (!formData.leetcode_username.trim()) {
            return setStatus({ type: "error", message: "LeetCode username is required." });
        }

        setLoading(true);
        try {
            // Sends the password DIRECTLY to Supabase Auth ONLY.
            const { ok, message } = await registerRequest(formData);
            if (ok) {
                setStatus({ type: "success", message: "Account created successfully! An admin will approve your request shortly." });
                setFormData({ name: "", roll_number: "", email: "", leetcode_username: "", password: "", confirmPassword: "" });
            } else {
                setStatus({ type: "error", message: message || "Failed to submit request." });
            }
        } catch {
            setStatus({ type: "error", message: "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-indigo-500/25 blur-[100px] animate-pulse" />
                <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
                <div className="absolute -bottom-48 right-1/3 w-96 h-96 rounded-full bg-blue-400/15 blur-[80px] animate-pulse" style={{ animationDelay: "3s" }} />
            </div>

            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
                <div className="w-full max-w-md animate-fade-in">

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/40 mb-4">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Create Account
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Already registered?{" "}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    <div className="glass-card p-6 sm:p-8">
                        {status.message && (
                            <div className={`rounded-lg p-3 mb-5 text-sm font-medium ${status.type === "error"
                                    ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
                                    : "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300"
                                }`}>
                                {status.message}
                            </div>
                        )}

                        {status.type !== "success" && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <FormField label="Full Name" name="name" required value={formData.name} onChange={handleChange} placeholder="First Last" />
                                <FormField label="Roll Number" name="roll_number" required value={formData.roll_number} onChange={handleChange} placeholder="e.g. 727624BAM001" />
                                <FormField label="Email Address" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="student@example.com" />
                                <FormField label="LeetCode Username" name="leetcode_username" required value={formData.leetcode_username} onChange={handleChange} placeholder="e.g. your_leetcode_id" />
                                <FormField label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                <FormField label="Confirm Password" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all duration-200"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {loading ? "Creating..." : "Sign Up"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
