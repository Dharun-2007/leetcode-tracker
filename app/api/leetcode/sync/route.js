import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");
const blind75FilePath = path.join(process.cwd(), "data", "blind75.json");
const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";

const QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      titleSlug
    }
  }
`;

async function readUsers() {
  const json = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(json);
}

async function writeUsers(users) {
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8");
}

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

    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];
    if (!user.leetcodeUsername) {
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
        variables: { username: user.leetcodeUsername, limit: 20 },
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

    // Identify which recent slugs are in Blind 75 and not yet solved by user
    const userSolvedSlugs = new Set(user.blind75SolvedSlugs || []);
    let newSolvesFound = false;

    for (const slug of recentSlugs) {
      if (blind75Slugs.has(slug) && !userSolvedSlugs.has(slug)) {
        userSolvedSlugs.add(slug);
        newSolvesFound = true;
      }
    }

    if (newSolvesFound) {
      user.blind75SolvedSlugs = Array.from(userSolvedSlugs);
      users[userIndex] = user;
      await writeUsers(users);
      return NextResponse.json({ updated: true, user });
    }

    return NextResponse.json({ updated: false, user });
  } catch (error) {
    console.error("LeetCode sync error", error);
    return NextResponse.json({ error: "Failed to sync LeetCode progress" }, { status: 500 });
  }
}
