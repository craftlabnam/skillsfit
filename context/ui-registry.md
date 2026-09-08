# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

`components/layout/Navbar.tsx`

Full-width `bg-surface border-b border-border h-16` header, inner content `max-w-[1440px] mx-auto px-6 flex items-center justify-between`. Logo is `/logo.png` via `next/image` at `h-8 w-auto`. Nav links (Dashboard, Find Jobs, Profile) — inactive: `text-sm font-medium text-text-secondary hover:text-accent`; active (current route, via `usePathname()` from `next/navigation`): `text-sm font-medium text-accent`, no underline, per ui-rules.md's Navbar spec. CTA — dark button `bg-overlay-dark text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-text-primary`.

Takes an optional `signedIn` prop (default `false`). When `true`, the right-hand CTA slot swaps from the "Start for free" `Link` to `SignOutButton` — same nav links either side, no other change. Used with `signedIn` on the three protected placeholder pages below; the marketing homepage still passes only `ctaHref` (its own signed-in-vs-signed-out branching is a separate, pre-existing concern — see `app/page.tsx`).

### Footer

`components/layout/Footer.tsx`

`bg-surface border-t border-border`, inner `max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between`. Same logo treatment as Navbar at `h-7`. Links — `text-sm font-medium text-text-secondary hover:text-accent`.

### Hero

`components/homepage/Hero.tsx`

Gradient card — `hero-gradient rounded-2xl px-8 py-20 text-center` (see `.hero-gradient` utility in `globals.css`, built from `--color-info-light`, `--color-accent-light`, `--color-accent-muted` radial gradients — no hardcoded hex). Headline `text-4xl md:text-5xl font-bold text-text-primary`. Primary CTA — dark button (`bg-overlay-dark`) with `lucide-react` `ArrowRight` icon. Secondary CTA — `bg-surface border border-border text-text-primary`. Dashboard preview image (`/images/dashboard-demo.png`) overlaps the card with `-mt-10 md:-mt-16`.

### Features

`components/homepage/Features.tsx`

Two alternating `grid md:grid-cols-2 gap-12 items-center` sections inside `max-w-[1440px] mx-auto px-6 py-20`. Feature list item — `text-base font-semibold text-text-primary` title + `text-sm text-text-secondary` description. First section wraps the whole list in a rail: `border-l-2 border-accent pl-6`. Second section highlights only the primary item with `border-l-2 border-accent pl-4`. Showcase images (`jobs-lists.png`, `agnet-log.png`) sit in `rounded-2xl border border-border bg-surface p-2 shadow-sm` frames.

### Testimonial

`components/homepage/Testimonial.tsx`

Centered `max-w-2xl mx-auto text-center`. Eyebrow label `text-xs font-semibold tracking-wide text-accent uppercase`. Quote `text-2xl font-medium text-text-primary`. Avatar — `size-10 rounded-full object-cover` using `/images/user-icon.png`.

### CTA

`components/homepage/CTA.tsx`

Same `hero-gradient rounded-2xl px-8 py-20 text-center` treatment and button pair as Hero. Reused at the bottom of the homepage.

