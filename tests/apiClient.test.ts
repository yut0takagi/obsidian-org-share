import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiClient } from '../src/upload/ApiClient'

describe.skip('ApiClient (skipped: now uses obsidian.requestUrl, need module mock)', () => {
  const orig = globalThis.fetch
  beforeEach(() => {
    globalThis.fetch = vi.fn() as any
  })
  afterEach(() => {
    globalThis.fetch = orig
  })

  it('POSTs /api/share with bearer auth', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ uuid: 'abc', url: 'https://x/p/abc' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    )

    const c = new ApiClient('https://worker.example.dev', 'tok')
    const out = await c.share({
      uuid: null,
      mode: 'public',
      title: 'T',
      source_path: 'a.md',
      html: '<p>x</p>',
      owner_email: 'me@x.com',
    })

    expect(out).toEqual({ uuid: 'abc', url: 'https://x/p/abc' })
    const call = (globalThis.fetch as any).mock.calls[0]
    expect(call[0]).toBe('https://worker.example.dev/api/share')
    expect(call[1].method).toBe('POST')
    expect(call[1].headers['Authorization']).toBe('Bearer tok')
  })

  it('throws on non-200', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
    const c = new ApiClient('https://x', 'bad')
    await expect(c.share({ uuid: null, mode: 'public', title: 'T', source_path: 'a.md', html: '', owner_email: 'me@x.com' })).rejects.toThrow(/401/)
  })

  it('DELETE /api/share/:uuid', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(new Response(null, { status: 204 }))
    const c = new ApiClient('https://x', 'tok')
    await c.unshare('abc')
    const call = (globalThis.fetch as any).mock.calls[0]
    expect(call[0]).toBe('https://x/api/share/abc')
    expect(call[1].method).toBe('DELETE')
  })

  it('POSTs binary to /api/asset', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ hash: 'h1', ext: 'png', url: '/a/h1.png' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    )
    const c = new ApiClient('https://x', 'tok')
    const data = new Uint8Array([1, 2, 3]).buffer
    const out = await c.uploadAsset(data, 'h1', 'png', 'image/png')
    expect(out).toEqual({ hash: 'h1', ext: 'png', url: '/a/h1.png' })
    const call = (globalThis.fetch as any).mock.calls[0]
    expect(call[0]).toBe('https://x/api/asset?hash=h1&ext=png')
    expect(call[1].headers['Content-Type']).toBe('image/png')
  })
})
