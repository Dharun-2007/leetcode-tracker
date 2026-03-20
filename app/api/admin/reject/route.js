import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const { requestId } = await request.json();
        if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from("account_requests").update({ status: "rejected" }).eq("id", requestId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
