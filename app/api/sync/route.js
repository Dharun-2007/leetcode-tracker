import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";

const STATS_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum { difficulty count }
      }
    }
  }
`;

const RECENT_AC_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      title titleSlug
    }
  }
`;

async function syncStudent(supabase, student) {
    if (!student.leetcode_username) return;

    try {
        const [statsRes, acRes] = await Promise.all([
            fetch(LEETCODE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
                body: JSON.stringify({ query: STATS_QUERY, variables: { username: student.leetcode_username } }),
            }),
            fetch(LEETCODE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
                body: JSON.stringify({ query: RECENT_AC_QUERY, variables: { username: student.leetcode_username, limit: 100 } }),
            }),
        ]);

        const statsData = await statsRes.json();
        const acData = await acRes.json();

        const nums = statsData?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
        const subs = acData?.data?.recentAcSubmissionList || [];

        let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;
        nums.forEach((item) => {
            if (item.difficulty === "All") totalSolved = item.count;
            if (item.difficulty === "Easy") easySolved = item.count;
            if (item.difficulty === "Medium") mediumSolved = item.count;
            if (item.difficulty === "Hard") hardSolved = item.count;
        });

        await supabase.from("leetcode_stats_cache").upsert({
            user_id: student.id,
            total_solved: totalSolved,
            easy_solved: easySolved,
            medium_solved: mediumSolved,
            hard_solved: hardSolved,
            solved_slugs: subs.map((s) => s.titleSlug),
            last_updated: new Date().toISOString(),
        }, { onConflict: "user_id" });

        return { user_id: student.id, status: "success" };
    } catch (err) {
        return { user_id: student.id, status: "error", error: err.message };
    }
}

export async function POST(request) {
    const supabase = getSupabaseAdmin();

    const { data: students } = await supabase
        .from("users")
        .select("id, leetcode_username")
        .eq("role", "student")
        .not("leetcode_username", "is", null);

    const results = [];
    // Process sequentially to avoid rate limits
    for (const student of students || []) {
        const result = await syncStudent(supabase, student);
        results.push(result);
        // Small delay between requests to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({ synced: results.length, results });
}
