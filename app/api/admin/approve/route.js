import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const { requestId } = await request.json();
        if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();

        // Fetch the request
        const { data: req, error: fetchErr } = await supabase
            .from("account_requests")
            .select("*")
            .eq("id", requestId)
            .single();

        if (fetchErr || !req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
        if (req.status !== "pending") return NextResponse.json({ error: "Request already processed" }, { status: 400 });

        // Insert into users
        const { error: insertErr } = await supabase.from("users").insert([{
            name: req.name,
            roll_number: req.roll_number,
            email: req.email,
            role: req.role,
            leetcode_username: req.leetcode_username,
        }]);

        if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

        // Mark as approved
        await supabase.from("account_requests").update({ status: "approved" }).eq("id", requestId);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
