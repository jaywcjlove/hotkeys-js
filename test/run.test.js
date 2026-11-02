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
