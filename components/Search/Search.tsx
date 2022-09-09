import { useEffect, useState, useCallback, useRef } from "react"
import style from "./Search.module.scss"
import { stringify, parse } from "query-string"

import Image from "next/future/image"
import { debounce, first, throttle, update } from 'lodash'
import { SearchQuery, fetchDataWithQuery } from "../../utils/Archive"
import ResultItem from "./SearchItem"
import SearchResults from "./SearchResults"
import { useRouter } from "next/router"
import FacetArea from "./Facet/FacetArea"
import PageButton from "./PageButton"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { atom, useAtom } from "jotai"
import qs from "qs"
import { useDebounce, useRunOnce, useThrottle } from "../../utils/hooks"
import Config from "../../utils/Config"

import refreshCWIcon from "../../assets/icons/refresh-cw.svg"
import leftIcon from "../../assets/icons/left.svg"
import rightIcon from "../../assets/icons/right.svg"

interface SearchProps {
  initialQuery: SearchQuery
}

enum PageDirection {
  Previous,
  Next
}

export default function Search({ initialQuery }: SearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [usedPageButtons, setUsedPageButtons] = useState(false)
  const [isFacetAreaOpen, setIsFacetAreaOpen] = useState(false)
  const [facetSelections, setFacetSelections] = useState(initialQuery.query.facets || {})
  const [pageButtonClicked, setPageButtonClicked] = useState<PageDirection | null>(null)
  const debounceSearchText = useDebounce(query.query.any, Config.defaultSearchDebounceTime)

  const router = useRouter()

  const { isFetching, data } = useQuery(["runSearch", query.page, query.rows, debounceSearchText, facetSelections], () => {
    if(!debounceSearchText) {
      return null
    }

    return fetchDataWithQuery({
      query: {
        any: debounceSearchText,
        facets: facetSelections
      },
      rows: query.rows,
      page: query.page,
    })
  })

  const haveMoreResults = (data) ? data?.response?.numFound / query.rows > query.page : false
  const haveResults = (data) ? data?.response?.docs.length > 0 : false

  const nextPage = () => {
    setUsedPageButtons(true)
    setQuery({
      ...query,
      page: query.page + 1
    })
    setPageButtonClicked(PageDirection.Previous)
  }

  const prevPage = () => {
    setUsedPageButtons(true)
    setQuery({
      ...query,
      page: query.page - 1
    })
    setPageButtonClicked(PageDirection.Next)
  }

  const updateUrl = () => {
    const facetList: { [key: string]: string[] } = {}

    for (let facetGroup in facetSelections) {
      facetList["facet:" + facetGroup] = facetSelections[facetGroup].map((facet) => facet.val + "")
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

  useRunOnce(() => {
    router.beforePopState((state) => {
      router.reload()
      return true
    })
  })

  useEffect(() => {
    setQuery({
      ...query,
      query: {
        ...query.query,
        facets: facetSelections 
      }
    })
  }, [facetSelections])

  useEffect(() => {
    updateUrl()
  }, [facetSelections, query])

  useEffect(() => {
    if(pageButtonClicked != null) {
      setPageButtonClicked(null)
    }
  }, [pageButtonClicked])

  let currentStatusText = ""
  if(!isFetching) {
    if (debounceSearchText.length == 0) {
      currentStatusText = "Start by typing something in the textfield"
    } else if(data && !data?.response.docs.length) {
      currentStatusText = "No results found with these search terms"
    }
  }

  return (
    <div>
      {isFetching && isFacetAreaOpen && (
        <div className="fixed top-5 right-5">
          <Image src={refreshCWIcon} className="animate-spin w-8" alt="Loading..." />
        </div>
      )}
      <form onSubmit={(event) => {
        event.preventDefault()
      }}>
        <input
          type="text"
          defaultValue={query.query.any}
          className="border-2 border-black w-full p-3 font-serif italic text-2xl focus:shadow-btn"

          onChange={(event) => {
            const value = event.target.value
            setQuery({
              ...query,
              query: {
                ...query.query,
                any: value
              },
              page: 1
            })
          }}

          onKeyDown={(event) => {
            if (event.key == "Enter") {
              event.preventDefault()
            }
          }}
        />
      </form>
      {(data || isFacetAreaOpen) && (
        <FacetArea 
          searchText={debounceSearchText} 
          facetsPerPage={50} 
          selectedFacets={facetSelections}
          onSelection={(facetGroup, facets) => {
            const newFacetSelections = {
              ...facetSelections
            }

            newFacetSelections[facetGroup.idName] = facets

            setFacetSelections(newFacetSelections)
          }}
          onOpen={(isOpen) => {
            setIsFacetAreaOpen(isOpen)
          }}
        />
      )}

      <div className="py-5">
        {isFetching && (
          <div className="text-2xl font-bold uppercase p-5 flex justify-center">
            <Image src={refreshCWIcon} className="animate-spin" width="100" height="100" alt="Loading..." />
          </div>
        )}
        {currentStatusText && (
          <div className="text-3xl uppercase font-bold">
            {currentStatusText}
          </div>
        )}
        {!isFetching && data && data.response.docs.length > 0 && (
          <SearchResults page={query.page} rows={query.rows} result={data}/>
        )}
      </div>
      
      {query.page > 1 && haveResults && (
        <PageButton
          className="fixed inset-y-1/2 left-4"
          textTop="Prev"
          textBottom="Page"
          showText={usedPageButtons}
          icon={(
            <Image src={leftIcon} alt="Previous page" />
          )}
          onClick={() => {
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
          icon={(
            <Image src={rightIcon} alt="Next page" />
          )}
          onClick={(event) => {
            nextPage()
          }}
        />
      )}
    </div>
  )
}