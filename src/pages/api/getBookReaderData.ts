import type { NextApiRequest, NextApiResponse } from 'next';
import { BookReaderTotalData, getAllBookReaderDataWithIdentifier } from '../../inc/Archive/BookReader';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookReaderTotalData | null>
) {
  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  const identifier = req.query.identifier as string;

  const results = await getAllBookReaderDataWithIdentifier(identifier);

  if(!results) {
    res.status(502).json(null);
    return;
  }

  res.status(200).json(results);
}
