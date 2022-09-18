import { MediaType } from '../../inc/Archive/Archive';
import { Metadata } from '../../inc/Archive/Metadata';
import BookReader from './BookReader/BookReader';

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
        <BookReader metadata={metadata} />
      </>
    );
  }

  return (
    <div>
      No reader yet for mediatype {mediatype}
    </div>
  );
}
