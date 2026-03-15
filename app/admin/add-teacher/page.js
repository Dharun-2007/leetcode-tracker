"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Mail, Lock, User, Code } from "lucide-react";

export default function AddTeacherPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", leetcode_username: "" });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.role !== "admin") router.push("/");
    }, [currentUser]);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });
        setLoading(true);
        try {
            const res = await fetch("/api/admin/add-teacher", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: "success", message: `Teacher account created for ${form.name}!` });
                setForm({ name: "", email: "", password: "", leetcode_username: "" });
            } else {
                setStatus({ type: "error", message: data.error || "Failed to create teacher." });
            }
        } catch {
            setStatus({ type: "error", message: "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Add Teacher</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Create a new teacher account directly</p>
            </div>

            <div className="glass-card p-8">
                {status.message && (
                    <div className={`rounded-lg p-3 mb-5 text-sm font-medium ${status.type === "error"
                        ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
                        : "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300"
                        }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { name: "name", label: "Full Name", type: "text", icon: User, required: true, placeholder: "Teacher's full name" },
                        { name: "email", label: "Email Address", type: "email", icon: Mail, required: true, placeholder: "teacher@school.edu" },
                        { name: "password", label: "Password", type: "password", icon: Lock, required: true, placeholder: "Set a secure password" },
                        { name: "leetcode_username", label: "LeetCode Username", type: "text", icon: Code, required: false, placeholder: "Optional" },
                    ].map(({ name, label, type, icon: Icon, required, placeholder }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    name={name} type={type} required={required}
                                    placeholder={placeholder} value={form[name]} onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="pt-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-3 text-xs text-blue-700 dark:text-blue-300">
                        ℹ️ Role is automatically set to <strong>teacher</strong>. LeetCode username is optional for teachers.
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        {loading ? "Creating..." : "Create Teacher Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
