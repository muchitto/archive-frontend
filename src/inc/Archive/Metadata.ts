import { MediaType } from './Archive'

export enum FileFormat {
  ImageContainerPDF = 'Image Container PDF',
  TextPDF = 'Text PDF',
  Bittorrent = 'Archive BitTorrent',
  Metadata = 'Metadata',
  ItemTile = 'Item tile',
  Unknown = 'Unknown',
  SignlePageProcessedJP2Zip = 'Single Page Processed JP2 ZIP',
  DjvuXML = 'Djvu XML',
  DjvuTXT = 'DjVuTXT',
  AbbyyGZ = 'Abbyy GZ',
  Scandata = 'Scandata',
  ComicBookRAR = 'Comic Book RAR',
  AnimatedGIF = 'Animated GIF',
}

export interface File {
  crc32: string
  format: FileFormat
  md5: string
  mtime: number
  name: string
  rotation: number
  sha1: string
  size: number
  source: string
}

export interface Metadata {
  created: number
  d1: string
  d2: string
  d3: string
  dir: string
  files: File[]
  files_count: number
  item_last_updated: number
  item_size: number
  metadata: {
    addeddate: string
    backup_location: string
    collection: string[]
    creator: string
    curation: string
    date: string
    description: string
    identifier: string
    'identifier-access'?: string
    'identifier-ark'?: string
    licenseurl: string
    language: string
    mediatype: MediaType
    ocr?: string
    ppi?: number
    publicdate: string
    repub_state?: string
    scanner: string
    subject: string[]
    title: string
    uploader: string
  }
  server: string
  uniq: number
  workable_servers: string[]
}

export async function getItemMetadata(identifier: string): Promise<Metadata | null> {
  const request = await fetch(`https://archive.org/metadata/${identifier}`)
  const data = await request.json()

  if (!data) {
    return null
  }

  return data as Metadata
}
