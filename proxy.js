import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ---------------- LOGGED IN ---------------- */
  if (user) {
    const { data: appUser, error } = await supabase
      .from("app_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !appUser?.role) {
      console.error("No role found for user:", user.id);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = appUser.role;

    const roleRoutes = {
      admin: "/dashboard/admin",
      doctor: "/dashboard/doctor",
      worker: "/dashboard/worker",
      patient: "/dashboard/patient",
    };

    const allowedBase = roleRoutes[role];

    // Logged-in users should not access auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL(allowedBase, request.url));
    }

    // Enforce role-based dashboard access
    if (pathname.startsWith("/dashboard")) {
      if (!pathname.startsWith(allowedBase)) {
        return NextResponse.redirect(new URL(allowedBase, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
