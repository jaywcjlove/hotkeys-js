const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

let browser;
let page;

// Helper function to trigger keyboard events in browser
async function triggerKeyboardEvent(page, keyCode, options = {}) {
  return await page.evaluate(({ keyCode, options }) => {
    const event = new KeyboardEvent('keydown', {
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    document.body.dispatchEvent(event);
  }, { keyCode, options });
}

async function triggerKeyboardUp(page, keyCode, options = {}) {
  return await page.evaluate(({ keyCode, options }) => {
    const event = new KeyboardEvent('keyup', {
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    document.body.dispatchEvent(event);
  }, { keyCode, options });
}

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
    expect(result.pressedKeys).toEqual(expect.arrayContaining([16, 17, 65, 91]));
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
    expect(result.pressedKeys).toEqual(expect.arrayContaining(['⇧', '⌃', 'A', '⌘']));
  });

  test('HotKeys unbind Test Case', async () => {
    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let isExecuteFunction = false;
        window.hotkeys('enter', (e) => {
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
        let isExecuteFunction = false;
        window.hotkeys('enter', (e) => {
          isExecuteFunction = true;
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

  afterAll(async () => {
    await browser.close();
  });
});

jest.setTimeout(30000);
