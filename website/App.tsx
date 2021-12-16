import React, { Component } from 'react';
import GithubCorner from '@uiw/react-github-corners';
import { Github } from '@uiw/react-shields';
import MarkdownPreview from '@uiw/react-markdown-preview';
import KeyBoard, { KeyCodeData } from '@uiw/react-mac-keyboard';
import Footer from './components/Footer';
import styles from './styles/index.module.less';
import DocumentStr from '../README.md';
import hotkeys from '..';
import pkg from '../package.json';

type ArrayT<T, T1=T> = Array<T | T1>

interface AppProps {

}
interface AppState {
  keyCode: ArrayT<number>;
  keyStr: ArrayT<string, number>;
}
export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      keyCode: [],
      keyStr: [],
    };
    this.onKeyUpEvent = this.onKeyUpEvent.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.onKeyUpEvent);
    function pkeys(keys: ArrayT<number>, key: number): ArrayT<number> {
      if (keys.indexOf(key) === -1) keys.push(key);
      return keys;
    }
    function pkeysStr(keysStr: ArrayT<string, number>, key: string): ArrayT<string, number> {
      if (keysStr.indexOf(key) === -1) keysStr.push(key);
      return keysStr;
    }
    hotkeys('*', (evn): void => {
      (evn as any).preventDefault();
      const keys: ArrayT<number> = [];
      const keyStr: ArrayT<number, string> = [];
      if (hotkeys.shift) {
        pkeys(keys, 16);
        pkeysStr(keyStr, 'shift');
      }
      if (hotkeys.ctrl) {
        pkeys(keys, 17);
        pkeysStr(keyStr, 'ctrl');
      }
      if (hotkeys.alt) {
        pkeys(keys, 18);
        pkeysStr(keyStr, 'alt');
      }
      if (hotkeys.control) {
        pkeys(keys, 17);
        pkeysStr(keyStr, 'control');
      }
      if (hotkeys.command) {
        pkeys(keys, 91);
        pkeysStr(keyStr, 'command');
      }
      keyStr.push(evn.keyCode);
      if (keys.indexOf(evn.keyCode) === -1) keys.push(evn.keyCode);
      this.setState({ keyCode: keys, keyStr });
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.onKeyUpEvent);
  }

  onKeyUpEvent() {
    this.setState({ keyCode: [], keyStr: [] });
  }

  onKeyBoardMouseDown(item: KeyCodeData) {
    if (item.keycode > -1) {
      this.setState({ keyStr: [item.keycode] });
    }
  }

  onKeyBoardMouseUp() {
    this.setState({ keyStr: [] });
  }

  openVersionWebsite(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target && e.target.value) {
      window.location.href = e.target.value;
    }
  }

  render() {
    const { keyStr, keyCode } = this.state;
    let DocumentStrSource: string | undefined = DocumentStr;
    if (DocumentStrSource) DocumentStrSource = DocumentStr.replace(/([\s\S]*)<!--dividing-->/, '');
    return (
      <div>
        <select className={styles.version} onChange={this.openVersionWebsite.bind(this)}>
          <option value="https://jaywcjlove.github.io/hotkeys">
            v
            {pkg.version}
          </option>
          <option value="https://unpkg.com/hotkeys-js@3.4.3/doc/index.html">v3.4.3</option>
          <option value="https://unpkg.com/hotkeys-js@3.4.2/doc/index.html">v3.4.2</option>
          <option value="https://unpkg.com/hotkeys-js@2.0.10/doc/index.html">v2.0.10</option>
        </select>
        {keyStr.length > -1 && (
          <div className={styles.keyCodeInfo}>
            {keyStr.map((item) => <span key={`${item}`}>{item}</span>)}
          </div>
        )}
        <GithubCorner href="https://github.com/jaywcjlove/hotkeys" target="__blank" />
        <div className={styles.header}>
          <div className={styles.title}>HotKeys.js</div>
          <div className={styles.github}>
            <a href="https://www.npmjs.com/package/hotkeys-js">
              <button type="button">On NPM</button>
            </a>
            <a href="https://github.com/jaywcjlove/hotkeys/">
              <button type="button">Fork on Github</button>
            </a>
            <a href="https://github.com/jaywcjlove/hotkeys/">
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
          onMouseDown={(e: React.MouseEvent<HTMLLIElement, MouseEvent>, item:KeyCodeData) => this.onKeyBoardMouseDown(item)}
          onMouseUp={this.onKeyBoardMouseUp.bind(this)}
          keyCode={keyCode}
        />
        <MarkdownPreview style={{ maxWidth: 995, margin: '0 auto' }} source={DocumentStrSource} />
        <Footer name="Kenny Wong" href="http://jaywcjlove.github.io" year="2015-present">
          <Github user="jaywcjlove" repo="hotkeys">
            <Github.Social href="https://github.com/jaywcjlove/hotkeys" type="forks" />
            <Github.Social href="https://github.com/jaywcjlove/hotkeys" type="stars" />
            <Github.Social href="https://github.com/jaywcjlove/hotkeys" type="watchers" />
            <Github.Social href="https://github.com/jaywcjlove/hotkeys" type="followers" />
          </Github>
        </Footer>
      </div>
    );
  }
}
