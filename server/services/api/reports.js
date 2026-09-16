import guidesQuery from 'entityQueries/guides.js'

export const guides = async ({ params = {} } = {}) => {
  const { packageId, direction, limit, ingDate, endDate } = params
  const { guides, pagination } = await guidesQuery.getGuides({
    packageId,
    direction,
    limit,
    ingDate,
    endDate,
  })

  return {
    msg: 'Guides fetched successfully',
    guides,
    pagination,
    status: 'SUCCESS',
  }
}
