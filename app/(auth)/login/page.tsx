import Image from "next/image";
import Link from "next/link";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

const LoginPage = () => {
  return (
    <main className="flex-1 grid md:grid-cols-2">
      <section className="hero-gradient flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary leading-tight max-w-md">
          Sign in and let the agent prep your next application
        </h1>
        <p className="mt-4 text-text-secondary max-w-md">
          Sign in with your email and password or connect with Google to
          start building your profile, matching jobs, and creating tailored
          application materials.
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-12 md:py-20">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="SkillsFit"
              width={496}
              height={168}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <h2 className="text-lg font-semibold text-text-primary text-center">
              Welcome
            </h2>
            <p className="mt-1 text-sm text-text-secondary text-center">
              Sign in to continue your job search
            </p>

            <div className="mt-6">
              <EmailPasswordForm />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <OAuthButtons />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
