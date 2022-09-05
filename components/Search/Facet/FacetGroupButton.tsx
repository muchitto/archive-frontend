import { useState } from "react"
import { FacetGroup } from "../../../utils/Archive"

interface FacetGroupButtonProps {
  facetGroup: FacetGroup
  selectedFacetCount: number | null
  className?: string
  isOpened: boolean
  isLoading: boolean
  onToggle: (isOpen: boolean) => void
}

export default function FacetGroupButton({facetGroup, className, selectedFacetCount, isLoading, isOpened, onToggle} : FacetGroupButtonProps) {
  const [isOpen, setIsOpen] = useState(isOpened)

  const additionalClassName = `${isOpen && !isLoading ? 'border-white bg-black text-white' : 'border-black bg-white text-black'}`

  return (
    <button
      key={facetGroup.idName}
      className={`font-serif italic text-lg flex items-center border-2 mr-2 p-2 px-3 mt-5 ${additionalClassName} ${className}`}
      onClick={async (event) => {
        event.preventDefault()
        const newIsOpen = !isOpen
        setIsOpen(newIsOpen)
        onToggle(newIsOpen)
      }}>
      <label className="cursor-pointer">
        {facetGroup.name}
      </label>
      {selectedFacetCount && (
        <span className="ml-2">
          ({selectedFacetCount})
        </span>
      )}

      {isLoading && (
        <img src="./icons/loading.svg" className="animate-reverse-spin w-6 ml-5" />
      )}
    </button>
  )
}