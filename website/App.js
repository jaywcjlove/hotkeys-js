import React, { Component } from 'react';
import GithubCorner from './components/GithubCorner';
import KeyBoard from './components/KeyBoard';
import Footer from './components/Footer';
import Markdown from './components/Markdown';
import GithubShields from './components/GithubShields';
import styles from './styles/index.less';
import DocumentStr from '../README.md';
import hotkeys from '../dist/hotkeys.common';
import pkg from '../package.json';

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      keyCode: [],
      keyStr: [],
    };
    this.onKeyUpEvent = this.onKeyUpEvent.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keyup', this.onKeyUpEvent);
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
      const keyStr = [];
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
    return false;
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.onKeyUpEvent);
  }
  onKeyUpEvent() {
    this.setState({ keyCode: [], keyStr: [] });
  }
  onKeyBoardMouseDown(item) {
    if (item.keycode > -1) {
      this.setState({ keyStr: [item.keycode] });
    }
  }
  onKeyBoardMouseUp() {
    this.setState({ keyStr: [] });
  }
  openVersionWebsite(e) {
    if (e.target && e.target.value) {
      window.location.href = e.target.value;
    }
  }
  render() {
    const { keyStr } = this.state;
    let DocumentStrSource = DocumentStr;
    if (DocumentStrSource) DocumentStrSource = DocumentStr.replace(/([\s\S]*)<!--dividing-->/, '');
    return (
      <div>
        <select className={styles.version} onChange={this.openVersionWebsite.bind(this)}>
          <option value="https://jaywcjlove.github.io/hotkeys">v{pkg.version}</option>
          <option value="https://unpkg.com/hotkeys-js@3.4.2/doc/index.html">v3.4.2</option>
          <option value="https://unpkg.com/hotkeys-js@2.0.10/doc/index.html">v2.0.10</option>
        </select>
        {keyStr.length > -1 && (
          <div className={styles.keyCodeInfo}>
            {keyStr.map(item => <span key={`${item}`}>{item}</span>)}
          </div>
        )}
        <GithubCorner url="https://github.com/jaywcjlove/hotkeys" />
        <div className={styles.header}>
          <div className={styles.title}>HotKeys.js</div>
          <div className={styles.github}>
            <a href="https://www.npmjs.com/package/hotkeys-js">
              <button>On NPM</button>
            </a>
            <a href="https://github.com/jaywcjlove/hotkeys/">
              <button>Fork on Github</button>
            </a>
            <a href="https://github.com/jaywcjlove/hotkeys/">
              <button>Doc on Github</button>
            </a>
          </div>
          <div className={styles.info}>A robust Javascript library for capturing keyboard input and key combinations entered. It has no dependencies. Try to press your keyboard, The following button will highlight.</div>
        </div>
        <KeyBoard
          onMouseDown={this.onKeyBoardMouseDown.bind(this)}
          onMouseUp={this.onKeyBoardMouseUp.bind(this)}
          keyCode={this.state.keyCode}
        />
        <Markdown source={DocumentStrSource} />
        <GithubShields
          source={[
            {
              href: 'https://github.com/jaywcjlove/hotkeys/stargazers',
              img: 'https://img.shields.io/github/stars/jaywcjlove/hotkeys.svg?style=social',
            },
            {
              href: 'https://github.com/jaywcjlove/hotkeys/network',
              img: 'https://img.shields.io/github/forks/jaywcjlove/hotkeys.svg?style=social',
            },
            {
              href: 'https://github.com/jaywcjlove/hotkeys/watchers',
              img: 'https://img.shields.io/github/watchers/jaywcjlove/hotkeys.svg?style=social&label=Watch',
            },
            {
              href: 'https://github.com/jaywcjlove/followers',
              img: 'https://img.shields.io/github/followers/jaywcjlove.svg?style=social',
            },
          ]}
        />
        <Footer name="Kenny Wong" href="http://jaywcjlove.github.io" year="2015-present" />
      </div>
    );
  }
}
