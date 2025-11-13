import { KeyHandler } from "./var";
/** Set or get the current scope (defaults to 'all') */
declare function setScope(scope: string): void;
/** Get the current scope */
declare function getScope(): string;
/** Get the key codes of the currently pressed keys */
declare function getPressedKeyCodes(): number[];
declare function getPressedKeyString(): string[];
interface KeyCodeInfo {
    scope: string;
    shortcut: string;
    mods: number[];
    keys: number[];
}
declare function getAllKeyCodes(): KeyCodeInfo[];
/** hotkey is effective only when filter return true */
declare function filter(event: KeyboardEvent): boolean;
/** Determine whether the pressed key matches a specific key, returns true or false */
declare function isPressed(keyCode: number | string): boolean;
/** Loop through and delete all handlers with the specified scope */
declare function deleteScope(scope?: string, newScope?: string): void;
interface UnbindInfo {
    key: string;
    scope?: string;
    method?: KeyHandler;
    splitKey?: string;
}
declare function unbind(keysInfo?: string | UnbindInfo | UnbindInfo[], ...args: any[]): void;
interface HotkeysOptions {
    scope?: string;
    element?: HTMLElement | Document;
    keyup?: boolean;
    keydown?: boolean;
    capture?: boolean;
    splitKey?: string;
    single?: boolean;
}
interface HotkeysInterface {
    (key: string, method: KeyHandler): void;
    (key: string, scope: string, method: KeyHandler): void;
    (key: string, option: HotkeysOptions, method: KeyHandler): void;
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    option?: boolean;
    control?: boolean;
    cmd?: boolean;
    command?: boolean;
    setScope: typeof setScope;
    getScope: typeof getScope;
    deleteScope: typeof deleteScope;
    getPressedKeyCodes: typeof getPressedKeyCodes;
    getPressedKeyString: typeof getPressedKeyString;
    getAllKeyCodes: typeof getAllKeyCodes;
    isPressed: typeof isPressed;
    filter: typeof filter;
    trigger: typeof trigger;
    unbind: typeof unbind;
    noConflict?: (deep?: boolean) => HotkeysInterface;
    keyMap: Record<string, number>;
    modifier: Record<string, number>;
    modifierMap: Record<string | number, number | string>;
}
declare function trigger(shortcut: string, scope?: string): void;
declare const _default: HotkeysInterface;
export default _default;
