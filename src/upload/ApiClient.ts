import { requestUrl } from 'obsidian'

export type ShareMode = 'org' | 'list' | 'public'

export interface ShareRequest {
  uuid: string | null
  mode: ShareMode
  audience?: string[]
  expires_at?: string | null
  title: string
  source_path: string
  html: string
  owner_email: string
}

export interface ShareResponse {
  uuid: string
  url: string
}

export interface AssetResponse {
  hash: string
  ext: string
  url: string
}

export class ApiClient {
  constructor(private workerUrl: string, private token: string) {}

  async share(req: ShareRequest): Promise<ShareResponse> {
    const res = await requestUrl({
      url: `${this.workerUrl}/api/share`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
      throw: false,
    })
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`share failed: ${res.status} ${res.text}`)
    }
    return JSON.parse(res.text) as ShareResponse
  }

  async unshare(uuid: string): Promise<void> {
    const res = await requestUrl({
      url: `${this.workerUrl}/api/share/${uuid}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` },
      throw: false,
    })
    if (res.status >= 300 && res.status !== 404) {
      throw new Error(`unshare failed: ${res.status}`)
    }
  }

  async uploadAsset(body: ArrayBuffer, hash: string, ext: string, contentType: string): Promise<AssetResponse> {
    const res = await requestUrl({
      url: `${this.workerUrl}/api/asset?hash=${encodeURIComponent(hash)}&ext=${encodeURIComponent(ext)}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': contentType,
      },
      body,
      throw: false,
    })
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`asset failed: ${res.status} ${res.text}`)
    }
    return JSON.parse(res.text) as AssetResponse
  }
}
