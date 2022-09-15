import Head from 'next/head';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';
import Footer from '../Common/Footer';
import Header from '../Common/Header';

interface LayoutProps {
  title?: string
}

export default function Regular ({children, title} : PropsWithChildren<LayoutProps>) {
  const router = useRouter();
  const siteName = 'Archive';

  return (
    <div className="container mx-auto max-w-ld rounded-md p-5">
      <Head>
        <title>{siteName}{title ? ` - ${title}` : ''}</title>
      </Head>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
