import { useEffect, useState } from "react";
import { Facet, FacetSearchResult } from "../utils/Archive";

interface SearchFacetProps {
  facet: Facet
  isChecked: boolean
  onClick: (facet: Facet, checked: boolean) => void
}

export default function SearchFacet({ facet, isChecked, onClick }: SearchFacetProps) {
  const [checked, setChecked] = useState(isChecked)

  return (
    <div className="p-2">
      <input 
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          setChecked(!checked)
          onClick(facet, checked)
        }}
      />

      <label className="ml-2 italic text-lg">
        {facet.val}
      </label>
    </div>
  )
}