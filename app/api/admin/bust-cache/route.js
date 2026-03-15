import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

/**
 * POST /api/admin/bust-cache
 * Body: { userId: string }
 * Deletes the cached LeetCode stats for a user so the next GET /api/leetcode/[username]
 * will fetch fresh data from LeetCode (including all solved slugs).
 */
export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from("leetcode_stats_cache")
            .delete()
            .eq("user_id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
