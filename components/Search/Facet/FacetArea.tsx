import { debounce } from "lodash"
import { MouseEvent, useCallback, useEffect, useMemo, useRef } from "react"
import { MouseEventHandler, useState } from "react"
import { Facet, FacetGroup, FacetSearchResult, FacetSearchResultPretty, FacetTypeList, Query, SelectedFacets } from "../../../utils/Archive"
import FacetGroupButton from "./FacetGroupButton"
import style from "../Search.module.scss"

interface FacetAreaProps {
  facetsPerPage: number
  query: Query 
  onSelection: (selectedFacets: SelectedFacets) => void
  onOpen: (open: boolean) => void
}

export default function FacetArea ({ facetsPerPage, query, onSelection, onOpen } : FacetAreaProps) {
  const [facetList, setFacetList] = useState([] as Facet[])
  const [page, setPage] = useState(1)
  const [loadingFacetGroup, setLoadingFacetGroup] = useState(null as FacetGroup | null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedFacets, setSelectedFacets] = useState(query.query.facets)
  const [currentFacetGroup, setCurrentFacetGroup] = useState(null as FacetGroup | null)
  const lastSearchStr = useRef(query.query.any)
  const lastPage = useRef(query.page)

  useEffect(() => {
    if(lastPage.current != query.page) {
      closeArea()
    } else if(currentFacetGroup && lastSearchStr.current != query.query.any) {
      if(query.query.any != "") {
        debounceSelectFacetGroup(currentFacetGroup)
      } else {
        closeArea()
      }
    }

    lastPage.current = query.page
    lastSearchStr.current = query.query.any
  }, [query])

  const filterFacet = (facet : Facet) => {
    if(!search) {
      return true
    }

    return (facet.val + "").includes(search)
  }

  const totalPages = Math.ceil(facetList.filter(filterFacet).length / facetsPerPage)

  const selectFacetGroup = async (facetGroup: FacetGroup) => {
    setLoadingFacetGroup(facetGroup)

    const facetReq = await fetch(`/api/getFacets?facet=${facetGroup.idName}&any=${query.query.any}`)
    const facets = await facetReq.json() as FacetSearchResultPretty | boolean

    setLoadingFacetGroup(null)
    setPage(1)

    if(!facets) {
      return
    }

    let facetList = (facets as FacetSearchResultPretty).facets

    facetList = facetList.map(facet => {
      return {
        ...facet,
        group: facetGroup,
      }
    })

    setFacetList(facetList)
    setIsOpen(true)
  }

  const debounceSelectFacetGroup = useCallback(debounce(async (facetGroup : FacetGroup) => {
    await selectFacetGroup(facetGroup)
  }, 1000), [])

  const currentFilteredList = useMemo(() => {
    let newFacetList = facetList.filter(filterFacet)
    newFacetList = newFacetList.slice(facetsPerPage * (page - 1), facetsPerPage * page)
    return newFacetList
  }, [facetList, search, page])

  const closeArea = () => {
    setIsOpen(false)
    setSearch("")
    setCurrentFacetGroup(null)
    onOpen(false)
  }

  const openArea = async (facetGroup: FacetGroup) => {
    await selectFacetGroup(facetGroup)
    setIsOpen(true)
    onOpen(true)
  }

  const clearFacetSelection = () => {
    let newSelectedFacets : SelectedFacets = {}

    Object.keys(selectedFacets).forEach(selectedFacetGroup => {
      if(selectedFacetGroup == currentFacetGroup?.idName) {
        return
      }
      
      newSelectedFacets[selectedFacetGroup] = selectedFacets[selectedFacetGroup]
    })

    setSelectedFacets(newSelectedFacets)
    onSelection(newSelectedFacets)
  }

  return (
    <>
      <div className="flex flex-wrap items-center">
        <label className="italic font-serif text-lg p-2 mt-5 mr-2">
          Filter by:
        </label>

        {Object.keys(FacetTypeList).map((facetGroupName) => {
          const facetGroupIdName = FacetTypeList[facetGroupName]

          const facetGroup : FacetGroup = {
            name: facetGroupName, 
            idName: facetGroupIdName 
          }
          
          const isLoading = loadingFacetGroup?.idName == facetGroup?.idName

          return (
            <FacetGroupButton 
              key={facetGroup.idName}
              isOpened={currentFacetGroup?.idName == facetGroupIdName}
              isLoading={isLoading as boolean}
              selectedFacetCount={selectedFacets[facetGroupIdName] ? selectedFacets[facetGroupIdName].length : null}
              facetGroup={facetGroup}
              onToggle={() => {
                if(currentFacetGroup?.idName == facetGroupIdName) {
                  closeArea()
                  return
                }
                openArea(facetGroup)
                setCurrentFacetGroup(facetGroup)
              }}
            />)
        })}
      </div>
      {isOpen && (
        <div className="p-5 bg-white border-2 border-black mt-5">
          <div className="justify-between flex">
            <div className="flex">
            {facetList.length > 0 && (
                <>
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
                  <div className="ml-5"></div>
                </>
              )}
                
              <button 
                className="text-2xl border-2 border-black p-2" 
                onClick={event => {
                  event.preventDefault()
                  clearFacetSelection()
                }}>
                Clear
              </button>
            </div>
            <button onClick={event => {
              event.preventDefault()
              closeArea()
            }} className="">
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
            {currentFilteredList.length == 0 && search != "" && (
              <div className="text-2xl">
                Cannot find anything with that filter search text
              </div>
            )}
            {currentFilteredList.map((facet) => {
              const currentSelectedFacets = selectedFacets[facet.group.idName] || []

              return (
                <div className="p-2 flex justify-center" key={facet.val}>
                  <input 
                    type="checkbox"
                    className={`invisible ${style.searchFacetCheckbox}`}
                    id={`facet_${facet.val}`}
                    value={facet.val}
                    checked={(currentSelectedFacets.length > 0) ? currentSelectedFacets.some(selectedFacet => selectedFacet.val == facet.val) : false}
                    onChange={(event) => {
                      let newCurrentSelectedFacets = currentSelectedFacets.filter(selectedFacet => selectedFacet.val != facet.val)

                      if(event.target.checked) {
                        newCurrentSelectedFacets.push(facet)
                      }

                      const newSelectedFacets = {...selectedFacets}

                      newSelectedFacets[facet.group.idName] = newCurrentSelectedFacets

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