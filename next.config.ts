import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdfjs-dist next to its worker file in node_modules; bundling it into
  // the SSR chunks makes the pdf.js worker fail to load at runtime.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
