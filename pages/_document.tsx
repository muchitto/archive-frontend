import { Html, Head, Main, NextScript } from 'next/document'
import { KeyboardEventHandler } from 'react'

export default function Document() {
  return (
    <Html className="scroll-smooth">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}