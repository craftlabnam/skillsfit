# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to SkillsFit.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server

Package is `@insforge/sdk` (`@insforge/ssr` does not exist as a package — verified against npm and the SDK's own bundled reference). SSR helpers are subpath exports of the same package: `@insforge/sdk/ssr` and `@insforge/sdk/ssr/middleware`. Three separate surfaces — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
// baseUrl + anonKey auto-resolve from NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY
import { createBrowserClient } from "@insforge/sdk/ssr";

export const insforge = createBrowserClient();
```

```typescript
// lib/insforge-server.ts — server context only, read-only (cannot sign in/out)
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  return createServerClient({
    cookies: await cookies(),
  });
};
```

```typescript
// Auth mutations (sign in/up/out, OAuth) — the server client above is read-only,
// so mutations go through createAuthActions() instead, inside a Server Action
// or the OAuth callback Route Handler.
import { createAuthActions } from "@insforge/sdk/ssr";
const auth = createAuthActions({ cookies: await cookies() });
```

**Rules:**

- Browser client — Client Components, browser-side reads via Storage/Realtime
- Server client — Server Components, API routes, Server Actions, agent functions; read-only
- Auth actions — the only surface that mutates the session cookie
- Never use browser client in server context
- Never use server client in browser context

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const { data, error } = await insforge.auth.getCurrentUser();
if (!data.user) redirect("/login");
```

```typescript
// Start Google/GitHub OAuth — server-driven, in a Server Action.
// SSR mode does NOT auto-exchange the callback like the plain client does,
// so this always needs a matching Route Handler at the callback URL.
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function signInWithOAuth(provider: "google" | "github") {
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    skipBrowserRedirect: true,
  });
  if (error || !data?.url) return { success: false, error: "Could not start sign-in" };
  // codeVerifier from `data` must be stashed in an httpOnly cookie here so the
  // callback Route Handler can pass it to exchangeOAuthCode()
  redirect(data.url);
}
```

```typescript
// app/api/auth/callback/route.ts — exchanges the OAuth code for a session
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const codeVerifier = request.cookies.get("oauth_code_verifier")?.value;
  const auth = createAuthActions({ cookies: await cookies() });
  const { error } = await auth.exchangeOAuthCode(code!, codeVerifier);
  return NextResponse.redirect(
    new URL(error ? "/login" : "/dashboard", request.url),
  );
}
```

---

### DB Queries

Note the `.database` namespace — it is not `insforge.from(...)` directly.

```typescript
// Read
const { data, error } = await insforge.database
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert
const { data, error } = await insforge.database
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge.database
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Storage

`.upload(path, file)` always overwrites an existing key — there is no separate `upsert` option — and the response returns the URL directly, so there is no separate `getPublicUrl()` call.

```typescript
// Upload file — overwrites any existing object at this path
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer);

const url = data.url; // returned directly from upload(), no getPublicUrl() step
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Uploading to an existing path always replaces it — no explicit flag needed
- Always save `data.url` (and `data.key`, for future download/delete calls) back to the DB after upload
- Never write files to disk — always upload buffer directly to storage
- The documented signature takes `File | Blob`; verify server-side Buffer support when implementing 08 Resume PDF Generation — convert to a `Blob` first if needed

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided
  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: job.contract_type || "fulltime",
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- Always include `category=it-jobs` — never search Adzuna without this filter
- Never pass `where` if location is empty — omit the parameter entirely
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — GPT-4o scores from it, not a full description
- Default country to `'us'` — support `gb`, `au`, `ca` as alternatives

---

## Firecrawl

**Check first:** Check AGENTS.md for an installed Firecrawl skill. If a Firecrawl MCP server is configured — use it. The skill/MCP will have the latest session management and API patterns.

### Session Creation — Company Research

```typescript
import Firecrawl from "@firecrawl";

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });

// Single session for company research — sequential page visits
const session = await app.sessions.create({
  projectId: process.env.FIRECRAWL_PROJECT_ID!,
  timeout: 120, // 2 minute session — visits 3-4 pages max
});
```

**Important — Firecrawl runs independently from your Next.js server:**
Firecrawl sessions run on Firecrawl's cloud infrastructure, not inside your Next.js API route. The API route triggers the Firecrawl session and returns a response while the session continues running independently on Firecrawl's platform. Do not add `maxDuration` or any timeout configuration to Next.js API routes to accommodate Firecrawl session length.

