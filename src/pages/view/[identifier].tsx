import { useQuery } from '@tanstack/react-query';
import { GetServerSideProps, NextPage } from 'next';
import Loader from '../../components/Common/Loader';
import RegulerLayout from '../../components/Layouts/Regular';
import ViewPlayer from '../../components/View/ViewPlayer';
import { Metadata } from '../../inc/Archive/Metadata';

interface ViewProps {
  identifier: string
}

const View: NextPage<ViewProps> = ({ identifier }: ViewProps) => {
  const { isFetching, data: metadata } = useQuery([ 'metadata', identifier ], () => (
    fetch(`/api/getMetadata?identifier=${identifier}`)
      .then(async data => await data.json() as Metadata | null)
  ));

  return (
    <RegulerLayout title={metadata?.metadata.title}>
      <Loader isLoading={isFetching} text="Fetching metadata">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-5xl pb-10 italic font-bold text-center">
            {metadata?.metadata.title}
          </h1>
          {!isFetching && metadata && (
            <div className="border-t-2 border-black py-5">
              {metadata ? (
                <ViewPlayer metadata={metadata} />
              ) : (
                <div>
              Cannot initialize viewplayer.
                </div>
              )}
            </div>
          )}
        </div>
      </Loader>
    </RegulerLayout>
  );
};

export default View;

export const getServerSideProps : GetServerSideProps<ViewProps> = async (context) => {
  const identifier = context.query.identifier as string ?? '';

  return {
    props: {
      identifier
    }
  };
};
