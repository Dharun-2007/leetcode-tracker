import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const { requestId } = await request.json();
        if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();
        await supabase.from("account_requests").update({ status: "rejected" }).eq("id", requestId);

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
