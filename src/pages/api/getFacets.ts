import type { NextApiRequest, NextApiResponse } from 'next'
import { CategoryQuery, FacetSearchResultPretty, fetchFacetsPretty } from '../../utils/Archive'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse< FacetSearchResultPretty | null>
  ) {
    const facet = req.query.facet as string
    const any = req.query.any as string

    const query: CategoryQuery = {
        any: any,
        facet: facet
    }

    const results = await fetchFacetsPretty(query)

    if(!results) {
        return null
    }

    let output : FacetSearchResultPretty | null = null

    if(results) {
        output = {
            ...(results as FacetSearchResultPretty)
        }
    }

    res.status(200).json(output)
}