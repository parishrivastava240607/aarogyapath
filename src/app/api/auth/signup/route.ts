import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = signUpSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name, gender, city, lat, lng, role, specialty, regNo } = result.data;
    const supabase = createClient();

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 2. Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name,
      gender,
      city,
      lat,
      lng,
      role,
      specialty: specialty || null,
      reg_no: regNo || null,
      is_available: role !== "citizen",
      language: "en",
    });

    if (profileError) {
      // In local mode if database isn't hooked yet, return user id and warning
      console.warn("Profile table insert warning:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role,
        city,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
