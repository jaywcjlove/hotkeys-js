export interface HotkeysEvent {
  key: string
  method: KeyHandler
  mods: number[]
  scope: string
  shortcut: string
}

export interface KeyHandler {
  (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent): void
}

export interface FilterEvent {
  target?: {
    tagName?: string
  }
  srcElement?: {
    tagName?: string
  }
}

type Options = {
  scope: string,
  element?: HTMLElement | null
}

interface Hotkeys {
  (key: string, callback: Function): void
  (key: string, scope: string, callback?: KeyHandler): void
  (key: string, scope: Options, callback?: KeyHandler): void

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
// https://github.com/eiriklv/react-masonry-component/issues/57
declare var hotkeys: Hotkeys
export default hotkeys;
