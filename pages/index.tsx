import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Search from '../components/Search'
import { FacetGroup, FetchDataWithQuery, FetchFacets, Query, Result } from '../utils/Archive'

interface HomeProps {
  initialQuery: Query
  initialResult: Result
  facetGroups: FacetGroup[]
}

const Home: NextPage<HomeProps> = ({initialQuery, initialResult}: HomeProps) => {
  return (
    <div className="container mx-auto max-w-ld rounded-md">
      <header className="py-10">
        <div className="flex items-center w-full">
          <img src="./icons/logo.svg" />
          <label className='inline-block text-6xl font-bold ml-10 uppercase'>
            Archive
          </label>
        </div>
      </header>
      <div>
        <Search 
          initialQuery={initialQuery}
          initialResult={initialResult} 
        />
      </div>
    </div>
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