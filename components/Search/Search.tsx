import { useEffect, useState, useCallback, useRef } from "react"
import style from "./Search.module.scss"
import { stringify, parse } from "query-string"

import { debounce, throttle } from 'lodash'
import { SelectedFacets, FetchDataWithQuery, Doc, MediaType, AllMediaTypes, Query, QueryDetail, Result, FacetType, FacetTypeList, FetchFacets, FacetSearchResult, Facet } from "../../utils/Archive"
import ResultItem from "./SearchItem"
import SearchResults from "./SearchResults"
import { useRouter } from "next/router"
import FacetArea from "./Facet/FacetArea"
import PageButton from "./PageButton"

interface SearchProps {
  initialQuery: Query
}

export default function Search({ initialQuery }: SearchProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState({} as Result)
  const [badSearch, setBadSearch] = useState(false)
  const [selectedFacets, setSelectedFacets] = useState(initialQuery.query.facets)
  const [initialized, setInitialized] = useState(false)
  const [usedPageButtons, setUsedPageButtons] = useState(false)
  const [isFacetAreaOpen, setIsFacetAreaOpen] = useState(false)

  const router = useRouter()

  const haveMoreResults = result?.response?.numFound / query.rows > query.page
  const haveResults = result?.response?.docs.length > 0

  const runSearchDebounced = useCallback(debounce((query: Query) => {
    runSearch(query)
  }, 1000), [isSearching])

  const runSearch = (query: Query) => {
    setIsSearching(true)

    FetchDataWithQuery(query).then((data) => {
      setIsSearching(false)

      setInitialized(true)

      if (data) {
        updateUrl(query)
        setResult(data as Result)
        setBadSearch(false)
        return
      }

      setBadSearch(true)

    }).catch((error) => {
      console.log(error)
    })
  }

  const updateQueryAndSearch = async (query: Query, debounced: boolean) => {
    setQuery(query)

    if(debounced) {
      runSearchDebounced(query)
    } else {
      runSearch(query)
    }

    if(!isFacetAreaOpen) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const nextPage = () => {
    setUsedPageButtons(true)
    updateQueryAndSearch({
      ...query,
      page: query.page + 1
    }, false)
  }

  const prevPage = () => {
    setUsedPageButtons(true)

    updateQueryAndSearch({
      ...query,
      page: query.page - 1
    }, false)
  }

  const updateUrl = (query: Query) => {
    const facetList : { [key:string]: string[] } = {}
    
    for(let facetGroup in query.query.facets) {
      facetList["facet:" + facetGroup] = query.query.facets[facetGroup].map((facet) => facet.val + "")
    }

    router.push({
      pathname: `/`,
      query: {
        ...facetList,
        any: query.query.any,
        page: query.page
      }
    }, undefined, {
      shallow: true,
    })
    
  }

  useEffect(() => {
    router.beforePopState((state) => {
      location.reload()
      return true
    })

    if(query.query.any) {
      runSearch(query)
    }
  }, [])

  return ( 
    <div>
      {isSearching && isFacetAreaOpen && (
        <div className="fixed top-5 right-5">
          <img src="./icons/loading.svg" className="animate-reverse-spin w-8" />
        </div>
      )}
      <form onSubmit={(event) => {
        event.preventDefault()

        runSearch(query)
      }}>
        <input
          type="text"
          value={query.query.any}
          className="border-2 border-black w-full p-3 font-serif italic text-2xl"

          onChange={(event) => {
            const value = event.target.value
            updateQueryAndSearch({
              ...query,
              query: {
                ...query.query,
                any: value
              }
            }, true)
          }}

          onKeyDown={(event) => {
            if(event.key == "Enter") {
              event.preventDefault()
              runSearch(query)
            }
          }}
        />

        {(result?.response?.docs.length > 0 || selectedFacets) && initialized && (
          <FacetArea
            query={query}
            facetsPerPage={50}
            onOpen={(open) => {
              setIsFacetAreaOpen(open)
            }}
            onSelection={(selectedFacets: SelectedFacets) => {
              setSelectedFacets(selectedFacets)

              updateQueryAndSearch({
                ...query,
                query: {
                  any: query.query.any,
                  facets: selectedFacets
                },
                page: 1
              }, false)
            }}
          />
        )}
      </form>
      <div className="py-5">
        {isSearching ? (
          <div className="text-2xl font-bold uppercase p-5 flex justify-center">
            <img src="./icons/loading.svg" className="animate-reverse-spin" />
          </div>) : (
          (!badSearch && result.response?.docs.length > 0) ?
            <SearchResults query={query} result={result} />
            : (
              <div className="text-3xl uppercase font-bold">
                {initialized && (
                  <>
                    No results found
                  </>
                )}
                {!initialized && (
                  <>
                    Start by typing in a search text
                  </>
                )}
              </div>
            )
        )}
      </div>
      {query.page > 1 && haveResults && (
        <PageButton
          className="fixed inset-y-1/2 left-4"
          textTop="Prev"
          textBottom="Page"
          showText={usedPageButtons}
          iconPath={"./icons/left.svg"}
          onClick={(event) => {
            prevPage()
          }}
        />
      )}
      {haveMoreResults && (
        <PageButton
          className="fixed inset-y-1/2 right-4"
          textTop="Next"
          textBottom="Page"
          showText={usedPageButtons}
          iconPath={"./icons/right.svg"}
          onClick={(event) => {
            nextPage()
          }}
        />
      )}
    </div>
  )
}