import Image from 'next/future/image';
import { FacetGroup } from '../../../inc/Archive/Search';

import refreshCWIcon from '../../../assets/icons/refresh-cw.svg';

interface FacetGroupButtonProps {
  facetGroup: FacetGroup
  selectedFacetCount: number
  totalFacetCount: number
  className?: string
  isOpened: boolean
  isLoading: boolean
  isError: boolean
  onToggle: (isOpen: boolean) => void
}

export default function FacetGroupButton({
  facetGroup, className, totalFacetCount, selectedFacetCount, isError, isLoading, isOpened, onToggle
}: FacetGroupButtonProps) {
  const classes = [
    'font-serif italic text-lg',
    'flex items-center',
    'p-2 px-3 mt-5 mr-2',
    'border-2 border-black bg-white text-black',
    'disabled:opacity-40',
    'enabled:hover:shadow-btn',
    'enabled:hover:bg-amber-100',
    className
  ];

  const isDisabled = isLoading || totalFacetCount == 0;

  if (!isLoading && totalFacetCount == 0) {
    classes.push('border-dashed');
  } else if (isError) {
    classes.push('animation-pulse bg-red-400');
  } else if (isOpened) {
    classes.push('shadow-btn bg-yellow-200');
  }

  return (
    <button
      key={facetGroup.idName}
      disabled={isDisabled}
      className={classes.join(' ')}
      onClick={async (event) => {
        event.preventDefault();
        onToggle(isOpened);
      }}>
      <label className="cursor-pointer">
        {facetGroup.name}
      </label>
      {selectedFacetCount > 0 && !isDisabled && (
        <span className="mx-2 font-bold non-italic font-sans">
          ({selectedFacetCount})
        </span>
      )}
      {isLoading && (
        <Image src={refreshCWIcon} className="animate-spin w-6 ml-5" alt="Loading" priority={true} />
      )}
    </button>
  );
}
