import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "users.json");

async function readUsers() {
  const json = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(json);
}

async function writeUsers(users) {
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8");
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to read users.json", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, leetcodeUsername } = body || {};

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role,
      leetcodeUsername: leetcodeUsername || "",
      stats: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
      },
      blind75SolvedSlugs: [],
      neet150Solved: 0,
    };

    const updated = [...users, newUser];
    await writeUsers(updated);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const users = await readUsers();
    const exists = users.some((u) => u.id === id);
    if (!exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = users.filter((u) => u.id !== id);
    await writeUsers(updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

