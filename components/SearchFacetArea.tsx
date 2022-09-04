import { MouseEventHandler, useState } from "react"
import { Facet, FacetSearchResult, FacetTypeList } from "../utils/Archive"
import SearchFacet from "./SearchFacet"

export type SelectedFacets = { 
  [key: string] : Facet[] 
}

interface SearchFacetAreaProps {
  facetsPerPage: number
  query: string 
  onSelection: (selectedFacets: SelectedFacets) => void
}

export default function SearchFacetArea ({ facetsPerPage, query, onSelection } : SearchFacetAreaProps) {
  const [facetList, setFacetList] = useState([] as Facet[])
  const [page, setPage] = useState(1)
  const [loadingFacet, setLoadingFacet] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedFacets, setSelectedFacets] = useState({} as SelectedFacets)
  const [currentFacetGroup, setCurrentFacetGroup] = useState("")

  const filterFacet = (facet : Facet) => {
    if(!search) {
      return true
    }

    return (facet.val + "").includes(search)
  }

  const totalPages = Math.ceil(facetList.filter(filterFacet).length / facetsPerPage)

  const selectFacetGroup = async (facetName: string, facetIdName: string) => {
    setLoadingFacet(facetName)
    setCurrentFacetGroup(facetIdName)

    const facetReq = await fetch(`/api/getFacets?facet=${facetIdName}&query=${query}`)
    const facets = await facetReq.json() as FacetSearchResult | boolean

    setLoadingFacet("")
    setPage(1)

    if(!facets) {
      return
    }

    let facetList = (facets as FacetSearchResult).options

    facetList = facetList.map(facet => {
      return {
        ...facet,
        group: facetIdName
      }
    })

    setFacetList(facetList)
    setIsOpen(true)
  }

  const currentFilteredList = () => {
    let newFacetList = facetList.filter(filterFacet)
    newFacetList = newFacetList.slice(facetsPerPage * (page - 1), facetsPerPage * page)
    return newFacetList
  }

  const closeArea : MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    setIsOpen(false)
    setSearch("")
  }

  return (
    <>
      <div className="flex flex-wrap">
        {Object.keys(FacetTypeList).map((facetGroupName) => {
          const facetGroupIdName = (FacetTypeList as { [key: string]: string })[facetGroupName]
          return (
            <button
              className="flex items-center border-2 border-black mr-2 p-2 px-3 mt-5 bg-white"
              onClick={async (event) => {
                event.preventDefault()
                await selectFacetGroup(facetGroupName, facetGroupIdName)
              }}>
                <label className="font-serif italic text-lg ">
                  {facetGroupName}
                </label>
        
                {(loadingFacet == facetGroupName) && (
                  <img src="./icons/loading.svg" className="animate-reverse-spin w-6 ml-5" />
                )}
            </button>
          )
        })}
      </div>
      {facetList?.length > 0 && isOpen && (
        <div className="p-5 bg-white border-2 border-black mt-5">
          <div className="justify-between flex">
            <div className="flex">
              <img src="./icons/search.svg" className="w-10" />

              <input 
                type="text" 
                value={search}
                className="border-2 border-black w-80 ml-2 font-serif italic text-lg p-3" 
                onChange={event => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
              
              <button className="ml-5 text-2xl border-2 border-black p-2" onClick={event => {
                event.preventDefault()

                const newSelectedFacets = {
                  ...selectedFacets
                }

                setSelectedFacets(newSelectedFacets)
                onSelection(newSelectedFacets)
              }}>
                Clear
              </button>
            </div>
            
            <button onClick={closeArea}>
              <img src="./icons/x.svg" />
            </button>
          </div>
          {page > 1 && (
            <div className="flex justify-center mt-5 animate-bounce">
              <button onClick={event => {
                event.preventDefault()
                setPage(page - 1)
              }}>
                <img src="./icons/up.svg" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap mt-5">
            {currentFilteredList().map((facet) => {
              const currentSelectedFacets = selectedFacets[facet.group] || []

              return (
                <>
                <div className="p-2">
                  <input 
                    type="checkbox"
                    value={facet.n}
                    checked={(currentSelectedFacets.length > 0) ? currentSelectedFacets.some(selectedFacet => selectedFacet.n == facet.n) : false}
                    onChange={(event) => {
                      let newCurrentSelectedFacets = currentSelectedFacets.filter(selectedFacet => selectedFacet.n != facet.n)

                      if(event.target.checked) {
                        newCurrentSelectedFacets.push(facet)
                      }

                      const newSelectedFacets = {...selectedFacets}

                      newSelectedFacets[facet.group] = newCurrentSelectedFacets

                      setSelectedFacets(newSelectedFacets)

                      onSelection(newSelectedFacets)
                    }}
                  />

                  <label className="ml-2 italic text-lg tracking-wide">
                    {facet.val}
                  </label>
                </div>
                </>
              )
            })}
          </div>
          {page < totalPages && (
            <div className="flex justify-center mt-5 animate-bounce">
              <button onClick={event => {
                event.preventDefault()
                setPage(page + 1)
              }}>
                <img src="./icons/down.svg" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}