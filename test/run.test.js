/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

let browser;
let page;

function resolveChromeExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  if (process.platform === 'darwin') {
    const macCandidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    const found = macCandidates.find((candidate) => fs.existsSync(candidate));
    if (found) return found;
  }

  if (process.platform === 'linux') {
    const linuxCandidates = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
    const found = linuxCandidates.find((candidate) => fs.existsSync(candidate));
    if (found) return found;
  }

  return undefined;
}

beforeAll(async () => {
  const executablePath = resolveChromeExecutablePath();
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    timeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  page = await browser.newPage();

  // Install CommonJS and AMD globals before the UMD build runs so those
  // branches execute during the single script load. `exports` is set as well
  // so the wrapper takes the CommonJS path; the factory still assigns
  // window.hotkeys, and the trailing AMD check runs afterwards.
  await page.evaluateOnNewDocument(() => {
    window.exports = {};
    window.module = { exports: {} };
    window.__amdCalls = 0;
    window.define = function define(deps, factory) {
      window.__amdCalls += 1;
      const fn = typeof deps === 'function' ? deps : factory;
      if (typeof fn === 'function') return fn();
    };
    window.define.amd = true;
  });

  // Enable coverage collection
  await page.coverage.startJSCoverage();

  // Load the test HTML file
  const htmlPath = path.resolve(__dirname, './index.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2' });
}, 1000 * 120);