Both Hero and CTA (and Navbar's "Start for free") now take an optional `ctaHref` prop, computed once server-side in `app/page.tsx` via `createInsforgeServer().auth.getCurrentUser()` — `/dashboard` if signed in, `/login` (the default) otherwise.

### OAuthButtons

`components/auth/OAuthButtons.tsx`

`"use client"` — calls the `signInWithOAuth` Server Action (`actions/auth.ts`) directly via `onClick` + `useTransition` rather than a plain `<form action>`, since the action returns `{ success, error }` per code-standards.md's Server Action convention and plain form actions require a void-returning function. Google only (GitHub button removed by direct request — the backend provider itself is untouched, `signInWithOAuth(provider)` still accepts `"github"`, just nothing calls it). Full-width button: `bg-surface border border-border rounded-md px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`, inline Google SVG using the `--color-google-*` tokens in globals.css (a fixed 4-color trademark, not a themeable color, but still tokenized rather than hardcoded — same treatment as `--color-linkedin`) + label. Button text swaps to "Redirecting…" while pending. Inline error text below on failure: `text-sm text-error text-center`.

**Pattern:** every clickable `<button>` in this project (not `<Link>` — those already get a pointer cursor natively) uses `cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`. Match this on any future button.

### EmailPasswordForm

`components/auth/EmailPasswordForm.tsx`

`"use client"` — same `onClick`/`useTransition` pattern as OAuthButtons, calling the `signInWithPassword` Server Action. Stacked `flex flex-col gap-3`. Each field: `text-sm font-medium text-text-secondary mb-1` label above a `rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent` input (ui-rules.md Form Inputs spec) with `autoComplete="email"` / `"current-password"`. Submit is the primary button treatment: `bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-accent-dark cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`, full width, text swaps to "Signing in…" while pending. Sign-in only — no sign-up form exists. The Server Action itself validates email format/non-empty password before calling InsForge — not just the browser's `required`/`type="email"`.

### SignOutButton

`components/auth/SignOutButton.tsx`

`"use client"` — same `onClick`/`useTransition` pattern as OAuthButtons/EmailPasswordForm, calling the `signOut` Server Action (`actions/auth.ts`). Secondary button treatment (not primary — sign-out isn't the page's main action): `bg-surface border border-border rounded-md px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`. Text swaps to "Signing out…" while pending. Inline error text below on failure: `text-sm text-error text-center`. Rendered inside `Navbar` when `signedIn` is true (its CTA slot) — not placed directly on the three protected placeholder pages below, so there's exactly one sign-out control per page.

### Protected placeholder pages (Dashboard, Profile, Find Jobs)

`app/dashboard/page.tsx`, `app/profile/page.tsx`, `app/find-jobs/page.tsx`

Minimal stand-ins until each page's real feature lands (Phase 2/3/5 in build-plan.md). All three share one layout, independently duplicated per file rather than factored into a shared component — each will diverge completely once its real UI is built, so a shared placeholder would just be deleted piecemeal later. `<Navbar signedIn />` at the top (full-width, matches every other page in the app), then `main` — `flex-1 flex items-center justify-center bg-background px-6 py-12` wrapper, centered `max-w-sm` card: standard Card treatment (`rounded-2xl border border-border bg-surface p-6` + the login page's shadow value) containing the page title (`text-lg font-semibold text-text-primary`, matching the login card's "Welcome" heading style) and a `Coming soon.` subtitle (`text-sm text-text-secondary`). No logo or Sign Out button inside the card — the Navbar already provides both. Access is gated entirely by `proxy.ts` (already covers these three paths and their subpaths) — no auth check duplicated in the page itself, per code-standards.md's "scope is sacred."

### Login page

`app/(auth)/login/page.tsx`

Two-column `grid md:grid-cols-2`, no Navbar/Footer. Left panel (`hero-gradient`, always rendered — not `hidden` below `md`, so it stacks above the card on mobile instead of disappearing from the DOM/accessibility tree; that matters because it holds the page's only `<h1>`): heading `text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary max-w-md` + supporting copy `mt-4 text-text-secondary max-w-md`, padding scales `px-6 md:px-12 lg:px-20 py-12 md:py-20`. Right panel: centered single card on `bg-background`, standard ui-rules.md Card treatment (`rounded-2xl border border-border bg-surface p-6` + standard shadow — `p-6` per spec, not `p-8`). Logo linked to `/`, `h-8 w-auto`, centered above the card with `mb-8`. Card heading `text-lg font-semibold text-text-primary` reads "Welcome" (not "Welcome back"), subtitle `text-sm text-text-secondary`, both centered. `EmailPasswordForm` sits above an `or` divider (`h-px flex-1 bg-border` either side of `text-xs text-text-muted`), then `OAuthButtons` below. No design mockup exists for this page (only landing-page/dashboard/find-jobs/job-details/profile have one) — built directly from ui-tokens.md/ui-rules.md conventions.
