import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | null>
) {
  const identifier = req.query.identifier as string;

  const results = await getItemMetadata(identifier);

  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);
  res.status(200).json(results);
}
