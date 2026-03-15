"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Loader2, Search, Trash2, Edit2, Check, X } from "lucide-react";

function RoleBadge({ role }) {
  const map = { admin: "badge-admin", teacher: "badge-teacher", student: "badge-student" };
  return <span className={`badge ${map[role] || "badge-blue"} capitalize`}>{role}</span>;
}

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") { router.push("/"); return; }
    loadUsers();
  }, [currentUser]);

  async function loadUsers() {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActionLoading(id + "_delete");
    await fetch("/api/admin/delete-user", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setActionLoading(null);
  }

  async function handleSave(id) {
    setActionLoading(id + "_save");
    const res = await fetch("/api/admin/edit-user", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, ...editData }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...editData } : u));
      setEditingId(null);
    }
    setActionLoading(null);
  }

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.roll_number || "").toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  if (!currentUser) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View, edit, and delete all platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or roll number..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          {["all", "student", "teacher", "admin"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${roleFilter === r ? "bg-white dark:bg-slate-800 shadow text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>User</th><th>Role</th><th>Roll No</th><th>LeetCode</th><th>Joined</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                ) : filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {editingId === user.id ? (
                        <div className="space-y-1">
                          <input value={editData.name} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input value={editData.email} onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td className="text-gray-500 dark:text-gray-400">{user.roll_number || "—"}</td>
                    <td>
                      {editingId === user.id ? (
                        <input value={editData.leetcode_username} onChange={(e) => setEditData((p) => ({ ...p, leetcode_username: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">{user.leetcode_username || "—"}</span>
                      )}
                    </td>
                    <td className="text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {editingId === user.id ? (
                          <>
                            <button onClick={() => handleSave(user.id)} disabled={!!actionLoading}
                              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition disabled:opacity-50">
                              {actionLoading === user.id + "_save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(user.id); setEditData({ name: user.name, email: user.email, leetcode_username: user.leetcode_username || "" }); }}
                              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 transition">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {user.role !== "admin" && (
                              <button onClick={() => handleDelete(user.id)} disabled={!!actionLoading}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition disabled:opacity-50">
                                {actionLoading === user.id + "_delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            )}
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
