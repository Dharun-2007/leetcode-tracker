"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Trophy, Medal } from "lucide-react";

export default function LeaderboardPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadLeaderboard(); }, []);

    async function loadLeaderboard() {
        try {
            const [studentsRes, cacheRes, b75Res] = await Promise.all([
                supabase.from("users").select("id, name, roll_number, leetcode_username").eq("role", "student"),
                supabase.from("leetcode_stats_cache").select("user_id, total_solved, easy_solved, medium_solved, hard_solved, solved_slugs"),
                supabase.from("blind75_progress").select("user_id, solved_count, total_count"),
            ]);

            const students = studentsRes.data || [];
            const cacheMap = {};
            (cacheRes.data || []).forEach((c) => { cacheMap[c.user_id] = c; });

            const b75Map = {};
            (b75Res.data || []).forEach((b) => {
                if (!b75Map[b.user_id]) b75Map[b.user_id] = 0;
                b75Map[b.user_id] += b.solved_count;
            });

            // For students without blind75_progress data, calculate from solved_slugs
            const blind75Data = await import("../../data/blind75.json");
            const blind75List = blind75Data.default || blind75Data;
            const blind75Slugs = new Set(blind75List.map((p) => p.slug));

            const enriched = students.map((s) => {
                const cache = cacheMap[s.id];
                let blind75Solved = 0;
                if (cache?.solved_slugs && Array.isArray(cache.solved_slugs)) {
                    blind75Solved = cache.solved_slugs.filter((slug) => blind75Slugs.has(slug)).length;
                }
                return {
                    ...s,
                    total_solved: cache?.total_solved || 0,
                    blind75_solved: blind75Solved,
                    blind75_pct: ((blind75Solved / 75) * 100).toFixed(1),
                };
            });

            enriched.sort((a, b) => b.blind75_solved - a.blind75_solved || b.total_solved - a.total_solved);
            setRows(enriched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function RankIcon({ rank }) {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Ranked by Blind75 completion</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Trophy className="h-12 w-12 mx-auto opacity-20 mb-3" />
                        <p>No students yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Roll No</th>
                                    <th>LeetCode</th>
                                    <th className="text-center">Blind75</th>
                                    <th className="text-center">Progress</th>
                                    <th className="text-center">Total Solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={row.id} className={i < 3 ? "bg-gradient-to-r from-yellow-50/40 to-transparent dark:from-yellow-950/10" : ""}>
                                        <td className="w-12">
                                            <div className="flex items-center justify-center">
                                                <RankIcon rank={i + 1} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${i === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500" : i === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500" : i === 2 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                                                    {row.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-500 dark:text-gray-400">{row.roll_number || "—"}</td>
                                        <td className="text-gray-500 dark:text-gray-400">{row.leetcode_username || "—"}</td>
                                        <td className="text-center">
                                            <span className={`font-bold text-lg ${row.blind75_solved >= 70 ? "text-green-600 dark:text-green-400" : row.blind75_solved >= 40 ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                                                {row.blind75_solved} / 75
                                            </span>
                                        </td>
                                        <td className="text-center w-36">
                                            <div className="space-y-1">
                                                <div className="progress-bar-track">
                                                    <div className="progress-bar-fill" style={{ width: `${row.blind75_pct}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-500">{row.blind75_pct}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center font-bold text-blue-600 dark:text-blue-400">{row.total_solved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
