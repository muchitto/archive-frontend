import createCacheStore from '../Cache';
import { File, FileFormat, getItemMetadata, Metadata } from './Metadata';

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

export type BookReaderBookSpread = [BookReaderPageData, BookReaderPageData?];

export interface BookReaderData {
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

export interface BookReaderBookInfo {
  title: string
  date: string
  language: string
  collection: string
  pageProgression: 'lr' | 'rl'
  ppi: number
  numPages: number
  titleLeaf: number
  titleIndex: number
  url: string
  pageWidths: number[]
  pageHeights: number[]
  pageNums: number[]
  itemId: string
  subPrefix: string
  itemPath: string
  zip: string
  server: string
  imageFormat: string
  archiveFormat: string
  leafNums: number[]
  previewImage: string
  titleImage: string
}

export interface BookReaderTotalData {
  info: BookReaderBookInfo
  data: BookReaderData
}

export async function getBookReaderBookInfo(metadata: Metadata) : Promise<BookReaderBookInfo | null> {
  const url = new URL(`https://${metadata.server}/BookReader/BookReaderJSON.php`);
  url.searchParams.set('itemId', metadata.metadata.identifier);
  url.searchParams.set('itemPath', metadata.dir);
  url.searchParams.set('server', metadata.server);

  const request = await fetch(url.toString());

  if(request.status != 200) {
    return null;
  }

  const result = await request.json() as BookReaderBookInfo;

  if(!result) {
    return null;
  }

  return result;
}

export async function getBookReaderBookData (info: BookReaderBookInfo) {
  const url = new URL(`https://${info.server}/BookReader/BookReaderJSIA.php`);
  url.searchParams.set('id', info.itemId);
  url.searchParams.set('itemPath', info.itemPath);
  url.searchParams.set('server', info.server);
  url.searchParams.set('format', 'jsonp');
  url.searchParams.set('subPrefix', info.subPrefix);
  url.searchParams.set('requestUri', `/details/${info.itemId}`);

  const request = await fetch(url.toString());

  if(request.status != 200) {
    return null;
  }

  const result = await request.json();

  if(!result) {
    return null;
  }

  return result.data as BookReaderData;
}

const bookReaderCache = createCacheStore<BookReaderTotalData>();

export async function getAllBookReaderDataWithIdentifier(identifier: string) {
  const bookreaderData = await bookReaderCache.getSet(`bookreader_all_${identifier}`, async () => {
    const metadata = await getItemMetadata(identifier);

    if(!metadata) {
      return null;
    }

    const allBookReaderData = await getAllBookReaderData(metadata);

    if(!allBookReaderData) {
      return null;
    }

    return allBookReaderData;
  });

  return bookreaderData.data;
}

export async function getAllBookReaderData(metadata: Metadata) : Promise<BookReaderTotalData | null> {
  const info = await getBookReaderBookInfo(metadata);

  if(!info) {
    return null;
  }

  const data = await getBookReaderBookData(info);

  if(!data) {
    return null;
  }

  return {
    data,
    info
  };
}

export function getItemMetadataWithFormat(metadata: Metadata, format: FileFormat) : File | null {
  const file = metadata.files.find(file => file.format == format);

  if(!file) {
    return null;
  }

  return file;
}
