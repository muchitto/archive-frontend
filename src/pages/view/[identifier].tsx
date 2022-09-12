import { GetServerSideProps, NextPage } from 'next'
import ViewPlayer from '../../components/View/ViewPlayer'
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata'

interface ViewProps {
  identifier: string
  metadata: Metadata | null
}

const View: NextPage<ViewProps> = ({ identifier, metadata }: ViewProps) => {

  getItemMetadata(identifier).then(data => {
    console.log(data)
  })

  return (
    <>
      {metadata ? (
        <ViewPlayer metadata={metadata} />
      ) : (
        <div>
          Cannot initialize viewplayer.
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ViewProps> = async (context) => {
  const identifier = context.query.identifier as string

  const metadata = await getItemMetadata(identifier)

  return {
    props: {
      identifier,
      metadata,
    }
  }
}

export default View
