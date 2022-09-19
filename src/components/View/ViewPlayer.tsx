import { MediaType } from '../../inc/Archive/Archive';
import { Metadata } from '../../inc/Archive/Metadata';

export default function ViewPlayer ({ metadata }: { metadata: Metadata }) {
  const mediatype = metadata?.metadata.mediatype;

  if(!metadata) {
    return <div>
      Invalid metadata.
    </div>;
  }

  if(mediatype == MediaType.Texts) {
    return (
      <>
        <iframe src={`https://archive.org/stream/${metadata.metadata.identifier}`} className="w-full min-h-screen	"></iframe>
      </>
    );
  }

  return (
    <div>
      No reader yet for mediatype {mediatype}
    </div>
  );
}
