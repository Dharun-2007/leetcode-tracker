"use client";

import { X, CheckCircle2, Circle, ExternalLink } from "lucide-react";

export default function SolvedModal({ onClose, categories }) {
    if (!categories) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 dark:border-white/8">
                    <h2 className="text-lg font-bold">Blind75 Solved Problems</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/8 dark:hover:bg-white/8 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                    {Object.entries(categories).map(([category, data]) => {
                        const solved = data.problems.filter((p) => p.isSolved);
                        if (solved.length === 0) return null;
                        return (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {category}
                                    </h3>
                                    <span className="badge badge-blue">
                                        {data.solved}/{data.total}
                                    </span>
                                </div>
                                <ul className="space-y-1">
                                    {data.problems.map((problem) => (
                                        <li
                                            key={problem.slug}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${problem.isSolved
                                                    ? "bg-green-50 dark:bg-green-950/20"
                                                    : "bg-black/3 dark:bg-white/3"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {problem.isSolved ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                                                )}
                                                <span
                                                    className={`text-sm ${problem.isSolved
                                                            ? "text-gray-800 dark:text-gray-200 font-medium"
                                                            : "text-gray-400 dark:text-gray-600"
                                                        }`}
                                                >
                                                    {problem.name}
                                                </span>
                                                <span
                                                    className={`badge ${problem.difficulty === "Easy"
                                                            ? "badge-easy"
                                                            : problem.difficulty === "Medium"
                                                                ? "badge-medium"
                                                                : "badge-hard"
                                                        }`}
                                                >
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            {problem.isSolved && (
                                                <a
                                                    href={`https://leetcode.com/problems/${problem.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
