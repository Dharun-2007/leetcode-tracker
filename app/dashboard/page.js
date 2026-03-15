"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { computeBlind75Stats } from "../../lib/blind75";
import { Loader2, Search, Download, Users } from "lucide-react";
import ExportModal from "../../components/ExportModal";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [syncingUser, setSyncingUser] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "admin") { router.push("/admin"); return; }
    if (currentUser.role === "student") { router.push("/questions"); return; }
    loadDashData();
  }, [currentUser, router]);

  async function loadDashData() {
    try {
      const [studentsRes, cacheRes] = await Promise.all([
        supabase.from("users").select("*").eq("role", "student"),
        supabase.from("leetcode_stats_cache").select("*"),
      ]);

      const studentList = studentsRes.data || [];
      const cacheMap = {};
      (cacheRes.data || []).forEach((c) => { cacheMap[c.user_id] = c; });

      const enriched = studentList.map((student) => {
        const cache = cacheMap[student.id];
        const stats = cache ? {
          totalSolved: cache.total_solved,
          easySolved: cache.easy_solved,
          mediumSolved: cache.medium_solved,
          hardSolved: cache.hard_solved,
          solvedSlugs: cache.solved_slugs || [],
        } : null;

        const blind75 = (stats?.solvedSlugs?.length > 0)
          ? computeBlind75Stats(stats.solvedSlugs)
          : null;

        return { ...student, stats, blind75 };
      });

      setStudents(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSync = async (e, username) => {
    e.stopPropagation();
    if (!username) return alert("No LeetCode username linked!");

    setSyncingUser(username);
    try {
      // Calls the API with the MERGE logic to protect your data
      await fetch(`/api/leetcode/${username}?forceRefresh=true`);
      await loadDashData();
    } catch (error) {
      console.error("Failed to sync", error);
    } finally {
      setSyncingUser(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
      (s.leetcode_username && s.leetcode_username.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    const getSortValue = (roll) => {
      if (!roll) return Infinity;
      const match = roll.match(/\d{1,3}$/);
      return match ? parseInt(match[0], 10) : Infinity;
    };
    return getSortValue(a.roll_number) - getSortValue(b.roll_number);
  });

  if (!currentUser || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {showExportModal && (
        <ExportModal students={filteredStudents} onClose={() => setShowExportModal(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Students Dashboard</h1>
            <p className="text-gray-500 mt-0.5">{students.length} students enrolled</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-700 bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Download Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>LeetCode</th>
                <th className="text-center">Total</th>
                <th className="text-center">Blind75</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/dashboard/student/${s.id}`)}
                  className="cursor-pointer"
                >
                  <td>{s.name}</td>
                  <td>{s.roll_number || "—"}</td>
                  <td>{s.leetcode_username || "—"}</td>
                  <td className="text-center font-bold text-blue-400">{s.stats?.totalSolved || 0}</td>
                  <td className="text-center font-bold">{s.blind75?.totalSolved || 0} / 75</td>
                  <td className="text-center">
                    <button
                      onClick={(e) => handleSync(e, s.leetcode_username)}
                      disabled={syncingUser === s.leetcode_username || !s.leetcode_username}
                      className="text-xs bg-blue-900/30 text-blue-400 hover:bg-blue-800/50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      {syncingUser === s.leetcode_username ? "Syncing..." : "Sync"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}