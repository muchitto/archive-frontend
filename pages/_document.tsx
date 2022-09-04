import { Html, Head, Main, NextScript } from 'next/document'
import Link from 'next/link'
import { KeyboardEventHandler } from 'react'
import Image from "next/image"

export default function Document() {
  return (
    <Html className="scroll-smooth">
      <Head />
      <body>
        <div className="container mx-auto max-w-ld rounded-md p-5">
          <header className="py-10">
            <div className="flex items-center w-full">
              <img src="/icons/logo.svg" />
              <label className='inline-block text-6xl font-bold ml-10 uppercase'>
                <Link href="/">
                  Archive
                </Link>
              </label>
            </div>
          </header>

          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  )
}