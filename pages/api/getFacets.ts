import type { NextApiRequest, NextApiResponse } from 'next'
import { Facet, FacetSearchResult, FacetSearchResultPretty, FetchFacets, FetchFacetsPretty } from '../../utils/Archive'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse< FacetSearchResultPretty | boolean>
  ) {
    const facet = req.query.facet as string
    const any = req.query.any as string

    const facets = await FetchFacetsPretty({
        any,
        facet,
    })

    if(!facets) {
        return false
    }

    let output : boolean | FacetSearchResultPretty = false

    if(facets) {
        output = {
            ...(facets as FacetSearchResultPretty)
        }
    }

    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json(output)
}