import { type } from "os"
import { stringify } from "querystring"

export type SelectedFacets = { 
  [key: string] : Facet[] 
}

export interface Result {
  responseHeader: {
    status: number
    QTime: number
    params: {
      query: string
      qin: string
      fields: string
      rows: string
      start: number
    }
  }
  response: {
    numFound: number
    start: number
    docs: Doc []
  }
}

export interface Doc {
  title: string
  backup_location: string
  collection: string[]
  contributor: string
  creator: string
  date: string
  description: string
  downloads: number
  "external-identifier": string[]
  foldoutcount: number
  format: string[]
  identifier: string 
  imagecount?: number
  indexflag: string[]
  item_size: number
  language: string
  mediatype: MediaType
  oai_updatedate: string[]
  publicdate: string
  publisher?: string
  week?: number
  year?: number
  month?: number
}

export enum MediaType {
  Account = "account",
  Audio = "audio",
  Data = "data",
  Image = "image",
  Movies = "movies",
  Texts = "texts",
  Web = "web",
}

export const AllMediaTypes : { [key: string] : MediaType} = {
  "Account": MediaType.Account,
  "Audio": MediaType.Audio,
  "Data": MediaType.Data,
  "Image": MediaType.Image,
  "Movies": MediaType.Movies,
  "Texts": MediaType.Texts,
  "Web": MediaType.Web
}

export interface Query {
  query: QueryDetail
  rows: number
  page: number
  output?: "json" | "xml"
}

export interface QueryDetail {
  any: string
  facets: SelectedFacets
}

export function QueryDetailFormatter(data: QueryDetail) {
  let q = `(${data.any})`

  for(let key in data.facets) {
    if(q.length > 0) {
      q += " AND "
    }

    let localq = ""
    for(let facet of data.facets[key]) {
      if(localq.length > 0) {
        localq += ` OR `
      }
  
      localq += `${key}:(${facet.val})`
    }

    if(data.facets[key].length > 1) {
      q += `(${localq})`
    } else {
      q += localq 
    }
  } 

  return encodeURIComponent(q)
}

export interface CategoryQuery {
  any: string
  facet: string 
}

export interface Facet {
  n?: number
  val: number | string
  group: FacetGroup
}

export interface FacetGroup {
  name: string
  idName: string
}

export interface FacetSearchResult {
  checked: any[]
  hdr: string 
  morf: string 
  options: Facet[]
  submit: string
}

export interface FacetSearchResultPretty {
  facetGroup: FacetGroup
  facets: Facet[]
}

export enum FacetType {
  Creator = "creator",
  Collection = "collection",
  Subject = "subject",
  Year = "year",
  Mediatype = "mediatype",
  LendingStatus = "lending___status",
  Language = "languageSorter"
}

export const FacetTypeList : { [key: string] : FacetType } = {
  "Creator": FacetType.Creator,
  "Collection": FacetType.Collection,
  "Subject": FacetType.Subject,
  "Year": FacetType.Year,
  "Mediatype": FacetType.Mediatype,
  "Lending status": FacetType.LendingStatus,
  "Language": FacetType.Language,
}

export function GetFacetProperNameWithId(idName: string) {
  return Object.keys(FacetTypeList)[Object.values(FacetTypeList).indexOf(idName as FacetType)] || ""
}

export async function FetchFacets(query: CategoryQuery) : Promise<FacetSearchResult | boolean> {
  const searchURL = `https://archive.org/search.php?query=${query.any}&morf=${query.facet}&headless=1&facets_xhr=facets&output=json`

  const fetchedFacets = await fetch(searchURL)
  const result = await fetchedFacets.json() as FacetSearchResult

  return result
}

export async function FetchFacetsPretty(query: CategoryQuery) : Promise<FacetSearchResultPretty | boolean> {
  const facets = await FetchFacets(query)
  
  if(!facets) {
    return false
  }

  const facetGroupProperName = GetFacetProperNameWithId(query.facet)

  const facetGroup : FacetGroup = {
    name: facetGroupProperName,
    idName: query.facet
  }

  const facetList = (facets as FacetSearchResult).options.map(facet => {
    facet.group = facetGroup
    return facet
  })

  const facetResultPretty : FacetSearchResultPretty = {
    facetGroup: facetGroup,
    facets: facetList
  }

  return facetResultPretty
}

export async function FetchAllFacetsPretty(any: string) : Promise<FacetSearchResultPretty[] | boolean> {
  const facetResultList : FacetSearchResultPretty[] = []

  for(let facetTypeProperName of Object.keys(FacetTypeList)) {
    const facetIdName = FacetTypeList[facetTypeProperName]

    try {
      const facetListPretty = await FetchFacetsPretty({
        any,
        facet: facetIdName
      })

      if(!facetListPretty) {
        console.log(`could not fetch facets with facet group id ${facetIdName}`)
        continue 
      }

      facetResultList.push(facetListPretty as FacetSearchResultPretty)
    } catch(error) {
      console.log(`could not fetch facets with facet group id ${facetIdName}`)
    }
  }

  return facetResultList
}

export async function FetchDataWithQuery(query: Query): Promise<Result | boolean> {
  if(!query.query.any) {
    return false
  }
  
  let urlPrefix = `https://archive.org/advancedsearch.php?` + stringify({
    rows: query.rows,
    page: query.page,
    output: query.output || "json"
  })

  if(query.query) {
    urlPrefix += `&q=${QueryDetailFormatter(query.query)}`
  }
  
  const data = await fetch(urlPrefix)

  const dataJson: Result = await data.json()

  return dataJson
}