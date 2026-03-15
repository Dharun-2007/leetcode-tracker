import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();

        // 1. Fetch user to retrieve email so we can target Supabase Auth deletion
        const { data: user } = await supabase.from("users").select("email").eq("id", userId).single();

        // 2. Delete from cache 
        await supabase.from("leetcode_stats_cache").delete().eq("user_id", userId);

        // 3. Delete from blind75 table
        await supabase.from("blind75_progress").delete().eq("user_id", userId);

        // 4. Delete from users table
        const { error } = await supabase.from("users").delete().eq("id", userId);

        // 5. Delete from Supabase Auth system entirely
        if (user && user.email) {
            const { data: authData } = await supabase.auth.admin.listUsers();
            if (authData && authData.users) {
                const authUser = authData.users.find(u => u.email === user.email);
                if (authUser) {
                    await supabase.auth.admin.deleteUser(authUser.id);
                }
            }
        }

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
