import type { NextApiRequest, NextApiResponse } from 'next';
import { BookReaderTotalData, getAllBookReaderDataWithIdentifier } from '../../inc/Archive/BookReader';
import createCacheStore from '../../inc/Cache';

const cacheStore = createCacheStore<BookReaderTotalData>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookReaderTotalData | null>
) {
  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  const identifier = req.query.identifier as string;

  const cache = await cacheStore.get(`book_reader_data_all_${identifier}`);

  let results = cache.data;
  if(!cache.isValid) {
    results = await getAllBookReaderDataWithIdentifier(identifier);

    if(!results) {
      res.status(502).json(null);
      return;
    }

    await cache.set(results);
  }

  res.status(200).json(results);
  return;
}
