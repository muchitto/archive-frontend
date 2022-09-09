import { useEffect, useMemo, useRef } from "react"
import { useState } from "react"
import { FacetGroup, FacetSearchResultPretty, SearchQuery, FacetGroupsAndFacets, facetTypeList } from "../../../utils/Archive"
import FacetGroupButton from "./FacetGroupButton"
import style from "../Search.module.scss"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useDebounce } from "../../../utils/hooks"
import Config from "../../../utils/Config"

import Image from "next/future/image"

import searchIcon from "../../../assets/icons/search.svg"
import xIcon from "../../../assets/icons/x.svg"
import upIcon from "../../../assets/icons/up.svg"
import downIcon from "../../../assets/icons/down.svg"

interface FacetAreaProps {
  facetsPerPage: number
  query: SearchQuery
  onSelection: (selectedFacets: FacetGroupsAndFacets) => void
  onOpen?: (open: boolean) => void
}

export default function FacetArea({ facetsPerPage, query, onSelection, onOpen }: FacetAreaProps) {
  const [page, setPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [filterSearchText, setFilterSearchText] = useState("")
  const [selectedFacets, setSelectedFacets] = useState(query.query.facets)
  const [currentFacetGroup, setCurrentFacetGroup] = useState(null as FacetGroup | null)

  const debouncedSearchText = useDebounce(query.query.any, Config.defaultSearchDebounceTime)

  const facetResults = useQueries({
    queries: Object.keys(facetTypeList).map(groupIdName => {
      const facetGroup = facetTypeList[groupIdName]

      return {
        queryKey: ['facetGroup', facetGroup.idName, debouncedSearchText],
        queryFn: () => {
          return fetch(`/api/getFacets?any=${debouncedSearchText}&facet=${facetGroup.idName}`)
            .then(res => res.json())
            .then(res => ({
              facetGroup,
              res: res as FacetSearchResultPretty | null
            }))
        },
        retry: true,
        retryDelay: 2000,
      }
    })
  })

  const facetLists = useMemo(() => {
    const newFacetList : FacetGroupsAndFacets = {}
    facetResults.forEach(result => {
      if(!result.data || !result.data.facetGroup || !result.data.res) {
        return
      }

      newFacetList[result.data.facetGroup.idName] = result.data.res.facets
    });
    return newFacetList
  }, [facetResults])

  const currentFacetList = useMemo(() => {
    if(!currentFacetGroup) {
      return []
    }

    return facetLists[currentFacetGroup.idName] ?? []
  }, [currentFacetGroup, facetLists])

  const facetsThatCanBeSelected = useMemo(() => {
    const out : FacetGroupsAndFacets = {}
    for(let groupId in selectedFacets) {
      if(!facetLists[groupId] || facetLists[groupId].length == 0) {
        out[groupId] = selectedFacets[groupId]
        continue
      }

      out[groupId] = selectedFacets[groupId].filter(facet => {
        if(!facetLists[groupId] || facetLists[groupId].length == 0) {
          return false
        }

        return facetLists[groupId].some(f => f.val == facet.val)
      })
    }
    return out
  }, [facetLists, selectedFacets])

  const currentFilteredList = useMemo(() => {
    const searchFilteredList = currentFacetList.filter(facet => (facet.val + "").toLowerCase().includes(filterSearchText.toLowerCase()))

    return searchFilteredList.slice((page - 1) * facetsPerPage, page * facetsPerPage)
  }, [currentFacetList, filterSearchText, page, facetsPerPage])

  useEffect(() => {
    closeArea()
  }, [debouncedSearchText])

  // Report selection changes that happens
  useEffect(() => {
    onSelection(facetsThatCanBeSelected)
  }, [selectedFacets])

  const closeArea = () => {
    setIsOpen(false)
    setFilterSearchText("")
    setCurrentFacetGroup(null)
    
    if(onOpen) {
      onOpen(false)
    }
  }

  const openArea = async (facetGroup: FacetGroup) => {
    setIsOpen(true)
    
    if(onOpen) {
      onOpen(true)
    }
  }

  const clearSelection = (facetGroup: FacetGroup) => {
    const newSelectedFacets = {
      ...selectedFacets
    }
    newSelectedFacets[facetGroup.idName] = []
    setSelectedFacets(newSelectedFacets)
  }

  const totalPages = currentFacetList.length / facetsPerPage

  return (
    <>
      <div className="flex flex-wrap items-center">
        <label className="italic font-serif text-lg p-2 mt-5 mr-2">
          Filter by:
        </label>

        {Object.keys(facetTypeList).map(facetTypeId => {
          const facetGroup = facetTypeList[facetTypeId]
          const result = facetResults.find(res => res.data?.facetGroup.idName == facetGroup.idName)

          const isLoading = result?.isFetching ?? true
          const isOpened = currentFacetGroup?.idName == facetGroup?.idName
          const isError = result?.isError ?? false
          
          const selectedFacetCount = facetsThatCanBeSelected[facetGroup.idName]?.length ?? 0
          const totalFacetCount = facetLists[facetGroup.idName]?.length ?? 0

          return (
            <FacetGroupButton
              key={facetGroup?.idName}
              isOpened={isOpened}
              isLoading={isLoading}
              facetGroup={facetGroup}
              isError={isError}
              totalFacetCount={totalFacetCount}
              selectedFacetCount={selectedFacetCount}
              
              onToggle={() => {
                if (currentFacetGroup?.idName == facetGroup.idName) {
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
              {currentFacetList.length > 0 && (
                <>
                  <Image src={searchIcon} className="inline-block md:w-10" />

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

                  if(currentFacetGroup) {
                    clearSelection(currentFacetGroup)
                  }
                }}>
                Clear
              </button>
            </div>
            <button onClick={event => {
              event.preventDefault()
              closeArea()
            }} className="">
              <Image src={xIcon} />
            </button>
          </div>
          {page > 1 && (
            <div className="flex justify-center mt-5 animate-bounce">
              <button onClick={event => {
                event.preventDefault()
                setPage(page - 1)
              }}>
                <Image src={upIcon} />
              </button>
            </div>
          )}
          <div className="flex flex-wrap mt-5">
            {currentFacetList.length == 0 && (
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

                      if (event.target.checked) {
                        newCurrentSelectedFacets.push(facet)
                      }

                      const newSelectedFacets = { ...selectedFacets }

                      newSelectedFacets[facet.group.idName] = newCurrentSelectedFacets

                      setSelectedFacets(newSelectedFacets)
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
                <Image src={downIcon} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}