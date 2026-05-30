import type { OrgShareSettings } from './types'

export const DEFAULT_SETTINGS: OrgShareSettings = {
  workerUrl: '',
  apiToken: '',
  ownerEmail: '',
  orgDomain: '',
  defaultExpiry: '7d',
  defaultMode: 'org',
}
