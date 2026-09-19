import guidesQuery from 'entityQueries/guides.js'
import {
  MAX_EXPORT_ROWS,
  assertExportDateRange,
  buildExportKey,
  guidesToCsv,
} from 'libs/guidesExport.js'
import { uploadExportFile } from 'vendor/aws.js'

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

export const exportGuides = async ({ params = {} } = {}) => {
  const { ingDate, endDate } = params

  assertExportDateRange(ingDate, endDate)

  const rows = await guidesQuery.getAllGuidesForExport({
    ingDate,
    endDate,
    maxRows: MAX_EXPORT_ROWS,
  })

  const csv = guidesToCsv(rows)
  const key = buildExportKey()
  const bucket = process.env.S3_BUCKET
  const expiresIn = Number(process.env.EXPORT_URL_TTL_SECONDS) || 900

  if (!bucket) {
    throw new Error('S3_BUCKET is not configured')
  }

  const uploaded = await uploadExportFile({
    bucket,
    key,
    body: csv,
    expiresIn,
  })

  return {
    msg: 'Export ready',
    downloadUrl: uploaded.url,
    expiresAt: uploaded.expiresAt,
    expiresIn: uploaded.expiresIn,
    rowCount: rows.length,
    status: 'SUCCESS',
  }
}
