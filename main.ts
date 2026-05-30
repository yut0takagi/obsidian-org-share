import { Plugin, MarkdownView } from 'obsidian'
import { DEFAULT_SETTINGS } from './src/settings/defaults'
import type { OrgShareSettings } from './src/settings/types'
import { OrgShareSettingsTab } from './src/settings/SettingsTab'
import { shareNoteCommand } from './src/commands/shareNote'
import { copyShareUrlCommand } from './src/commands/copyShareUrl'
import { stopSharingCommand } from './src/commands/stopSharing'

export default class OrgSharePlugin extends Plugin {
  settings!: OrgShareSettings

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new OrgShareSettingsTab(this.app, this))

    const activeFile = () => this.app.workspace.getActiveViewOfType(MarkdownView)?.file ?? null

    this.addCommand({
      id: 'share-this-note',
      name: 'Share this note',
      checkCallback: (checking) => {
        const file = activeFile()
        if (!file) return false
        if (checking) return true
        shareNoteCommand(this.app, this.settings, file)
        return true
      },
    })

    this.addCommand({
      id: 'copy-share-url',
      name: 'Copy share URL',
      checkCallback: (checking) => {
        const file = activeFile()
        if (!file) return false
        if (checking) return true
        copyShareUrlCommand(this.app, file)
        return true
      },
    })

    this.addCommand({
      id: 'stop-sharing',
      name: 'Stop sharing',
      checkCallback: (checking) => {
        const file = activeFile()
        if (!file) return false
        if (checking) return true
        stopSharingCommand(this.app, this.settings, file)
        return true
      },
    })

    this.addRibbonIcon('share', 'Share this note', () => {
      shareNoteCommand(this.app, this.settings, activeFile())
    })

    console.log('[org-share] loaded')
  }

  async onunload() {
    console.log('[org-share] unloaded')
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
