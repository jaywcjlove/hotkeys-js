import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import classNames from 'classnames';
import styles from './styles/index.less';

hljs.configure({
  tabReplace: '  ', // 2 spaces
  classPrefix: '', // don't append class prefix
});

export default class Markdown extends Component {
  componentDidMount() {
    const code = this.node.getElementsByTagName('code');
    for (let i = 0; i < code.length; i += 1) {
      if (code[i].parentNode && code[i].parentNode.tagName === 'PRE') {
        hljs.highlightBlock(code[i]);
      }
    }
  }
  render() {
    const { source } = this.props;
    return (
      <div ref={(node) => { this.node = node; }}>
        <ReactMarkdown
          className={classNames(styles.markdown, 'markdown')}
          source={source}
          escapeHtml={false}
          allowNode={(node) => {
            if (node.type === 'html') {
              if (/<!--([^]+?)-->/.test(node.value)) return false;
              // const scriptValue = node.value.match(/<script.*?>(.*?)<\/script>/ig);
              // node.value.replace(/<script.*?>(.*?)<\/script>/, (te) => {
              //   console.log('te:', te);
              // });
            }
            return node;
          }}
        />
      </div>
    );
  }
}
