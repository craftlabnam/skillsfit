"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { OAUTH_CODE_VERIFIER_COOKIE } from "@/lib/auth-cookies";
import { getPostSignInRedirect } from "@/lib/auth-redirect";
import { getPostHogClient } from "@/lib/posthog-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInWithPassword(email: string, password: string) {
  if (!EMAIL_PATTERN.test(email) || password.length === 0) {
    return { success: false, error: "Enter a valid email and password." };
  }

  let redirectUrl: string;

  try {
    const auth = createAuthActions({ cookies: await cookies() });
    const { data, error } = await auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      console.error("[actions/auth]", error);
      return { success: false, error: "Incorrect email or password." };
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
      event: "password_sign_in_completed",
      properties: { method: "email", is_new_user: isNewUser },
    });
    await posthog.flush();

    redirectUrl = getPostSignInRedirect();
  } catch (error) {
    console.error("[actions/auth]", error);
    await getPostHogClient().captureExceptionImmediate(error, undefined, {
      $process_person_profile: false,
      boundary: "sign_in_with_password",
    });
    return { success: false, error: "Could not sign in. Please try again." };
  }

  redirect(redirectUrl);
}

export async function signInWithOAuth(provider: "google" | "github") {
  let redirectUrl: string;

  try {
    const cookieStore = await cookies();
    const auth = createAuthActions({ cookies: cookieStore });
    const { data, error } = await auth.signInWithOAuth(provider, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      skipBrowserRedirect: true,
    });

    if (error || !data?.url) {
      console.error("[actions/auth]", error);
      return { success: false, error: "Could not start sign-in. Please try again." };
    }

    if (data.codeVerifier) {
      cookieStore.set(OAUTH_CODE_VERIFIER_COOKIE, data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
    }

    redirectUrl = data.url;
  } catch (error) {
    console.error("[actions/auth]", error);
    await getPostHogClient().captureExceptionImmediate(error, undefined, {
      $process_person_profile: false,
      boundary: "sign_in_with_oauth",
      provider,
    });
    return { success: false, error: "Could not start sign-in. Please try again." };
  }

  redirect(redirectUrl);
}

export async function signOut() {
  try {
    const cookieStore = await cookies();

    // Capture sign-out event before ending the session
    const serverClient = createServerClient({ cookies: cookieStore });
    const { data: sessionData } = await serverClient.auth.getCurrentUser();
    if (sessionData?.user?.id) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: sessionData.user.id,
        event: "user_signed_out",
      });
      await posthog.flush();
    }

    const auth = createAuthActions({ cookies: cookieStore });
    const { error } = await auth.signOut();
    if (error) {
      console.error("[actions/auth]", error);
      return { success: false, error: "Could not sign out. Please try again." };
    }
  } catch (error) {
    console.error("[actions/auth]", error);
    await getPostHogClient().captureExceptionImmediate(error, undefined, {
      $process_person_profile: false,
      boundary: "sign_out",
    });
    return { success: false, error: "Could not sign out. Please try again." };
  }

  redirect("/");
}
