const isff: boolean =
  typeof navigator !== 'undefined'
    ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0
    : false;

/** Bind event */
function addEvent(
  object: HTMLElement | Document | Window,
  event: string,
  method: EventListenerOrEventListenerObject,
  useCapture?: boolean
): void {
  if (object.addEventListener) {
    object.addEventListener(event, method, useCapture);
    // @ts-expect-error - attachEvent is only available on IE
  } else if (object.attachEvent) {
    // @ts-expect-error - attachEvent is only available on IE
    object.attachEvent(`on${event}`, method);
  }
}

function removeEvent(
  object: HTMLElement | Document | Window | null,
  event: string,
  method: EventListenerOrEventListenerObject,
  useCapture?: boolean
): void {
  if (!object) return;
  if (object.removeEventListener) {
    object.removeEventListener(event, method, useCapture);
    // @ts-expect-error - removeEvent is only available on IE
  } else if (object.detachEvent) {
    // @ts-expect-error - detachEvent is only available on IE
    object.detachEvent(`on${event}`, method);
  }
}

/** Convert modifier keys to their corresponding key codes */
function getMods(modifier: Record<string, number>, key: string[]): number[] {
  const modsKeys = key.slice(0, key.length - 1);
  const modsCodes: number[] = [];
  for (let i = 0; i < modsKeys.length; i++) {
    modsCodes.push(modifier[modsKeys[i].toLowerCase()]);
  }
  return modsCodes;
}

/** Process the input key string and convert it to an array */
function getKeys(key: string | undefined): string[] {
  if (typeof key !== 'string') key = '';
  key = key.replace(/\s/g, ''); // Match any whitespace character, including spaces, tabs, form feeds, etc.
  const keys = key.split(','); // Allow multiple shortcuts separated by ','
  let index = keys.lastIndexOf('');

  // Shortcut may include ',' — special handling needed
  for (; index >= 0; ) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys;
}

/** Compare arrays of modifier keys */
function compareArray(a1: number[], a2: number[]): boolean {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex;
}

/**
 * Get layout-independent key code from keyboard event
 * This makes hotkeys work regardless of keyboard layout (Russian, German, etc.)
 * Uses event.code (physical key) instead of keyCode (character) for letter keys
 */
function getLayoutIndependentKeyCode(event: KeyboardEvent): number {
  let key = event.keyCode || event.which || event.charCode;

  // Convert physical key code (KeyA-KeyZ) to corresponding ASCII code (65-90)
  // This makes 'ctrl+a' work on any keyboard layout
  if (event.code && /^Key[A-Z]$/.test(event.code)) {
    key = event.code.charCodeAt(3); // "KeyA"[3] = "A" -> 65
  }

  return key;
}

export {
  isff,
  getMods,
  getKeys,
  addEvent,
  removeEvent,
  compareArray,
  getLayoutIndependentKeyCode,
};
