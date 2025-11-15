/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'dark-mode': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          permanent?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
