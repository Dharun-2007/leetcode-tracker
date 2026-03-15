// lib/leetcode.js
// NOTE: Direct LeetCode API calls are now handled via /api/leetcode/[username] route
// which implements 24h database caching. Use fetch('/api/leetcode/USERNAME') instead.
// This file is kept for backward compatibility only.
export async function fetchLeetCodeData(username) {
  if (!username) return null;
  try {
    const res = await fetch(`/api/leetcode/${encodeURIComponent(username)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
