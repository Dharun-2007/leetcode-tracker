import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Failed to read users from Supabase", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

// POST and DELETE are intentionally handled by the admin auth routes now (e.g. /api/admin/add-teacher, /api/admin/delete-user)
// Providing minimal stubs to prevent hard crashes if old UI calls are still floating around
export async function POST() {
  return NextResponse.json({ error: "Please use the designated auth routes for creation." }, { status: 400 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Please use the admin deletion route." }, { status: 400 });
}
