import { useMemo } from "react"
import { MouseEventHandler, useState } from "react"
import { Facet, FacetSearchResult, FacetTypeList, SelectedFacets } from "../../utils/Archive"
import style from "./Search.module.scss"

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

  const currentFilteredList = useMemo(() => {
    let newFacetList = facetList.filter(filterFacet)
    newFacetList = newFacetList.slice(facetsPerPage * (page - 1), facetsPerPage * page)
    return newFacetList
  }, [facetList, search, page])

  const closeArea : MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    setIsOpen(false)
    setSearch("")
    setCurrentFacetGroup("")
  }

  return (
    <>
      <div className="flex flex-wrap items-center">
        <label className="italic font-serif text-lg p-2 mt-5 mr-2">Filter by:</label>
        {Object.keys(FacetTypeList).map((facetGroupName) => {
          const facetGroupIdName = (FacetTypeList as { [key: string]: string })[facetGroupName]
          let buttonClass = `font-serif italic text-lg flex items-center border-2 mr-2 p-2 px-3 mt-5 `

          if(currentFacetGroup == facetGroupIdName && loadingFacet == "") {
            buttonClass += "border-white bg-black text-white"
          } else {
            buttonClass += "border-black bg-white text-black"
          }

          return (
            <button
              key={facetGroupIdName}
              className={buttonClass}
              onClick={async (event) => {
                event.preventDefault()
                if(currentFacetGroup == facetGroupIdName) {
                  closeArea(event)
                  return
                }
                await selectFacetGroup(facetGroupName, facetGroupIdName)
                setIsOpen(true)
              }}>
                <label className="cursor-pointer">
                  {facetGroupName}
                </label>
                {selectedFacets[facetGroupIdName] && selectedFacets[facetGroupIdName].length > 0 && (
                  <span className="ml-2">
                    ({selectedFacets[facetGroupIdName].length})
                  </span>
                )}
        
                {(loadingFacet == facetGroupName) && (
                  <img src="./icons/loading.svg" className="animate-reverse-spin w-6 ml-5" />
                )}
            </button>
          )
        })}
      </div>
      {isOpen && (
        <div className="p-5 bg-white border-2 border-black mt-5">
          <div className="justify-between flex">
            {facetList.length > 0 && (
              <div className="flex">
                <img src="./icons/search.svg" className="inline-block md:w-10" />

                <input 
                  type="text" 
                  value={search}
                  className="border-2 border-black w-full md:w-80 ml-2 font-serif italic text-lg p-3 inline-block" 
                  onChange={event => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                />
                
                <button 
                  className="ml-5 text-2xl border-2 border-black p-2" 
                  onClick={event => {
                    event.preventDefault()

                    let newSelectedFacets : SelectedFacets = {}

                    Object.keys(selectedFacets).forEach(selectedFacetGroup => {
                      if(selectedFacetGroup == currentFacetGroup) {
                        return
                      }
                      
                      newSelectedFacets[selectedFacetGroup] = selectedFacets[selectedFacetGroup]
                    })

                    setSelectedFacets(newSelectedFacets)
                    onSelection(newSelectedFacets)
                  }}>
                  Clear
                </button>
              </div>
            )}
            <button onClick={closeArea} className="">
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
            {facetList.length == 0 && (
              <div className="text-2xl">
                No filters in this category with this query
              </div>
            )}
            {currentFilteredList.map((facet) => {
              const currentSelectedFacets = selectedFacets[facet.group] || []

              return (
                <div className="p-2 flex justify-center" key={facet.val}>
                  <input 
                    type="checkbox"
                    className={`invisible ${style.searchFacetCheckbox}`}
                    id={`facet_${facet.val}`}
                    value={facet.val}
                    checked={(currentSelectedFacets.length > 0) ? currentSelectedFacets.some(selectedFacet => selectedFacet == facet) : false}
                    onChange={(event) => {
                      let newCurrentSelectedFacets = currentSelectedFacets.filter(selectedFacet => selectedFacet != facet)

                      if(event.target.checked) {
                        newCurrentSelectedFacets.push(facet)
                      }

                      const newSelectedFacets = {...selectedFacets}

                      newSelectedFacets[facet.group] = newCurrentSelectedFacets

                      setSelectedFacets(newSelectedFacets)

                      onSelection(newSelectedFacets)
                    }}
                  />

                  <label className="italic text-lg tracking-wide flex" htmlFor={`facet_${facet.val}`}>
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
                <img src="./icons/down.svg" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}