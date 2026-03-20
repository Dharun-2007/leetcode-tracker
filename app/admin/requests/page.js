"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../components/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Loader2, Check, X, Clock, User, Mail, BookOpen } from "lucide-react";

function StatusBadge({ status }) {
    const map = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return (
        <span className={`badge ${map[status] || ""}`}>{status}</span>
    );
}

export default function AdminRequestsPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("pending");

    const loadRequests = useCallback(async () => {
        setLoading(true);
        const query = supabase.from("account_requests").select("*").order("created_at", { ascending: false });
        if (filter !== "all") query.eq("status", filter);
        const { data } = await query;
        setRequests(data || []);
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role !== "admin") { router.push("/"); return; }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRequests();
    }, [currentUser, filter, router, loadRequests]);

    async function handleApprove(id) {
        setActionLoading(id + "_approve");
        const res = await fetch("/api/admin/approve", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: id }),
        });
        if (res.ok) setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
        setActionLoading(null);
    }

    async function handleReject(id) {
        setActionLoading(id + "_reject");
        const res = await fetch("/api/admin/reject", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: id }),
        });
        if (res.ok) setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
        setActionLoading(null);
    }

    if (!currentUser) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Account Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve student registration requests</p>
                </div>
                {/* Filter tabs */}
                <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                    {["pending", "approved", "rejected", "all"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${filter === f
                                ? "bg-white dark:bg-slate-800 shadow text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                        <Clock className="h-12 w-12 opacity-30" />
                        <p className="font-medium">No {filter} requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th><th>Roll No</th><th>Email</th><th>LeetCode</th><th>Status</th><th>Date</th><th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {req.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{req.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-500 dark:text-gray-400">{req.roll_number || "—"}</td>
                                        <td className="text-gray-500 dark:text-gray-400">{req.email}</td>
                                        <td className="text-gray-500 dark:text-gray-400">{req.leetcode_username || "—"}</td>
                                        <td><StatusBadge status={req.status} /></td>
                                        <td className="text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex justify-end gap-2">
                                                {req.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={actionLoading !== null}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition disabled:opacity-50"
                                                        >
                                                            {actionLoading === req.id + "_approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={actionLoading !== null}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition disabled:opacity-50"
                                                        >
                                                            {actionLoading === req.id + "_reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
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
