import type { NextApiRequest, NextApiResponse } from 'next'
import { SearchResult } from '../../inc/Archive/Search'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse< SearchResult | null>
) {
  const facet = req.query.facet as string

  res.status(200).json(null)
}