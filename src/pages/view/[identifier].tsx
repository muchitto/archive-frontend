import { GetServerSideProps, NextPage } from 'next'
import BookReader from '../../components/View/BookReader/BookReader'
import { MediaType } from '../../inc/Archive/Archive'
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata'

interface ViewProps {
  metadata: Metadata | null
}

const ViewPlayer = ({ metadata }: { metadata: Metadata }) => {
  const mediatype = metadata?.metadata.mediatype

  if(mediatype == MediaType.Texts) {
    return (
      <BookReader metadata={metadata} />
    )
  }

  return (
    <div>
      No reader yet for mediatype {mediatype}
    </div>
  )
}

const View: NextPage<ViewProps> = ({ metadata }: ViewProps) => {

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
