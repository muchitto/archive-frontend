import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { FacetGroup, FacetSearchResultPretty, FacetGroupSelections, facetTypeList, Facet } from '../../../inc/Archive/Search';
import FacetGroupButton from './FacetGroupButton';
import { useQueries } from '@tanstack/react-query';

import FacetSelectionArea from './FacetSelectionArea';
import { atom, useAtom } from 'jotai';

interface FacetAreaProps {
  facetsPerPage: number
  searchText: string
  selectedFacets: FacetGroupSelections
  onSelection: (facetGroup: FacetGroup, facets: Facet[]) => void
  onOpen?: (open: boolean) => void
}

export const useFacetPanelOpenAtom = atom(false);

export default function FacetArea({
  facetsPerPage, searchText, selectedFacets, onSelection, onOpen
}: FacetAreaProps) {
  const [ currentFacetGroup, setCurrentFacetGroup ] = useState(null as FacetGroup | null);
  const [ openPanel, setOpenPanel ] = useAtom(useFacetPanelOpenAtom);

  const facetResults = useQueries({
    queries: Object.keys(facetTypeList).map(groupIdName => {
      const facetGroup = facetTypeList[groupIdName];

      return {
        queryKey: [ 'facetGroup', facetGroup.idName, searchText ],
        queryFn: () => {
          return fetch(`/api/getFacets?any=${searchText}&facet=${facetGroup.idName}`)
            .then(res => res.json())
            .then(res => ({
              facetGroup,
              res: res as FacetSearchResultPretty | null
            }));
        },
        retry: true,
        retryDelay: 2000,
      };
    })
  });

  const facetLists = useMemo(() => {
    const newFacetList : FacetGroupSelections = {};
    facetResults.forEach(result => {
      if(!result.data || !result.data.facetGroup || !result.data.res) {
        return;
      }

      newFacetList[result.data.facetGroup.idName] = result.data.res.facets;
    });
    return newFacetList;
  }, [ facetResults ]);

  const selectedFacetsFiltered = useMemo(() => {
    const out : FacetGroupSelections = {};

    for(const facetId in selectedFacets) {
      out[facetId] = selectedFacets[facetId].filter(facet => {
        if(facetLists[facetId]) {
          return facetLists[facetId].some(f => f.val == facet.val);
        }

        return false;
      }) ?? [];
    }

    return out;
  }, [ facetLists, selectedFacets ]);

  useEffect(() => {
    setCurrentFacetGroup(null);
  }, [ searchText ]);

  useEffect(() => {
    if(!openPanel) {
      setCurrentFacetGroup(null);
    }
  }, [ openPanel ]);

  return (
    <>
      <div className="flex flex-wrap items-center">
        <label className="italic font-serif text-lg p-2 mt-5 mr-2">
          Filter by:
        </label>

        {Object.keys(facetTypeList).map(facetTypeId => {
          const facetGroup = facetTypeList[facetTypeId];
          const result = facetResults.find(res => res.data?.facetGroup.idName == facetGroup.idName);

          const isLoading = result?.isFetching ?? true;
          const isOpened = currentFacetGroup?.idName == facetGroup?.idName;
          const isError = result?.isError ?? false;

          const selectedFacetCount = selectedFacetsFiltered[facetGroup.idName]?.length ?? 0;
          const totalFacetCount = facetLists[facetGroup.idName]?.length ?? 0;

          return (
            <FacetGroupButton
              key={facetGroup?.idName}
              isOpened={isOpened}
              isLoading={isLoading}
              facetGroup={facetGroup}
              isError={isError}
              totalFacetCount={totalFacetCount}
              selectedFacetCount={selectedFacetCount}

              onToggle={() => {
                const isOpen = currentFacetGroup?.idName == facetGroup.idName;

                if(isOpen) {
                  setCurrentFacetGroup(null);
                  setOpenPanel(false);

                  if(onOpen) {
                    onOpen(false);
                  }
                } else {
                  setCurrentFacetGroup(facetGroup);
                  setOpenPanel(true);

                  if(onOpen) {
                    onOpen(true);
                  }
                }
              }}
            />);
        })}
      </div>
      {openPanel && currentFacetGroup && (
        <FacetSelectionArea
          facets={facetLists[currentFacetGroup.idName] ?? []}
          facetGroup={currentFacetGroup}
          facetsPerPage={facetsPerPage}
          selectedFacets={selectedFacets[currentFacetGroup.idName] ?? []}
          onSelection={onSelection}
          onClose={() => {
            setCurrentFacetGroup(null);
          }}
        />
      )}
    </>
  );
}