describe('\n   Hotkeys.js Test Case\n', () => {
  test('global wildcard handlers remain active after switching scope', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      const previousScope = window.hotkeys.getScope();
      const onGlobal = (event) => calls.push(`global:${event.type}`);
      window.hotkeys('*', { keyup: true }, onGlobal);
      window.hotkeys('*', { scope: 'wildcard-active', keyup: true },
        (event) => calls.push(`active:${event.type}`));
      window.hotkeys('*', { scope: 'wildcard-inactive', keyup: true },
        () => calls.push('inactive'));
      window.hotkeys.setScope('wildcard-active');

      for (const type of ['keydown', 'keyup']) {
        document.body.dispatchEvent(new KeyboardEvent(type, {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
        }));
      }

      window.hotkeys.unbind('*', 'all', onGlobal);
      window.hotkeys.deleteScope('wildcard-active');
      window.hotkeys.deleteScope('wildcard-inactive');
      window.hotkeys.setScope(previousScope);
      return calls;
    });

    expect(result).toEqual([
      'global:keydown', 'active:keydown', 'global:keyup', 'active:keyup',
    ]);
  });

  test('single replaces callbacks with a custom splitKey', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      const options = { splitKey: '-', single: true, scope: 'custom-separator' };
      window.hotkeys('ctrl-a', options, () => calls.push('previous'));
      window.hotkeys('ctrl-a', options, () => calls.push('replacement'));
      window.hotkeys.setScope('custom-separator');

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));
      window.hotkeys.deleteScope('custom-separator');

      return calls;
    });

    expect(result).toEqual(['replacement']);
  });

  test.each(['+', '::'])('unbind and single preserve distinct chords with %s', async (splitKey) => {
    await page.evaluate((separator) => {
      window.chordCalls = [];
      const options = { scope: 'distinct-chords', splitKey: separator };
      window.hotkeys(`a${separator}b`, options, () => window.chordCalls.push('removed'));
      window.hotkeys(`c${separator}b`, options, () => window.chordCalls.push('other'));
      window.hotkeys.setScope(options.scope);
    }, splitKey);

    const pressChord = async (first) => {
      await page.keyboard.down(first);
      await page.keyboard.press('b');
      await page.keyboard.up(first);
    };

    try {
      await pressChord('c');
      await page.evaluate((separator) => {
        window.hotkeys.unbind({ key: `a${separator}b`, scope: 'distinct-chords', splitKey: separator });
      }, splitKey);
      await pressChord('a');
      await pressChord('c');
      expect(await page.evaluate(() => window.chordCalls)).toEqual(['other', 'other']);

      await page.evaluate((separator) => {
        const options = { scope: 'distinct-chords', splitKey: separator };
        window.hotkeys(`a${separator}b`, options, () => window.chordCalls.push('previous'));
        window.hotkeys(`a${separator}b`, { ...options, single: true }, () => window.chordCalls.push('replacement'));
      }, splitKey);
      await pressChord('c');
      await pressChord('a');
      expect(await page.evaluate(() => window.chordCalls)).toEqual(['other', 'other', 'other', 'replacement']);
    } finally {
      await page.evaluate(() => {
        window.hotkeys.deleteScope('distinct-chords');
        delete window.chordCalls;
      });
    }
  });

  test('HTML loader', async () => {
    const title = await page.title();
    expect(title).toBe('hotkeys.js');
  }, 10000);

  test('Test HTML load', async () => {
    const text = await page.$eval('#root', (el) => el.textContent);
    expect(text).toBe('hotkeys');

    const hasHotkeys = await page.evaluate(() => {
      return typeof window.hotkeys !== 'undefined';
    });
    expect(hasHotkeys).toBeTruthy();
  });

  test('HotKeys getPressedKeyCodes Test Case', async () => {
    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let isExecuteFunction = false;
        window.hotkeys('command+ctrl+shift+a', (e) => {
          isExecuteFunction = true;
          const pressedKeys = window.hotkeys.getPressedKeyCodes();
          resolve({
            isExecuteFunction,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            pressedKeys,
          });
        });

        // Trigger the event
        const event = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          metaKey: true,
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('command+ctrl+shift+a');
          resolve({ isExecuteFunction, pressedKeys: [] });
        }, 100);
      });
    });

    expect(result.isExecuteFunction).toBeTruthy();
    expect(result.metaKey).toBeTruthy();
    expect(result.ctrlKey).toBeTruthy();
    expect(result.shiftKey).toBeTruthy();
    expect(result.pressedKeys).toEqual(
      expect.arrayContaining([16, 17, 65, 91])
    );
  });

  test('HotKeys getPressedKeyString Test Case', async () => {
    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let isExecuteFunction = false;
        window.hotkeys('command+ctrl+shift+a', (e) => {
          isExecuteFunction = true;
          const pressedKeys = window.hotkeys.getPressedKeyString();
          resolve({
            isExecuteFunction,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            pressedKeys,
          });
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          metaKey: true,
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('command+ctrl+shift+a');
          resolve({ isExecuteFunction: false, pressedKeys: [] });
        }, 100);
      });
    });

    expect(result.isExecuteFunction).toBeTruthy();
    expect(result.pressedKeys).toEqual(
      expect.arrayContaining(['⇧', '⌃', 'A', '⌘'])
    );
  });

  test('HotKeys unbind Test Case', async () => {
    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let isExecuteFunction = false;
        window.hotkeys('enter', () => {
          isExecuteFunction = true;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          const unbindResult = window.hotkeys.unbind('enter');
          resolve({
            isExecuteFunction,
            unbindResult,
            keyCode: 13,
          });
        }, 100);
      });
    });

    expect(result.isExecuteFunction).toBeTruthy();
    expect(result.unbindResult).toBeUndefined();
  });

  test('getAllKeyCodes Test Case', async () => {
    const result = await page.evaluate(() => {
      return window.hotkeys.getAllKeyCodes();
    });

    expect(Array.isArray(result)).toBeTruthy();
  });

  test('getAllKeyCodes respects each binding splitKey', async () => {
    const result = await page.evaluate(() => {
      const scope = 'key-code-query';
      window.hotkeys('ctrl-a', { scope, splitKey: '-' }, () => {});
      window.hotkeys('ctrl::shift::b', { scope, splitKey: '::' }, () => {});
      window.hotkeys('ctrl-+', { scope, splitKey: '-' }, () => {});
      window.hotkeys('ctrl+c', { scope }, () => {});
      const bindings = window.hotkeys.getAllKeyCodes()
        .filter((binding) => binding.scope === scope)
        .map(({ shortcut, keys }) => ({ shortcut, keys }));
      window.hotkeys.deleteScope(scope);
      return bindings;
    });

    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining([
      { shortcut: 'ctrl-a', keys: [17, 65] },
      { shortcut: 'ctrl::shift::b', keys: [17, 16, 66] },
      { shortcut: 'ctrl-+', keys: [17, 43] },
      { shortcut: 'ctrl+c', keys: [17, 67] },
    ]));
  });

  test('HotKeys Special keys Test Case', async () => {
    const result = await page.evaluate(async () => {
      const results = {};

      // Test enter
      await new Promise((resolve) => {
        window.hotkeys('enter', (e) => {
          results.enter = e.keyCode === 13;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('enter');
          resolve();
        }, 50);
      });

      // Test space
      await new Promise((resolve) => {
        window.hotkeys('space', (e) => {
          results.space = e.keyCode === 32;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 32,
          which: 32,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('space');
          resolve();
        }, 50);
      });

      return results;
    });

    expect(result.enter).toBeTruthy();
    expect(result.space).toBeTruthy();
  });

  test('HotKeys modern and legacy Enter events Test Case', async () => {
    const result = await page.evaluate(async () => {
      const results = {
        modernKey: false,
        modernPreferred: false,
        legacy: false,
      };

      window.hotkeys('enter', () => {
        results.modernKey = true;
      });

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true,
          cancelable: true,
        })
      );
      window.hotkeys.unbind('enter');

      window.hotkeys('enter', () => {
        results.modernPreferred = true;
      });

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          // Intentionally conflicting legacy values: modern `key` must take precedence.
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true,
        })
      );
      window.hotkeys.unbind('enter');

      window.hotkeys('enter', () => {
        results.legacy = true;
      });

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        })
      );
      window.hotkeys.unbind('enter');

      return results;
    });

    expect(result).toEqual({
      modernKey: true,
      modernPreferred: true,
      legacy: true,
    });
  });

  test('HotKeys modern numeric key event Test Case', async () => {
    const result = await page.evaluate(() => {
      let triggered = false;

      window.hotkeys('1', () => {
        triggered = true;
      });

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '1',
          code: 'Digit1',
          bubbles: true,
          cancelable: true,
        })
      );
      window.hotkeys.unbind('1');

      return triggered;
    });

    expect(result).toBeTruthy();
  });

  test('numpad keys match num_* bindings, not the main keyboard keys', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      const keys = ['num_0', 'num_decimal', 'num_subtract', 'num_divide', '0', '.', '-', '/'];
      keys.forEach((key) => window.hotkeys(key, () => calls.push(key)));

      const press = (key, code, keyCode) => {
        ['keydown', 'keyup'].forEach((type) => {
          document.body.dispatchEvent(new KeyboardEvent(type, {
            key, code, keyCode, which: keyCode, bubbles: true,
          }));
        });
      };
      // Numpad keys report the same `key` as the main keyboard row
      press('0', 'Numpad0', 96);
      press('.', 'NumpadDecimal', 110);
      press('-', 'NumpadSubtract', 109);
      press('/', 'NumpadDivide', 111);
      press('0', 'Digit0', 48);
      press('.', 'Period', 190);
      press('-', 'Minus', 189);
      press('/', 'Slash', 191);

      keys.forEach((key) => window.hotkeys.unbind(key));
      return calls;
    });

    expect(result).toEqual(['num_0', 'num_decimal', 'num_subtract', 'num_divide', '0', '.', '-', '/']);
  });

  test('numpad enter matches num_enter, the main enter key matches enter', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      ['num_enter', 'enter'].forEach((key) => window.hotkeys(key, () => calls.push(key)));

      const press = (code) => {
        ['keydown', 'keyup'].forEach((type) => {
          document.body.dispatchEvent(new KeyboardEvent(type, {
            key: 'Enter', code, keyCode: 13, which: 13, bubbles: true,
          }));
        });
      };
      // Browsers report keyCode 13 for both Enter keys
      press('NumpadEnter');
      press('Enter');

      ['num_enter', 'enter'].forEach((key) => window.hotkeys.unbind(key));
      return calls;
    });

    expect(result).toEqual(['num_enter', 'enter']);
  });

  test('HotKeys Test Case', async () => {
    const result = await page.evaluate(async () => {
      const results = {};

      // Test 'w'
      await new Promise((resolve) => {
        window.hotkeys('w', (e) => {
          results.w = e.keyCode === 87;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 87,
          which: 87,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('w');
          resolve();
        }, 50);
      });

      // Test 'a' with isPressed
      await new Promise((resolve) => {
        window.hotkeys('a', () => {
          results.isPressedA = window.hotkeys.isPressed('a');
          results.isPressedAUpper = window.hotkeys.isPressed('A');
          results.isPressed65 = window.hotkeys.isPressed(65);
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('a');
          resolve();
        }, 50);
      });

      return results;
    });

    expect(result.w).toBeTruthy();
    expect(result.isPressedA).toBeTruthy();
    expect(result.isPressedAUpper).toBeTruthy();
    expect(result.isPressed65).toBeTruthy();
  });

  test('keyup handlers observe released key state', async () => {
    await page.evaluate(() => {
      window.keyupStates = [];
      const record = (event, handler) => {
        if (event.type !== 'keyup') return;
        window.keyupStates.push({
          isPressed: window.hotkeys.isPressed('a'),
          pressed: window.hotkeys.getPressedKeyCodes(),
          handlerKeys: handler.keys,
        });
      };
      window.hotkeys('*', { keyup: true }, record);
      window.hotkeys('a', { keyup: true }, record);
      window.hotkeys('a', { keyup: true }, record);
    });

    try {
      await page.keyboard.press('a');
    } finally {
      await page.evaluate(() => {
        window.hotkeys.unbind('*');
        window.hotkeys.unbind('a');
      });
    }

    const result = await page.evaluate(() => ({
      states: window.keyupStates,
      after: window.hotkeys.getPressedKeyCodes(),
    }));
    expect(result.states).toHaveLength(3);
    expect(result.states).toEqual(Array(3).fill({
      isPressed: false,
      pressed: [],
      handlerKeys: [65],
    }));
    expect(result.after).toEqual([]);
  });

  test('keyup combinations use pre-release matching with released callback state', async () => {
    await page.evaluate(() => {
      window.comboStates = [];
      window.hotkeys('ctrl+a', { keyup: true }, (event, handler) => {
        if (event.type !== 'keyup') return;
        window.comboStates.push({
          isPressedA: window.hotkeys.isPressed('a'),
          isPressedCtrl: window.hotkeys.isPressed('ctrl'),
          pressed: window.hotkeys.getPressedKeyCodes(),
          handlerKeys: handler.keys,
        });
      });
    });

    let during;
    try {
      await page.keyboard.down('Control');
      await page.keyboard.down('a');
      await page.keyboard.up('a');
      during = await page.evaluate(() => window.comboStates);
    } finally {
      await page.keyboard.up('Control');
      await page.evaluate(() => window.hotkeys.unbind('ctrl+a'));
    }

    expect(during).toEqual([{
      isPressedA: false,
      isPressedCtrl: true,
      pressed: [17],
      handlerKeys: [17, 65],
    }]);
    expect(await page.evaluate(() => window.hotkeys.getPressedKeyCodes())).toEqual([]);
  });

  test('keydown and keyup preserve the existing sorted key order', async () => {
    await page.evaluate(() => {
      window.orderedStates = [];
      window.hotkeys('z+a', { keyup: true }, (event, handler) => {
        window.orderedStates.push({
          type: event.type,
          handlerKeys: handler.keys,
          pressed: window.hotkeys.getPressedKeyCodes(),
          isPressedA: window.hotkeys.isPressed('a'),
        });
      });
    });

    try {
      await page.keyboard.down('z');
      await page.keyboard.down('a');
      await page.keyboard.up('a');
      await page.keyboard.up('z');
    } finally {
      await page.evaluate(() => window.hotkeys.unbind('z+a'));
    }

    const result = await page.evaluate(() => ({
      states: window.orderedStates,
      after: window.hotkeys.getPressedKeyCodes(),
    }));
    expect(result.states).toEqual([
      { type: 'keydown', handlerKeys: [65, 90], pressed: [65, 90], isPressedA: true },
      { type: 'keyup', handlerKeys: [65, 90], pressed: [90], isPressedA: false },
    ]);
    expect(result.after).toEqual([]);
  });

  test('HotKeys Key combination Test Case', async () => {
    const result = await page.evaluate(async () => {
      const results = {};

      // Test ⌘+d
      await new Promise((resolve) => {
        window.hotkeys('⌘+d', (e) => {
          results.cmdD = e.keyCode === 68 && e.metaKey;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 68,
          which: 68,
          metaKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('⌘+d');
          resolve();
        }, 50);
      });

      // Test shift+a
      await new Promise((resolve) => {
        window.hotkeys('shift+a', (e) => {
          results.shiftA = e.keyCode === 65 && e.shiftKey;
        });

        const event = new KeyboardEvent('keydown', {
          keyCode: 65,
          which: 65,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(event);

        setTimeout(() => {
          window.hotkeys.unbind('shift+a');
          resolve();
        }, 50);
      });

      return results;
    });

    expect(result.cmdD).toBeTruthy();
    expect(result.shiftA).toBeTruthy();
  });

  test('Hotkey trigger with shortcut', async () => {
    const result = await page.evaluate(() => {
      let count = 0;
      window.hotkeys('a', () => {
        count++;
      });

      window.hotkeys.trigger('a');

      window.hotkeys.unbind('a');

      return count;
    });

    expect(result).toBe(1);
  });

  test('Hotkey trigger ignores bindings without a callback', async () => {
    const result = await page.evaluate(() => {
      window.hotkeys('a');
      let error = null;
      try {
        window.hotkeys.trigger('a');
      } catch (exception) {
        error = exception.message;
      }
      window.hotkeys.unbind('a');
      return error;
    });

    expect(result).toBeNull();
  });

  test('Hotkey trigger supports the generic Event fallback', async () => {
    const result = await page.evaluate(() => {
      const createEvent = document.createEvent;
      let snapshot;
      document.createEvent = function (type) {
        if (type === 'KeyboardEvent') throw new Error('KeyboardEvent unsupported');
        return createEvent.call(this, type);
      };

      try {
        window.hotkeys('alt+b', (event, handler) => {
          snapshot = {
            isEvent: event instanceof Event,
            isKeyboardEvent: event instanceof KeyboardEvent,
            type: event.type,
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            altKey: event.altKey,
            cancelable: event.cancelable,
            targetIsDocument: event.target === document,
            handlerKeys: handler.keys,
            pressed: window.hotkeys.getPressedKeyCodes(),
          };
        });
        window.hotkeys.trigger('alt+b');
      } finally {
        document.createEvent = createEvent;
        window.hotkeys.unbind('alt+b');
      }

      return { snapshot, after: window.hotkeys.getPressedKeyCodes() };
    });

    expect(result).toEqual({
      snapshot: {
        isEvent: true,
        isKeyboardEvent: false,
        type: 'keydown',
        key: 'b',
        code: 'KeyB',
        keyCode: 66,
        altKey: true,
        cancelable: true,
        targetIsDocument: true,
        handlerKeys: [18, 66],
        pressed: [18, 66],
      },
      after: [],
    });
  });

  test('Hotkey trigger preserves modifier-only callbacks', async () => {
    const result = await page.evaluate(() => {
      let snapshot;
      window.hotkeys('ctrl', (event) => {
        snapshot = {
          key: event.key,
          keyCode: event.keyCode,
          ctrlKey: event.ctrlKey,
          pressed: window.hotkeys.getPressedKeyCodes(),
        };
      });
      window.hotkeys.trigger('ctrl');
      window.hotkeys.unbind('ctrl');
      return { snapshot, after: window.hotkeys.getPressedKeyCodes() };
    });

    expect(result).toEqual({
      snapshot: {
        key: 'ctrl',
        keyCode: 17,
        ctrlKey: true,
        pressed: [17],
      },
      after: [],
    });
  });

  test.each([
    { shortcut: 'ctrl', key: 'Control', code: 'ControlLeft', keyCode: 17, modifierKey: 'ctrlKey' },
    { shortcut: 'shift', key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifierKey: 'shiftKey' },
    { shortcut: 'alt', key: 'Alt', code: 'AltLeft', keyCode: 18, modifierKey: 'altKey' },
    { shortcut: 'command', key: 'Meta', code: 'MetaLeft', keyCode: 91, modifierKey: 'metaKey' },
  ])('dispatches $shortcut-only handlers with and without wildcard bindings', async (fixture) => {
    const calls = await page.evaluate(({ shortcut, key, code, keyCode, modifierKey }) => {
      const result = [];
      for (const withWildcard of [false, true]) {
        window.hotkeys(shortcut, { keyup: true }, (event, handler) => {
          result.push({
            withWildcard,
            type: event.type,
            shortcut: handler.shortcut,
            keys: handler.keys,
            pressed: window.hotkeys.getPressedKeyCodes(),
          });
        });
        if (withWildcard) window.hotkeys('*', () => {});
        for (const type of ['keydown', 'keyup']) {
          document.body.dispatchEvent(new KeyboardEvent(type, {
            key, code, keyCode, which: keyCode, [modifierKey]: type === 'keydown', bubbles: true,
          }));
        }
        window.hotkeys.unbind(shortcut);
        if (withWildcard) window.hotkeys.unbind('*');
      }
      return result;
    }, fixture);

    const expected = [false, true].flatMap((withWildcard) =>
      ['keydown', 'keyup'].map((type) => ({
        withWildcard,
        type,
        shortcut: fixture.shortcut,
        keys: [fixture.keyCode],
        pressed: type === 'keydown' ? [fixture.keyCode] : [],
      }))
    );
    expect(calls).toEqual(expected);
  });

  test('Hotkey trigger provides event and pressed state', async () => {
    const result = await page.evaluate(() => {
      const scope = 'manual-trigger-event';
      let snapshot;
      let unrelatedKeydowns = 0;
      const onKeydown = () => unrelatedKeydowns++;
      document.addEventListener('keydown', onKeydown);

      window.hotkeys('ctrl+a', { scope }, (event, handler) => {
        snapshot = {
          isKeyboardEvent: event instanceof KeyboardEvent,
          type: event.type,
          key: event.key,
          code: event.code,
          keyCode: event.keyCode,
          which: event.which,
          ctrlKey: event.ctrlKey,
          ctrlModifier: event.getModifierState('Control'),
          altModifier: event.getModifierState('Alt'),
          targetIsDocument: event.target === document,
          handlerKeys: handler.keys,
          pressed: window.hotkeys.getPressedKeyCodes(),
          ctrlPressed: window.hotkeys.isPressed('ctrl'),
          aPressed: window.hotkeys.isPressed('a'),
          bPressed: window.hotkeys.isPressed('b'),
          ctrlFlag: window.hotkeys.ctrl,
        };
      });

      window.hotkeys.trigger('ctrl+a', scope);

      const after = {
        pressed: window.hotkeys.getPressedKeyCodes(),
        aPressed: window.hotkeys.isPressed('a'),
        ctrlFlag: window.hotkeys.ctrl,
      };
      window.hotkeys.deleteScope(scope);
      document.removeEventListener('keydown', onKeydown);
      return { snapshot, after, unrelatedKeydowns };
    });

    expect(result).toEqual({
      snapshot: {
        isKeyboardEvent: true,
        type: 'keydown',
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
        ctrlKey: true,
        ctrlModifier: true,
        altModifier: false,
        targetIsDocument: true,
        handlerKeys: [17, 65],
        pressed: [17, 65],
        ctrlPressed: true,
        aPressed: true,
        bPressed: false,
        ctrlFlag: true,
      },
      after: { pressed: [], aPressed: false, ctrlFlag: false },
      unrelatedKeydowns: 0,
    });
  });

  test('Hotkey trigger restores physical state after an error', async () => {
    const result = await page.evaluate(() => {
      const scope = 'manual-trigger-error';
      window.hotkeys('ctrl+a', { scope }, () => {
        throw new Error('manual trigger failure');
      });

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17,
        ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'b', code: 'KeyB', keyCode: 66, which: 66,
        ctrlKey: true, bubbles: true,
      }));
      const before = window.hotkeys.getPressedKeyCodes();

      let message;
      try {
        window.hotkeys.trigger('ctrl+a', scope);
      } catch (error) {
        message = error.message;
      }

      const after = {
        pressed: window.hotkeys.getPressedKeyCodes(),
        aPressed: window.hotkeys.isPressed('a'),
        bPressed: window.hotkeys.isPressed('b'),
        ctrlPressed: window.hotkeys.isPressed('ctrl'),
        ctrlFlag: window.hotkeys.ctrl,
      };

      for (const [key, code, keyCode] of [['b', 'KeyB', 66], ['Control', 'ControlLeft', 17]]) {
        document.body.dispatchEvent(new KeyboardEvent('keyup', {
          key, code, keyCode, which: keyCode, bubbles: true,
        }));
      }
      const cleared = {
        pressed: window.hotkeys.getPressedKeyCodes(),
        ctrlFlag: window.hotkeys.ctrl,
      };
      window.hotkeys.deleteScope(scope);
      return { before, message, after, cleared };
    });

    expect(result).toEqual({
      before: [17, 66],
      message: 'manual trigger failure',
      after: {
        pressed: [17, 66],
        aPressed: false,
        bPressed: true,
        ctrlPressed: true,
        ctrlFlag: true,
      },
      cleared: { pressed: [], ctrlFlag: false },
    });
  });

  test('Hotkey trigger with multi shortcut', async () => {
    const result = await page.evaluate(() => {
      let count = 0;
      for (let i = 0; i < 3; i++) {
        window.hotkeys('a', () => {
          count++;
        });
      }

      window.hotkeys.trigger('a');

      window.hotkeys.unbind('a');

      return count;
    });

    expect(result).toBe(3);
  });

  test('Layout-independent hotkeys (Cyrillic/Russian keyboard)', async () => {
    const result = await page.evaluate(async () => {
      const results = {
        altMTriggered: false,
        altVTriggered: false,
        downKeysAfterAltM: [],
        downKeysAfterAltV: [],
        downKeysAfterRelease: [],
      };

      // Register hotkeys for alt+m and alt+v
      window.hotkeys('alt+m', () => {
        results.altMTriggered = true;
        results.downKeysAfterAltM = window.hotkeys.getPressedKeyCodes();
      });

      window.hotkeys('alt+v', () => {
        results.altVTriggered = true;
        results.downKeysAfterAltV = window.hotkeys.getPressedKeyCodes();
      });

      // Simulate Alt+M on Russian keyboard layout
      // On Russian layout, M key produces "Ь" character (code 1068 or ~126)
      // But the physical key is still KeyM
      await new Promise((resolve) => {
        // Press Alt
        const altDown = new KeyboardEvent('keydown', {
          keyCode: 18,
          which: 18,
          code: 'AltLeft',
          altKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(altDown);

        setTimeout(() => {
          // Press M (with wrong keyCode but correct code)
          const mDown = new KeyboardEvent('keydown', {
            keyCode: 126, // Wrong keyCode (~ character on Cyrillic layout)
            which: 126,
            code: 'KeyM', // Correct physical key code
            altKey: true,
            bubbles: true,
            cancelable: true,
          });
          document.body.dispatchEvent(mDown);

          setTimeout(() => {
            // Release M
            const mUp = new KeyboardEvent('keyup', {
              keyCode: 126,
              which: 126,
              code: 'KeyM',
              altKey: true,
              bubbles: true,
              cancelable: true,
            });
            document.body.dispatchEvent(mUp);

            setTimeout(() => {
              // Release Alt
              const altUp = new KeyboardEvent('keyup', {
                keyCode: 18,
                which: 18,
                code: 'AltLeft',
                altKey: false,
                bubbles: true,
                cancelable: true,
              });
              document.body.dispatchEvent(altUp);

              resolve();
            }, 20);
          }, 20);
        }, 20);
      });

      // Small delay between combinations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate Alt+V on Russian keyboard layout
      // On Russian layout, V key produces "М" character
      await new Promise((resolve) => {
        // Press Alt
        const altDown = new KeyboardEvent('keydown', {
          keyCode: 18,
          which: 18,
          code: 'AltLeft',
          altKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(altDown);

        setTimeout(() => {
          // Press V (with wrong keyCode but correct code)
          const vDown = new KeyboardEvent('keydown', {
            keyCode: 1052, // Wrong keyCode (М character on Cyrillic layout)
            which: 1052,
            code: 'KeyV', // Correct physical key code
            altKey: true,
            bubbles: true,
            cancelable: true,
          });
          document.body.dispatchEvent(vDown);

          setTimeout(() => {
            // Release V
            const vUp = new KeyboardEvent('keyup', {
              keyCode: 1052,
              which: 1052,
              code: 'KeyV',
              altKey: true,
              bubbles: true,
              cancelable: true,
            });
            document.body.dispatchEvent(vUp);

            setTimeout(() => {
              // Release Alt
              const altUp = new KeyboardEvent('keyup', {
                keyCode: 18,
                which: 18,
                code: 'AltLeft',
                altKey: false,
                bubbles: true,
                cancelable: true,
              });
              document.body.dispatchEvent(altUp);

              // Check downKeys after all keys released
              setTimeout(() => {
                results.downKeysAfterRelease =
                  window.hotkeys.getPressedKeyCodes();
                resolve();
              }, 20);
            }, 20);
          }, 20);
        }, 20);
      });

      // Cleanup
      window.hotkeys.unbind('alt+m');
      window.hotkeys.unbind('alt+v');

      return results;
    });

    // Both hotkeys should be triggered
    expect(result.altMTriggered).toBeTruthy();
    expect(result.altVTriggered).toBeTruthy();

    // Alt (18) + M (77) should be in downKeys during Alt+M
    expect(result.downKeysAfterAltM).toEqual(expect.arrayContaining([18, 77]));

    // Alt (18) + V (86) should be in downKeys during Alt+V
    expect(result.downKeysAfterAltV).toEqual(expect.arrayContaining([18, 86]));

    // After all keys released, downKeys should be empty (this was the bug)
    expect(result.downKeysAfterRelease).toEqual([]);
  });

  test('Latin alternate layouts should match typed letters', async () => {
    const result = await page.evaluate(async () => {
      const results = {
        iTriggered: false,
        cTriggered: false,
        pressedKeysDuringI: [],
      };

      window.hotkeys('i', () => {
        results.iTriggered = true;
        results.pressedKeysDuringI = window.hotkeys.getPressedKeyCodes();
      });

      window.hotkeys('c', () => {
        results.cTriggered = true;
      });

      await new Promise((resolve) => {
        const keyDown = new KeyboardEvent('keydown', {
          key: 'i',
          code: 'KeyC',
          keyCode: 73,
          which: 73,
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(keyDown);

        setTimeout(() => {
          const keyUp = new KeyboardEvent('keyup', {
            key: 'i',
            code: 'KeyC',
            keyCode: 73,
            which: 73,
            bubbles: true,
            cancelable: true,
          });
          document.body.dispatchEvent(keyUp);
          resolve();
        }, 20);
      });

      window.hotkeys.unbind('i');
      window.hotkeys.unbind('c');

      return results;
    });

    expect(result.iTriggered).toBeTruthy();
    expect(result.cTriggered).toBeFalsy();
    expect(result.pressedKeysDuringI).toEqual(expect.arrayContaining([73]));
  });

    test('Hotkey trigger uses wildcard-only custom separators', async () => {
      const result = await page.evaluate(() => {
        const scope = 'wildcard-only-custom-separator';
        let snapshot;
        window.hotkeys('*', { scope, splitKey: '-' }, (event, handler) => {
          snapshot = {
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            ctrlKey: event.ctrlKey,
            handlerKeys: handler.keys,
            pressed: window.hotkeys.getPressedKeyCodes(),
          };
        });

        window.hotkeys.trigger('ctrl-a', scope);
        const after = window.hotkeys.getPressedKeyCodes();
        window.hotkeys.deleteScope(scope);
        return { snapshot, after };
      });

      expect(result).toEqual({
        snapshot: {
          key: 'a',
          code: 'KeyA',
          keyCode: 65,
          ctrlKey: true,
          handlerKeys: [17, 65],
          pressed: [17, 65],
        },
        after: [],
      });
    });

    test('Hotkey trigger shares custom separators with wildcard handlers', async () => {
      const result = await page.evaluate(() => {
        const scope = 'custom-separator-wildcard';
        const calls = [];
        const capture = (name) => (event, handler) => calls.push({
          name,
          key: event.key,
          code: event.code,
          keyCode: event.keyCode,
          ctrlKey: event.ctrlKey,
          handlerKeys: handler.keys,
          pressed: window.hotkeys.getPressedKeyCodes(),
        });

        window.hotkeys('ctrl-a', { scope, splitKey: '-' }, capture('exact'));
        window.hotkeys('*', { scope }, capture('wildcard'));
        window.hotkeys.trigger('ctrl-a', scope);

        const after = window.hotkeys.getPressedKeyCodes();
        window.hotkeys.deleteScope(scope);
        return { calls, after };
      });

      expect(result).toEqual({
        calls: [
          {
            name: 'exact',
            key: 'a',
            code: 'KeyA',
            keyCode: 65,
            ctrlKey: true,
            handlerKeys: [17, 65],
            pressed: [17, 65],
          },
          {
            name: 'wildcard',
            key: 'a',
            code: 'KeyA',
            keyCode: 65,
            ctrlKey: true,
            handlerKeys: [17, 65],
            pressed: [17, 65],
          },
        ],
        after: [],
      });
    });
  test('modifier released before a punctuation key reuses the keydown code', async () => {
    const result = await page.evaluate(() => {
      window.hotkeys.setScope('all');
      window.dispatchEvent(new Event('afterprint'));

      let m = 0;
      let slashUp = 0;
      let sevenUp = 0;
      let semiUp = 0;
      let commaUp = 0;
      let bracketUp = 0;
      let eightUp = 0;
      let hostSlash = 0;
      const host = document.createElement('div');
      document.body.appendChild(host);

      window.hotkeys('m', () => { m += 1; });
      window.hotkeys('/', { keyup: true, keydown: false }, () => { slashUp += 1; });
      window.hotkeys('7', { keyup: true, keydown: false }, () => { sevenUp += 1; });
      window.hotkeys(';', { keyup: true, keydown: false }, () => { semiUp += 1; });
      window.hotkeys(',', { keyup: true, keydown: false }, () => { commaUp += 1; });
      window.hotkeys('[', { keyup: true, keydown: false }, () => { bracketUp += 1; });
      window.hotkeys('8', { keyup: true, keydown: false }, () => { eightUp += 1; });
      window.hotkeys('/', {
        element: host, keyup: true, keydown: false,
      }, () => { hostSlash += 1; });

      const send = (type, properties) => {
        document.body.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          ...properties,
        }));
      };
      const pressed = () => window.hotkeys.getPressedKeyCodes();

      send('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      send('keydown', { key: '/', code: 'Digit7', keyCode: 55, which: 55, shiftKey: true });
      const afterSlashDown = pressed();
      send('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      send('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
      const afterGermanSlash = { pressed: pressed(), m, slashUp, sevenUp };
      send('keydown', { key: 'm', code: 'KeyM', keyCode: 77, which: 77 });
      send('keyup', { key: 'm', code: 'KeyM', keyCode: 77, which: 77 });
      const afterM = { pressed: pressed(), m };

      send('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      send('keydown', { key: '/', code: 'Digit7', keyCode: 55, which: 55, shiftKey: true });
      send('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      send('keydown', { key: '7', code: 'Digit7', keyCode: 55, which: 55, repeat: true });
      const duringRepeat = pressed();
      send('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });

      send('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      send('keydown', { key: ';', code: 'Comma', keyCode: 188, which: 188, shiftKey: true });
      send('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      send('keyup', { key: ',', code: 'Comma', keyCode: 188, which: 188 });
      const afterSemi = { pressed: pressed(), semiUp, commaUp };

      send('keydown', {
        key: '[', code: 'Digit8', keyCode: 56, which: 56, altKey: true, ctrlKey: true,
      });
      send('keyup', { key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17 });
      send('keyup', { key: 'Alt', code: 'AltRight', keyCode: 18, which: 18 });
      send('keyup', { key: '8', code: 'Digit8', keyCode: 56, which: 56 });
      const afterBracket = { pressed: pressed(), bracketUp, eightUp };

      send('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      send('keydown', { key: '?', code: 'Slash', keyCode: 191, which: 191, shiftKey: true });
      send('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      send('keyup', { key: '/', code: 'Slash', keyCode: 191, which: 191 });
      send('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      send('keydown', { key: '{', code: 'BracketLeft', keyCode: 219, which: 219, shiftKey: true });
      send('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      send('keyup', { key: '[', code: 'BracketLeft', keyCode: 219, which: 219 });
      const afterUs = pressed();

      const sevenBeforeLegacy = sevenUp;
      send('keydown', { key: '7', keyCode: 55, which: 55 });
      send('keyup', { key: '7', keyCode: 55, which: 55 });
      const afterLegacy = { pressed: pressed(), sevenUp, sevenBeforeLegacy };

      // IME 229 keeps a physical code but must not become that key's identity.
      send('keydown', { code: 'Digit7', keyCode: 229, which: 229 });
      send('keydown', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
      const afterImePhysical = pressed();
      send('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: '/', code: 'Digit7', keyCode: 55, which: 55, shiftKey: true, bubbles: true,
      }));
      const afterFilteredDown = pressed();
      send('keydown', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
      const duringFiltered = pressed();
      send('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
      const afterFiltered = pressed();
      input.remove();

      const afterResets = [];
      const resets = [
        () => window.dispatchEvent(new Event('blur')),
        () => window.dispatchEvent(new Event('afterprint')),
        () => document.dispatchEvent(new Event('fullscreenchange')),
      ];
      resets.forEach((reset) => {
        send('keydown', { key: '/', code: 'Digit7', keyCode: 55, which: 55, shiftKey: true });
        reset();
        send('keydown', { key: '/', code: 'Slash', keyCode: 191, which: 191 });
        send('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
        afterResets.push(pressed());
        send('keyup', { key: '/', code: 'Slash', keyCode: 191, which: 191 });
      });

      const beforeHost = { slashUp, sevenUp, hostSlash };
      const sendHost = (type, properties) => {
        host.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          ...properties,
        }));
      };
      sendHost('keydown', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, shiftKey: true });
      sendHost('keydown', { key: '/', code: 'Digit7', keyCode: 55, which: 55, shiftKey: true });
      sendHost('keyup', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16 });
      sendHost('keyup', { key: '7', code: 'Digit7', keyCode: 55, which: 55 });
      const afterHost = { pressed: pressed(), slashUp, sevenUp, hostSlash };

      window.hotkeys.unbind('m');
      window.hotkeys.unbind('/');
      window.hotkeys.unbind('7');
      window.hotkeys.unbind(';');
      window.hotkeys.unbind(',');
      window.hotkeys.unbind('[');
      window.hotkeys.unbind('8');
      host.remove();
      window.dispatchEvent(new Event('afterprint'));

      return {
        afterSlashDown,
        afterGermanSlash,
        afterM,
        duringRepeat,
        afterSemi,
        afterBracket,
        afterUs,
        afterLegacy,
        afterImePhysical,
        afterFilteredDown,
        duringFiltered,
        afterFiltered,
        afterResets,
        beforeHost,
        afterHost,
      };
    });

    expect(result.afterSlashDown).toEqual([16, 191]);
    expect(result.afterGermanSlash).toEqual({ pressed: [], m: 0, slashUp: 1, sevenUp: 0 });
    expect(result.afterM).toEqual({ pressed: [], m: 1 });
    expect(result.duringRepeat).toEqual([191]);
    expect(result.afterSemi).toEqual({ pressed: [], semiUp: 1, commaUp: 0 });
    expect(result.afterBracket).toEqual({ pressed: [], bracketUp: 1, eightUp: 0 });
    expect(result.afterUs).toEqual([]);
    expect(result.afterLegacy).toEqual({
      pressed: [],
      sevenBeforeLegacy: 0,
      sevenUp: 1,
    });
    expect(result.afterImePhysical).toEqual([55]);
    expect(result.afterFilteredDown).toEqual([]);
    expect(result.duringFiltered).toEqual([55]);
    expect(result.afterFiltered).toEqual([]);
    expect(result.afterResets).toEqual([[191], [191], [191]]);
    expect(result.afterHost.pressed).toEqual([]);
    expect(result.afterHost.hostSlash).toBe(result.beforeHost.hostSlash + 1);
    expect(result.afterHost.slashUp).toBe(result.beforeHost.slashUp + 1);
    expect(result.afterHost.sevenUp).toBe(result.beforeHost.sevenUp);
  });

    test('Hotkey trigger should also fire wildcard (*) handlers', async () => {
    const result = await page.evaluate(() => {
      let wildcardCount = 0;
      let specificCount = 0;

      window.hotkeys('a', () => {
        specificCount++;
      });

      window.hotkeys('*', () => {
        wildcardCount++;
      });

      window.hotkeys.trigger('a');

      window.hotkeys.trigger('b');

      window.hotkeys.unbind('a');
      window.hotkeys.unbind('*');

      return { wildcardCount, specificCount };
    });

    expect(result.specificCount).toBe(1);

    expect(result.wildcardCount).toBe(2);
  });

  test('capture mode keeps held modifiers when focus moves within the page', async () => {
    const isolatedPage = await browser.newPage();
    try {
      await isolatedPage.setContent('<button id="first">First</button><button id="second">Second</button>');
      await isolatedPage.addScriptTag({ path: path.resolve(__dirname, '../dist/hotkeys-js.umd.cjs') });
      await isolatedPage.evaluate(() => {
        window.hotkeys('ctrl+a', { capture: true }, () => {});
        document.querySelector('#first').focus();
      });
      await isolatedPage.keyboard.down('Control');
      const result = await isolatedPage.evaluate(() => {
        document.querySelector('#second').focus();
        return {
          ctrl: window.hotkeys.ctrl,
          control: window.hotkeys.control,
          pressed: window.hotkeys.isPressed('ctrl'),
        };
      });
      expect(result).toEqual({ ctrl: true, control: true, pressed: true });
    } finally {
      await isolatedPage.close();
    }
  });

  test.each(['blur', 'focus'])('%s clears stale pressed keys and modifier aliases', async (type) => {
    const result = await page.evaluate((eventType) => {
      let calls = 0;
      window.hotkeys('a', () => { calls += 1; });
      const aliases = ['shift', 'ctrl', 'control', 'alt', 'option', 'cmd', 'command'];
      for (const keyCode of [16, 17, 18, 91]) {
        document.body.dispatchEvent(new KeyboardEvent('keydown', {
          keyCode, which: keyCode, shiftKey: true, ctrlKey: true,
          altKey: true, metaKey: true, bubbles: true,
        }));
      }
      const before = aliases.map((key) => window.hotkeys[key]);
      window.dispatchEvent(new Event(eventType));
      const pressed = window.hotkeys.getPressedKeyCodes();
      const after = aliases.map((key) => window.hotkeys[key]);
      for (const keyType of ['keydown', 'keyup']) {
        document.body.dispatchEvent(new KeyboardEvent(keyType, {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
        }));
      }
      window.hotkeys.unbind('a');
      return { before, pressed, after, calls };
    }, type);

    expect(result.before).toEqual(Array(7).fill(true));
    expect(result.pressed).toEqual([]);
    expect(result.after).toEqual(Array(7).fill(false));
    expect(result.calls).toBe(1);
  });

  test('afterprint clears keys whose keyup was swallowed by the print dialog', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      window.hotkeys('ctrl+p', () => calls.push('ctrl+p'));
      window.hotkeys('a', () => calls.push('a'));

      // The print dialog opened by Ctrl+P receives the keyup events instead of the page
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'p', code: 'KeyP', keyCode: 80, which: 80, ctrlKey: true, bubbles: true,
      }));
      window.dispatchEvent(new Event('afterprint'));
      const pressedAfterPrint = window.hotkeys.getPressedKeyCodes();
      const ctrlAfterPrint = window.hotkeys.ctrl;

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));

      window.hotkeys.unbind('ctrl+p');
      window.hotkeys.unbind('a');

      return { calls, pressedAfterPrint, ctrlAfterPrint };
    });

    expect(result.calls).toEqual(['ctrl+p', 'a']);
    expect(result.pressedAfterPrint).toEqual([]);
    expect(result.ctrlAfterPrint).toBe(false);
  });

  test('UMD build exposes CommonJS and AMD entry points', async () => {
    const result = await page.evaluate(() => ({
      amdCalls: window.__amdCalls,
      exportIsHotkeys: window.module.exports === window.hotkeys,
      defaultIsExport: window.module.exports.default === window.module.exports,
      hotkeysIsFunction: typeof window.hotkeys === 'function',
    }));

    expect(result.hotkeysIsFunction).toBe(true);
    expect(result.exportIsHotkeys).toBe(true);
    expect(result.defaultIsExport).toBe(true);
    expect(result.amdCalls).toBeGreaterThan(0);
  });

  test('comma is a bindable key, including inside a modifier shortcut', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      window.hotkeys.setScope('all');
      window.hotkeys(',', () => calls.push('comma'));
      window.hotkeys('a,ctrl+,', (event) => {
        calls.push(event.ctrlKey ? 'ctrl+comma' : 'a');
      });

      const comma = { key: ',', code: 'Comma', keyCode: 188, which: 188, bubbles: true };
      document.body.dispatchEvent(new KeyboardEvent('keydown', comma));
      document.body.dispatchEvent(new KeyboardEvent('keyup', comma));
      document.body.dispatchEvent(new KeyboardEvent('keydown', { ...comma, ctrlKey: true }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', { ...comma, ctrlKey: false }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));
      window.hotkeys.unbind(',');
      window.hotkeys.unbind('a,ctrl+,');
      return calls;
    });

    expect(result).toEqual(['comma', 'ctrl+comma', 'a']);
  });

  test('filter ignores text fields and still allows non-text controls', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      window.hotkeys.setScope('all');
      window.hotkeys('a', () => calls.push('a'));

      const host = document.createElement('div');
      document.body.appendChild(host);
      const press = (el) => {
        calls.length = 0;
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
        }));
        el.dispatchEvent(new KeyboardEvent('keyup', {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
        }));
        return calls.slice();
      };

      const text = document.createElement('input');
      text.type = 'text';
      host.appendChild(text);
      const textResult = press(text);

      const readOnly = document.createElement('input');
      readOnly.type = 'text';
      readOnly.readOnly = true;
      host.appendChild(readOnly);
      const readOnlyResult = press(readOnly);

      const textarea = document.createElement('textarea');
      host.appendChild(textarea);
      const textareaResult = press(textarea);

      const readOnlyArea = document.createElement('textarea');
      readOnlyArea.readOnly = true;
      host.appendChild(readOnlyArea);
      const readOnlyAreaResult = press(readOnlyArea);

      const select = document.createElement('select');
      host.appendChild(select);
      const selectResult = press(select);

      const editable = document.createElement('div');
      editable.contentEditable = 'true';
      host.appendChild(editable);
      const editableResult = press(editable);

      const allowedTypes = ['checkbox', 'radio', 'range', 'button', 'file', 'reset', 'submit', 'color'];
      const allowed = {};
      allowedTypes.forEach((type) => {
        const input = document.createElement('input');
        input.type = type;
        host.appendChild(input);
        allowed[type] = press(input);
      });

      const viaSrcElement = window.hotkeys.filter({ srcElement: text });
      const viaReadOnlySrc = window.hotkeys.filter({ srcElement: readOnly });

      const originalFilter = window.hotkeys.filter;
      let nullFilterFired = false;
      try {
        window.hotkeys.filter = null;
        window.hotkeys('b', () => {
          nullFilterFired = true;
        });
        document.body.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'b', code: 'KeyB', keyCode: 66, which: 66, bubbles: true,
        }));
        document.body.dispatchEvent(new KeyboardEvent('keyup', {
          key: 'b', code: 'KeyB', keyCode: 66, which: 66, bubbles: true,
        }));
      } finally {
        window.hotkeys.filter = originalFilter;
      }

      window.hotkeys.unbind('a');
      window.hotkeys.unbind('b');
      host.remove();
      window.dispatchEvent(new Event('afterprint'));
      return {
        textResult,
        readOnlyResult,
        textareaResult,
        readOnlyAreaResult,
        selectResult,
        editableResult,
        allowed,
        viaSrcElement,
        viaReadOnlySrc,
        nullFilterFired,
      };
    });

    expect(result.textResult).toEqual([]);
    expect(result.textareaResult).toEqual([]);
    expect(result.selectResult).toEqual([]);
    expect(result.editableResult).toEqual([]);
    expect(result.readOnlyResult).toEqual(['a']);
    expect(result.readOnlyAreaResult).toEqual(['a']);
    expect(result.viaSrcElement).toBe(false);
    expect(result.viaReadOnlySrc).toBe(true);
    expect(result.nullFilterFired).toBe(true);
    ['checkbox', 'radio', 'range', 'button', 'file', 'reset', 'submit', 'color'].forEach((type) => {
      expect(result.allowed[type]).toEqual(['a']);
    });
  });

  test('filter ignores text fields inside an open shadow root', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      window.hotkeys.setScope('all');
      window.hotkeys('a', () => calls.push('a'));

      const host = document.createElement('div');
      document.body.appendChild(host);
      const root = host.attachShadow({ mode: 'open' });
      // Real key events are composed, so they reach document with target retargeted to the host.
      const press = (el) => {
        calls.length = 0;
        ['keydown', 'keyup'].forEach((type) => {
          el.dispatchEvent(new KeyboardEvent(type, {
            key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true, composed: true,
          }));
        });
        return calls.slice();
      };

      const text = document.createElement('input');
      root.appendChild(text);
      const editable = document.createElement('div');
      editable.contentEditable = 'true';
      root.appendChild(editable);
      const button = document.createElement('button');
      root.appendChild(button);
      const readOnly = document.createElement('input');
      readOnly.readOnly = true;
      root.appendChild(readOnly);
      const innerHost = document.createElement('div');
      root.appendChild(innerHost);
      const nested = document.createElement('input');
      innerHost.attachShadow({ mode: 'open' }).appendChild(nested);

      const shadowResult = {
        text: press(text),
        editable: press(editable),
        button: press(button),
        readOnly: press(readOnly),
        nested: press(nested),
      };

      window.hotkeys.unbind('a');
      host.remove();
      return shadowResult;
    });

    expect(result.text).toEqual([]);
    expect(result.editable).toEqual([]);
    expect(result.button).toEqual(['a']);
    expect(result.readOnly).toEqual(['a']);
    expect(result.nested).toEqual([]);
  });

  test('stuck modifiers, legacy key codes, and focus or fullscreen resets', async () => {
    const result = await page.evaluate(() => {
      const calls = [];
      window.hotkeys.setScope('all');
      window.dispatchEvent(new Event('afterprint'));

      window.hotkeys('a', () => calls.push('a'));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'CapsLock', code: 'CapsLock', keyCode: 20, which: 20, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'CapsLock', code: 'CapsLock', keyCode: 20, which: 20, bubbles: true,
      }));
      const afterCapsLock = {
        calls: calls.slice(),
        pressed: window.hotkeys.getPressedKeyCodes(),
      };

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true,
      }));
      const beforeMetaUp = window.hotkeys.getPressedKeyCodes();
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Meta', code: 'MetaLeft', keyCode: 91, which: 91, bubbles: true,
      }));
      const afterMetaUp = window.hotkeys.getPressedKeyCodes();

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'x', code: 'KeyX', keyCode: 88, which: 88, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Meta', code: 'MetaLeft', keyCode: 91, which: 91, metaKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k', code: 'KeyK', keyCode: 75, which: 75, metaKey: true, bubbles: true,
      }));
      const duringHeldMeta = window.hotkeys.getPressedKeyCodes();
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Meta', code: 'MetaLeft', keyCode: 91, which: 91, bubbles: true,
      }));

      window.hotkeys('command+a', () => calls.push('command+a'));
      [93, 224].forEach((legacyCode) => {
        window.dispatchEvent(new Event('afterprint'));
        document.body.dispatchEvent(new KeyboardEvent('keydown', {
          keyCode: legacyCode, which: legacyCode, bubbles: true,
        }));
        document.body.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, metaKey: true, bubbles: true,
        }));
        document.body.dispatchEvent(new KeyboardEvent('keyup', {
          key: 'a', code: 'KeyA', keyCode: 65, which: 65, bubbles: true,
        }));
        document.body.dispatchEvent(new KeyboardEvent('keyup', {
          keyCode: legacyCode, which: legacyCode, bubbles: true,
        }));
      });

      window.dispatchEvent(new Event('afterprint'));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        keyCode: 229, which: 229, bubbles: true,
      }));
      const afterIme = window.hotkeys.getPressedKeyCodes();

      window.hotkeys('ctrl+alt+m', () => calls.push('altgraph'));
      const altGraph = new KeyboardEvent('keydown', {
        key: 'm', code: 'KeyM', keyCode: 77, which: 77, bubbles: true, cancelable: true,
      });
      Object.defineProperty(altGraph, 'getModifierState', {
        configurable: true,
        value: (name) => name === 'AltGraph',
      });
      document.body.dispatchEvent(altGraph);
      const duringAltGraph = window.hotkeys.getPressedKeyCodes();
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'm', code: 'KeyM', keyCode: 77, which: 77, bubbles: true,
      }));

      window.hotkeys('f', () => calls.push('focus-key'));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true,
      }));
      const beforeFocus = window.hotkeys.getPressedKeyCodes();
      window.dispatchEvent(new Event('focus'));
      const afterFocus = window.hotkeys.getPressedKeyCodes();

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true,
      }));
      document.dispatchEvent(new Event('fullscreenchange'));
      const afterFullscreen = {
        pressed: window.hotkeys.getPressedKeyCodes(),
        ctrl: window.hotkeys.ctrl,
      };
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true,
      }));
      document.dispatchEvent(new Event('webkitfullscreenchange'));
      const afterWebkitFullscreen = {
        pressed: window.hotkeys.getPressedKeyCodes(),
        ctrl: window.hotkeys.ctrl,
      };

      let star = 0;
      window.hotkeys('*', () => {
        star += 1;
      });
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, bubbles: true,
      }));

      window.hotkeys.unbind('a');
      window.hotkeys.unbind('command+a');
      window.hotkeys.unbind('ctrl+alt+m');
      window.hotkeys.unbind('f');
      window.hotkeys.unbind('*');
      window.dispatchEvent(new Event('afterprint'));

      return {
        afterCapsLock,
        beforeMetaUp,
        afterMetaUp,
        duringHeldMeta,
        calls,
        afterIme,
        duringAltGraph,
        beforeFocus,
        afterFocus,
        afterFullscreen,
        afterWebkitFullscreen,
        star,
      };
    });

    expect(result.afterCapsLock).toEqual({ calls: [], pressed: [] });
    expect(result.beforeMetaUp).toEqual(expect.arrayContaining([65, 17]));
    expect(result.afterMetaUp).toEqual([]);
    expect(result.duringHeldMeta).toEqual(expect.arrayContaining([91, 75]));
    expect(result.duringHeldMeta).not.toContain(88);
    expect(result.calls).toEqual(expect.arrayContaining(['command+a', 'altgraph']));
    expect(result.calls.filter((name) => name === 'command+a')).toHaveLength(2);
    expect(result.afterIme).toEqual([]);
    expect(result.duringAltGraph).toEqual(expect.arrayContaining([17, 18, 77]));
    expect(result.beforeFocus).toEqual(expect.arrayContaining([70]));
    expect(result.afterFocus).toEqual([]);
    expect(result.afterFullscreen).toEqual({ pressed: [], ctrl: false });
    expect(result.afterWebkitFullscreen).toEqual({ pressed: [], ctrl: false });
    expect(result.star).toBeGreaterThan(0);
  });

  test('handlers can stop the event, target one element, and unbind selectively', async () => {
    const result = await page.evaluate(() => {
      window.hotkeys.setScope('all');
      window.dispatchEvent(new Event('afterprint'));
      const calls = [];

      const host = document.createElement('div');
      document.body.appendChild(host);
      const onlyUp = document.createElement('div');
      document.body.appendChild(onlyUp);

      window.hotkeys('e', { element: host }, () => calls.push('host'));
      window.hotkeys('e', () => calls.push('document'));
      host.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'e', code: 'KeyE', keyCode: 69, which: 69, bubbles: true, cancelable: true,
      }));
      host.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'e', code: 'KeyE', keyCode: 69, which: 69, bubbles: true,
      }));

      window.hotkeys('f', {
        element: onlyUp, capture: true, keyup: true, keydown: false,
      }, () => calls.push('keyup-only'));
      onlyUp.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true,
      }));
      onlyUp.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true,
      }));

      window.dispatchEvent(new Event('afterprint'));
      const stopped = new KeyboardEvent('keydown', {
        key: 'r', code: 'KeyR', keyCode: 82, which: 82, bubbles: true, cancelable: true,
      });
      window.hotkeys('r', () => false);
      const dispatched = document.body.dispatchEvent(stopped);
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'r', code: 'KeyR', keyCode: 82, which: 82, bubbles: true,
      }));

      window.dispatchEvent(new Event('afterprint'));
      const legacy = new KeyboardEvent('keydown', {
        key: 't', code: 'KeyT', keyCode: 84, which: 84, bubbles: true, cancelable: true,
      });
      const originalPreventDefault = KeyboardEvent.prototype.preventDefault;
      Object.defineProperty(KeyboardEvent.prototype, 'preventDefault', {
        configurable: true,
        writable: true,
        value: undefined,
      });
      let legacyRan = false;
      window.hotkeys('t', () => {
        legacyRan = true;
        return false;
      });
      try {
        document.body.dispatchEvent(legacy);
      } finally {
        Object.defineProperty(KeyboardEvent.prototype, 'preventDefault', {
          configurable: true,
          writable: true,
          value: originalPreventDefault,
        });
      }
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 't', code: 'KeyT', keyCode: 84, which: 84, bubbles: true,
      }));

      const keep = () => calls.push('keep');
      const drop = () => calls.push('drop');
      window.hotkeys('u', keep);
      window.hotkeys('u', drop);
      window.hotkeys.unbind('u', drop);
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'u', code: 'KeyU', keyCode: 85, which: 85, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'u', code: 'KeyU', keyCode: 85, which: 85, bubbles: true,
      }));

      window.hotkeys('ctrl+a', { scope: 'array-scope' }, () => calls.push('array-a'));
      window.hotkeys('ctrl+b', { scope: 'array-scope' }, () => calls.push('array-b'));
      window.hotkeys.setScope('array-scope');
      window.hotkeys.unbind([
        { key: 'ctrl+a', scope: 'array-scope' },
        { scope: 'array-scope' },
      ]);
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'b', code: 'KeyB', keyCode: 66, which: 66, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'b', code: 'KeyB', keyCode: 66, which: 66, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, bubbles: true,
      }));

      window.hotkeys('d', { scope: 'delete-me' }, () => calls.push('deleted-scope'));
      window.hotkeys.setScope('delete-me');
      window.hotkeys.deleteScope();
      const scopeAfterDelete = window.hotkeys.getScope();
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'd', code: 'KeyD', keyCode: 68, which: 68, bubbles: true,
      }));
      window.hotkeys.setScope('');
      const scopeAfterEmpty = window.hotkeys.getScope();

      const attached = [];
      const detached = [];
      const legacyElement = {
        attachEvent(name) { attached.push(name); },
        detachEvent(name) { detached.push(name); },
      };
      window.hotkeys('z', { element: legacyElement }, () => {});
      window.hotkeys.unbind('z');

      const current = window.hotkeys;
      const returned = current.noConflict(true);
      const replacedWithPrevious = window.hotkeys === undefined;
      window.hotkeys = current;

      window.hotkeys.unbind('e');
      window.hotkeys.unbind('f');
      window.hotkeys.unbind('r');
      window.hotkeys.unbind('t');
      window.hotkeys.unbind('u');
      window.hotkeys.deleteScope('array-scope');
      window.hotkeys.setScope('all');
      host.remove();
      onlyUp.remove();
      window.dispatchEvent(new Event('afterprint'));

      return {
        calls,
        dispatched,
        defaultPrevented: stopped.defaultPrevented,
        legacyRan,
        returnValue: legacy.returnValue,
        scopeAfterDelete,
        scopeAfterEmpty,
        attached,
        detached,
        noConflictSame: returned === current,
        replacedWithPrevious,
      };
    });

    expect(result.calls).toEqual(expect.arrayContaining([
      'host', 'document', 'keyup-only', 'keep', 'array-b',
    ]));
    expect(result.calls).not.toEqual(expect.arrayContaining([
      'drop', 'array-a', 'deleted-scope',
    ]));
    expect(result.dispatched).toBe(false);
    expect(result.defaultPrevented).toBe(true);
    expect(result.legacyRan).toBe(true);
    expect(result.returnValue).toBe(false);
    expect(result.scopeAfterDelete).toBe('all');
    expect(result.scopeAfterEmpty).toBe('all');
    expect(result.attached).toEqual(expect.arrayContaining(['onkeydown', 'onkeyup']));
    expect(result.detached).toEqual(expect.arrayContaining(['onkeydown', 'onkeyup']));
    expect(result.noConflictSame).toBe(true);
    expect(result.replacedWithPrevious).toBe(true);
  });

  test('unbind() removes every shortcut and a later binding still works', async () => {
    const result = await page.evaluate(() => {
      window.hotkeys.setScope('all');
      const calls = [];
      window.hotkeys('n', 'named-scope', () => calls.push('named'));
      window.hotkeys.setScope('named-scope');
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'n', code: 'KeyN', keyCode: 78, which: 78, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'n', code: 'KeyN', keyCode: 78, which: 78, bubbles: true,
      }));
      window.hotkeys.setScope('all');
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'n', code: 'KeyN', keyCode: 78, which: 78, bubbles: true,
      }));
      window.hotkeys.deleteScope('named-scope');

      window.hotkeys('ctrl+a', { scope: 'cmp-scope' }, () => calls.push('cmp'));
      window.hotkeys.unbind({ key: 'ctrl+shift+a', scope: 'cmp-scope' });
      window.hotkeys.unbind('missing-shortcut');
      window.hotkeys.setScope('cmp-scope');
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a', code: 'KeyA', keyCode: 65, which: 65, ctrlKey: true, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, bubbles: true,
      }));
      window.hotkeys.deleteScope('cmp-scope');
      window.hotkeys.setScope('all');

      const duplicateHost = document.createElement('div');
      document.body.appendChild(duplicateHost);
      window.hotkeys('g', { element: duplicateHost }, () => {});
      window.hotkeys('g', { element: duplicateHost }, () => {});
      window.hotkeys('h', () => {});
      window.hotkeys.unbind('g');
      window.hotkeys.unbind('h');
      duplicateHost.remove();
      window.hotkeys(undefined, () => {});

      window.hotkeys('q', () => calls.push('before'));
      window.hotkeys('w', { scope: 'other' }, () => calls.push('other'));
      window.hotkeys.unbind();

      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'q', code: 'KeyQ', keyCode: 81, which: 81, bubbles: true,
      }));
      window.hotkeys.setScope('other');
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'w', code: 'KeyW', keyCode: 87, which: 87, bubbles: true,
      }));

      window.hotkeys.setScope('all');
      window.hotkeys('q', () => calls.push('after'));
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'q', code: 'KeyQ', keyCode: 81, which: 81, bubbles: true,
      }));
      document.body.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'q', code: 'KeyQ', keyCode: 81, which: 81, bubbles: true,
      }));
      window.hotkeys.unbind('q');
      return calls;
    });

    expect(result).toEqual(['named', 'cmp', 'after']);
  });

  test('UMD build also loads through AMD and the browser global, with Firefox key codes', async () => {
    const loadBuild = () => page.evaluate(() => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../dist/hotkeys-js.umd.cjs';
      script.onload = () => resolve({
        type: typeof window.hotkeys,
        minus: window.hotkeys.keyMap['-'],
        equal: window.hotkeys.keyMap['='],
        semicolon: window.hotkeys.keyMap[';'],
        amdCalls: window.__amdCalls || 0,
      });
      script.onerror = () => reject(new Error('failed to reload hotkeys-js.umd.cjs'));
      document.body.appendChild(script);
    }));

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
    );
    await page.evaluate(() => {
      delete window.module;
      delete window.exports;
      window.__amdCalls = 0;
      window.define = function define(deps, factory) {
        window.__amdCalls += 1;
        const fn = typeof deps === 'function' ? deps : factory;
        return typeof fn === 'function' ? fn() : undefined;
      };
      window.define.amd = {};
    });
    const amd = await loadBuild();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.evaluate(() => {
      delete window.module;
      delete window.exports;
      delete window.define;
    });
    const browserGlobal = await loadBuild();

    const withoutNavigator = await page.evaluate(() => new Promise((resolve) => {
      try {
        Object.defineProperty(window, 'navigator', {
          configurable: true,
          get() {
            return undefined;
          },
        });
      } catch (error) {
        resolve({ overridden: false, message: error.message });
        return;
      }
      if (typeof navigator !== 'undefined') {
        resolve({ overridden: false, type: typeof navigator });
        return;
      }
      delete window.module;
      delete window.exports;
      delete window.define;
      const script = document.createElement('script');
      script.src = '../dist/hotkeys-js.umd.cjs';
      script.onload = () => resolve({
        overridden: true,
        type: typeof window.hotkeys,
      });
      script.onerror = () => resolve({ overridden: true, type: 'error' });
      document.body.appendChild(script);
    }));

    expect(amd.type).toBe('function');
    expect(amd.amdCalls).toBeGreaterThan(0);
    expect(amd.minus).toBe(173);
    expect(amd.equal).toBe(61);
    expect(amd.semicolon).toBe(59);
    expect(browserGlobal.type).toBe('function');
    expect(browserGlobal.minus).toBe(189);
    expect(browserGlobal.equal).toBe(187);
    expect(browserGlobal.semicolon).toBe(186);
    expect(withoutNavigator.overridden).toBe(true);
    expect(withoutNavigator.type).toBe('function');
  });

  afterAll(async () => {
    if (!browser) {
      return;
    }

    // Collect coverage data. Reloading one build produces several entries for
    // the same URL; merge them so each file is measured once.
    const jsCoverage = mergeCoverageEntries(page ? await page.coverage.stopJSCoverage() : []);
    
    // Convert to Istanbul/Jest compatible coverage format
    global.__coverage__ = global.__coverage__ || {};
    
    for (const entry of jsCoverage) {
      // Only process hotkeys related files
      if (entry.url.includes('hotkeys') && !entry.url.includes('test')) {
        // Handle file path correctly, remove file:// prefix
        const filePath = entry.url.replace(/^file:\/\//, '');
        const sourceMap = createCoverageMap(entry, filePath);
        
        // Add to global coverage object
        global.__coverage__[filePath] = sourceMap;
      }
    }
    
    // Calculate total coverage for logging
    let totalBytes = 0;
    let usedBytes = 0;
    for (const entry of jsCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start;
      }
    }
    const coverage = (usedBytes / totalBytes) * 100;
    console.log(`JS Coverage: ${coverage.toFixed(2)}%`);

    // Save coverage metrics to file for CI/Actions usage
    const coverageDir = path.join(process.cwd(), 'coverage');
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }

    // Save coverage as simple text for easy shell script access
    fs.writeFileSync(
      path.join(coverageDir, 'js-coverage.txt'), 
      `${coverage.toFixed(2)}`
    );
    
    console.log(`Coverage metrics saved to: ${path.join(coverageDir, 'js-coverage.txt')}`);
    
    await browser.close();
  });
});

