import Image from 'next/future/image';
import { useMemo, useState } from 'react';
import { Facet, FacetGroup } from '../../../inc/Archive/Search';
import { useThrottle } from '../../../inc/Hooks';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';

import searchIcon from '../../../assets/icons/search.svg';
import xIcon from '../../../assets/icons/x.svg';
import upIcon from '../../../assets/icons/up.svg';
import downIcon from '../../../assets/icons/down.svg';
import checkSquareIcon from '../../../assets/icons/check-square.svg';
import squareIcon from '../../../assets/icons/square.svg';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface FacetSelectionAreaProps {
  facets: Facet[]
  facetGroup: FacetGroup
  facetsPerPage: number
  selectedFacets: Facet[]
  onClose: () => void
  onSelection: (facetGroup: FacetGroup, facets: Facet[]) => void
}

interface FacetSelectionCheckProps {
  facet: Facet
  isSelected: boolean
  className?: string
  onSelection: (isChecked: boolean) => void
}

export function FacetSelectionCheck ({ facet, className, isSelected, onSelection } : FacetSelectionCheckProps) {
  const [wrapper] = useAutoAnimate<HTMLDivElement>({
    duration: 100,
    easing: 'ease-in-out'
  });

  return (
    <div className='inline-block' ref={wrapper}>
      <Checkbox.Root
        checked={isSelected}
        onCheckedChange={onSelection}
        className={`flex content-center min-w-fit ${className} hover:underline p-1`}>
        <Checkbox.Indicator forceMount={true} className="inline-block">
          <Image
            src={isSelected ? checkSquareIcon : squareIcon}
            alt={'Facet checkbox'}
            width="30"
            height="30"
          />
        </Checkbox.Indicator>
        <Label.Root className="inline-block mt-1 ml-1 text-lg">
          {facet.val}
        </Label.Root>
      </Checkbox.Root>
    </div>
  );
}

export default function FacetSelectionArea({ facetGroup, facetsPerPage, selectedFacets, facets, onClose, onSelection }: FacetSelectionAreaProps) {
  const [filterSearchText, setFilterSearchText] = useState('');
  const [page, setPage] = useState(1);

  const throttledFilterSearchText = useThrottle(filterSearchText, 100);
  const currentFilteredList = useMemo(() => {
    const searchFilteredList = facets.filter(facet => {
      return (facet.val + '').toLowerCase().trim().includes(throttledFilterSearchText.trim().toLowerCase());
    });

    return searchFilteredList.slice((page - 1) * facetsPerPage, page * facetsPerPage);
  }, [facets, throttledFilterSearchText, page, facetsPerPage]);

  const totalPages = facets.length / facetsPerPage;

  return (
    <div className="p-5 bg-white border-2 border-black mt-5">
      <div className="justify-between flex">
        <div className="flex">
          {facets.length > 0 && (
            <>
              <Image src={searchIcon} className="inline-block md:w-10" alt="Filter" />

              <input
                type="text"
                value={filterSearchText}
                className="border-2 border-black w-full md:w-80 ml-2 font-serif italic text-lg p-3 inline-block"
                onChange={event => {
                  setFilterSearchText(event.target.value);
                  setPage(1);
                }}
              />
              <div className="ml-5"></div>
            </>
          )}

          <button
            className="text-2xl border-2 border-black p-2"
            onClick={event => {
              event.preventDefault();

              onSelection(facetGroup, []);
            }}>
            Clear
          </button>
        </div>
        <button
          className=""
          onClick={event => {
            event.preventDefault();

            setPage(1);
            onClose();
          }}
        >
          <Image src={xIcon} alt="Close" />
        </button>
      </div>

      {selectedFacets.length > 0 && (
        <div className="flex flex-wrap mt-5 border-b-2 border-black p-2">
          {selectedFacets.map(facet => {
            return (
              <FacetSelectionCheck
                className="mr-2 mb-2"
                key={facet.val}
                facet={facet}
                isSelected={true}
                onSelection={(isChecked) => {
                  onSelection(facetGroup, selectedFacets.filter(f => f.val != facet.val));
                }}
              />
            );
          })}
        </div>

      )}
      {page > 1 && (
        <div className="flex justify-center mt-8 animate-bounce">
          <button onClick={event => {
            event.preventDefault();
            setPage(page - 1);
          }}>
            <Image src={upIcon} alt="Previous page" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap mt-5" >
        {facets.length == 0 && (
          <div className="text-2xl">
            No filters in this category with this query
          </div>
        )}
        {currentFilteredList.length == 0 && filterSearchText != '' && (
          <div className="text-2xl">
            Cannot find anything with that filter search text
          </div>
        )}
        {currentFilteredList.map((facet) => {
          if(selectedFacets.includes(facet)) {
            return <></>;
          }

          return (
            <FacetSelectionCheck
              className="mr-2 mb-2"
              key={facet.val}
              facet={facet}
              isSelected={false}
              onSelection={(isChecked) => {
                const newFacetSelection = [...selectedFacets];
                newFacetSelection.push(facet);
                onSelection(facetGroup, newFacetSelection);
              }}
            />
          );
        })}
      </div>
      {page < totalPages && (
        <div className="flex justify-center mt-5 animate-bounce">
          <button onClick={event => {
            event.preventDefault();
            setPage(page + 1);
          }}>
            <Image src={downIcon} alt="Next page" />
          </button>
        </div>
      )}
    </div>
  );
}
