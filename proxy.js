import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const nextPath = url.pathname;

  // 1. Redirect unauthenticated app_users to login if they try to access a protected route
  if (!user && nextPath.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    // 2. Fetch user role from the 'app_users' table
    const { data: userData } = await supabase
      .from("app_users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = userData?.role;

    // 3. Prevent logged-in app_users from visiting login/signup
    if (nextPath === "/login" || nextPath === "/signup" || nextPath === "/") {
      if (role) {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
      }
    }

    // 4. Role-based route protection
    if (nextPath.startsWith("/dashboard")) {
      const allowedPath = `/dashboard/${role}`;
      
      // If user tries to access a dashboard that doesn't belong to their role
      if (!nextPath.startsWith(allowedPath)) {
        return NextResponse.redirect(new URL(allowedPath, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};