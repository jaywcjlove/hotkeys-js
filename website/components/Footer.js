import React from 'react';
import style from './Footer.less';

export default function Footer({ name, href, year}) {
  return (
    <div className={style.footer}>© <a target="_blank" href={href}>{name}</a> {year}</div>
  )
}