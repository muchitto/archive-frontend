import type { NextApiRequest, NextApiResponse } from 'next'
import { Facet, FacetSearchResult, FetchFacets } from '../../utils/Archive'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse< FacetSearchResult | boolean>
  ) {
    const facet = req.query.facet as string
    const query = req.query.query as string

    const facets = await FetchFacets({
        query,
        facet,
    })

    if(!facets) {
        return false
    }

    let output : boolean | FacetSearchResult = false

    if(facets) {
        output = {
            ...(facets as FacetSearchResult)
        }
    }

    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(output)
}