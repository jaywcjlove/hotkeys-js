declare const _default: HotkeysInterface;
export default _default;

/** Loop through and delete all handlers with the specified scope */
declare function deleteScope(scope?: string, newScope?: string): void;

/** hotkey is effective only when filter return true */
declare function filter(event: KeyboardEvent): boolean;

declare function getAllKeyCodes(): KeyCodeInfo[];

/** Get the key codes of the currently pressed keys */
declare function getPressedKeyCodes(): number[];

declare function getPressedKeyString(): string[];

/** Get the current scope */
declare function getScope(): string;

export declare interface HotkeysHandler {
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

declare interface HotkeysInterface {
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

declare interface HotkeysOptions {
    scope?: string;
    element?: HTMLElement | Document;
    keyup?: boolean;
    keydown?: boolean;
    capture?: boolean;
    splitKey?: string;
    single?: boolean;
}

/** Determine whether the pressed key matches a specific key, returns true or false */
declare function isPressed(keyCode: number | string): boolean;

declare interface KeyCodeInfo {
    scope: string;
    shortcut: string;
    mods: number[];
    keys: number[];
}

export declare interface KeyHandler {
    (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysHandler): void | boolean;
}

/** Set or get the current scope (defaults to 'all') */
declare function setScope(scope: string): void;

declare function trigger(shortcut: string, scope?: string): void;

declare function unbind(keysInfo?: string | UnbindInfo | UnbindInfo[], ...args: any[]): void;

declare interface UnbindInfo {
    key: string;
    scope?: string;
    method?: KeyHandler;
    splitKey?: string;
}

export { }
