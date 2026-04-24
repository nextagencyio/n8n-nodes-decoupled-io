# n8n-nodes-decoupled-io

[n8n](https://n8n.io) community node for [Decoupled.io](https://decoupled.io) — read and write Drupal content, manage spaces and environment tiers, and trigger workflows from content events.

> **Status: v0.1 (community).** Phase 1 ships **Space**, **Content**, and **Content Type** resources. Trigger node, Taxonomy, Environment Tier, AI Generate, and Visual Editor sub-nodes are tracked in [docs/N8N-NODE-PLAN.md](https://github.com/nextagencyio/decoupled-io/blob/main/docs/N8N-NODE-PLAN.md) on the Decoupled.io repo.

## Operations (v0.1)

**Space**
- List, Get, Get Login Link, Get OAuth Credentials, Get Usage

**Content**
- List (by content type, paginated), Get (by UUID), Import (bulk JSON)

**Content Type**
- List, Describe (returns field schema)

## Install

In your n8n instance:

1. **Settings → Community Nodes → Install**
2. Enter `n8n-nodes-decoupled-io`
3. Accept the risk acknowledgement and install

After install you'll see **Decoupled Drupal** in the workflow editor's node picker.

## Credentials

Create a Personal Access Token at [dashboard.decoupled.io → Settings → API Tokens](https://dashboard.decoupled.io/organization/tokens) (format `dc_tok_...`).

In n8n, create a new credential of type **Decoupled.io API**, paste the token, and save. The credential test pings `/api/users/me` to verify.

Self-hosted dashboards / staging environments can override the dashboard and MCP URLs in the credential's advanced fields.

## Example workflows

### 1. Slack notification on publish

```
[Decoupled Drupal Trigger]  →  [Slack: Send message]
  event: content.published       channel: #content
  space: Acme Marketing          text: "📝 Just published: {{ $json.title }}"
```

(Trigger node ships in v0.2 — for now, use a Cron + List Content workflow as a placeholder.)

### 2. AI summary back to Drupal

```
[Cron: every 30 min]  →  [Decoupled: List content]  →  [OpenAI: Summarize body]  →  [Decoupled: Import]
  hourly                  type: article                                              update existing nodes
                          limit: 10
```

### 3. Daily content digest

```
[Cron: 9am daily]  →  [Decoupled: List content]  →  [Function: Format]  →  [Email]
                       type: blog_post
                       updated >= 24h ago
```

## Development

```bash
git clone https://github.com/nextagencyio/n8n-nodes-decoupled-io
cd n8n-nodes-decoupled-io
npm install
npm run build
npm run dev   # spins up a local n8n with this node hot-reloaded
```

## License

MIT — see LICENSE.md.
