import { getPool } from 'libs/db.js'
import { camelizeKeys } from 'libs/string.js'

/** Primary key / cursor column on `paquetes`. */
const PACKAGE_ID_COLUMN = 'package_id'

/** Date column used for ingDate / endDate filters. */
const DATE_COLUMN = 'fecha'

function buildGuidesFilters({ packageId, direction, ingDate, endDate } = {}) {
  const where = []
  const values = []

  const cursor = Number(packageId)
  const safeCursor = Number.isFinite(cursor) ? cursor : 0
  const goingBack = String(direction || 'next').toLowerCase() === 'back'

  if (goingBack) {
    where.push(`${PACKAGE_ID_COLUMN} < ?`)
  } else {
    where.push(`${PACKAGE_ID_COLUMN} > ?`)
  }
  values.push(safeCursor)

  if (ingDate) {
    where.push(`${DATE_COLUMN} >= ?`)
    values.push(ingDate)
  }

  if (endDate) {
    where.push(`${DATE_COLUMN} <= ?`)
    values.push(endDate)
  }

  return {
    clause: `WHERE ${where.join(' AND ')}`,
    values,
    goingBack,
    cursor: safeCursor,
  }
}

const getPackageId = row => Number(row.packageId ?? row.package_id)

const getGuides = async ({
  packageId = 0,
  direction = 'next',
  limit = 25,
  ingDate,
  endDate,
} = {}) => {
  const pool = await getPool()
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25))
  const { clause, values, goingBack, cursor } = buildGuidesFilters({
    packageId,
    direction,
    ingDate,
    endDate,
  })

  const order = goingBack ? `${PACKAGE_ID_COLUMN} DESC` : `${PACKAGE_ID_COLUMN} ASC`

  const [rows] = await pool.query(
    `
      SELECT *
      FROM paquetes
      ${clause}
      ORDER BY ${order}
      LIMIT ?
    `,
    [...values, safeLimit]
  )

  // Keep response ordered by packageId ASC for both directions
  const guides = (goingBack ? [...rows].reverse() : rows).map(camelizeKeys)

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

export default {
  getGuides,
}
