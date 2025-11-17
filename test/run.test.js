/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const path = require('path');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  page = await browser.newPage();

  // Load the test HTML file
  const htmlPath = path.resolve(__dirname, './index.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2' });
}, 1000 * 120);

describe('\n   Hotkeys.js Test Case\n', () => {
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

  afterAll(async () => {
    await browser.close();
  });
});

jest.setTimeout(30000);
