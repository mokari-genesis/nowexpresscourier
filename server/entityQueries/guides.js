import { getPool } from 'libs/db.js'
import { camelizeKeys } from 'libs/string.js'
import {
  buildCursor,
  buildDateFilterSql,
  buildOptimizedGuidesSql,
  buildOriginalGuidesExportSql,
  buildOriginalGuidesSql,
} from './guidesReportSql.js'

const getPackageId = row => Number(row.packageId ?? row.package_id)

function normalizeGuideRow(row) {
  const normalized = { ...row }

  for (const [key, value] of Object.entries(normalized)) {
    if (value instanceof Date) {
      normalized[key] = value.toISOString()
    } else if (typeof value === 'bigint') {
      normalized[key] = Number(value)
    } else if (
      value !== null &&
      typeof value === 'object' &&
      value.constructor?.name === 'Decimal'
    ) {
      normalized[key] = Number(value)
    }
  }

  return normalized
}

async function runGuidesQuery(buildSql, params) {
  const {
    packageId = 0,
    direction = 'next',
    limit = 25,
    ingDate,
    endDate,
  } = params

  const pool = await getPool()
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25))
  const { goingBack, cursor, comparator, order } = buildCursor({
    packageId,
    direction,
  })
  const { sql: dateFilterSql, values: dateValues } = buildDateFilterSql({
    ingDate,
    endDate,
  })

  const sql = buildSql({ dateFilterSql, comparator, order })

  // original: [dates..., cursor, limit]
  // optimized: [dates..., cursor, limit] inside guias_base (same bind order)
  const [rows] = await pool.query(sql, [...dateValues, cursor, safeLimit])

  const guides = (goingBack ? [...rows].reverse() : rows)
    .map(camelizeKeys)
    .map(normalizeGuideRow)

  const firstId = guides.length ? getPackageId(guides[0]) : null
  const lastId = guides.length ? getPackageId(guides[guides.length - 1]) : null

  return {
    guides,
    pagination: {
      packageId: cursor,
      direction: goingBack ? 'back' : 'next',
      limit: safeLimit,
      nextCursor: lastId,
      prevCursor: firstId,
      hasMore: guides.length === safeLimit,
    },
  }
}

/** Production path — early page filter, then enrich. */
export function getGuides(params = {}) {
  return runGuidesQuery(buildOptimizedGuidesSql, params)
}

/**
 * Reference path — original full-universe CTEs + late cursor.
 * Kept for parity tests; do not use in handlers.
 */
export function getGuidesOriginal(params = {}) {
  return runGuidesQuery(buildOriginalGuidesSql, params)
}

/**
 * Single original report query for CSV export (date range only, no cursor loop).
 * @param {{ ingDate: string, endDate: string, maxRows?: number }} params
 */
export async function getAllGuidesForExport({
  ingDate,
  endDate,
  maxRows = 50_000,
} = {}) {
  const pool = await getPool()
  const { sql: dateFilterSql, values: dateValues } = buildDateFilterSql({
    ingDate,
    endDate,
  })

  if (!dateValues.length) {
    throw new Error('ingDate and endDate are required for export')
  }

  const sql = buildOriginalGuidesExportSql({ dateFilterSql })
  const [rows] = await pool.query(sql, dateValues)
  const guides = rows.map(camelizeKeys).map(normalizeGuideRow)

  if (guides.length > maxRows) {
    throw new Error(`Export exceeds maximum of ${maxRows} rows`)
  }

  return guides
}

export default {
  getGuides,
  getGuidesOriginal,
  getAllGuidesForExport,
}
