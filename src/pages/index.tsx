import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Search from '../components/Search/Search'
import { Facet, SearchQuery, FacetGroupSelections, facetTypeList, fetchDataWithQuery, SearchResult } from '../utils/Archive'
import Config from '../utils/Config'

interface HomeProps {
  initialQuery: SearchQuery
  initialResults: SearchResult | null
}

const Home: NextPage<HomeProps> = ({initialQuery, initialResults}: HomeProps) => {

  return (
    <>
      <div>
        <Search 
          initialQuery={initialQuery}
          initialResults={initialResults}
        />
      </div>
    </>
  )
}

export default Home

export const getServerSideProps : GetServerSideProps<HomeProps> = async (context) => {
  const any = context.query.any as string || ""
  const rows = parseInt(context.query.rows as string) || Config.defaultRows
  const page = parseInt(context.query.page as string) || 1

  const newSelectedFacets : FacetGroupSelections = {}
  for(let queryName in context.query) {
    if(queryName.startsWith("facet:")) {
      const facetGroupIdName = queryName.replace(/^facet\:/, "")
      let value = context.query[queryName]

      if(!Array.isArray(value)) {
        value = [value as string]
      }

      if(!newSelectedFacets[facetGroupIdName]) {
        newSelectedFacets[facetGroupIdName] = []
      }

      const facets : Facet[] = value.map(facet => {
        return {
          group: facetTypeList[facetGroupIdName],
          val: facet
        }
      })

      newSelectedFacets[facetGroupIdName].push(
        ...facets
      )
    }
  }

  const initialQuery = {
    query: {
      any,
      facets: newSelectedFacets
    },
    rows,
    page,
  }

  const initialResults = await fetchDataWithQuery(initialQuery)

  return {
    props: {
      initialQuery,
      initialResults
    }
  }
}