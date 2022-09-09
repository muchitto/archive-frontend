import { Html, Head, Main, NextScript } from 'next/document'
import Link from 'next/link'
import { KeyboardEventHandler } from 'react'
import Image from "next/image"

export default function Document() {
  return (
    <Html className="scroll-smooth bg-amber-50	">
      <Head />
      <body>
        <div className="container mx-auto max-w-ld rounded-md p-5">
          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  )
}