const isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false;

/** Bind event */
function addEvent(object, event, method, useCapture) {
  if (object.addEventListener) {
    object.addEventListener(event, method, useCapture);
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, method);
  }
}

function removeEvent(object, event, method, useCapture) {
  if (object.removeEventListener) {
    object.removeEventListener(event, method, useCapture);
  } else if (object.detachEvent) {
    object.detachEvent(`on${event}`, method);
  }
}

/** Convert modifier keys to their corresponding key codes */
function getMods(modifier, key) {
  const mods = key.slice(0, key.length - 1);
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase()];
  return mods;
}

/** Process the input key string and convert it to an array */
function getKeys(key) {
  if (typeof key !== 'string') key = '';
  key = key.replace(/\s/g, ''); // Match any whitespace character, including spaces, tabs, form feeds, etc.
  const keys = key.split(','); // Allow multiple shortcuts separated by ','
  let index = keys.lastIndexOf('');

  // Shortcut may include ',' — special handling needed
  for (; index >= 0;) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys;
}

/** Compare arrays of modifier keys */
function compareArray(a1, a2) {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex;
}

export {
  isff,
  getMods,
  getKeys,
  addEvent,
  removeEvent,
  compareArray,
};
