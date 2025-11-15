import React from 'react';
import style from './Footer.module.css';

interface FooterProps {
  name: string;
  href: string;
  year: string;
  children?: React.ReactNode;
}

export default function Footer({ name, href, year, children }: FooterProps) {
  return (
    <div className={style.footer}>
      {children}
      <div>
        Licensed under MIT. (Yes it&acute;s free and
        <a href="https://github.com/jaywcjlove/hotkeys"> open-sourced</a>
        )
      </div>
      <div>
        ©
        <a target="_blank" rel="noopener noreferrer" href={href}>{name}</a>
        {year}
      </div>
    </div>
  );
}
