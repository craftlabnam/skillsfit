import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SkillsFit — AI-Powered Job Hunting",
  description:
    "SkillsFit finds the jobs, researches the companies, and gives you everything you need to stand out.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {data.user && (
          <PostHogIdentify
            userId={data.user.id}
            email={data.user.email}
            name={data.user.profile?.name}
          />
        )}
        {children}
      </body>
    </html>
  );
}
