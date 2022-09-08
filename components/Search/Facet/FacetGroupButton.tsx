import Image from "next/future/image"
import { useState } from "react"
import { FacetGroup } from "../../../utils/Archive"

import refreshCWIcon from "../../../assets/icons/refresh-cw.svg"

interface FacetGroupButtonProps {
  facetGroup: FacetGroup
  selectedFacetCount: number
  className?: string
  isOpened: boolean
  isLoading: boolean
  onToggle: (isOpen: boolean) => void
}

export default function FacetGroupButton({ facetGroup, className, selectedFacetCount, isLoading, isOpened, onToggle }: FacetGroupButtonProps) {
  let classes = [
    "font-serif italic text-lg",
    "flex items-center",
    "border-2",
    "p-2 px-3 mt-5 mr-2",
    "border-black bg-white text-black",
    "disabled:opacity-40", 
    "enabled:hover:shadow-btn", 
    "enabled:hover:bg-amber-100",
    className
  ]

  if(isOpened) {
    classes.push("shadow-btn bg-amber-200")
  }

  return (
    <button
      key={facetGroup.idName}
      disabled={isLoading}
      className={classes.join(" ")}
      onClick={async (event) => {
        event.preventDefault()
        onToggle(isOpened)
      }}>
      <label className="cursor-pointer">
        {facetGroup.name}
      </label>
      {selectedFacetCount > 0 && (
        <span className="ml-2">
          ({selectedFacetCount})
        </span>
      )}
      {isLoading && (
        <Image src={refreshCWIcon} className="animate-spin w-6 ml-5" />
      )}
    </button>
  )
}