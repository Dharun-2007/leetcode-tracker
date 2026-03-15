import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, leetcode_username } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Check for duplicate email
        const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
        if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

        // Add to Supabase Auth system directly 
        const { error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError && authError.message !== "User already registered") {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const { data, error } = await supabase.from("users").insert([{
            name,
            email,
            role: "teacher",
            leetcode_username: leetcode_username || null,
            roll_number: null,
        }]).select().single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true, user: data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
