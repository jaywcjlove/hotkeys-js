/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const path = require('path');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  page = await browser.newPage();

  // Enable coverage collection
  await page.coverage.startJSCoverage();

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
    // Collect coverage data
    const jsCoverage = await page.coverage.stopJSCoverage();
    
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
    const fs = require('fs');
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
        if (range.start <= lineEndOffset && range.end >= lineStartOffset && range.count > 0) {
          functionCovered = range.count;
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