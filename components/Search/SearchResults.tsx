import { useState } from "react";
import { Doc, Query, Result } from "../../utils/Archive";
import ResultItem from "./SearchItem";

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
      <div className="md:grid md:grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {result.response.docs.map((doc) => {
          return (<ResultItem doc={doc} key={doc.identifier} />)
        })}
      </div>
    </div>
  )
}