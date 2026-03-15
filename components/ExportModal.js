"use client";

import { useState } from "react";
import { X, Download, FileText, Table } from "lucide-react";
import { exportToCSV, exportToPDF } from "../lib/export";

export default function ExportModal({ onClose, students }) {
    const [reportType, setReportType] = useState("both");
    const [fromRoll, setFromRoll] = useState("");
    const [toRoll, setToRoll] = useState("");
    const [exporting, setExporting] = useState(false);

    function filterStudents() {
        let filtered = [...students];
        if (fromRoll.trim()) {
            filtered = filtered.filter(
                (s) => s.roll_number && s.roll_number >= fromRoll.trim()
            );
        }
        if (toRoll.trim()) {
            filtered = filtered.filter(
                (s) => s.roll_number && s.roll_number <= toRoll.trim()
            );
        }
        return filtered;
    }

    const handleCSV = () => {
        setExporting(true);
        try {
            exportToCSV(filterStudents(), reportType);
        } finally {
            setExporting(false);
        }
    };

    const handlePDF = async () => {
        setExporting(true);
        try {
            await exportToPDF(filterStudents(), reportType);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-card w-full max-w-md animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 dark:border-white/8">
                    <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold">Download Report</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/8 dark:hover:bg-white/8 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Report type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Report Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: "blind75", label: "Blind75", icon: Table },
                                { value: "leetcode", label: "LeetCode", icon: FileText },
                                { value: "both", label: "Both", icon: Download },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setReportType(value)}
                                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-all ${reportType === value
                                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Roll number range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Roll Number Range <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                                <input
                                    type="text"
                                    value={fromRoll}
                                    onChange={(e) => setFromRoll(e.target.value)}
                                    placeholder="e.g. 727624BAM001"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                                <input
                                    type="text"
                                    value={toRoll}
                                    onChange={(e) => setToRoll(e.target.value)}
                                    placeholder="e.g. 727625BAM305"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Filters students: {filterStudents().length} of {students.length} selected
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-black/8 dark:border-white/8 flex gap-3">
                    <button
                        onClick={handleCSV}
                        disabled={exporting}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 transition disabled:opacity-60"
                    >
                        <Table className="h-4 w-4" />
                        Download CSV
                    </button>
                    <button
                        onClick={handlePDF}
                        disabled={exporting}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition disabled:opacity-60"
                    >
                        <FileText className="h-4 w-4" />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
