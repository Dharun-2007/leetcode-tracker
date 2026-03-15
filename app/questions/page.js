"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext";
import { computeBlind75Stats } from "../../lib/blind75";
import {
  Loader2, CheckCircle2, Circle, ExternalLink,
  ChevronDown, ChevronUp, Zap
} from "lucide-react";

function DifficultyBadge({ difficulty }) {
  const classes = {
    Easy: "badge-easy",
    Medium: "badge-medium",
    Hard: "badge-hard",
  };
  return <span className={`badge ${classes[difficulty] || ""}`}>{difficulty}</span>;
}

function CategoryCard({ category, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between p-4 hover:bg-black/3 dark:hover:bg-white/3 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-base font-bold truncate">{category}</h3>
          <span className="badge badge-blue shrink-0">{data.solved}/{data.total}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="w-20 hidden sm:block">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-500">{pct}%</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <ul className="divide-y divide-black/5 dark:divide-white/5 border-t border-black/8 dark:border-white/8">
          {data.problems.map((problem) => (
            <li
              key={problem.slug}
              className={`flex items-center justify-between px-4 py-3 transition ${problem.isSolved ? "bg-green-50/50 dark:bg-green-950/10" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {problem.isSolved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                )}
                <span className={`text-sm truncate ${problem.isSolved ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                  {problem.name}
                </span>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
              <a
                href={`https://leetcode.com/problems/${problem.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Solve <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheInfo, setCacheInfo] = useState(null);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser]);

  async function loadData() {
    if (!currentUser?.leetcode_username) {
      // No LeetCode username — leave stats as null, show warning in UI
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/leetcode/${encodeURIComponent(currentUser.leetcode_username)}`);
      const lcData = await res.json();

      // Only compute Blind75 stats when real slug data is available
      if (lcData?.solvedSlugs && Array.isArray(lcData.solvedSlugs)) {
        setStats(computeBlind75Stats(lcData.solvedSlugs));
      }
      setCacheInfo({ fromCache: lcData.fromCache, lastUpdated: lcData.lastUpdated });
    } catch (err) {
      console.error("Failed to load LeetCode data:", err);
      // Do NOT call computeBlind75Stats([]) — leave stats as null
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-gray-500 dark:text-gray-400">Loading Blind75 progress...</p>
    </div>
  );

  const pct = stats ? Math.round((stats.totalSolved / stats.totalProblems) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Blind 75</h1>
            <p className="text-gray-500 dark:text-gray-400">Your progress across all categories</p>
          </div>
        </div>
        <div className="glass-card-sm px-5 py-3 flex flex-col items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Overall Progress</span>
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {stats?.totalSolved || 0} / {stats?.totalProblems || 75}
          </span>
          <div className="w-full mt-2">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-1">{pct}% complete</span>
        </div>
      </div>

      {cacheInfo && (
        <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
          {cacheInfo.fromCache ? "✓ Using cached data" : "✓ Freshly synced"}{" "}
          {cacheInfo.lastUpdated ? `· Last updated: ${new Date(cacheInfo.lastUpdated).toLocaleString()}` : ""}
        </div>
      )}

      {!currentUser.leetcode_username && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm">
          ⚠️ No LeetCode username configured. Ask your admin to update your profile.
        </div>
      )}

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-3">
        {stats?.categories && Object.entries(stats.categories).map(([category, data]) => (
          <CategoryCard key={category} category={category} data={data} />
        ))}
      </div>
    </div>
  );
}