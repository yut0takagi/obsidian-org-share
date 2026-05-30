# Org Share — Obsidian plugin

Share notes from your Obsidian vault to a Cloudflare Access-gated URL with three audience modes (Org / Allowlist / Public).

## Setup

1. Deploy the companion worker (see [obsidian-org-share-worker](https://github.com/yut0takagi/obsidian-org-share-worker)).
2. Plugin Settings → Org Share → fill in:
   - Worker URL (e.g. `https://obsidian-org-share-worker.<sub>.workers.dev`)
   - API Token (the secret you set via `wrangler secret put API_TOKEN`)
   - Your email
   - Org domain (default: `cyberagent.co.jp`)
3. Open any note → Command palette → **Share this note**.

## Commands

| Command | What it does |
|---|---|
| **Share this note** | Opens modal to pick audience mode (Org / Specific people / Public) + expiry. Uploads, returns URL. |
| **Copy share URL** | Copies the share URL of the current note. |
| **Stop sharing** | Un-publishes the current note (404 from now on). |

## Audience modes

| Mode | Who can view |
|---|---|
| **Org-wide** | Anyone signed in with an email matching your configured org domain. |
| **Specific people** | Only emails you explicitly list in the modal. |
| **Public link** | Anyone with the URL. No login required. |

## Status

P1 MVP — personal BYO use only. Design: `開発計画/superpowers/specs/2026-05-30-org-share-plugin-design.md`. Plan: `開発計画/superpowers/plans/2026-05-30-org-share-plugin.md`.

## License

MIT
