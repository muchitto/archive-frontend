import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata';
import createCacheStore from '../../inc/Cache';

const metadataCache = createCacheStore<Metadata>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | null>
) {
  const identifier = req.query.identifier as string;

  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  const cacheData = await metadataCache.getSet(`metadata_${identifier}`, async (key: string) => {
    return await getItemMetadata(identifier);
  });

  if(!cacheData) {
    res.status(502).json(null);
    return;
  }

  res.status(200).json(cacheData.data);
}