jest.setTimeout(30000);

function mergeCoverageEntries(entries) {
  const byUrl = new Map();
  entries.forEach((entry) => {
    const current = byUrl.get(entry.url);
    if (!current) {
      byUrl.set(entry.url, { ...entry, ranges: entry.ranges.slice() });
      return;
    }
    current.ranges = current.ranges.concat(entry.ranges);
  });
  return Array.from(byUrl.values()).map((entry) => ({
    ...entry,
    ranges: unionRanges(entry.ranges),
  }));
}

function unionRanges(ranges) {
  const sorted = ranges.slice().sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  sorted.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ start: range.start, end: range.end });
      return;
    }
    last.end = Math.max(last.end, range.end);
  });
  return merged;
}

// Helper function to convert Puppeteer coverage data to Istanbul format
function createCoverageMap(entry, filePath) {
  const fs = require('fs');
  
  // Read source file content to create detailed line mapping
  let sourceText = '';
  try {
    sourceText = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    sourceText = entry.text; // Fallback to entry.text
  }
  
  const lines = sourceText.split('\n');
  const statements = {};
  const functions = {};
  const branches = {};
  const statementMap = {};
  const functionMap = {};
  const branchMap = {};
  
  let statementId = 1;
  
  // Create statement mapping for each line of code
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const lineLength = line.length;
    
    if (line.trim().length > 0) { // Only process non-empty lines
      const id = String(statementId++);
      statementMap[id] = {
        start: { line: lineNumber, column: 0 },
        end: { line: lineNumber, column: lineLength }
      };
      
      // Check if this line is covered
      let covered = 0;
      let lineStartOffset = lines.slice(0, lineIndex).reduce((acc, l) => acc + l.length + 1, 0);
      let lineEndOffset = lineStartOffset + lineLength;
      
      for (const range of entry.ranges) {
        if (range.start <= lineEndOffset && range.end >= lineStartOffset) {
          covered = Math.max(covered, range.count || 1);
        }
      }
      
      statements[id] = covered;
    }
  });
  
  // If no statement mappings exist, create default ones
  if (Object.keys(statements).length === 0) {
    statementMap['1'] = {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 100 }
    };
    statements['1'] = entry.ranges.length > 0 ? 1 : 0;
  }
  
  // Add some function mappings (based on simple function detection)
  lines.forEach((line, lineIndex) => {
    if (line.includes('function') || line.includes('=>') || line.includes('class')) {
      const lineNumber = lineIndex + 1;
      const functionId = String(Object.keys(functionMap).length + 1);
      
      functionMap[functionId] = {
        name: `function_${functionId}`,
        decl: { 
          start: { line: lineNumber, column: 0 },
          end: { line: lineNumber, column: line.length }
        },
        loc: { 
          start: { line: lineNumber, column: 0 },
          end: { line: lineNumber, column: line.length }
        },
        line: lineNumber
      };
      
      // Check if function is executed
      let functionCovered = 0;
      let lineStartOffset = lines.slice(0, lineIndex).reduce((acc, l) => acc + l.length + 1, 0);
      let lineEndOffset = lineStartOffset + line.length;
      
      for (const range of entry.ranges) {
        // Puppeteer ranges omit `count`. Treat a missing count as covered.
        const count = range.count == null ? 1 : range.count;
        if (range.start <= lineEndOffset && range.end >= lineStartOffset && count > 0) {
          functionCovered = count;
          break;
        }
      }
      
      functions[functionId] = functionCovered;
    }
  });
  
  return {
    path: filePath,
    statementMap,
    fnMap: functionMap,
    branchMap,
    s: statements,
    f: functions,
    b: branches,
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "coverage-" + Date.now()
  };
}
