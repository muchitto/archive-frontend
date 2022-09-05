import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Search from '../components/Search/Search'
import { Facet, FacetSearchResultPretty, FacetTypeList, FetchAllFacetsPretty, FetchDataWithQuery, FetchFacets, GetFacetProperNameWithId, Query, Result, SelectedFacets } from '../utils/Archive'

interface HomeProps {
  initialQuery: Query
}

const Home: NextPage<HomeProps> = ({initialQuery}: HomeProps) => {
  return (
    <>
      <div>
        <Search 
          initialQuery={initialQuery}
        />
      </div>
    </>
  )
}

export default Home

export const getServerSideProps : GetServerSideProps<HomeProps> = async (context) => {
  const any = context.query.any as string || ""
  const rows = parseInt(context.query.rows as string) || 50
  const page = parseInt(context.query.page as string) || 1

  const newSelectedFacets : SelectedFacets = {}
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
          group: {
            idName: facetGroupIdName,
            name: GetFacetProperNameWithId(facetGroupIdName)
          },
          val: facet
        }
      })

      newSelectedFacets[facetGroupIdName].push(
        ...facets
      )
    }
  }

  const initialResult = await FetchDataWithQuery({
    query: {
      any,
      facets: newSelectedFacets
    },
    rows,
    page
  })

  return {
    props: {
      initialQuery: {
        query: {
          any,
          facets: newSelectedFacets
        },
        rows,
        page,
      },
      initialResult: initialResult as Result,
    }
  }
}