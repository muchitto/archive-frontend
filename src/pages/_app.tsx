import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Image from 'next/future/image'
import Link from 'next/link'

import logoIcon from '../assets/icons/logo.svg'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1 * 60 * 60 * 1000,
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <header className="py-10">
        <div className="flex items-center w-full">
          <Image src={logoIcon} alt="Archive" />
          <label className='inline-block text-4xl md:text-6xl lg:text-8xl font-bold ml-5 md:ml-10 uppercase'>
            <Link href="/">
              Archive
            </Link>
          </label>
        </div>
      </header>
      <Component {...pageProps} />
      {process.env.NODE_ENV == 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}

export default MyApp
