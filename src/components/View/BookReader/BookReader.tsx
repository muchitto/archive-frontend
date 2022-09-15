import Image from 'next/future/image';
import { useEffect, useState } from 'react';
import { BookReaderBookSpread, BookReaderInfo } from '../../../inc/Archive/BookReader';
import { Metadata } from '../../../inc/Archive/Metadata';
import PageButton from '../../Common/PageButton';

import leftIcon from '../../../assets/icons/left.svg';
import rightIcon from '../../../assets/icons/right.svg';
import { useQuery } from '@tanstack/react-query';

import refreshCW from '../../../assets/icons/refresh-cw.svg';

interface BookReaderProps {
  metadata: Metadata
}

export default function BookReader ({ metadata }: BookReaderProps) {
  console.log(metadata);

  const [pageSpread, setPageSpread] = useState(0);
  const [currentSpread, setCurrentSpread] = useState(null as BookReaderBookSpread | null);

  const pageL = (currentSpread) ?  currentSpread[0] : null;
  const pageR = (currentSpread && currentSpread[1]) ? currentSpread[1] : null;

  const identifier = metadata.metadata.identifier;

  const { isFetching, data } = useQuery(['bookReaderData', identifier], async () =>
    fetch(`/api/getBookReaderData?identifier=${identifier}`)
      .then(res => res.json())
      .then(data => data as BookReaderInfo | null), { retry: true });

  const currentPageNumber = Math.max(1, pageSpread * 2);
  const totalPages = (data) ? data.brOptions.data.flat().length : 0;
  const hasMoreSpreads = totalPages > currentPageNumber;

  useEffect(() => {
    if(!isFetching && data) {
      setCurrentSpread(data.brOptions.data[pageSpread]);
    }
  }, [data, pageSpread]);

  if(isFetching) {
    return (
      <div>
        <Image src={refreshCW} className="animate-spin" width="100" height="100" alt="Loading page..." />
      </div>
    );
  }

  if(!currentSpread) {
    return (
      <div>
        Cannot show this spread
      </div>
    );
  }

  return (
    <div>
      {data && (
        <div className="text-center text-xl font-bold pb-4">
          Page: {currentPageNumber} / {totalPages}
        </div>
      )}
      {currentSpread && currentPageNumber > 0 && (
        <div>
          {pageSpread > 0 && (
            <PageButton
              className='fixed inset-y-1/2 left-4'
              showText={true}
              onClick={() => {
                setPageSpread(p => p - 1);
              }}
              content={
                <Image src={leftIcon} alt="Previous page" />
              }
              hideTextWhenClick={true}
            />
          )}
          <div className='flex w-full'>
            {pageL && (
              <img
                src={pageL.uri}
                width={pageL.width}
                height={pageL.height}
                alt={'Page'}
                className="w-1/2"
              />
            )}
            {pageR && (
              <img
                src={pageR.uri}
                width={pageR.width}
                height={pageR.height}
                alt={'Page'}
                className="w-1/2"
              />
            )}
          </div>
          {hasMoreSpreads && (
            <PageButton
              className='fixed inset-y-1/2 right-4'
              showText={true}
              onClick={() => {
                setPageSpread(p => p + 1);
              }}
              content={
                <Image src={rightIcon} alt="Next page" />
              }
              hideTextWhenClick={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
