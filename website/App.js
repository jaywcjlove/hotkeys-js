import React, { useEffect, useState } from 'react';
import GithubCorner from '@uiw/react-github-corners';
import { Github } from '@uiw/react-shields';
import MarkdownPreview from '@uiw/react-markdown-preview';
import KeyBoard from '@uiw/react-mac-keyboard';
import '@wcj/dark-mode';
import Footer from './components/Footer';
import styles from './styles/index.module.less';
import DocumentStr from '../README.md';
import hotkeys from '..';
import pkg from '../package.json';

export default function AppRoot() {
  const [keyCode, setKeyCode] = useState([]);
  const [keyStr, setKeyStr] = useState([]);

  useEffect(() => {
    document.addEventListener('keyup', onKeyUpEvent);

    function pkeys(keys, key) {
      if (keys.indexOf(key) === -1) keys.push(key);
      return keys;
    }
    function pkeysStr(keysStr, key) {
      if (keysStr.indexOf(key) === -1) keysStr.push(key);
      return keysStr;
    }

    hotkeys('*', (evn) => {
      evn.preventDefault();
      const keys = [];
      const kStr = [];
      if (hotkeys.shift) {
        pkeys(keys, 16);
        pkeysStr(kStr, 'shift');
      }
      if (hotkeys.ctrl) {
        pkeys(keys, 17);
        pkeysStr(kStr, 'ctrl');
      }
      if (hotkeys.alt) {
        pkeys(keys, 18);
        pkeysStr(kStr, 'alt');
      }
      if (hotkeys.control) {
        pkeys(keys, 17);
        pkeysStr(kStr, 'control');
      }
      if (hotkeys.command) {
        pkeys(keys, 91);
        pkeysStr(kStr, 'command');
      }
      kStr.push(evn.keyCode);
      if (keys.indexOf(evn.keyCode) === -1) keys.push(evn.keyCode);

      setKeyCode(keys);
      setKeyStr(kStr);
    });

    return () => {
      document.removeEventListener('keyup', onKeyUpEvent);
    };
  }, []);

  let DocumentStrSource = DocumentStr;
  if (DocumentStrSource) DocumentStrSource = DocumentStr.replace(/([\s\S]*)<!--dividing-->/, '');
  const openVersionWebsite = (e) => {
    if (e.target && e.target.value) {
      window.location.href = e.target.value;
    }
  };

  const onKeyUpEvent = () => {
    setKeyCode([]);
    setKeyStr([]);
  };

  const onKeyBoardMouseDown = (item) => {
    if (item.keycode > -1) {
      setKeyStr([item.keycode]);
    }
  };

  const onKeyBoardMouseUp = () => setKeyStr([]);

  return (
    <div>
      <div className={styles.tools}>
        <select className={styles.version} onChange={openVersionWebsite}>
          <option value="https://jaywcjlove.github.io/hotkeys-js">
            v
            {pkg.version}
          </option>
          <option value="https://unpkg.com/hotkeys-js@3.4.3/doc/index.html">v3.4.3</option>
          <option value="https://unpkg.com/hotkeys-js@3.4.2/doc/index.html">v3.4.2</option>
          <option value="https://unpkg.com/hotkeys-js@2.0.10/doc/index.html">v2.0.10</option>
        </select>
        <dark-mode permanent />
      </div>
      {keyStr.length > -1 && (
        <div className={styles.keyCodeInfo}>
          {keyStr.map((item) => <span key={`${item}`}>{item}</span>)}
        </div>
      )}
      <GithubCorner href="https://github.com/jaywcjlove/hotkeys-js" target="__blank" />
      <div className={styles.header}>
        <div className={styles.title}>HotKeys.js</div>
        <div className={styles.github}>
          <a href="https://www.npmjs.com/package/hotkeys-js">
            <button type="button">On NPM</button>
          </a>
          <a href="https://github.com/jaywcjlove/hotkeys-js/">
            <button type="button">Fork on Github</button>
          </a>
          <a href="https://github.com/jaywcjlove/hotkeys-js/">
            <button type="button">Doc on Github</button>
          </a>
          <a href="https://jaywcjlove.gitee.io/hotkeys/">
            <button type="button">Doc on Gitee</button>
          </a>
        </div>
        <div className={styles.info}>A robust Javascript library for capturing keyboard input and key combinations entered. It has no dependencies. Try to press your keyboard, The following button will highlight.</div>
      </div>
      <KeyBoard
        style={{ top: -40 }}
        onMouseDown={onKeyBoardMouseDown.bind(this)}
        onMouseUp={onKeyBoardMouseUp}
        keyCode={keyCode}
      />
      <MarkdownPreview style={{ maxWidth: 995, margin: '0 auto' }} source={DocumentStrSource} />
      <Footer name="Kenny Wong" href="http://jaywcjlove.github.io" year="2015-present">
        <Github user="jaywcjlove" repo="hotkeys-js">
          <Github.Social href="https://github.com/jaywcjlove/hotkeys-js" type="forks" />
          <Github.Social href="https://github.com/jaywcjlove/hotkeys-js" type="stars" />
          <Github.Social href="https://github.com/jaywcjlove/hotkeys-js" type="watchers" />
          <Github.Social href="https://github.com/jaywcjlove/hotkeys-js" type="followers" />
        </Github>
      </Footer>
    </div>
  );
}
