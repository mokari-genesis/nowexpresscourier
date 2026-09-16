import mysql from 'mysql2/promise'
import { getMysqlConfig } from 'vendor/aws.js'
import { Logger } from './logger.js'
import { camelizeKeys } from './string.js'

let pool = null

/**
 * Shared mysql2 pool. Credentials from Secrets Manager via getMysqlConfig().
 * Reused across warm Lambda invocations.
 */
export async function getPool(options = {}) {
  if (pool && !options.forceRefresh) return pool

  const config = await getMysqlConfig(options)
  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    namedPlaceholders: true,
    ...(config.ssl !== undefined ? { ssl: config.ssl } : {}),
  })

  return pool
}

export async function closePool() {
  if (!pool) return
  await pool.end()
  pool = null
}

/**
 * Higher-order query helper.
 *
 * @param {(args: object, conn: import('mysql2/promise').Pool|import('mysql2/promise').Connection) => Promise<any>} queryFn
 *   Should call `conn.query(...)` or `conn.execute(...)` and return that promise.
 * @param {{ singleResult?: boolean, debug?: boolean }} [options]
 */
export const fetchResult = (queryFn, { singleResult = false, debug = false } = {}) => {
  return async (args = {}, connection = null) => {
    try {
      const conn = connection ?? (await getPool())
      const result = await queryFn(args, conn)

      if (debug) {
        console.log('Query args:', args)
        console.log('Raw result:', result)
      }

      const rows = normalizeRows(result)
      const records = rows.map(camelizeKeys)
      return singleResult ? records[0] ?? null : records
    } catch (error) {
      Logger.error(error)
      throw error
    }
  }
}

/**
 * Run work inside a MySQL transaction.
 * usage: await transaction(async conn => { ... })()
 */
export function transaction(operations) {
  return async (...args) => {
    const p = await getPool()
    const conn = await p.getConnection()

    try {
      await conn.beginTransaction()
      const result = await operations(conn, ...args)
      await conn.commit()
      return result
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  }
}

function normalizeRows(result) {
  // mysql2 query/execute → [rows, fields]
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0]
  }
  if (Array.isArray(result)) {
    return result
  }
  return []
}

function validSqlIdentifiers(names) {
  return names.every(x => /^\w+$/.test(x))
}

function eachSlice(size, array) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * Build a parameterized multi-row INSERT for MySQL.
 * @returns {{ sql: string, values: any[] }}
 */
export function buildBulkInsert({ table, records, keys }) {
  const identifiers = [...keys, table]
  if (!validSqlIdentifiers(identifiers)) {
    throw new Error('Invalid column names')
  }
  if (!records?.length) {
    throw new Error('No records to insert')
  }

  const placeholders = records.map(() => `(${keys.map(() => '?').join(', ')})`).join(',\n')
  const values = records.flatMap(row => keys.map(key => row[key]))

  const sql = `
    INSERT INTO ${table} (
      ${keys.join(', ')}
    )
    VALUES
    ${placeholders}
  `

  return { sql, values }
}

export async function safeBulkInsert({ table, records, keys, connection = null } = {}) {
  const { sql, values } = buildBulkInsert({ table, records, keys })
  const conn = connection ?? (await getPool())
  const [result] = await conn.execute(sql, values)
  return result
}

export { eachSlice, validSqlIdentifiers }
