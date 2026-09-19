/** Max inclusive export window (~3 calendar months). */
export const MAX_EXPORT_RANGE_DAYS = 92

/** Soft cap to protect Lambda memory when building CSV in-memory. */
export const MAX_EXPORT_ROWS = 50_000

/**
 * CSV columns matching the original Excel export (snake_case headers, same order).
 * `key` is the camelCase field from the API/query layer.
 * Note: Excel uses `status` twice — guía status then documento status.
 */
export const GUIDE_CSV_COLUMNS = [
  { header: 'guia', key: 'guia' },
  { header: 'client_id', key: 'clientId' },
  { header: 'nombre_cliente', key: 'nombreCliente' },
  { header: 'fecha', key: 'fecha', format: 'date' },
  { header: 'tracking', key: 'tracking' },
  { header: 'status', key: 'statusGuia' },
  { header: 'peso_libras', key: 'pesoLibras' },
  { header: 'descripcion_guia', key: 'descripcionGuia' },
  { header: 'documento_id', key: 'documentoId' },
  { header: 'fecha_documento', key: 'fechaDocumento', format: 'datetime' },
  { header: 'factura_serie_sat', key: 'facturaSerieSat' },
  { header: 'cantidad_documentos_relacionados', key: 'cantidadDocumentosRelacionados' },
  { header: 'iva_guia', key: 'ivaGuia' },
  { header: 'dai_guia', key: 'daiGuia' },
  { header: 'impuestos_guia', key: 'impuestosGuia' },
  { header: 'sub_total_documento', key: 'subTotalDocumento' },
  { header: 'descuento_documento', key: 'descuentoDocumento' },
  { header: 'total_N_E_documento', key: 'totalNEDocumento' },
  { header: 'total_libras_documento', key: 'totalLibrasDocumento' },
  { header: 'impuestos_documento', key: 'impuestosDocumento' },
  { header: 'pago_total_documento', key: 'pagoTotalDocumento' },
  { header: 'status', key: 'status' },
  { header: 'conciliada', key: 'conciliada' },
]

/**
 * Parse YYYY-MM-DD into a UTC date at midnight.
 * @param {string} value
 * @returns {Date}
 */
export function parseIsoDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Dates must use YYYY-MM-DD format')
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${value}`)
  }

  return date
}

/**
 * Require both dates and ensure end >= start and span <= 3 months (~92 days).
 * @param {string} ingDate
 * @param {string} endDate
 */
export function assertExportDateRange(ingDate, endDate) {
  if (!ingDate || !endDate) {
    throw new Error('ingDate and endDate are required for export')
  }

  const start = parseIsoDateOnly(ingDate)
  const end = parseIsoDateOnly(endDate)

  if (end < start) {
    throw new Error('endDate must be on or after ingDate')
  }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays > MAX_EXPORT_RANGE_DAYS) {
    throw new Error(
      `Export date range cannot exceed 3 months (${MAX_EXPORT_RANGE_DAYS} days)`
    )
  }

  return { start, end, diffDays }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** Excel-style date: YYYY-MM-DD */
export function formatExportDate(value) {
  if (value === null || value === undefined || value === '') return ''

  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}`
  }

  const str = String(value)
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : str
}

/** Excel-style datetime: YYYY-MM-DD HH:mm:ss */
export function formatExportDateTime(value) {
  if (value === null || value === undefined || value === '') return ''

  if (value instanceof Date) {
    return `${formatExportDate(value)} ${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}:${pad2(value.getUTCSeconds())}`
  }

  const str = String(value)
    .replace('T', ' ')
    .replace(/\.\d+Z?$/, '')
    .replace(/Z$/, '')

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str} 00:00:00`
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) return str.slice(0, 19)
  return str
}

function formatCellValue(value, format) {
  if (format === 'date') return formatExportDate(value)
  if (format === 'datetime') return formatExportDateTime(value)
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function escapeCsvValue(value) {
  const str = String(value)

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Build UTF-8 CSV with BOM for Excel (headers match original report).
 * @param {Array<Record<string, unknown>>} rows
 * @param {typeof GUIDE_CSV_COLUMNS} [columns]
 */
export function guidesToCsv(rows, columns = GUIDE_CSV_COLUMNS) {
  const header = columns.map(column => column.header ?? column).join(',')
  const lines = rows.map(row =>
    columns
      .map(column => {
        if (typeof column === 'string') {
          return escapeCsvValue(formatCellValue(row[column]))
        }
        return escapeCsvValue(formatCellValue(row[column.key], column.format))
      })
      .join(',')
  )

  // BOM helps Excel detect UTF-8
  return `\uFEFF${[header, ...lines].join('\n')}\n`
}

/**
 * Object key without PII: exports/guides/{stage}/{yyyy}/{mm}/{uuid}.csv
 */
export function buildExportKey({
  prefix = 'exports/guides',
  stage = process.env.APP_ENV || process.env.STAGE || 'dev',
  now = new Date(),
  id = crypto.randomUUID(),
} = {}) {
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${prefix}/${stage}/${year}/${month}/${id}.csv`
}
