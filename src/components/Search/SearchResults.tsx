import { SearchResult } from '../../inc/Archive/Search';
import ResultItem from './SearchItem';

interface SearchResultsProps {
  page: number
  rows: number
  result: SearchResult
}

export default function SearchResults({ result, page, rows}: SearchResultsProps) {
  const numResults = result.response.numFound;
  const allPages = Math.ceil(numResults / rows);

  return (
    <div className="">
      <>
        <div className="text-2xl italic mb-5">
          <div>Results found: {numResults}</div>
          <div>Pages: {page} / {allPages}</div>
        </div>
        <div className="md:grid md:grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {result.response.docs.map((doc, index) => {
            return (<ResultItem pos={index} doc={doc} key={doc.identifier} />);
          })}
        </div>
      </>
    </div>
  );
}
