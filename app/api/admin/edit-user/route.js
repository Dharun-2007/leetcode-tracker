import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const { userId, name, email, leetcode_username } = await request.json();
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (leetcode_username !== undefined) updateData.leetcode_username = leetcode_username || null;

        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", userId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true, user: data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
