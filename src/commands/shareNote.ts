import { App, Notice, TFile, MarkdownView } from 'obsidian'
import { ApiClient } from '../upload/ApiClient'
import { ImageUploader } from '../upload/ImageUploader'
import { markdownToHtml } from '../render/markdownToHtml'
import { renderFullHtml } from '../render/template'
import { expiryToIso } from '../util/expiry'
import { parseShareMeta, applyShareMeta, type ShareMeta } from '../frontmatter/shareMeta'
import { ShareModal } from '../ui/ShareModal'
import { SharedStatusModal } from '../ui/SharedStatusModal'
import type { OrgShareSettings } from '../settings/types'

export async function shareNoteCommand(app: App, settings: OrgShareSettings, file: TFile | null): Promise<void> {
  if (!file) {
    new Notice('No active note')
    return
  }
  if (!settings.workerUrl || !settings.apiToken) {
    new Notice('Configure Worker URL and API Token in plugin settings first')
    return
  }

  const content = await app.vault.read(file)
  const existing = parseShareMeta(content)

  if (existing) {
    new SharedStatusModal(app, existing, {
      onUpdate: () => runShareFlow(app, settings, file, existing),
      onStop: () => stopSharing(app, settings, file, existing),
    }).open()
    return
  }

  await runShareFlow(app, settings, file, null)
}

async function runShareFlow(app: App, settings: OrgShareSettings, file: TFile, existing: ShareMeta | null): Promise<void> {
  const modal = new ShareModal(app, {
    mode: existing?.mode || settings.defaultMode,
    expiry: settings.defaultExpiry,
    orgDomain: settings.orgDomain,
  })
  const result = await modal.open()
  if (!result) return

  const notice = new Notice('Sharing…', 0)

  try {
    const api = new ApiClient(settings.workerUrl, settings.apiToken)
    const uploader = new ImageUploader(app, api)

    const raw = await app.vault.read(file)
    const bodyHtml = markdownToHtml(raw)
    const imgMap = await uploader.uploadImagesIn(bodyHtml, file.path)
    const bodyWithImages = ImageUploader.rewriteImageSrcs(bodyHtml, imgMap)

    const titleMatch = raw.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : file.basename

    const html = renderFullHtml({
      title,
      bodyHtml: bodyWithImages,
      ownerName: settings.ownerEmail.split('@')[0] || 'Anonymous',
      createdAt: new Date().toISOString(),
      expiresAt: expiryToIso(result.expiry),
    })

    const response = await api.share({
      uuid: existing?.uuid || null,
      mode: result.mode,
      audience: result.audience,
      expires_at: expiryToIso(result.expiry),
      title,
      source_path: file.path,
      html,
      owner_email: settings.ownerEmail,
    })

    const newMeta: ShareMeta = {
      uuid: response.uuid,
      mode: result.mode,
      url: response.url,
      updated_at: new Date().toISOString(),
    }
    const updated = applyShareMeta(raw, newMeta)
    await app.vault.modify(file, updated)

    notice.hide()
    new Notice(`Shared: ${response.url}`, 5000)
    await navigator.clipboard.writeText(response.url)
  } catch (e: any) {
    notice.hide()
    new Notice(`Share failed: ${e.message}`)
    console.error('[org-share]', e)
  }
}

async function stopSharing(app: App, settings: OrgShareSettings, file: TFile, meta: ShareMeta): Promise<void> {
  const notice = new Notice('Stopping…', 0)
  try {
    const api = new ApiClient(settings.workerUrl, settings.apiToken)
    await api.unshare(meta.uuid)
    const raw = await app.vault.read(file)
    const { removeShareMeta } = await import('../frontmatter/shareMeta')
    await app.vault.modify(file, removeShareMeta(raw))
    notice.hide()
    new Notice('Stopped sharing')
  } catch (e: any) {
    notice.hide()
    new Notice(`Stop failed: ${e.message}`)
  }
}
