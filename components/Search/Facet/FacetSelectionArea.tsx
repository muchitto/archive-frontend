import Image from "next/future/image"
import { useMemo, useState } from "react"
import { Facet, FacetGroup } from "../../../utils/Archive"

import searchIcon from "../../../assets/icons/search.svg"
import xIcon from "../../../assets/icons/x.svg"
import upIcon from "../../../assets/icons/up.svg"
import downIcon from "../../../assets/icons/down.svg"
import style from "../Search.module.scss"

interface FacetSelectionAreaProps {
  facets: Facet[]
  facetGroup: FacetGroup
  isOpen: boolean
  facetsPerPage: number
  selectedFacets: Facet[]
  onSelection: (facetGroup: FacetGroup, facets: Facet[]) => void
}

export default function FacetSelectionArea({ isOpen, facetGroup, facetsPerPage, selectedFacets, facets, onSelection }: FacetSelectionAreaProps) {
  const [filterSearchText, setFilterSearchText] = useState("")
  const [page, setPage] = useState(1)

  const currentFilteredList = useMemo(() => {
    const searchFilteredList = facets.filter(facet => (facet.val + "").toLowerCase().includes(filterSearchText.toLowerCase()))

    return searchFilteredList.slice((page - 1) * facetsPerPage, page * facetsPerPage)
  }, [facets, filterSearchText, page, facetsPerPage])

  if (!isOpen) {
    return (<></>)
  }

  const totalPages = facets.length / facetsPerPage

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
                  setFilterSearchText(event.target.value)
                  setPage(1)
                }}
              />
              <div className="ml-5"></div>
            </>
          )}

          <button
            className="text-2xl border-2 border-black p-2"
            onClick={event => {
              event.preventDefault()

              onSelection(facetGroup, [])
            }}>
            Clear
          </button>
        </div>
        <button 
          className=""
          onClick={event => {
            event.preventDefault()
            
            setPage(1)
          }} 
        >
          <Image src={xIcon} alt="Close" />
        </button>
      </div>
      {page > 1 && (
        <div className="flex justify-center mt-5 animate-bounce">
          <button onClick={event => {
            event.preventDefault()
            setPage(page - 1)
          }}>
            <Image src={upIcon} alt="Previous page" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap mt-5">
        {facets.length == 0 && (
          <div className="text-2xl">
            No filters in this category with this query
          </div>
        )}
        {currentFilteredList.length == 0 && filterSearchText != "" && (
          <div className="text-2xl">
            Cannot find anything with that filter search text
          </div>
        )}
        {currentFilteredList.map((facet) => {
          const facetId = `facet_${facet.val}`
          return (
            <div className="p-2 flex justify-center" key={facet.val}>
              <input
                type="checkbox"
                className={`invisible ${style.searchFacetCheckbox}`}
                id={facetId}
                value={facet.val}
                checked={(selectedFacets.length > 0) ? selectedFacets.some(selectedFacet => selectedFacet.val == facet.val) : false}
                onChange={(event) => {
                  const newFacetSelection = selectedFacets.filter(f => f.val != facet.val)
                  if(event.target.checked) {
                    newFacetSelection.push(facet)
                  }
                  onSelection(facetGroup, newFacetSelection)
                }}
              />

              <label className="italic text-lg tracking-wide flex" htmlFor={facetId}>
                <span className="ml-2">{facet.val}</span>
              </label>
            </div>
          )
        })}
      </div>
      {page < totalPages && (
        <div className="flex justify-center mt-5 animate-bounce">
          <button onClick={event => {
            event.preventDefault()
            setPage(page + 1)
          }}>
            <Image src={downIcon} alt="Next page" />
          </button>
        </div>
      )}
    </div>
  )
}