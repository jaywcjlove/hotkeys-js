declare const _default: HotkeysInterface;
export default _default;

declare type DeleteScope = (scope?: string, newScope?: string) => void;

declare type Filter = (event: KeyboardEvent) => boolean;

declare type GetAllKeyCodes = () => KeyCodeInfo[];

declare type GetPressedKeyCodes = () => number[];

declare type GetPressedKeyString = () => string[];

declare type GetScope = () => string;

declare interface HotkeysAPI {
    /**
     * Use the `hotkeys.setScope` method to set scope. There can only be one active scope besides 'all'.  By default 'all' is always active.
     *
     * ```js
     * // Define shortcuts with a scope
     * hotkeys('ctrl+o, ctrl+alt+enter', 'issues', function() {
     *   console.log('do something');
     * });
     * hotkeys('o, enter', 'files', function() {
     *   console.log('do something else');
     * });
     *
     * // Set the scope (only 'all' and 'issues' shortcuts will be honored)
     * hotkeys.setScope('issues'); // default scope is 'all'
     * ```
     */
    setScope: SetScope;
    /**
     * Use the `hotkeys.getScope` method to get scope.
     *
     * ```js
     * hotkeys.getScope();
     * ```
     */
    getScope: GetScope;
    /**
     * Use the `hotkeys.deleteScope` method to delete a scope. This will also remove all associated hotkeys with it.
     *
     * ```js
     * hotkeys.deleteScope('issues');
     * ```
     * You can use second argument, if need set new scope after deleting.
     *
     * ```js
     * hotkeys.deleteScope('issues', 'newScopeName');
     * ```
     */
    deleteScope: DeleteScope;
    /**
     * Returns an array of key codes currently pressed.
     *
     * ```js
     * hotkeys('command+ctrl+shift+a,f', function() {
     *   console.log(hotkeys.getPressedKeyCodes()); //=> [17, 65] or [70]
     * })
     * ```
     */
    getPressedKeyCodes: GetPressedKeyCodes;
    /**
     * Returns an array of key codes currently pressed.
     *
     * ```js
     * hotkeys('command+ctrl+shift+a,f', function() {
     *   console.log(hotkeys.getPressedKeyString()); //=> ['⌘', '⌃', '⇧', 'A', 'F']
     * })
     * ```
     */
    getPressedKeyString: GetPressedKeyString;
    /**
     * Get a list of all registration codes.
     *
     * ```js
     * hotkeys('command+ctrl+shift+a,f', function() {
     *   console.log(hotkeys.getAllKeyCodes());
     *   // [
     *   //   { scope: 'all', shortcut: 'command+ctrl+shift+a', mods: [91, 17, 16], keys: [91, 17, 16, 65] },
     *   //   { scope: 'all', shortcut: 'f', mods: [], keys: [42] }
     *   // ]
     * })
     * ```
     *
     */
    getAllKeyCodes: GetAllKeyCodes;
    isPressed: IsPressed;
    /**
     * By default hotkeys are not enabled for `INPUT` `SELECT` `TEXTAREA` elements.
     * `Hotkeys.filter` to return to the `true` shortcut keys set to play a role,
     * `false` shortcut keys set up failure.
     *
     * ```js
     * hotkeys.filter = function(event){
     *   return true;
     * }
     * //How to add the filter to edit labels. <div contentEditable="true"></div>
     * //"contentEditable" Older browsers that do not support drops
     * hotkeys.filter = function(event) {
     *   var target = event.target || event.srcElement;
     *   var tagName = target.tagName;
     *   return !(target.isContentEditable || tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
     * }
     *
     * hotkeys.filter = function(event){
     *   var tagName = (event.target || event.srcElement).tagName;
     *   hotkeys.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other');
     *   return true;
     * }
     * ```
     */
    filter: Filter;
    /**
     * trigger shortcut key event
     *
     * ```js
     * hotkeys.trigger('ctrl+o');
     * hotkeys.trigger('ctrl+o', 'scope2');
     * ```
     */
    trigger: Trigger;
    /**
     * Unbinds a shortcut key event.
     *
     * ```js
     * hotkeys.unbind('ctrl+o');
     * hotkeys.unbind('ctrl+o', 'scope1');
     * hotkeys.unbind('ctrl+o', 'scope1', method);
     * hotkeys.unbind('ctrl+o', method);
     * ```
     */
    unbind: Unbind;
    /**
     * Relinquish HotKeys’s control of the `hotkeys` variable.
     *
     * ```js
     * var k = hotkeys.noConflict();
     * k('a', function() {
     *   console.log("do something")
     * });
     *
     * hotkeys()
     * // -->Uncaught TypeError: hotkeys is not a function(anonymous function)
     * // @ VM2170:2InjectedScript._evaluateOn
     * // @ VM2165:883InjectedScript._evaluateAndWrap
     * // @ VM2165:816InjectedScript.evaluate @ VM2165:682
     * ```
     */
    noConflict: NoConflict;
    keyMap: Record<string, number>;
    modifier: Record<string, number>;
    modifierMap: Record<string | number, number | string>;
}

export declare interface HotkeysEvent {
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

declare interface HotkeysInterface extends HotkeysAPI {
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

declare interface IsPressed {
    /** For example, `hotkeys.isPressed(77)` is true if the `M` key is currently pressed. */
    (keyCode: number): boolean;
    /** For example, `hotkeys.isPressed('m')` is true if the `M` key is currently pressed. */
    (keyCode: string): boolean;
}

declare interface KeyCodeInfo {
    scope: string;
    shortcut: string;
    mods: number[];
    keys: number[];
}

export declare interface KeyHandler {
    (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent): void | boolean;
}

declare type NoConflict = (deep?: boolean) => HotkeysInterface;

declare type SetScope = (scope: string) => void;

declare type Trigger = (shortcut: string, scope?: string) => void;

declare interface Unbind {
    (key?: string): void;
    (keysInfo: UnbindInfo): void;
    (keysInfo: UnbindInfo[]): void;
    (key: string, scopeName: string): void;
    (key: string, scopeName: string, method: KeyHandler): void;
    (key: string, method: KeyHandler): void;
}

declare interface UnbindInfo {
    key: string;
    scope?: string;
    method?: KeyHandler;
    splitKey?: string;
}

export { }
