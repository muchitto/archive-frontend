import Image from 'next/future/image';
import { useEffect, useState } from 'react';
import { File, Metadata } from '../../../inc/Archive/Metadata';
import PageButton from '../../Common/PageButton';

import leftIcon from '../../../assets/icons/left.svg';
import rightIcon from '../../../assets/icons/right.svg';
import { useQuery } from '@tanstack/react-query';

import { BookReaderBookSpread, BookReaderTotalData } from '../../../inc/Archive/BookReader';
import Loader from '../../Common/Loader';
import { PageDirection } from '../../../pages/search';
import BookFileList from './BookFileList';

interface BookReaderProps {
  metadata: Metadata
}

export default function BookReader({ metadata }: BookReaderProps) {
  const [ currentSpread, setCurrentSpread ] = useState(null as BookReaderBookSpread | null);
  const [ spreadNumber, setSpreadNumber ] = useState(0);
  const [ loadingPage, setLoadingPage ] = useState(null as PageDirection | null);
  const [ currentFile, setCurrentFile ] = useState(null as File | null);

  const identifier = metadata.metadata.identifier;

  useEffect(() => {
    const url = new URL(location.href);
    const spread = url.searchParams.get('spread');

    if(spread) {
      setSpreadNumber(parseInt(spread));
    }
  }, []);

  const { isFetching, data : bookReaderData } = useQuery([ 'bookReaderData', identifier ], async () =>
    fetch(`/api/getBookReaderData?identifier=${identifier}`)
      .then(res => res.json())
      .then(data => data as BookReaderTotalData | null)
      .then(data => {
        console.log(data);
        if(data?.data.brOptions.data && data?.data.brOptions.data.length > 0) {
          setCurrentSpread(data.data.brOptions.data[0]);
        }

        return data;
      }),
  {
    retry: true
  });

  useEffect(() => {
    if(bookReaderData?.data.brOptions.data) {
      setCurrentSpread(bookReaderData?.data.brOptions.data[spreadNumber]);
    }
  }, [ spreadNumber ]);

  const spreads = (bookReaderData) ? bookReaderData.data.brOptions.data : [];
  const totalSpreads = spreads.length;
  const hasMorePages = totalSpreads > spreadNumber + 1;
  const pageL = (currentSpread) ? currentSpread[0] : null;
  const pageR = (currentSpread && currentSpread.length > 1) ? currentSpread[1] : null;
  const pageLeftURL = (currentSpread) ? currentSpread[0].uri : null;
  const pageRightURL = (currentSpread && currentSpread.length > 1) ? currentSpread[1]?.uri : null;

  const PageRow = ({ dir } : {dir: PageDirection}) => {
    return (
      <div className='flex justify-center'>
        {spreadNumber > 0 && (
          <PageButton
            className={`${dir == PageDirection.Previous ? 'lg:hidden' : ''} lg:fixed inline-block inset-y-1/2 left-4`}
            onClick={() => {
              setSpreadNumber(p => p - 1);
              setLoadingPage(PageDirection.Previous);
            }}
          >
            <Image src={leftIcon} alt="Previous page" />
          </PageButton>
        )}
        {hasMorePages && (
          <PageButton
            className={`${dir == PageDirection.Next ? 'lg:hidden' : ''} ml-5 lg:fixed inline-block inset-y-1/2 right-4`}
            onClick={() => {
              setSpreadNumber(p => p + 1);
              setLoadingPage(PageDirection.Next);
            }}
          >
            <Image src={rightIcon} alt="Next page" />
          </PageButton>
        )}
      </div>
    );
  };

  return (
    <div>
      <Loader isLoading={isFetching} text="Fetching pages">
        <div className="flex">
          <div className="flex-1 overflow-y-scroll">
            <BookFileList metadata={metadata} onSelect={file => {
              setCurrentFile(file);
            }} />
          </div>
          <div className="flex-0">
            <div className="text-center text-xl font-bold pb-4">
            Page: {spreadNumber + 1} / {totalSpreads}
            </div>
            {(pageL || pageR) && (
              <div>
                <PageRow dir={PageDirection.Previous} />

                <div className='flex w-full'>
                  {pageL && pageLeftURL && (
                    <img
                      src={pageLeftURL}
                      width={pageL.width}
                      height={pageL.height}
                      alt={'Page'}
                      className="w-1/2"
                    />
                  )}
                  {pageR && pageRightURL && (
                    <img
                      src={pageRightURL}
                      width={pageR.width}
                      height={pageR.height}
                      alt={'Page'}
                      className="w-1/2"
                    />
                  )}
                </div>

                <PageRow dir={PageDirection.Next} />
              </div>
            )}
          </div>
        </div>
      </Loader>
    </div>
  );
}
