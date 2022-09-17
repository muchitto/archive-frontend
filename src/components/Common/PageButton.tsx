import Image from 'next/future/image';
import { MouseEvent, PropsWithChildren, useRef } from 'react';

import refreshCWIcon from '../../assets/icons/refresh-cw.svg';

interface PageButtonProps {
  textTop?: string
  textBottom?: string
  className?: string
  hideTextWhenClick?: boolean
  showLoader?: boolean
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function PageButton({
  textTop,
  textBottom,
  className,
  hideTextWhenClick,
  onClick,
  showLoader,
  children
} : PropsWithChildren<PageButtonProps>) {
  const clicked = useRef(false);
  const shouldShowClick = !(hideTextWhenClick && clicked.current);
  const showTopText = textTop && shouldShowClick;
  const showBottomText = textBottom && shouldShowClick;

  return (
    <div className={`${className} text-center text-lg`}>
      <label className={`p-1 block mb-2 ${showTopText ? 'block' : 'invisible'}`}>
        {textTop}
      </label>
      <a href="#" onClick={(event) => {
        event.preventDefault();
        clicked.current = true;
        onClick(event);
      }} className="inline-block">

        {showLoader && (
          <Image
            src={refreshCWIcon}
            alt="Loading next page"
            className="animate-spin mt-2 ml-2"
            width="35"
            height="35"
          />
        )}
        {!showLoader && (
          <div className="rounded-full bg-white w-14 h-14 block border-2 border-black hover:shadow-btn">
            {children}
          </div>
        )}
      </a>
      <label className={`p-1 block mt-2 ${showBottomText ? 'block' : 'invisible'}`}>
        {textBottom}
      </label>
    </div>
  );
}
