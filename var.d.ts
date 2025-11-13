declare const _keyMap: Record<string, number>;
declare const _modifier: Record<string, number>;
declare const modifierMap: Record<string | number, number | string>;
declare const _mods: Record<number, boolean>;
export interface Handler {
    keyup: boolean;
    keydown: boolean;
    scope: string;
    mods: number[];
    shortcut: string;
    method: KeyHandler;
    key: string;
    splitKey: string;
    element: HTMLElement | Document;
    keys?: number[];
}
export interface KeyHandler {
    (keyboardEvent: KeyboardEvent, hotkeysEvent: Handler): void | boolean;
}
declare const _handlers: Record<string | number, Handler[]>;
export { _keyMap, _modifier, modifierMap, _mods, _handlers };
