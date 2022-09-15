import { MouseEvent, useRef } from 'react';

interface PageButtonProps {
  textTop?: string
  textBottom?: string
  showText: boolean
  className?: string
  hideTextWhenClick?: boolean
  content: JSX.Element
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function PageButton({
  textTop,
  textBottom,
  className,
  showText,
  hideTextWhenClick,
  content,
  onClick
} : PageButtonProps) {
  const clicked = useRef(false);
  const shouldShowClick = !(hideTextWhenClick && clicked.current);
  const showTopText = showText && textTop && shouldShowClick;
  const showBottomText = showText && textBottom && shouldShowClick;

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
        <div className="rounded-full bg-white w-14 h-14 block border-2 border-black hover:shadow-btn">
          {content}
        </div>
      </a>
      <label className={`p-1 block mt-2 ${showBottomText ? 'block' : 'invisible'}`}>
        {textBottom}
      </label>
    </div>
  );
}
