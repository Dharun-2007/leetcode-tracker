import { NextResponse } from "next/server";

const LEETCODE_ENDPOINT = "https://leetcode.com/graphql";

const QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Missing username parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(LEETCODE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from LeetCode" },
        { status: 500 }
      );
    }

    const json = await res.json();
    const stats =
      json?.data?.matchedUser?.submitStats?.acSubmissionNum || [];

    const aggregate = {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
    };

    for (const item of stats) {
      if (item.difficulty === "All") {
        aggregate.totalSolved = item.count || 0;
      } else if (item.difficulty === "Easy") {
        aggregate.easySolved = item.count || 0;
      } else if (item.difficulty === "Medium") {
        aggregate.mediumSolved = item.count || 0;
      } else if (item.difficulty === "Hard") {
        aggregate.hardSolved = item.count || 0;
      }
    }

    return NextResponse.json(aggregate);
  } catch (error) {
    console.error("LeetCode stats error", error);
    return NextResponse.json(
      { error: "Failed to fetch LeetCode stats" },
      { status: 500 }
    );
  }
}

