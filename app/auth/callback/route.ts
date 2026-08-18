import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { initUserProfileAfterOAuth } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Called from a Server Component; session cookies are set by
              // the client-side auth flow instead.
            }
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      try {
        await initUserProfileAfterOAuth(data.user);
        return NextResponse.redirect(new URL("/profile", request.url));
      } catch (error) {
        console.error("Failed to initialize profile:", error);
      }
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}