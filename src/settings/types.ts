export interface OrgShareSettings {
  workerUrl: string         // e.g., https://obsidian-org-share-worker.<sub>.workers.dev
  apiToken: string          // bearer token
  ownerEmail: string        // for meta
  orgDomain: string         // default org domain for org-mode (e.g., example.com)
  defaultExpiry: '1d' | '7d' | '30d' | 'never'
  defaultMode: 'org' | 'list' | 'public'
}
