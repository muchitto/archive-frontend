import Image from 'next/future/image'
import { useState } from 'react'
import { BookReaderBookSpread, getBookReaderDataWithMetadata } from '../../../inc/Archive/BookReader'
import { Metadata } from '../../../inc/Archive/Metadata'
import PageButton from '../../Common/PageButton'

import leftIcon from '../../../assets/icons/left.svg'
import rightIcon from '../../../assets/icons/right.svg'

interface BookReaderProps {
  metadata: Metadata | null
}

export default function BookReader ({ metadata }: BookReaderProps) {
  const [pageSpread, setPageSpread] = useState(0)
  const [pageSpreads, setPageSpreads] = useState([] as BookReaderBookSpread[])

  const hasMoreSpreads = (pageSpreads && pageSpreads.length > 0) ? pageSpreads.length > pageSpread : false

  const currentSpreadData = pageSpreads[pageSpread]

  const pageL = (currentSpreadData) ?  currentSpreadData[0] : null
  const pageR = (currentSpreadData && currentSpreadData[1]) ? currentSpreadData[1] : null

  if(metadata) {
    getBookReaderDataWithMetadata(metadata).then(async data => {
      const pages = data?.data.brOptions.data

      if(!pages){
        console.log('no pages')
        return
      }

      setPageSpreads(pages)
    })
  }

  if(!currentSpreadData) {
    return (
      <div>
        Cannot show this spread
      </div>
    )
  }

  return (
    <div>
      {hasMoreSpreads && currentSpreadData && (
        <div>
          {pageSpread > 0 && (
            <PageButton
              className='fixed inset-y-1/2 left-4'
              showText={true}
              onClick={(event) => {
                setPageSpread(p => p - 1)
              }}
              content={
                <Image src={leftIcon} alt="Previous page" />
              }
              hideTextWhenClick={true}
            />
          )}
          <div className='flex w-full'>
            {pageL && (
              <Image
                src={pageL.uri}
                width={pageL.width}
                height={pageL.height}
                alt={'Page'}
                className="w-1/2"
                priority={true}
              />
            )}
            {pageR && (
              <Image
                src={pageR.uri}
                width={pageR.width}
                height={pageR.height}
                alt={'Page'}
                className="w-1/2"
                priority={true}
              />
            )}
          </div>
          {hasMoreSpreads && (
            <PageButton
              className='fixed inset-y-1/2 right-4'
              showText={true}
              onClick={(event) => {
                setPageSpread(p => p + 1)
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
  )
}
