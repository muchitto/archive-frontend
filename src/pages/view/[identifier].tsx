import { GetServerSideProps, NextPage } from 'next';
import Regular from '../../components/Layouts/Regular';
import ViewPlayer from '../../components/View/ViewPlayer';
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata';

interface ViewProps {
  identifier: string
  metadata: Metadata | null
}

const View: NextPage<ViewProps> = ({ identifier, metadata }: ViewProps) => {
  return (
    <Regular title={metadata?.metadata.title}>
      <div>
        <h1 className="text-5xl pb-10 italic font-bold text-center">
          {metadata?.metadata.title}
        </h1>
        <div className="border-t-2 border-black py-5">
          {metadata ? (
            <ViewPlayer metadata={metadata} />
          ) : (
            <div>
              Cannot initialize viewplayer.
            </div>
          )}
        </div>
      </div>
    </Regular>
  );
};

export const getServerSideProps: GetServerSideProps<ViewProps> = async (context) => {
  const identifier = context.query.identifier as string;

  const metadata = await getItemMetadata(identifier);

  return {
    props: {
      identifier,
      metadata,
    }
  };
};

export default View;
