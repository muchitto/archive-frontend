import { stringify } from "querystring"

export interface SearchResult {
  responseHeader: {
    status: number;
    QTime: number;
    params: {
      query: string;
      qin: string;
      fields: string;
      rows: string;
      start: number;
    };
  };
  response: {
    numFound: number;
    start: number;
    docs: Doc[];
  };
}

export interface Doc {
  title: string;
  backup_location: string;
  collection: string[];
  contributor: string;
  creator: string;
  date: string;
  description: string;
  downloads: number;
  "external-identifier": string[];
  foldoutcount: number;
  format: string[];
  identifier: string;
  imagecount?: number;
  indexflag: string[];
  item_size: number;
  language: string;
  mediatype: MediaType;
  oai_updatedate: string[];
  publicdate: string;
  publisher?: string;
  week?: number;
  year?: number;
  month?: number;
}

export interface File {
  crc32: string;
  format: string;
  md5: string;
  mtime: number;
  name: string;
  rotation: number;
  sha1: string;
  size: number;
  source: string;
}

export interface Metadata {
  created: number;
  d1: string;
  d2: string;
  d3: string;
  dir: string;
  files: File[];
  files_count: number;
  item_last_updated: number;
  item_size: number;
  metadata: {
    addeddate: string;
    backup_location: string;
    collection: string[];
    creator: string;
    curation: string;
    date: string;
    description: string;
    identifier: string;
    language: string;
    mediatype: MediaType;
    publicdate: string;
    scanner: string;
    subject: string[];
    title: string;
    uploader: string;
  };
  server: string;
  uniq: number;
  workable_servers: string[];
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

export const AllMediaTypes: { [key: string]: MediaType } = {
  Account: MediaType.Account,
  Audio: MediaType.Audio,
  Data: MediaType.Data,
  Image: MediaType.Image,
  Movies: MediaType.Movies,
  Texts: MediaType.Texts,
  Web: MediaType.Web,
}

export type FacetGroupSelections = {
  [key: string]: Facet[];
};

export interface SearchQueryDetail {
  any: string;
  facets: FacetGroupSelections;
}

export interface SearchQuery {
  query: SearchQueryDetail;
  rows: number;
  page: number;
  output?: "json" | "xml";
}

export interface CategoryQuery {
  any: string;
  facet: string;
}

export interface Facet {
  n?: number;
  val: number | string;
  group: FacetGroup;
}

export interface FacetGroup {
  name: string;
  idName: string;
}

export interface FacetSearchResult {
  checked: any[];
  hdr: string;
  morf: string;
  options: Facet[];
  submit: string;
}

export interface FacetSearchResultPretty {
  facetGroup: FacetGroup;
  facets: Facet[];
}

export const facetTypeList: { [key: string]: FacetGroup } = {
  creator: {
    name: "Creator",
    idName: "creator",
  },
  collection: {
    name: "Collection",
    idName: "collection",
  },
  subject: {
    name: "Subject",
    idName: "subject",
  },
  year: {
    name: "Year",
    idName: "year",
  },
  mediatype: {
    name: "MediaType",
    idName: "mediatype",
  },
  lending___status: {
    name: "Lending status",
    idName: "lending___status",
  },
  languageSorter: {
    name: "Language",
    idName: "languageSorter",
  },
}

export function queryDetailFormatter(data: SearchQueryDetail) {
  let q = `(${data.any})`

  for (const key in data.facets) {
    const facetList = data.facets[key]

    if (facetList.length == 0) {
      continue
    }

    if (q.length > 0) {
      q += " AND "
    }

    let localq = ""
    for (const facet of data.facets[key]) {
      if (localq.length > 0) {
        localq += ` OR `
      }

      localq += `${key}:(${facet.val})`
    }

    if (data.facets[key].length > 1) {
      q += `(${localq})`
    } else {
      q += localq
    }
  }

  return encodeURIComponent(q)
}

export async function fetchFacets(
  query: CategoryQuery
): Promise<FacetSearchResult | null> {
  const searchURL = `https://archive.org/search.php?query=${query.any}&morf=${query.facet}&headless=1&facets_xhr=facets&output=json`

  const fetchedFacets = await fetch(searchURL)
  const result = (await fetchedFacets.json()) as FacetSearchResult

  return result
}

export async function convertFacetResultToPretty(
  query: CategoryQuery,
  result: FacetSearchResult
) {
  const facetGroup = facetTypeList[query.facet]

  const facetList = result.options.map((facet) => {
    facet.group = facetGroup
    return facet
  })

  const facetResultPretty: FacetSearchResultPretty = {
    facetGroup: facetGroup,
    facets: facetList,
  }

  return facetResultPretty
}

export async function fetchFacetsPretty(
  query: CategoryQuery
): Promise<FacetSearchResultPretty | null> {
  const results = await fetchFacets(query)

  if (!results) {
    return null
  }

  return convertFacetResultToPretty(query, results)
}

export async function fetchAllFacetsPretty(
  any: string
): Promise<FacetSearchResultPretty[] | null> {
  const facetResultList: FacetSearchResultPretty[] = []

  for (const facetTypeId of Object.keys(facetTypeList)) {
    const facetGroup = facetTypeList[facetTypeId]

    try {
      const facetListPretty = await fetchFacetsPretty({
        any,
        facet: facetGroup.idName,
      })

      if (!facetListPretty) {
        console.log(
          `could not fetch facets with facet group id ${facetGroup.idName}`
        )
        continue
      }

      facetResultList.push(facetListPretty as FacetSearchResultPretty)
    } catch (error) {
      console.log(
        `could not fetch facets with facet group id ${facetGroup.idName}`
      )
    }
  }

  return facetResultList
}

export async function fetchDataWithQuery(
  query: SearchQuery
): Promise<SearchResult | null> {
  if (!query.query.any) {
    return null
  }

  let urlPrefix =
    `https://archive.org/advancedsearch.php?` +
    stringify({
      rows: query.rows,
      page: query.page,
      output: query.output || "json",
    })

  if (query.query) {
    urlPrefix += `&q=${queryDetailFormatter(query.query)}`
  }

  const data = await fetch(urlPrefix)

  return await data.json()
}

export async function getItemMetadta(
  identifier: string
): Promise<Metadata | null> {
  const request = await fetch(`https://archive.org/metadata/${identifier}`)
  const data = await request.json()

  if (!data) {
    return null
  }

  return data as Metadata
}
