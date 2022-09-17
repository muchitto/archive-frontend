import Image from 'next/future/image';
import { PropsWithChildren } from 'react';

import refreshCWIcon from '../../assets/icons/refresh-cw.svg';

interface LoaderProps {
  text?: string
  isLoading: boolean
}

export default function Loader ({text, isLoading, children} : PropsWithChildren<LoaderProps>) {
  return (
    <>
      {isLoading && (<div>
        {text && (
          <div className='w-full text-center text-3xl font-bold uppercase py-5'>
            {text}
          </div>
        )}
        <div className="p-5 flex justify-center">
          <Image
            src={refreshCWIcon}
            className="animate-spin"
            width="100"
            height="100"
            alt="Loading..."
            priority={true}
          />
        </div>
      </div>)}
      {!isLoading && (
        children
      )}
    </>
  );
}
