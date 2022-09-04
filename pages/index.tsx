import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Search from '../components/Search/Search'
import { Facet, FetchDataWithQuery, FetchFacets, Query, Result } from '../utils/Archive'

interface HomeProps {
  initialQuery: Query
  initialResult: Result
}

const Home: NextPage<HomeProps> = ({initialQuery, initialResult}: HomeProps) => {
  return (
    <>
      <div>
        <Search 
          initialQuery={initialQuery}
          initialResult={initialResult} 
        />
      </div>
    </>
  )
}

export default Home

export const getServerSideProps : GetServerSideProps<HomeProps> = async (context) => {
  const searchString = context.query.any as string || ""
  const rows = parseInt(context.query.rows as string) || 50
  const page = parseInt(context.query.page as string) || 1
  //const facets = context.query.facets as { [key: string] : string } || []

  const initialResult = await FetchDataWithQuery({
    query: {
      any: searchString,
      facets: {}
    },
    rows,
    page
  })

  return {
    props: {
      initialQuery: {
        query: {
          any: searchString,
          facets: {}
        },
        rows,
        page,
      },
      initialResult: initialResult as Result,
    }
  }
}