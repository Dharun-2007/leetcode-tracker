"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import {
    Loader2, Users, GraduationCap, ShieldCheck, Trophy,
    ClipboardList, UserPlus, Settings, TrendingUp
} from "lucide-react";

function MetricCard({ label, value, icon: Icon, color, href }) {
    const content = (
        <div className="stat-card group cursor-pointer">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`mt-2 text-4xl font-extrabold ${color}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color.includes("blue") ? "from-blue-500 to-indigo-600" : color.includes("green") ? "from-emerald-500 to-green-600" : color.includes("purple") ? "from-purple-500 to-violet-600" : "from-orange-500 to-amber-600"} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ students: 0, teachers: 0, pendingRequests: 0, blind75Completions: 0, topStudents: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role !== "admin") {
            router.push(currentUser.role === "teacher" ? "/dashboard" : "/questions");
            return;
        }
        loadStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, router]);

    async function loadStats() {
        try {
            const [studentsRes, teachersRes, requestsRes, cacheRes] = await Promise.all([
                supabase.from("users").select("id, name, roll_number, leetcode_username", { count: "exact" }).eq("role", "student"),
                supabase.from("users").select("id", { count: "exact" }).eq("role", "teacher"),
                supabase.from("account_requests").select("id", { count: "exact" }).eq("status", "pending"),
                supabase.from("leetcode_stats_cache").select("user_id, total_solved").order("total_solved", { ascending: false }).limit(10),
            ]);

            const studentIds = (studentsRes.data || []).map((s) => s.id);

            // Blind75 completion (total_solved >= 75 or using blind75_progress)
            const { data: b75Data } = await supabase
                .from("blind75_progress")
                .select("user_id, solved_count, total_count");

            const completions = new Set();
            (b75Data || []).forEach((row) => {
                if (row.solved_count === row.total_count && row.total_count > 0) {
                    completions.add(row.user_id);
                }
            });

            // Build top students
            const topStudents = await Promise.all(
                (cacheRes.data || []).slice(0, 10).map(async (cache) => {
                    const student = (studentsRes.data || []).find((s) => s.id === cache.user_id);
                    if (!student) return null;
                    return { ...student, total_solved: cache.total_solved };
                })
            );

            setStats({
                students: studentsRes.count || 0,
                teachers: teachersRes.count || 0,
                pendingRequests: requestsRes.count || 0,
                blind75Completions: completions.size,
                topStudents: topStudents.filter(Boolean),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (!currentUser || loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-500 dark:text-gray-400">Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and quick actions</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/admin/add-teacher" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
                        <UserPlus className="h-4 w-4" /> Add Teacher
                    </Link>
                    <Link href="/admin/users" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-800/60 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <Settings className="h-4 w-4" /> Manage Users
                    </Link>
                    <Link href="/admin/requests" className="inline-flex items-center gap-2 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 px-4 py-2 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/30 transition">
                        <ClipboardList className="h-4 w-4" />
                        Requests {stats.pendingRequests > 0 && <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-xs">{stats.pendingRequests}</span>}
                    </Link>
                </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <MetricCard label="Total Students" value={stats.students} icon={GraduationCap} color="text-blue-600 dark:text-blue-400" href="/admin/users" />
                <MetricCard label="Total Teachers" value={stats.teachers} icon={Users} color="text-emerald-600 dark:text-emerald-400" href="/admin/users" />
                <MetricCard label="Pending Requests" value={stats.pendingRequests} icon={ClipboardList} color="text-orange-600 dark:text-orange-400" href="/admin/requests" />
                <MetricCard label="Blind75 Completions" value={stats.blind75Completions} icon={Trophy} color="text-purple-600 dark:text-purple-400" />
            </div>

            {/* Top students leaderboard */}
            {stats.topStudents.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-black/8 dark:border-white/8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-bold">Top Students by LeetCode Solved</h2>
                        </div>
                        <Link href="/leaderboard" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th><th>Student</th><th>Roll No</th><th>LeetCode</th><th className="text-right">Solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topStudents.map((s, i) => (
                                    <tr key={s.id}>
                                        <td>
                                            <span className={`font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                                                #{i + 1}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{s.name}</td>
                                        <td className="text-gray-500 dark:text-gray-400">{s.roll_number || "—"}</td>
                                        <td className="text-gray-500 dark:text-gray-400">{s.leetcode_username || "—"}</td>
                                        <td className="text-right font-bold text-blue-600 dark:text-blue-400">{s.total_solved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
