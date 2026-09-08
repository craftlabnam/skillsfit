# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for SkillsFit: Session Replay, Error Tracking, and Support were enabled, along with health, error, and support signal sources. The scout troop and two Replay Vision monitors are armed; findings will begin appearing in the [Self-driving inbox](https://us.posthog.com/project/577183/inbox) within about 30 minutes after data arrives.

## AI data processing

Approved by the wizard's organization-level gate.

## GitHub

GitHub was already connected before this setup. GitHub Issues was not selected for Self-driving ingestion in this run.

## Products enabled

| Product | Result | Client check |
| --- | --- | --- |
| Session Replay | enabled | Web initialization does not disable recording. |
| Error Tracking | enabled | Web initialization explicitly enables exception capture. |
| Support (Conversations) | enabled | Requires an inbound email, inbox, or Slack channel before tickets can arrive. |

## Signal sources

| Source product | Source type | Action |
| --- | --- | --- |
| `signals_scout` | `cross_source_issue` | Enabled by default; no opt-out configuration was created. |
| `health_checks` | `health_issue` | Enabled (`01a07285-f759-74ba-97a1-1b97c525d1cf`). |
| `error_tracking` | `issue_created` | Enabled (`01a07285-f719-714a-ad7a-00dc3b03e640`). |
| `error_tracking` | `issue_reopened` | Enabled (`01a07285-f6d6-70cb-ae75-fa9198218fc2`). |
| `error_tracking` | `issue_spiking` | Enabled (`01a07285-f6e3-76e8-8cd4-9930424c8761`). |
| `conversations` | `ticket` | Enabled (`01a07285-f78e-7344-b965-e5b14d970cd5`). |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped; this retired responder is replaced by Replay Vision scanners. |

## Connected tools

No connected tools were selected in the issue-tracker picker. No warehouse-backed responders were added.

## Scout troop

**Budget:** 100 runs/day, 0 used today, 100 remaining. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

| Status | Scouts | Reason |
| --- | --- | --- |
| Enabled | `general` | Cross-product patterns and otherwise-unowned surfaces. |
| Enabled | `product-analytics` | Core product-flow monitoring for this web application. |
| Enabled | `web-analytics` | Traffic, attribution, landing-page, and channel-health monitoring. |
| Enabled | `health-checks` | Prioritizes actionable PostHog configuration health issues. |
| Disabled | `ai-observability`, `apm`, `conversations`, `csp-violations`, `customer-analytics`, `data-pipelines`, `data-warehouse`, `experiments`, `feature-flags`, `insight-alerts`, `logs`, `mcp-tool-calls`, `revenue-analytics`, `skills-store`, `surveys`, `tasks`, `web-vitals` | No evidence these surfaces are currently active; enable a matching scout if the product adopts that surface. |
| Disabled | `anomaly-detection`, `observability-gaps`, `inbox-validation`, `replay-vision` | Kept selective at this early stage; general monitoring and the configured responders cover the immediate needs. |
| Disabled | `error-tracking` | Covered by the enabled native Error Tracking responder. |
| Disabled | `session-replay` | Covered by the Replay Vision scanners below. |

Four scouts are active and 23 remain disabled, keeping the troop well below the ten-scout quality ceiling.

## Custom scouts

No custom scouts were created. A focused sign-in reliability scout was proposed because `components/auth/EmailPasswordForm.tsx` and `components/auth/OAuthButtons.tsx` capture sign-in attempts and failures; it was declined.

The planned job-search and company-research flows were considered but not proposed as runnable custom scouts because their domain events are documented for later implementation rather than confirmed by the available project data. Generic auth, error, replay, and web health remain covered by the active troop and native routes.

If a future custom scout becomes noisy, set its config’s `emit` value to `false` in PostHog to leave it running in dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes verified findings to the inbox. These are the only objects in this setup that spend Replay Vision quota; each finding starts at half weight and needs corroboration before promotion into a report.

| Status | Scanner | Scope | Sampling | Estimate |
| --- | --- | --- | --- | --- |
| Created | SkillsFit job search breakage | Sessions visiting `/find-jobs`, the job discovery and evaluation completion flow; watches search results, match scores, job details, and company research for visible breakage. | 0.5 | 0 observations and 0 credits/month. |
| Created | SkillsFit user frustration | Sessions with a `$rageclick`; watches repeated attempts around job search, filters, job details, research, and profile/resume actions. | 1.0 | 0 observations and 0 credits/month. |

Both scanners emit to Self-driving. There were no recordings at setup time, so they are armed and will start processing automatically once recordings arrive. The organization currently has 2,500 Replay Vision credits remaining and is not exhausted.

## Follow-ups

- [ ] Connect a Support inbound channel (email, inbox, or Slack) in PostHog so the enabled Support responder can receive tickets.
- [ ] Generate production or test browser sessions after deployment so Session Replay and the two Replay Vision monitors receive recordings.
- [ ] As job discovery, profile, resume, and company-research features are implemented, confirm their planned PostHog event taxonomy is captured; this will make a job-search reliability scout viable if desired.
- [ ] Optionally reauthorize the PostHog MCP connection with `property_definition:read` to allow direct event-taxonomy verification; the project profile was not yet built during setup.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Scout runs draw from the daily run budget, findings cluster into reports in the inbox, and immediately actionable reports can begin coding tasks.

## Files modified or created

- Created `posthog-self-driving-report.md`.
- No application source files were modified.
