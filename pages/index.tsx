import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Search from '../components/Search/Search'
import { Facet, SearchQuery, FacetGroupsAndFacets, facetTypeList } from '../utils/Archive'
import Config from '../utils/Config'

interface HomeProps {
  initialQuery: SearchQuery
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
  const rows = parseInt(context.query.rows as string) || Config.defaultRows
  const page = parseInt(context.query.page as string) || 1

  const newSelectedFacets : FacetGroupsAndFacets = {}
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

  console.log(newSelectedFacets)

  return {
    props: {
      initialQuery: {
        query: {
          any,
          facets: newSelectedFacets
        },
        rows,
        page,
      }
    }
  }
}