**Rules:**

- Always use single sessions — never parallel sessions (free plan limit)
- Session timeout is 120 seconds — sufficient for 3-4 page visits
- Always end sessions cleanly — call stagehand.close() when done
- Project ID always from `process.env.FIRECRAWL_PROJECT_ID` — never hardcode
- Firecrawl client lives in `lib/firecrawl.ts` — always import from there

---

## Stagehand

**Check first:** Check AGENTS.md for an installed Stagehand skill. If a Stagehand MCP server is configured — use it. The skill/MCP will have the latest act() and extract() patterns.

### Initialisation

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "FIRECRAWL",
  apiKey: process.env.FIRECRAWL_API_KEY!,
  projectId: process.env.FIRECRAWL_PROJECT_ID!,
  firecrawlSessionID: session.id,
  model: {
    modelName: "openai/gpt-4o",
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1",
  },
  disablePino: true,
});

await stagehand.init();
const page = stagehand.context.activePage()!;
```

### extract()

```typescript
import { z } from "zod";

const result = await stagehand.extract({
  instruction:
    "Extract the company overview, main product description, and any technology mentions from this page.",
  schema: z.object({
    companyOverview: z.string().optional(),
    mainProduct: z.string().optional(),
    techMentions: z.array(z.string()).optional(),
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});
```

### act()

```typescript
// Always wrap in try/catch
try {
  await stagehand.act({
    action: "Click the About link in the navigation",
  });
} catch (error) {
  await logAgentError(jobId, null, error);
}
```

## Company Research Section

Replace the existing Stagehand "Company Research Pattern" section in library-docs.md with this:

---

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → GPT-4o synthesis.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website.

```typescript
// Step 1 — Homepage extraction
const homepageData = await stagehand.extract({
  instruction:
    "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  schema: z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
});

// If oneLiner and productSummary are empty — wrong site or parked domain
// Skip to synthesis with job description and profile only
if (!homepageData.oneLiner && !homepageData.productSummary) {
  await stagehand.close();
  // proceed to synthesis with empty companyResearch
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers)
const subPageData = await stagehand.extract({
  instruction:
    "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  schema: z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
});

// Step 3 — GPT-4o synthesis (after browser closes)
// Feed three data sources: company research + job from DB + profile from DB
const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Matched skills (already computed): ${job.matched_skills.join(", ")}
Missing skills (already computed): ${job.missing_skills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" },
  temperature: 0.4,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract()` with a Zod schema — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch
- Always call `await stagehand.close()` when done — ends the Firecrawl session
- Model is always `gpt-4o` — never use other models
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Always close session in finally block — never leave sessions open even if research fails
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## Model calls (OpenRouter, OpenAI-compatible)

**Check first:** Check AGENTS.md for an installed OpenAI or OpenRouter skill. The skill will have the latest API patterns and model capabilities.

All model calls go through the InsForge-provisioned OpenRouter key, never the direct OpenAI API. OpenRouter is OpenAI-compatible, so the OpenAI SDK works with a custom `baseURL`. The direct OpenAI account is unfunded and answers every call with `429 You have no credits remaining`.

### Structured JSON Response

```typescript
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const response = await openrouter.chat.completions.create({
  model: "openai/gpt-4o",
  response_format: { type: "json_object" },
  temperature: 0.3,
  messages: [
    {
      role: "system",
      content: "You are a job matching assistant. Return only valid JSON.",
    },
    {
      role: "user",
      content: `Your prompt here`,
    },
  ],
});

const result = JSON.parse(response.choices[0].message.content!);
```

### Quota and rate-limit handling (429)

A model call can fail with `429` — no credits left or the rate limit is hit. Catch it, log it, and return a readable message. Never let the `429` escape as an unhandled exception that crashes the agent function or the action that called it.

```typescript
try {
  const response = await openrouter.chat.completions.create({
    /* ... */
  });
  return {
    success: true,
    data: JSON.parse(response.choices[0].message.content!),
  };
} catch (error) {
  await logAgentError(runId, null, error);
  if (error instanceof OpenAI.APIError && error.status === 429) {
    return {
      success: false,
      error: "AI is temporarily over capacity. Please try again in a few minutes.",
    };
  }
  return {
    success: false,
    error: "Could not complete the AI request. Please try again.",
  };
}
```

**Temperature settings:**

- `0.3` — matching, scoring, extraction, research synthesis — deterministic results
- `0.7` — resume generation — natural variation

**Max tokens:**

- Job matching + scoring: `300`
- Company research synthesis: `800`
- Resume generation: `1000`
- Profile extraction from resume: `800`

**Rules:**

- Client always points at OpenRouter — `baseURL: 'https://openrouter.ai/api/v1'` with `process.env.OPENROUTER_API_KEY`. Never call the direct OpenAI API (`new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`) — that account is unfunded and returns `429 no credits remaining`
- Model string is always `'openai/gpt-4o'` (OpenRouter route prefix) — never `'gpt-4o'` or other model names
- Always catch `OpenAI.APIError` — on `status === 429` log it and return a readable "over capacity" message; never let the quota error escape the agent function or action
- Always use `response_format: { type: 'json_object' }` for structured data
- Always parse `response.choices[0].message.content` as string — even with json_object it returns a string
- Always validate parsed JSON before using — wrap in try/catch
- Match threshold is always `MATCH_THRESHOLD` from `lib/utils.ts` — never hardcode 70
- Company research synthesis must always return a complete dossier — never return empty even if browser research failed

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

This Next.js version (15.3+/16) initializes the browser client from a root-level `instrumentation-client.ts`, auto-loaded before the app hydrates — no `PostHogProvider` or root-layout wiring, and never combine the two approaches. Real env var is `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (not `NEXT_PUBLIC_POSTHOG_KEY`).

```typescript
// instrumentation-client.ts
import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: "/ingest", // same-origin, rewritten by next.config to PostHog's ingestion host
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
```

`next.config` rewrites `/ingest/static/*` and `/ingest/array/*` to `us-assets.i.posthog.com`, and `/ingest/*` to `us.i.posthog.com` — both asset and event paths must be proxied, not just one.

Any client component that needs to fire an event imports `posthog-js` directly (init already ran in `instrumentation-client.ts`):

```typescript
import posthog from "posthog-js";

posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1, // send immediately
      flushInterval: 0, // no batching — Next.js functions are short-lived
    });
  }
  return posthogClient;
}

// Singleton client — flush (not shutdown) after each capture in a request
const posthog = getPostHogClient();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.flush(); // required — ensures event is sent before the function returns
```

**Rules:**

- `getPostHogClient()` is a module-level singleton (not created per-call) — always `await posthog.flush()` after capturing, not `shutdown()`, since `shutdown()` would tear down the shared client
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId`/`distinctId` on every server-side event
- Call `posthog.identify({ distinctId, properties })` server-side after login (`actions/auth.ts`, the OAuth callback route); `components/auth/PostHogIdentify.tsx` re-identifies client-side on every page load when `RootLayout` (app/layout.tsx) finds an existing session — covers refreshes and new tabs where no sign-in action ever ran
- Call `posthog.reset()` on logout, client-side, before the sign-out Server Action is even dispatched (SignOutButton.tsx) — `signOut()` redirects server-side on success rather than returning, so code cannot reliably run after awaiting it
- Unexpected server-side exceptions in auth/agent boundaries: `posthog.captureExceptionImmediate(error, undefined, { $process_person_profile: false, boundary: "..." })`

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Resume PDF Generation

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: 'bold' },
  text: { fontSize: 10 },
})

const ResumePDF = ({ profile }: { profile: Profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{profile.fullName}</Text>
        <Text style={styles.text}>{profile.email}</Text>
      </View>
    </Page>
  </Document>
)

// Generate buffer
const buffer = await renderToBuffer(<ResumePDF profile={profile} />)

// Upload directly to InsForge Storage
await insforge.storage
  .from('resumes')
  .upload(`${userId}/resume.pdf`, buffer, {
    contentType: 'application/pdf',
    upsert: true
  })
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/resume/` routes
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- Always save public URL to DB after upload

---

## pdf-parse

**Check first:** Check AGENTS.md for an installed pdf-parse skill.

### Extract Text from Uploaded Resume

```typescript
import pdf from "pdf-parse";

// In API route handling resume upload
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("resume") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(buffer);
  const extractedText = pdfData.text; // raw text content

  // Send to GPT-4o for structured extraction
}
```

**Rules:**

- Server-side only — never import in client components
- `pdfData.text` is raw unformatted text — GPT-4o handles the structure extraction
- Always handle parse errors — some PDFs are image-based and return empty text
- If `pdfData.text` is empty or very short — return error to user: "Could not extract text from this PDF. Please try a different file."
