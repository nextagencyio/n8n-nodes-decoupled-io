# n8n Verified Node Submission — `n8n-nodes-decoupled-io`

This is the canonical text to submit when filling in n8n's verified-node application form
at <https://github.com/n8n-io/n8n/issues/new?template=community-node-verification.yml>.

Update version numbers, install counts, and contact email before submitting if more than
a few days have passed since this file was written.

---

## Form fields

### npm package name

```
n8n-nodes-decoupled-io
```

### npm package URL

```
https://www.npmjs.com/package/n8n-nodes-decoupled-io
```

### GitHub repo URL

```
https://github.com/nextagencyio/n8n-nodes-decoupled-io
```

### Node maintainer

```
Decoupled.io (https://decoupled.io)
Primary contact: hello@decoupled.io
GitHub: @nextagencyio
```

### Short description (1 line)

```
Read and write Drupal content via Decoupled.io — manage spaces, content,
and content types from any n8n workflow.
```

### Long description

```
n8n-nodes-decoupled-io is the official integration between n8n and
Decoupled.io, the AI-native headless CMS platform built on Drupal.

The package adds a single typed action node — Decoupled Drupal — with
ten operations across three resources:

  • Space: List, Get, Get Login Link, Get OAuth Credentials, Get Usage
  • Content: List (paginated), Get (by UUID), Import (bulk JSON)
  • Content Type: List, Describe (returns field schema)

Authentication is via Personal Access Tokens (PAT) issued from the
user's Decoupled.io dashboard. Tokens are encrypted at rest in n8n;
the credential test pings the Decoupled.io MCP server's tools/list
endpoint to validate before save.

All operations route through Decoupled.io's MCP server, which also
backs the dashboard UI — so the node inherits the same auth, RLS,
and rate limits the platform already enforces.

Async dropdowns ('loadOptions') for Space and Content Type let users
pick from real account data instead of typing UUIDs by hand. Selecting
a Space populates the Content Type dropdown for that space — the
typical pattern users expect from CMS integrations like Strapi or
Sanity, which our node convention follows.

The node is part of an active integration roadmap (Phase 2 adds a
webhook-based Trigger node, Taxonomy + Environment Tier resources,
and an AI Generate sub-node). The current Phase 1 scope is
intentionally narrow to ship cleanly and pass review.
```

### Why should this node be verified?

```
Decoupled.io is a managed Drupal-based headless CMS used by agencies and
in-house teams. n8n is the natural automation layer for content workflows
and our users have been asking for native integration. Verification means
n8n Cloud users can install in one click, which matters because most
of our agency customers either don't run their own n8n or aren't going
to leave Cloud to do so.

Quality posture:

- Phase 1 ships only the operations users need on day one — no half-built
  resources or hidden experimental flags.
- Strict TypeScript across the package; @n8n/community-nodes ESLint
  ruleset passes with no overrides.
- Credential test hits a JSON-returning endpoint (MCP tools/list) so
  failure surfaces as a clean "Authorization failed" instead of n8n's
  generic "invalid JSON" error.
- All HTTP calls go through n8n's httpRequestWithAuthentication helper —
  no custom retry/auth code, no leaked secrets in error logs.
- Strict mode enabled in package.json's n8n.strict field.
- Tested end-to-end against n8n 2.17.7 (the current Cloud release line);
  install via Settings → Community Nodes → drop into a workflow → connect
  with PAT → execute List spaces → returns real data from the user's
  account.
- Zero peer-installed dependencies that need native compilation
  (no isolated-vm, no sharp, no node-gyp churn).
- Published under MIT.

Roadmap commitment:

- Active maintenance from Decoupled.io's team (paid support).
- Roadmap visible at https://github.com/nextagencyio/decoupled-io/blob/main/docs/N8N-NODE-PLAN.md
  with concrete phasing for the Trigger node and remaining resources.
- Docs live at https://decoupled.io/docs/integrations/n8n with install
  walkthrough, three example workflows, and troubleshooting.
- We control the backend (mcp.decoupled.io) so the API surface won't
  drift away from the node — every n8n operation is a thin call to an
  MCP tool the dashboard also uses.
```

### Categories

Suggested category for n8n's directory: **Productivity** or **Communication** — the platform doesn't have a "Headless CMS" bucket today; "Productivity" fits with Notion, Airtable, etc.

### Default credential type to test against

```
Decoupled.io API
```

n8n's review can validate by:

1. Installing the node from npm via Settings → Community Nodes.
2. Opening any workflow → adding **Decoupled Drupal** node.
3. Creating a new **Decoupled.io API** credential — the test ping is
   safe to run with a fake `dc_tok_FAKE` token, which surfaces the
   correct "Authorization failed - please check your credentials"
   message (no JSON-parse junk, no console errors).
4. To exercise live data: a real PAT is needed. The maintainer can
   provide a sandbox PAT on request to <hello@decoupled.io>.

---

## Pre-submission checklist

Before opening the verification issue, confirm each:

- [ ] `npm view n8n-nodes-decoupled-io@latest` shows the version we're submitting
- [ ] `npm pack --dry-run` shows the published files are dist + LICENSE + README only (no source, no .map, no tsbuildinfo)
- [ ] README on GitHub renders correctly with install + usage instructions
- [ ] Docs page at <https://decoupled.io/docs/integrations/n8n> is live and accurate
- [ ] All credentials + nodes have icons (`*.svg` files exist next to their `.credentials.ts` / `.node.ts`)
- [ ] `npm run lint` passes with zero warnings/errors
- [ ] `npm run build` produces clean dist
- [ ] We've tested install in a fresh n8n container (Docker) end-to-end — install → add node → set credential → execute → see real data

---

## After submission

n8n's verification team typically responds in 1-3 weeks. Watch:

- The submission issue for review comments.
- Any required code changes — usually icon adjustments, lint compliance, or doc clarifications.

Approval makes the node appear in n8n Cloud's built-in integration directory with a verified badge. The npm version stays the same — verification is a metadata flag on n8n's side, not a republish.
