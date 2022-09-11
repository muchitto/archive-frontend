import { stringify } from "qs"

export interface BookReaderQuery {
  server: string
  identifier: string
  itemPath: string
  subPrefix: string
  requestUri: string
  json: "json"
}

export async function getBookReaderData(query: BookReaderQuery) {
  const bookReaderPath = `/BookReader/BookReaderJSIA.php`

  stringify(query)


  //?id=BSOHComicBookIssue01&itemPath=/12/items/BSOHComicBookIssue01&server=ia600803.us.archive.org&format=jsonp&subPrefix=BSOH-ComicBook-Issue-01&requestUri=/details/BSOHComicBookIssue01
  return {

  }
}
