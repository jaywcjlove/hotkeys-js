declare const isff: boolean;
/** Bind event */
declare function addEvent(object: HTMLElement | Document | Window, event: string, method: EventListenerOrEventListenerObject, useCapture?: boolean): void;
declare function removeEvent(object: HTMLElement | Document | Window | null, event: string, method: EventListenerOrEventListenerObject, useCapture?: boolean): void;
/** Convert modifier keys to their corresponding key codes */
declare function getMods(modifier: Record<string, number>, key: string[]): number[];
/** Process the input key string and convert it to an array */
declare function getKeys(key: string | undefined): string[];
/** Compare arrays of modifier keys */
declare function compareArray(a1: number[], a2: number[]): boolean;
export { isff, getMods, getKeys, addEvent, removeEvent, compareArray, };
