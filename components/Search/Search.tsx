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
import { useQuery } from "@tanstack/react-query"
import { atom, useAtom } from "jotai"
import qs from "qs"
import useDebounce from "../../utils/useDebounce"
import Config from "../../utils/Config"

import refreshCWIcon from "../../assets/icons/refresh-cw.svg"
import leftIcon from "../../assets/icons/left.svg"
import rightIcon from "../../assets/icons/right.svg"

interface SearchProps {
  initialQuery: SearchQuery
}

export default function Search({ initialQuery }: SearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [usedPageButtons, setUsedPageButtons] = useState(false)
  const [isFacetAreaOpen, setIsFacetAreaOpen] = useState(false)
  const router = useRouter()
  const debounceSearchText = useDebounce(query.query.any, Config.defaultSearchDebounceTime)
  const [firstLoad, setFirstLoad] = useState(false)
  const [facetSelections, setFacetSelections] = useState(initialQuery.query.facets || {})

  const { isFetching, error, data, refetch } = useQuery(["runSearch", query.page, query.rows, debounceSearchText, facetSelections], () => {
    if(!query.query.any) {
      return null
    }

    return fetchDataWithQuery({
      query: {
        any: query.query.any,
        facets: {}
      },
      rows: query.rows,
      page: query.page,
    })
  }, {
    onSuccess: (result) => {
      setFirstLoad(true)  
      updateUrl()
    }
  })

  const haveMoreResults = (data) ? data?.response?.numFound / query.rows > query.page : false
  const haveResults = (data) ? data?.response?.docs.length > 0 : false

  const nextPage = () => {
    setUsedPageButtons(true)
    setQuery({
      ...query,
      page: query.page + 1
    })
  }

  const prevPage = () => {
    setUsedPageButtons(true)
    setQuery({
      ...query,
      page: query.page - 1
    })
  }

  const updateUrl = () => {
    const facetList: { [key: string]: string[] } = {}

    for (let facetGroup in query.query.facets) {
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
      router.reload()
      return true
    })
  }, [])

  let currentStatusText = ""

  if(!isFetching) {
    if(data && data.response.docs.length == 0) {
      currentStatusText = "No results found with these search terms"
    } else if (!firstLoad) {
      currentStatusText = "Start by typing something in the text"
    }
  }

  return (
    <div>
      {isFetching && isFacetAreaOpen && (
        <div className="fixed top-5 right-5">
          <Image src={refreshCWIcon} className="animate-spin w-8" />
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
      {query.query.any && (
        <FacetArea 
          query={query} 
          facetsPerPage={50} 
          onSelection={setFacetSelections}
          onOpen={() => {

          }}
        />
      )}

      <div className="py-5">
        {isFetching && (
          <div className="text-2xl font-bold uppercase p-5 flex justify-center">
            <Image src={refreshCWIcon} className="animate-spin" />
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
            <Image src={leftIcon} />
          )}
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
          icon={(
            <Image src={rightIcon} />
          )}
          onClick={(event) => {
            nextPage()
          }}
        />
      )}
    </div>
  )
}