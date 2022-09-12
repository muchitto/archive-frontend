import path from 'path'
import { File, FileFormat, Metadata } from './Metadata'

export interface BookReaderPageData {
  height: number
  width: number
  leafNum: number
  pageSide: 'L' | 'R'
  pageType: 'Title' | 'Normal'
  uri: string
}

export enum BookType {
  PDF = 'PDF',
  ePub = 'ePub',
  PlainText = 'Plain Text',
  Daisy = 'DAISY',
  Kindle = 'Kindle'
}

export type BookReaderBookSpread = [BookReaderPageData, BookReaderPageData?]

export interface BookReaderInfo {
  brOptions: {
    bookId: string
    bookPath: string
    bookTitle: string
    data: BookReaderBookSpread[]
    defaultStartLeaf: number
    imageFormat: string
    pageProgression: 'lr' | 'rl'
    plugins: {
      textSelection: {
        enabled: boolean
        singlePageDjvuXmlUrl: string
      }
    }
    ppi: number
    server: string
    subPrefix: string
    vars: {
      bookId: string
      bookPath: string
      server: string
      subPrefix: string
    }
    zip: string
  }
  data: {
    bookUrl: string
    downloadUrls: [BookType, string][]
    id: string
    isRestricted: boolean
    olHost: string
    streamOnly: boolean
    subPrefix: string
  }
  lendingInfo: {
    bookUrl: string
    daysLeftOnLoan: number
    isAdmin: boolean
    isArchiveOrgLending: false
    isAvailable: boolean
    isAvailableForBrowsing: boolean
    isBrowserBorrowable: boolean
    isLendingRequired: boolean
    isOpenLibraryLending: boolean
    isPrintDisabledOnly: boolean
    lendingStatus: null
    loanCount: number
    loanRecord: any[]
    loansUrl: string
    maxLoans: number
    secondsLeftOnLoan: number
    shouldProtectImages: boolean
    totalWaitlistCount: number
    userHasBorrowed: boolean
    userHasBrowsed: boolean
    userHoldIsReady: boolean
    userIsPrintDisabled: boolean
    userOnWaitingList: boolean
    userWaitlistPosition: number
    userid: number
  }
  metadata: Metadata
}

type BookReaderResult = { data: BookReaderInfo }

export async function getBookReaderDataWithMetadata(metadata: Metadata) : Promise<BookReaderResult | null> {
  const url = new URL(`https://${metadata.server}/BookReader/BookReaderJSIA.php`)
  url.searchParams.set('id', metadata.metadata.identifier)
  url.searchParams.set('itemPath', metadata.dir)
  url.searchParams.set('server', metadata.server)
  url.searchParams.set('format', 'json')
  url.searchParams.set('requestUri', `/details/${metadata.metadata.identifier}`)

  const pdf = getItemMetadataPDF(metadata)

  if(!pdf || !pdf.name) {
    return null
  }

  const filename = path.parse(pdf.name)
  url.searchParams.set('subPrefix', filename.name)

  const request = await fetch(url)

  if(!request) {
    return null
  }

  return await request.json() as BookReaderResult
}


export function getItemMetadataPDF(metadata: Metadata) : File | null {
  const pdfFile = metadata.files.find(file => file.format == FileFormat.PDF)

  if(!pdfFile) {
    return null
  }

  return pdfFile
}
