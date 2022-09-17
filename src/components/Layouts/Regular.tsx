import Head from 'next/head';
import { PropsWithChildren } from 'react';
import Footer from '../Common/Footer';
import Header from '../Common/Header';

interface LayoutProps {
  title?: string
}

export default function RegulerLayout ({children, title} : PropsWithChildren<LayoutProps>) {
  const siteName = 'Archive';

  const titleText = `${siteName}${title ? ` - ${title}` : ''}`;
  return (
    <>
      <Head>
        <title>{titleText}</title>
      </Head>
      <div className="container mx-auto max-w-ld rounded-md p-5">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}
