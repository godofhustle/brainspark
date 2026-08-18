import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { initUserProfileAfterOAuth } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() });
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