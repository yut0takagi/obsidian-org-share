import { App, PluginSettingTab, Setting } from 'obsidian'
import type OrgSharePlugin from '../../main'

export class OrgShareSettingsTab extends PluginSettingTab {
  plugin: OrgSharePlugin

  constructor(app: App, plugin: OrgSharePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    containerEl.createEl('h2', { text: 'Org Share' })

    new Setting(containerEl)
      .setName('Worker URL')
      .setDesc('Your deployed Cloudflare Worker base URL (no trailing slash).')
      .addText((text) =>
        text
          .setPlaceholder('https://obsidian-org-share-worker.example.workers.dev')
          .setValue(this.plugin.settings.workerUrl)
          .onChange(async (value) => {
            this.plugin.settings.workerUrl = value.replace(/\/$/, '')
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('API Token')
      .setDesc('Bearer token configured via `wrangler secret put API_TOKEN`.')
      .addText((text) => {
        text.inputEl.type = 'password'
        text
          .setPlaceholder('hex-encoded secret')
          .setValue(this.plugin.settings.apiToken)
          .onChange(async (value) => {
            this.plugin.settings.apiToken = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('Your email (owner)')
      .setDesc('Recorded in note metadata.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.ownerEmail)
          .onChange(async (value) => {
            this.plugin.settings.ownerEmail = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Organization domain')
      .setDesc('Used by "Org-wide" mode.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.orgDomain)
          .onChange(async (value) => {
            this.plugin.settings.orgDomain = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Default expiry')
      .addDropdown((d) =>
        d
          .addOption('1d', '1 day')
          .addOption('7d', '7 days')
          .addOption('30d', '30 days')
          .addOption('never', 'Never')
          .setValue(this.plugin.settings.defaultExpiry)
          .onChange(async (value) => {
            this.plugin.settings.defaultExpiry = value as any
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Default mode')
      .addDropdown((d) =>
        d
          .addOption('org', 'Org-wide')
          .addOption('list', 'Specific people')
          .addOption('public', 'Public link')
          .setValue(this.plugin.settings.defaultMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultMode = value as any
            await this.plugin.saveSettings()
          }),
      )
  }
}
