import type { NextApiRequest, NextApiResponse } from 'next';
import { BookReaderTotalData, getAllBookReaderDataWithIdentifier } from '../../inc/Archive/BookReader';
import createCacheStore from '../../inc/Cache';

const bookReaderCache = createCacheStore<BookReaderTotalData>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookReaderTotalData | null>
) {
  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  const identifier = req.query.identifier as string;

  const bookreaderData = await bookReaderCache.getSet(
    `bookreader_all_${identifier}`,
    async () => {
      return await getAllBookReaderDataWithIdentifier(identifier);
    }
  );

  if (!bookreaderData.isValid) {
    res.status(502).json(null);
    return;
  }

  res.status(200).json(bookreaderData.data);
}
