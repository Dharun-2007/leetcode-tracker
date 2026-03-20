"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../../components/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { computeBlind75Stats } from "../../../../lib/blind75";
import { Loader2, ArrowLeft, ExternalLink, CheckCircle2, Circle, X, RefreshCw } from "lucide-react";
import Link from "next/link";

/* ─── Solved Problems Modal ─── */
function SolvedModal({ categoryName, data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-lg max-h-[80vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-lg">{categoryName}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="overflow-y-auto flex-1 divide-y divide-white/5">
          {data.problems.map((p) => (
            <li key={p.slug} className={`flex items-center justify-between px-5 py-3 ${p.isSolved ? "bg-green-950/15" : ""}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {p.isSolved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-600 shrink-0" />
                )}
                <span className={`text-sm truncate ${p.isSolved ? "font-medium text-gray-200" : "text-gray-500"}`}>
                  {p.name}
                </span>
                <span className={`badge shrink-0 ${p.difficulty === "Easy" ? "badge-easy" : p.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`}>
                  {p.difficulty}
                </span>
              </div>
              <a href={`https://leetcode.com/problems/${p.slug}`} target="_blank" rel="noopener noreferrer" className="ml-2 shrink-0 text-blue-400 hover:text-blue-300">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, borderColor }) {
  return (
    <div className={`glass-card p-6 border-l-4 ${borderColor} transition-transform hover:scale-[1.02]`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

function CategoryCard({ category, data, onClickSolved }) {
  const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
  return (
    <div className="glass-card p-5 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm text-gray-200 truncate pr-2">{category}</span>
        <button
          onClick={() => data.solved > 0 && onClickSolved()}
          className={`text-xs font-black px-3 py-1 rounded-full transition-all ${data.solved > 0
              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 cursor-pointer"
              : "bg-gray-800 text-gray-600 cursor-default"
            }`}
        >
          {data.solved}/{data.total}
        </button>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Click score to view</p>
        <p className="text-[11px] font-bold text-gray-400">{pct}%</p>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [b75, setB75] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);

  const loadStudent = useCallback(async () => {
    try {
      const { data: user } = await supabase.from("users").select("*").eq("id", id).single();
      if (!user) { setLoading(false); return; }
      setStudent(user);

      const { data: cache } = await supabase.from("leetcode_stats_cache").select("*").eq("user_id", id).single();

      if (cache) {
        const slugs = cache.solved_slugs || [];
        setStats({
          totalSolved: cache.total_solved || 0,
          easySolved: cache.easy_solved || 0,
          mediumSolved: cache.medium_solved || 0,
          hardSolved: cache.hard_solved || 0,
          solvedSlugs: slugs,
        });
        if (slugs.length > 0) setB75(computeBlind75Stats(slugs));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "student" && currentUser.id !== id) {
      router.push("/questions");
      return;
    }
    loadStudent();
  }, [id, currentUser, loadStudent, router]);

  async function handleRefresh() {
    if (!student?.leetcode_username) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/leetcode/${encodeURIComponent(student.leetcode_username)}?forceRefresh=true`);
      if (res.ok) {
        const lcData = await res.json();
        const slugs = lcData.solved_slugs || lcData.solvedSlugs || [];

        const mappedData = {
          totalSolved: lcData.total_solved || lcData.totalSolved || 0,
          easySolved: lcData.easy_solved || lcData.easySolved || 0,
          mediumSolved: lcData.medium_solved || lcData.mediumSolved || 0,
          hardSolved: lcData.hard_solved || lcData.hardSolved || 0,
          solvedSlugs: slugs,
        };

        setStats(mappedData);
        if (slugs.length > 0) setB75(computeBlind75Stats(slugs));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  if (!currentUser || loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
    </div>
  );

  if (!student) return <div className="text-center py-24 text-gray-400">Student Not Found</div>;

  const backHref = currentUser.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {modalCategory && b75?.categories[modalCategory] && (
        <SolvedModal categoryName={modalCategory} data={b75.categories[modalCategory]} onClose={() => setModalCategory(null)} />
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        {currentUser.role !== "student" ? (
          <Link href={backHref} className="flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO DASHBOARD
          </Link>
        ) : <div />}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-500 hover:text-blue-400 uppercase transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Updating..." : "Refresh Stats"}
        </button>
      </div>

      {/* Main Profile Header */}
      <div className="glass-card p-8 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">{student.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-lg">
                  Roll: {student.roll_number}
                </span>
                <a href={`https://leetcode.com/u/${student.leetcode_username}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 hover:bg-white/10">
                  <ExternalLink className="h-3 w-3" /> {student.leetcode_username}
                </a>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-center min-w-[160px]">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Blind75 Progress</p>
            <p className="text-3xl font-black text-blue-500">
              {b75 ? `${b75.totalSolved} / ${b75.totalProblems}` : "0 / 75"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Solved" value={stats?.totalSolved ?? 0} borderColor="border-blue-600" />
        <StatCard label="Easy" value={stats?.easySolved ?? 0} borderColor="border-green-500" />
        <StatCard label="Medium" value={stats?.mediumSolved ?? 0} borderColor="border-yellow-500" />
        <StatCard label="Hard" value={stats?.hardSolved ?? 0} borderColor="border-red-500" />
      </div>

      {/* Categories Grid */}
      {b75 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Blind 75 Progress</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track how many Blind 75 problems you have completed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(b75.categories).map(([category, data]) => (
              <CategoryCard key={category} category={category} data={data} onClickSolved={() => setModalCategory(category)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}