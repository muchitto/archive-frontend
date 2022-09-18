import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemMetadata, Metadata } from '../../inc/Archive/Metadata';
import createCacheStore from '../../inc/Cache';

const cacheStore = createCacheStore<Metadata>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | null>
) {
  const identifier = req.query.identifier as string;

  const cache = await cacheStore.get(`metadata_${identifier}`);

  res.setHeader('Cache-control', `public, s-maxage=${2 * 60 * 60}`);

  let results = cache.data;
  if(!cache.isValid) {
    results = await getItemMetadata(identifier);

    if(!results) {
      res.status(502).json(null);
      return;
    }

    cache.set(results);
  }

  res.status(200).json(results);
}
