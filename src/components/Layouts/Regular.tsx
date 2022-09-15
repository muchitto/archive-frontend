import { PropsWithChildren } from 'react';
import Footer from '../Common/Footer';
import Header from '../Common/Header';

interface LayoutProps {

}

export default function Regular ({children} : PropsWithChildren<LayoutProps>) {
  return (
    <div className="container mx-auto max-w-ld rounded-md p-5">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
