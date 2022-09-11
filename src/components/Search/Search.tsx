import { useEffect, useState } from "react"
import Image from "next/future/image"
import { SearchQuery, fetchDataWithQuery, SearchResult } from "../../inc/Archive/Search"
import SearchResults from "./SearchResults"
import { useRouter } from "next/router"
import FacetArea, { useFacetPanelOpenAtom } from "./Facet/FacetArea"
import PageButton from "./PageButton"
import { useQuery } from "@tanstack/react-query"
import { useDebounce, useInitialized, useRunOnce } from "../../inc/hooks"
import Config from "../../inc/Config"

import refreshCWIcon from "../../assets/icons/refresh-cw.svg"
import leftIcon from "../../assets/icons/left.svg"
import rightIcon from "../../assets/icons/right.svg"
import { useAtom } from "jotai"

interface SearchProps {
  initialQuery: SearchQuery
  initialResults: SearchResult | null
}

enum PageDirection {
  Previous,
  Next
}

export default function Search({ initialQuery, initialResults }: SearchProps) {
  const [page, setPage] = useState(initialQuery.page)
  const [rows, setRows] = useState(initialQuery.rows)
  const [openPanel, setOpenPanel] = useAtom(useFacetPanelOpenAtom)
  const [usedPageButtons, setUsedPageButtons] = useState(false)
  const [isFacetAreaOpen, setIsFacetAreaOpen] = useState(false)
  const [facetSelections, setFacetSelections] = useState(initialQuery.query.facets || {})
  const [pageButtonClicked, setPageButtonClicked] = useState<PageDirection | null>(null)
  const [searchText, setSearchText] = useState(initialQuery.query.any)

  const initialized = useInitialized(false)
  const debounceSearchText = useDebounce(searchText, Config.defaultSearchDebounceTime)

  const router = useRouter()

  const { isFetching, data } = useQuery(["runSearch", page, rows, debounceSearchText, facetSelections], () => {
    if(!debounceSearchText) {
      return null
    }

    return fetchDataWithQuery({
      query: {
        any: debounceSearchText,
        facets: facetSelections
      },
      rows: rows,
      page: page,
    })
  }, (!initialized) ? {
    keepPreviousData: true,
  } : {
    keepPreviousData: true,
  })

  const haveMoreResults = (data) ? data?.response?.numFound / rows > page : false
  const haveResults = (data) ? data?.response?.docs.length > 0 : false
  const isChangingPage = pageButtonClicked != null

  const nextPage = () => {
    setUsedPageButtons(true)
    setPage(page + 1)
    setPageButtonClicked(PageDirection.Next)
    setOpenPanel(false)
  }

  const prevPage = () => {
    setUsedPageButtons(true)
    setPage(page - 1)
    setPageButtonClicked(PageDirection.Previous)
    setOpenPanel(false)
  }

  const updateUrl = () => {
    const facetList: { [key: string]: string[] } = {}

    for (const facetGroup in facetSelections) {
      facetList["facet:" + facetGroup] = facetSelections[facetGroup].map((facet) => facet.val + "")
    }

    router.push({
      pathname: `/`,
      query: {
        ...facetList,
        any: searchText,
        page: page,
        rows: rows
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
    updateUrl()
  }, [facetSelections, debounceSearchText, page, rows])

  useEffect(() => {
    if(!isFetching && pageButtonClicked != null) {
      setPageButtonClicked(null)
    }
  }, [isFetching, pageButtonClicked])

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
      {!isChangingPage && isFetching && isFacetAreaOpen && (
        <div className="fixed top-5 right-5">
          <Image src={refreshCWIcon} className="animate-spin w-8" alt="Loading..." priority={true} />
        </div>
      )}
      <form onSubmit={(event) => {
        event.preventDefault()
      }}>
        <input
          type="text"
          defaultValue={searchText}
          className="border-2 border-black w-full p-3 font-serif italic text-2xl focus:shadow-btn"

          onChange={(event) => {
            const value = event.target.value
            setSearchText(value)
            setPage(1)
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
          shouldClose={isChangingPage}
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
        {!isChangingPage && isFetching && (
          <div className="text-2xl font-bold uppercase p-5 flex justify-center">
            <Image src={refreshCWIcon} className="animate-spin" width="100" height="100" alt="Loading..." priority={true} />
          </div>
        )}
        {currentStatusText && (
          <div className="text-3xl uppercase font-bold">
            {currentStatusText}
          </div>
        )}
        {data && data.response.docs.length > 0 && (
          <SearchResults page={page} rows={rows} result={data}/>
        )}
      </div>

      {(isChangingPage || (page > 1 && haveResults)) && (
        <PageButton
          className="fixed inset-y-1/2 left-4"
          textTop="Prev"
          textBottom="Page"
          showText={usedPageButtons}
          icon={
            (pageButtonClicked == PageDirection.Previous) ?
              (
                <Image
                  src={refreshCWIcon}
                  alt="Loading previous page"
                  className="animate-spin mt-2"
                  width="35"
                  height="35"
                />
              )
              :
              (
                <Image src={leftIcon} alt="Previous page" />
              )}
          onClick={() => {
            prevPage()
          }}
        />
      )}
      {(isChangingPage || haveMoreResults) && (
        <PageButton
          className="fixed inset-y-1/2 right-4"
          textTop="Next"
          textBottom="Page"
          showText={usedPageButtons}
          icon={pageButtonClicked == PageDirection.Next ?
            (
              <Image
                src={refreshCWIcon}
                alt="Loading next page"
                className="animate-spin mt-2"
                width="35"
                height="35"
              />
            )
            : (
              <Image src={rightIcon} alt="Next page" />
            )
          }
          onClick={(event) => {
            nextPage()
          }}
        />
      )}
    </div>
  )
}
