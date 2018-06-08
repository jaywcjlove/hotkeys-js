// Type definitions for hotkeys v3.3.3
// Project: https://github.com/jaywcjlove/hotkeys
// Definitions by: Eager Wei <https://github.com/weidapao>

interface HotkeysEvent {
  key: string
  method: KeyHandler
  mods: number[]
  scope: string
  shortcut: string
}

interface KeyHandler {
  (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent): void
}

interface FilterEvent {
  target?: {
    tagName?: string
  }
  srcElement?: {
    tagName?: string
  }
}

interface Hotkeys {
  (key: string, callback: KeyHandler): void
  (key: string, scope: string, callback: KeyHandler): void

  shift: boolean
  ctrl: boolean
  alt: boolean
  option: boolean
  control: boolean
  cmd: boolean
  command: boolean

  setScope(scopeName: string): void
  getScope(): string
  deleteScope(scopeName: string): void

  noConflict(): void

  unbind(key: string): void
  unbind(key: string, scopeName: string): void

  isPressed(keyCode: number): boolean
  isPressed(keyCode: string): boolean
  getPressedKeyCodes(): number[]

  filter(event: FilterEvent): boolean
}

declare var hotkeys: Hotkeys

declare module 'hotkeys-js' {
  export = hotkeys
}
