import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";
import fs from "fs/promises";
import path from "path";

const blind75FilePath = path.join(process.cwd(), "data", "blind75.json");
const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";

const QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      titleSlug
    }
  }
`;

async function readBlind75() {
  const json = await fs.readFile(blind75FilePath, "utf8");
  return JSON.parse(json);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body || {};

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.leetcode_username) {
      return NextResponse.json({ message: "No LeetCode username configured" }, { status: 200 });
    }

    // Fetch recent AC submissions from LeetCode
    const leetcodeRes = await fetch(LEETCODE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: user.leetcode_username, limit: 20 },
      }),
      cache: "no-store",
    });

    if (!leetcodeRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 500 });
    }

    const leetcodeData = await leetcodeRes.json();
    const recentSubmissions = leetcodeData?.data?.recentAcSubmissionList || [];

    // Extract slugs from submissions
    const recentSlugs = recentSubmissions.map((sub) => sub.titleSlug);

    // Get all blind 75 slugs
    const blind75Data = await readBlind75();
    const blind75Slugs = new Set();
    for (const category in blind75Data) {
      for (const problem of blind75Data[category]) {
        blind75Slugs.add(problem.slug);
      }
    }

    // Identify which recent slugs are in Blind 75 and not yet solved by user in cache
    const { data: progressData } = await supabase
      .from("blind75_progress")
      .select("question_slug")
      .eq("user_id", userId);

    const userSolvedSlugs = new Set((progressData || []).map(p => p.question_slug));

    let newSolvesFound = false;
    const newInserts = [];

    for (const slug of recentSlugs) {
      if (blind75Slugs.has(slug) && !userSolvedSlugs.has(slug)) {
        userSolvedSlugs.add(slug);
        newInserts.push({ user_id: userId, question_slug: slug });
        newSolvesFound = true;
      }
    }

    if (newSolvesFound && newInserts.length > 0) {
      // Upsert into Supabase blind75_progress
      await supabase.from("blind75_progress").upsert(newInserts, { onConflict: 'user_id, question_slug' });

      return NextResponse.json({ updated: true, user });
    }

    return NextResponse.json({ updated: false, user });
  } catch (error) {
    console.error("LeetCode sync error", error);
    return NextResponse.json({ error: "Failed to sync LeetCode progress" }, { status: 500 });
  }
}
