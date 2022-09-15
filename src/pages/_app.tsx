import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Regular from '../components/Layouts/Regular';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1 * 60 * 60 * 1000,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Regular>
        <Component {...pageProps} />
      </Regular>
      {process.env.NODE_ENV == 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default MyApp;
