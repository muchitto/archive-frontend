import { useEffect, useState, useCallback } from "react"
import style from "./Search.module.css"
import { stringify, parse } from "query-string"

import { debounce, throttle } from 'lodash'
import { FetchDataWithQuery, Doc, MediaType, AllMediaTypes, Query, QueryDetail, Result, FacetType, FacetTypeList, FetchFacets, FacetSearchResult, Facet } from "../utils/Archive"
import SearchItem from "./SearchItem"
import SearchResults from "./SearchResults"
import { useRouter } from "next/router"
import SearchFacet from "./SearchFacet"
import SearchFacetArea, { SelectedFacets } from "./SearchFacetArea"

interface SearchProps {
  initialQuery: Query
  initialResult: Result
}

export default function Search({ initialQuery, initialResult }: SearchProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState(initialResult)
  const [lastResult, setLastResult] = useState(null as Result | null)
  const [nextResult, setNextResult] = useState(null as Result | null)
  const [badSearch, setBadSearch] = useState(false)
  const [selectedFacets, setSelectedFacets] = useState({} as SelectedFacets)

  const router = useRouter()

  const haveMoreResults = result?.response?.numFound / query.rows > query.page
  const haveResults = result?.response?.docs.length > 0

  const bufferResults = () => {
    if (haveMoreResults) {
      FetchDataWithQuery({
        ...query,
        page: query.page + 1
      }).then((data) => {
        if (data) {
          setNextResult(data as Result)
        }
      })
    }
  }

  const runSearch = useCallback(debounce((query: Query) => {
    setIsSearching(true)

    FetchDataWithQuery(query).then((data) => {
      setIsSearching(false)

      if (data) {
        updateUrl()
        setResult(data as Result)
        setBadSearch(false)
        return
      }

      setBadSearch(true)

    }).catch((error) => {
      console.log(error)
    })
  }, 1000), [isSearching])

  const updateQueryAndSearch = async (query: Query) => {
    console.log(query)
    setQuery(query)
    runSearch(query)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const nextPage = () => {
    updateQueryAndSearch({
      ...query,
      page: query.page + 1
    })
  }

  const prevPage = () => {
    updateQueryAndSearch({
      ...query,
      page: query.page - 1
    })
  }

  const updateUrl = () => {
    router.replace({
      query: {
        ...router.query,
        row: query.rows,
        page: query.page,
        any: query.query.any
      }
    })
  }

  return (
    <div>
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
            })
          }}
        />
        
        <SearchFacetArea 
          query={query.query.any} 
          facetsPerPage={50} 
          onSelection={(selectedFacets: SelectedFacets) => {
            runSearch({
              ...query,
              query: {
                any: query.query.any,
                facets: selectedFacets
              },
            })
          }} 
        />
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
                No results found
              </div>
            )
        )}
      </div>
      {query.page > 1 && haveResults && (
        <div className="fixed inset-y-1/2 left-4 block rounded-full bg-white w-14 h-14 block border-2 border-black">
          <a href="#" onClick={(event) => prevPage()}>
            <img src="./icons/left.svg" className="w-full" />
          </a>
        </div>
      )}
      {haveMoreResults && (
        <div className="fixed inset-y-1/2 right-4 rounded-full bg-white w-14 h-14 block border-2 border-black">
          <a href="#" onClick={(event) => nextPage()}>
            <img src="./icons/right.svg" className="w-full" />
          </a>
        </div>
      )}
    </div>
  )
}