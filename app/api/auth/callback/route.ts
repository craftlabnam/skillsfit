import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { OAUTH_CODE_VERIFIER_COOKIE } from "@/lib/auth-cookies";
import { getPostSignInRedirect } from "@/lib/auth-redirect";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const auth = createAuthActions({ cookies: cookieStore });
    const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
    cookieStore.delete(OAUTH_CODE_VERIFIER_COOKIE);

    if (error || !data?.user) {
      console.error("[api/auth/callback]", error);
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: crypto.randomUUID(),
        event: "oauth_sign_in_failed",
        properties: {
          provider: "google",
          reason: error ? "exchange_error" : "no_user",
          $process_person_profile: false,
        },
      });
      await posthog.flush();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isNewUser =
      Math.abs(
        new Date(data.user.updatedAt).getTime() -
          new Date(data.user.createdAt).getTime(),
      ) <= 5_000;

    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: data.user.id,
      properties: { email: data.user.email, name: data.user.profile?.name },
    });
    posthog.capture({
      distinctId: data.user.id,
      event: "user_signed_in",
      properties: { method: "oauth", provider: "google", is_new_user: isNewUser },
    });
    await posthog.flush();

    return NextResponse.redirect(
      new URL(getPostSignInRedirect(), request.url),
    );
  } catch (error) {
    console.error("[api/auth/callback]", error);
    await getPostHogClient().captureExceptionImmediate(error, undefined, {
      $process_person_profile: false,
      boundary: "oauth_callback",
      provider: "google",
    });
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
