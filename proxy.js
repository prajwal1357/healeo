import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // ---------------- PUBLIC ROUTES ----------------
  const publicRoutes = ["/login", "/signup", "/verify"];
  if (publicRoutes.includes(path)) {
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    return res;
  }

  // ---------------- PROTECTED ROUTES ----------------
  if (path.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = profile.role;

    // Role-based access
    if (path.startsWith("/dashboard/admin") && role !== "admin")
      return NextResponse.redirect(new URL("/dashboard", req.url));

    if (path.startsWith("/dashboard/doctor") && role !== "doctor")
      return NextResponse.redirect(new URL("/dashboard", req.url));

    if (path.startsWith("/dashboard/worker") && role !== "worker")
      return NextResponse.redirect(new URL("/dashboard", req.url));

    if (path.startsWith("/dashboard/patient") && role !== "patient")
      return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/verify",
  ],
};
