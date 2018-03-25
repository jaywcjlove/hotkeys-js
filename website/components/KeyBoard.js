import React from 'react';
import classNames from 'classnames';

import styles from './KeyBoard.less';

const keyCode = [
  { keycode: 27, name: ['esc'] },
  { keycode: 112, name: ['F1'] },
  { keycode: 113, name: ['F2'] },
  { keycode: 114, name: ['F3'] },
  { keycode: 115, name: ['F4'] },
  { keycode: 116, name: ['F5'] },
  { keycode: 117, name: ['F6'] },
  { keycode: 118, name: ['F7'] },
  { keycode: 119, name: ['F8'] },
  { keycode: 120, name: ['F9'] },
  { keycode: 121, name: ['F10'] },
  { keycode: 122, name: ['F11'] },
  { keycode: 123, name: ['F12'] },
  { keycode: -1, name: ['〇'] },
  { keycode: 192, name: ['~', '`'] },
  { keycode: 49, name: ['!', '1'] },
  { keycode: 50, name: ['@', '2'] },
  { keycode: 51, name: ['#', '3'] },
  { keycode: 52, name: ['$', '4'] },
  { keycode: 53, name: ['%', '5'] },
  { keycode: 54, name: ['^', '6'] },
  { keycode: 55, name: ['&', '7'] },
  { keycode: 56, name: ['*', '8'] },
  { keycode: 57, name: ['(', '9'] },
  { keycode: 48, name: [')', '0'] },
  { keycode: 189, name: ['＿', '-'] },
  { keycode: 187, name: ['＋', ': '] },
  { keycode: 8, name: ['delete'] },
  { keycode: 9, name: ['tab'] },
  { keycode: 81, name: ['Q'] },
  { keycode: 87, name: ['W'] },
  { keycode: 69, name: ['E'] },
  { keycode: 82, name: ['R'] },
  { keycode: 84, name: ['T'] },
  { keycode: 89, name: ['Y'] },
  { keycode: 85, name: ['U'] },
  { keycode: 73, name: ['I'] },
  { keycode: 79, name: ['O'] },
  { keycode: 80, name: ['P'] },
  { keycode: 219, name: ['{', '['] },
  { keycode: 221, name: ['}', ']'] },
  { keycode: 220, name: ['|', '\\'] },
  { keycode: 20, name: ['', 'CapsLock'] },
  { keycode: 65, name: ['A'] },
  { keycode: 83, name: ['S'] },
  { keycode: 68, name: ['D'] },
  { keycode: 70, name: ['F'] },
  { keycode: 71, name: ['G'] },
  { keycode: 72, name: ['H'] },
  { keycode: 74, name: ['J'] },
  { keycode: 75, name: ['K'] },
  { keycode: 76, name: ['L'] },
  { keycode: 186, name: [':', ';'] },
  { keycode: 222, name: ['"', '\''] },
  { keycode: 13, name: ['enter', 'return'] },
  { keycode: 16, name: ['⇧'] },
  { keycode: 90, name: ['Z'] },
  { keycode: 88, name: ['X'] },
  { keycode: 67, name: ['C'] },
  { keycode: 86, name: ['V'] },
  { keycode: 66, name: ['B'] },
  { keycode: 78, name: ['N'] },
  { keycode: 77, name: ['M'] },
  { keycode: 188, name: ['<', ','] },
  { keycode: 190, name: ['>', '.'] },
  { keycode: 191, name: ['?', '/'] },
  { keycode: 16, name: ['⇧'] },
  { keycode: -1, name: ['fn'] },
  { keycode: 17, name: ['control'] },
  { keycode: 18, name: ['alt', 'option'] },
  { keycode: 91, name: ['command'] },
  { keycode: 32, name: [''] },
  { keycode: 93, name: ['command'] },
  { keycode: 18, name: ['alt', 'option'] },
  { keycode: 37, name: ['◀'] },
  { keycode: 38, name: ['▲'] },
  { keycode: 39, name: ['▶'] },
  { keycode: 40, name: ['▼'] },
];

export default function KeyBoard({ keyCode: keyCodeNum, onMouseDown, onMouseUp }) {
  return (
    <div className={styles.keyboard}>
      <ul>
        {keyCode.map((item, idx) => {
          const name = item.name.map((_item, _idx) => <span key={`${_idx}`}>{_item}</span>);
          return (
            <li
              key={idx}
              onMouseDown={() => onMouseDown(item)}
              onMouseUp={() => onMouseUp(item)}
              className={classNames({ pressed: keyCodeNum.indexOf(item.keycode) > -1 })}
              data-key={item.keycode}
            >
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
