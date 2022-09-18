import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | null>
) {
  const identifier = req.query.identifier as string;

  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  const results = await getItemMetadata(identifier);

  if(!results) {
    res.status(502).json(null);
    return;
  }

  res.status(200).json(results);
}
