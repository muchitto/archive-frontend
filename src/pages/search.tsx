import {
  useAtom
} from 'jotai';
import {
  GetServerSideProps, NextPage
} from 'next';
import Image from 'next/future/image';
import {
  useRouter
} from 'next/router';
import {
  useEffect, useState
} from 'react';
import FacetArea, {
  useFacetPanelOpenAtom
} from '../components/Search/Facet/FacetArea';
import PageButton from '../components/Common/PageButton';
import {
  Facet, FacetGroupSelections, facetTypeList, fetchDataWithQuery, SearchQuery, SearchResult
} from '../inc/Archive/Search';
import config from '../inc/Config';
import {
  useDebounce, useRunOnce
} from '../inc/Hooks';
import {
  useQuery
} from '@tanstack/react-query';

import refreshCWIcon from '../assets/icons/refresh-cw.svg';
import leftIcon from '../assets/icons/left.svg';
import rightIcon from '../assets/icons/right.svg';
import SearchResults from '../components/Search/SearchResults';
import RegulerLayout from '../components/Layouts/Regular';
import Loader from '../components/Common/Loader';

interface SearchProps {
  initialQuery: SearchQuery
  initialResults: SearchResult | null
}

export enum PageDirection {
  Previous,
  Next
}

const Search: NextPage<SearchProps> = ({ initialQuery, initialResults }: SearchProps) => {
  const [ page, setPage ] = useState(initialQuery.page);
  const [ rows, setRows ] = useState(initialQuery.rows);
  const [ isFacetPanelOpen, setIsFacetPanelOpen ] = useAtom(useFacetPanelOpenAtom);
  const [ usedPageButtons, setUsedPageButtons ] = useState(false);
  const [ facetSelections, setFacetSelections ] = useState(initialQuery.query.facets || {});
  const [ pageChangeDirection, setPageChangeDirection ] = useState<PageDirection | null>(null);
  const [ searchText, setSearchText ] = useState(initialQuery.query.any);

  const debounceSearchText = useDebounce(searchText, config.defaultSearchDebounceTime);

  const router = useRouter();

  useRunOnce(() => {
    router.beforePopState(() => {
      router.reload();
      return true;
    });
  });

  const { isFetching, data } = useQuery([ 'runSearch', page, rows, debounceSearchText, facetSelections ], () => {
    if(!debounceSearchText) {
      return null;
    }

    return fetchDataWithQuery({
      query: {
        any: debounceSearchText,
        facets: facetSelections
      },
      rows: rows,
      page: page,
    });
  }, {
    keepPreviousData: true,
  });

  const haveMoreResults = (data) ? data?.response?.numFound / rows > page : false;
  const haveResults = (data) ? data?.response?.docs.length > 0 : false;
  const isChangingPage = pageChangeDirection != null;

  const nextPage = () => {
    setUsedPageButtons(true);
    setPage(prev => prev + 1);
    setPageChangeDirection(PageDirection.Next);
    setIsFacetPanelOpen(false);
  };

  const prevPage = () => {
    setUsedPageButtons(true);
    setPage(prev => prev - 1);
    setPageChangeDirection(PageDirection.Previous);
    setIsFacetPanelOpen(false);
  };

  const updateUrl = () => {
    const facetList: { [key: string]: string[] } = {};

    for (const facetGroup in facetSelections) {
      facetList['facet:' + facetGroup] = facetSelections[facetGroup].map((facet) => facet.val + '');
    }

    router.replace({
      query: {
        ...facetList,
        any: searchText,
        page: page,
        rows: rows
      }
    });
  };


  useEffect(() => {
    updateUrl();
  }, [ data ]);

  useEffect(() => {
    if(!isFetching && pageChangeDirection != null) {
      setPageChangeDirection(null);
    }
  }, [ isFetching, pageChangeDirection ]);

  let currentStatusText = '';
  if(!isFetching) {
    if (debounceSearchText.length == 0) {
      currentStatusText = 'Start by typing something in the textfield';
    } else if(data && !data?.response?.docs.length) {
      currentStatusText = 'No results found with these search terms';
    }
  }

  return (
    <RegulerLayout title='Search'>
      <div>
        {!isChangingPage && isFetching && isFacetPanelOpen && (
          <div className="fixed top-5 right-5">
            <Image src={refreshCWIcon} className="animate-spin w-8" alt="Loading..." priority={true} />
          </div>
        )}
        <form onSubmit={(event) => {
          event.preventDefault();
        }}>
          <input
            type="text"
            defaultValue={searchText}
            className="border-2 border-black w-full p-3 font-serif italic text-2xl focus:shadow-btn"

            onChange={(event) => {
              const value = event.target.value;
              setSearchText(value);
              setPage(1);
            }}

            onKeyDown={(event) => {
              if (event.key == 'Enter') {
                event.preventDefault();
              }
            }}
          />
        </form>
        {(data || isFacetPanelOpen) && (
          <FacetArea
            searchText={debounceSearchText}
            facetsPerPage={50}
            selectedFacets={facetSelections}
            onSelection={(facetGroup, facets) => {
              const newFacetSelections = {
                ...facetSelections
              };

              newFacetSelections[facetGroup.idName] = facets;

              setFacetSelections(newFacetSelections);
            }}
          />
        )}

        <div className="py-5">
          <Loader isLoading={!isChangingPage && isFetching} text="Fetching search results...">
            {currentStatusText && (
              <div className="text-3xl uppercase font-bold">
                {currentStatusText}
              </div>
            )}
            {data && data.response?.docs.length > 0 && (
              <SearchResults page={page} rows={rows} result={data}/>
            )}
          </Loader>
        </div>

        {(isChangingPage || (page > 1 && haveResults)) && (
          <PageButton
            className="fixed inset-y-1/2 left-4"
            textTop='Previous'
            textBottom='Page'
            showText={!usedPageButtons}
            showLoader={pageChangeDirection == PageDirection.Previous}
            onClick={() => {
              prevPage();
            }}
          >
            <Image src={leftIcon} alt="Previous page" />
          </PageButton>
        )}
        {(isChangingPage || haveMoreResults) && (
          <PageButton
            className="fixed inset-y-1/2 right-4"
            textTop='Next'
            textBottom='Page'
            showText={!usedPageButtons}
            showLoader={pageChangeDirection == PageDirection.Next}
            onClick={() => {
              nextPage();
            }}
          >
            <Image src={rightIcon} alt="Next page" />
          </PageButton>
        )}
      </div>
    </RegulerLayout>
  );
};

