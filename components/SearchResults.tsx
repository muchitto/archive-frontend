import { useState } from "react";
import { Doc, Query, Result } from "../utils/Archive";
import SearchItem from "./SearchItem";

interface SearchResultsProps {
  result: Result
  query: Query
}

export default function SearchResults({ result, query }: SearchResultsProps) {
  const numResults = result.response.numFound
  const allPages = Math.ceil(numResults / query.rows)

  return (
    <div className="">
      <div className="text-2xl italic mb-5">
        <div>Results found: {numResults}</div>
        <div>Pages: {query.page} / {allPages}</div>
      </div>
      <div className="grid grid-flow-row-dense grid-cols-4 gap-4">
        {result.response.docs.map((doc) => {
          return (<SearchItem doc={doc} key={doc.identifier} />)
        })}
      </div>
    </div>
  )
}