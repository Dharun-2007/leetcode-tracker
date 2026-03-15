import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";
const CACHE_TTL_HOURS = 12;

const HEADERS = {
  "Content-Type": "application/json",
  Referer: "https://leetcode.com",
  "User-Agent": "Mozilla/5.0",
};

const COMBINED_QUERY = `
query getLeetCodeData($username: String!, $limit: Int!) {
  matchedUser(username: $username) {
    submitStats: submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
  recentSubmissionList(username: $username, limit: $limit) {
    titleSlug
    statusDisplay
  }
}
`;

export async function GET(request, context) {
  const params = await context.params; 
  const username = params.username;
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("forceRefresh") === "true";

  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  try {
    const { data: user } = await supabase.from("users").select("id").eq("leetcode_username", username).single();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: cache } = await supabase.from("leetcode_stats_cache").select("*").eq("user_id", user.id).single();

    if (cache && !forceRefresh) {
      const lastUpdated = new Date(cache.last_updated);
      const hoursSince = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSince < CACHE_TTL_HOURS && cache.solved_slugs?.length > 0) {
        return NextResponse.json({ 
            ...cache, 
            solvedSlugs: cache.solved_slugs, // Alias for frontend
            fromCache: true 
        });
      }
    }

    const lcRes = await fetch(LEETCODE_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ query: COMBINED_QUERY, variables: { username, limit: 100 } }),
      cache: 'no-store'
    });
    const result = await lcRes.json();
    const data = result.data;

    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const counts = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
    stats.forEach(s => counts[s.difficulty] = s.count);

    const newSlugs = (data.recentSubmissionList || [])
      .filter(s => s.statusDisplay === "Accepted")
      .map(s => s.titleSlug.toLowerCase().trim());

    const existingSlugs = cache?.solved_slugs || [];
    const mergedSlugs = Array.from(new Set([...existingSlugs, ...newSlugs]));

    const updatedStats = {
      user_id: user.id,
      total_solved: counts.All,
      easy_solved: counts.Easy,
      medium_solved: counts.Medium,
      hard_solved: counts.Hard,
      solved_slugs: mergedSlugs,
      last_updated: new Date().toISOString(),
    };

    await supabase.from("leetcode_stats_cache").upsert(updatedStats, { onConflict: "user_id" });

    return NextResponse.json({ 
        ...updatedStats, 
        totalSolved: counts.All,
        easySolved: counts.Easy,
        mediumSolved: counts.Medium,
        hardSolved: counts.Hard,
        solvedSlugs: mergedSlugs,
        fromCache: false 
    });
  } catch (error) {
    console.error(error);
    if (cache) return NextResponse.json({ ...cache, solvedSlugs: cache.solved_slugs, fromCache: true });
    return NextResponse.json({ error: "System failure" }, { status: 500 });
  }
}