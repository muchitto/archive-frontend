import type { NextApiRequest, NextApiResponse } from 'next';
import { BookReaderInfo, getBookReaderDataWithMetadata } from '../../inc/Archive/BookReader';
import { getItemMetadata } from '../../inc/Archive/Metadata';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookReaderInfo | null>
) {

  const identifier = req.query.identifier as string;
  const metadata = await getItemMetadata(identifier);

  if(metadata) {
    const results = await getBookReaderDataWithMetadata(metadata);

    res.status(200).json(results);
    return;
  }

  res.status(500).json(null);
}