export default Search;

export const getServerSideProps : GetServerSideProps<SearchProps> = async (context) => {
  const any = context.query.any as string || '';
  const rows = parseInt(context.query.rows as string) || config.defaultRows;
  const page = parseInt(context.query.page as string) || 1;

  const newSelectedFacets : FacetGroupSelections = {};
  for(const queryName in context.query) {
    if(queryName.startsWith('facet:')) {
      const facetGroupIdName = queryName.replace(/^facet\:/, '');
      let value = context.query[queryName] as string[];

      if(!Array.isArray(value)) {
        value = [ value as string ];
      }

      if(!newSelectedFacets[facetGroupIdName]) {
        newSelectedFacets[facetGroupIdName] = [];
      }

      const facets : Facet[] = value.map(facetId => {
        return {
          group: facetTypeList[facetGroupIdName],
          val: facetId
        };
      });

      newSelectedFacets[facetGroupIdName].push(
        ...facets
      );
    }
  }

  const initialQuery = {
    query: {
      any,
      facets: newSelectedFacets
    },
    rows,
    page,
  };

  // Should be investigated, why the useQuery initialData does not work, so disabling this for now.
  // const initialResults = await fetchDataWithQuery(initialQuery);

  return {
    props: {
      initialQuery,
      initialResults: null
    }
  };
};
