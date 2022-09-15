import path from 'path';
import { File, FileFormat, Metadata } from './Metadata';

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

type BookReaderResult = { data: BookReaderInfo };

export async function getBookReaderDataWithMetadata(metadata: Metadata) : Promise<BookReaderInfo | null> {
  const url = new URL(`https://${metadata.server}/BookReader/BookReaderJSIA.php`);
  url.searchParams.set('id', metadata.metadata.identifier);
  url.searchParams.set('itemPath', metadata.dir);
  url.searchParams.set('server', metadata.server);
  url.searchParams.set('format', 'jsonp');

  const file = getBookReaderFileFromMetadata(metadata);

  if(!file || !file.name) {
    return null;
  }

  const filename = path.parse(file.name);

  url.searchParams.set('subPrefix', `${filename.dir}/${filename.name}`.replace(/^\//, ''));
  url.searchParams.set('requestUri', `/details/${metadata.metadata.identifier}`);

  const request = await fetch(url.toString());

  if(request.status != 200) {
    return null;
  }

  const result = await request.json() as BookReaderResult;

  if(!result) {
    return null;
  }

  return result.data;
}

export function getBookReaderFileFromMetadata(metadata: Metadata) {
  if(metadata.files.length == 0) {
    return null;
  }

  const files = metadata.files.filter(f =>
    [
      FileFormat.SignlePageProcessedJP2Zip,
      FileFormat.ImageContainerPDF,
      FileFormat.ComicBookRAR,
      FileFormat.TextPDF,
    ].includes(f.format)
  );

  return files[0];
}

export function getItemMetadataWithFormat(metadata: Metadata, format: FileFormat) : File | null {
  const file = metadata.files.find(file => file.format == format);

  if(!file) {
    return null;
  }

  return file;
}
