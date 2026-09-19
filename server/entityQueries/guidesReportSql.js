/**
 * Shared SQL for the guides (guías) report.
 * - buildOriginalGuidesSql: full-universe CTEs, cursor applied at the end (reference)
 * - buildOptimizedGuidesSql: date + cursor + limit applied in guias_base first
 */

export const FECHA_ENTREGA_SQL = `
  CASE
    WHEN TRIM(p.ent_date) REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    THEN STR_TO_DATE(LEFT(TRIM(p.ent_date), 10), '%Y-%m-%d')
    WHEN TRIM(p.ent_date) REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}'
    THEN STR_TO_DATE(LEFT(TRIM(p.ent_date), 10), '%d/%m/%Y')
    ELSE NULL
  END
`

export function buildDateFilterSql({ ingDate, endDate } = {}) {
  const filters = []
  const values = []

  if (ingDate) {
    filters.push(`(${FECHA_ENTREGA_SQL}) >= ?`)
    values.push(ingDate)
  }

  if (endDate) {
    filters.push(`(${FECHA_ENTREGA_SQL}) < DATE_ADD(?, INTERVAL 1 DAY)`)
    values.push(endDate)
  }

  return {
    sql: filters.length ? `AND ${filters.join('\n    AND ')}` : '',
    values,
  }
}

export function buildCursor({ packageId = 0, direction = 'next' } = {}) {
  const cursor = Number(packageId)
  const safeCursor = Number.isFinite(cursor) ? cursor : 0
  const goingBack = String(direction || 'next').toLowerCase() === 'back'

  return {
    goingBack,
    cursor: safeCursor,
    comparator: goingBack ? '<' : '>',
    order: goingBack ? 'DESC' : 'ASC',
  }
}

const FINAL_SELECT = `
SELECT
  gb.package_id,
  gb.guia,
  gb.client_id AS client_id,
  COALESCE(u.name, c.client_name, c.contact_name) AS nombre_cliente,
  gb.fecha_entrega AS fecha,
  gb.tracking,
  gb.status AS status_guia,
  gb.weight AS peso_libras,
  gb.descripcion_guia,
  d.id AS documento_id,
  d.created_at AS fecha_documento,
  d.num_serie_sat AS factura_serie_sat,
  IFNULL(udg.cantidad_documentos_relacionados, 0) AS cantidad_documentos_relacionados,
  ROUND(IFNULL(gb.iva, 0), 2) AS iva_guia,
  ROUND(IFNULL(gb.dai, 0), 2) AS dai_guia,
  ROUND(IFNULL(gb.iva, 0) + IFNULL(gb.dai, 0), 2) AS impuestos_guia,
  dd.subtotal_b AS sub_total_documento,
  d.discount AS descuento_documento,
  CASE
    WHEN d.id IS NULL THEN NULL
    ELSE ROUND(IFNULL(dd.subtotal_b, 0) - IFNULL(d.discount, 0), 2)
  END AS total_n_e_documento,
  dd.total_libras AS total_libras_documento,
  CASE
    WHEN d.id IS NULL THEN NULL
    ELSE ROUND(IFNULL(px.iva, 0) + IFNULL(px.dai, 0), 2)
  END AS impuestos_documento,
  CASE
    WHEN d.id IS NULL THEN NULL
    ELSE ROUND(
      (IFNULL(dd.subtotal_b, 0) - IFNULL(d.discount, 0))
      + (IFNULL(px.iva, 0) + IFNULL(px.dai, 0)),
      2
    )
  END AS pago_total_documento,
  CASE
    WHEN d.id IS NULL THEN 'Sin documento'
    WHEN d.status = 2 THEN 'Facturado'
    WHEN d.status = 3 THEN 'Anulado'
    ELSE 'Otro'
  END AS status,
  CASE
    WHEN d.id IS NULL THEN 'Sin documento'
    WHEN ar.any_done = 1 THEN 'Conciliada'
    ELSE 'No conciliada'
  END AS conciliada
`

const JOIN_TAIL = `
LEFT JOIN ultimo_documento_guia udg
  ON udg.package_id = gb.package_id
LEFT JOIN documents d
  ON d.id = udg.id_document
LEFT JOIN clientes_unicos c
  ON c.client_id = gb.client_id
LEFT JOIN usuarios u
  ON u.id = c.id_usuario
LEFT JOIN detalle_documento dd
  ON dd.id_document = d.id
LEFT JOIN impuestos_documento px
  ON px.id_document = d.id
LEFT JOIN conciliacion_documento ar
  ON ar.document_id = d.id
`

/**
 * Reference query: same shape as the business SQL.
 * Date filter in guias_base; cursor + LIMIT only on the final SELECT.
 */
export function buildOriginalGuidesSql({
  dateFilterSql,
  comparator,
  order,
} = {}) {
  const sql = `
WITH
guias_base AS (
  SELECT
    p.package_id,
    p.guia,
    p.client_id,
    p.tracking,
    p.status,
    p.weight,
    p.description AS descripcion_guia,
    p.total_iva AS iva,
    p.dai,
    ${FECHA_ENTREGA_SQL} AS fecha_entrega
  FROM paquetes p
  WHERE 1 = 1
    ${dateFilterSql}
),

documentos_relacionados AS (
  SELECT DISTINCT
    gb.package_id,
    dd.id_document,
    d.created_at AS documento_created_at
  FROM guias_base gb
  JOIN document_details dd
    ON dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
   AND CAST(TRIM(dd.package_id) AS UNSIGNED) = gb.package_id
  JOIN documents d
    ON d.id = dd.id_document
),

documentos_rankeados AS (
  SELECT
    dr.package_id,
    dr.id_document,
    dr.documento_created_at,
    ROW_NUMBER() OVER (
      PARTITION BY dr.package_id
      ORDER BY dr.documento_created_at DESC, dr.id_document DESC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY dr.package_id) AS cantidad_documentos_relacionados
  FROM documentos_relacionados dr
),

ultimo_documento_guia AS (
  SELECT
    package_id,
    id_document,
    documento_created_at,
    cantidad_documentos_relacionados
  FROM documentos_rankeados
  WHERE rn = 1
),

clientes_unicos AS (
  SELECT c.*
  FROM clientes c
  JOIN (
    SELECT client_id, MAX(id) AS id
    FROM clientes
    GROUP BY client_id
  ) ultimo
    ON ultimo.client_id = c.client_id
   AND ultimo.id = c.id
),

detalle_documento AS (
  SELECT
    dd.id_document,
    SUM(IFNULL(dd.sub_total, 0)) AS subtotal_b,
    SUM(
      CASE
        WHEN dd.description <> 'Desaduanaje' THEN dd.qty
        ELSE 0
      END
    ) AS total_libras
  FROM document_details dd
  GROUP BY dd.id_document
),

guias_por_ultimo_documento AS (
  SELECT DISTINCT
    udg.id_document,
    p.package_id
  FROM ultimo_documento_guia udg
  JOIN document_details dd
    ON dd.id_document = udg.id_document
   AND dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
  JOIN paquetes p
    ON p.package_id = CAST(TRIM(dd.package_id) AS UNSIGNED)
),

impuestos_documento AS (
  SELECT
    gpd.id_document,
    SUM(IFNULL(p.total_iva, 0)) AS iva,
    ROUND(SUM(IFNULL(p.dai, 0)), 2) AS dai
  FROM guias_por_ultimo_documento gpd
  JOIN paquetes p
    ON p.package_id = gpd.package_id
  GROUP BY gpd.id_document
),

conciliacion_documento AS (
  SELECT
    ar.document_id,
    MAX(ar.status = 'DONE') AS any_done
  FROM account_reconciliation ar
  GROUP BY ar.document_id
)

${FINAL_SELECT}
FROM guias_base gb
${JOIN_TAIL}
WHERE gb.package_id ${comparator} ?
ORDER BY gb.package_id ${order}
LIMIT ?
`

  return sql
}

/**
 * Full original report for CSV export (date-filtered, no cursor pagination).
 * Safe when the date window is capped (e.g. max 3 months).
 */
export function buildOriginalGuidesExportSql({ dateFilterSql } = {}) {
  const sql = `
WITH
guias_base AS (
  SELECT
    p.package_id,
    p.guia,
    p.client_id,
    p.tracking,
    p.status,
    p.weight,
    p.description AS descripcion_guia,
    p.total_iva AS iva,
    p.dai,
    ${FECHA_ENTREGA_SQL} AS fecha_entrega
  FROM paquetes p
  WHERE 1 = 1
    ${dateFilterSql}
),

documentos_relacionados AS (
  SELECT DISTINCT
    gb.package_id,
    dd.id_document,
    d.created_at AS documento_created_at
  FROM guias_base gb
  JOIN document_details dd
    ON dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
   AND CAST(TRIM(dd.package_id) AS UNSIGNED) = gb.package_id
  JOIN documents d
    ON d.id = dd.id_document
),

documentos_rankeados AS (
  SELECT
    dr.package_id,
    dr.id_document,
    dr.documento_created_at,
    ROW_NUMBER() OVER (
      PARTITION BY dr.package_id
      ORDER BY dr.documento_created_at DESC, dr.id_document DESC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY dr.package_id) AS cantidad_documentos_relacionados
  FROM documentos_relacionados dr
),

ultimo_documento_guia AS (
  SELECT
    package_id,
    id_document,
    documento_created_at,
    cantidad_documentos_relacionados
  FROM documentos_rankeados
  WHERE rn = 1
),

clientes_unicos AS (
  SELECT c.*
  FROM clientes c
  JOIN (
    SELECT client_id, MAX(id) AS id
    FROM clientes
    GROUP BY client_id
  ) ultimo
    ON ultimo.client_id = c.client_id
   AND ultimo.id = c.id
),

detalle_documento AS (
  SELECT
    dd.id_document,
    SUM(IFNULL(dd.sub_total, 0)) AS subtotal_b,
    SUM(
      CASE
        WHEN dd.description <> 'Desaduanaje' THEN dd.qty
        ELSE 0
      END
    ) AS total_libras
  FROM document_details dd
  GROUP BY dd.id_document
),

guias_por_ultimo_documento AS (
  SELECT DISTINCT
    udg.id_document,
    p.package_id
  FROM ultimo_documento_guia udg
  JOIN document_details dd
    ON dd.id_document = udg.id_document
   AND dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
  JOIN paquetes p
    ON p.package_id = CAST(TRIM(dd.package_id) AS UNSIGNED)
),

impuestos_documento AS (
  SELECT
    gpd.id_document,
    SUM(IFNULL(p.total_iva, 0)) AS iva,
    ROUND(SUM(IFNULL(p.dai, 0)), 2) AS dai
  FROM guias_por_ultimo_documento gpd
  JOIN paquetes p
    ON p.package_id = gpd.package_id
  GROUP BY gpd.id_document
),

conciliacion_documento AS (
  SELECT
    ar.document_id,
    MAX(ar.status = 'DONE') AS any_done
  FROM account_reconciliation ar
  GROUP BY ar.document_id
)

${FINAL_SELECT}
FROM guias_base gb
${JOIN_TAIL}
ORDER BY gb.package_id ASC
`

  return sql
}

/**
 * Optimized query: page of guías first, then enrich.
 * Document tax totals still expand to all packages on those documents (same as original).
 */
export function buildOptimizedGuidesSql({
  dateFilterSql,
  comparator,
  order,
} = {}) {
  const sql = `
WITH
guias_base AS (
  SELECT *
  FROM (
    SELECT
      p.package_id,
      p.guia,
      p.client_id,
      p.tracking,
      p.status,
      p.weight,
      p.description AS descripcion_guia,
      p.total_iva AS iva,
      p.dai,
      ${FECHA_ENTREGA_SQL} AS fecha_entrega
    FROM paquetes p
    WHERE 1 = 1
      ${dateFilterSql}
      AND p.package_id ${comparator} ?
    ORDER BY p.package_id ${order}
    LIMIT ?
  ) page_packages
),

documentos_relacionados AS (
  SELECT DISTINCT
    gb.package_id,
    dd.id_document,
    d.created_at AS documento_created_at
  FROM guias_base gb
  JOIN document_details dd
    ON dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
   AND CAST(TRIM(dd.package_id) AS UNSIGNED) = gb.package_id
  JOIN documents d
    ON d.id = dd.id_document
),

documentos_rankeados AS (
  SELECT
    dr.package_id,
    dr.id_document,
    dr.documento_created_at,
    ROW_NUMBER() OVER (
      PARTITION BY dr.package_id
      ORDER BY dr.documento_created_at DESC, dr.id_document DESC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY dr.package_id) AS cantidad_documentos_relacionados
  FROM documentos_relacionados dr
),

ultimo_documento_guia AS (
  SELECT
    package_id,
    id_document,
    documento_created_at,
    cantidad_documentos_relacionados
  FROM documentos_rankeados
  WHERE rn = 1
),

clientes_unicos AS (
  SELECT c.*
  FROM clientes c
  JOIN (
    SELECT client_id, MAX(id) AS id
    FROM clientes
    GROUP BY client_id
  ) ultimo
    ON ultimo.client_id = c.client_id
   AND ultimo.id = c.id
  WHERE c.client_id IN (SELECT client_id FROM guias_base)
),

detalle_documento AS (
  SELECT
    dd.id_document,
    SUM(IFNULL(dd.sub_total, 0)) AS subtotal_b,
    SUM(
      CASE
        WHEN dd.description <> 'Desaduanaje' THEN dd.qty
        ELSE 0
      END
    ) AS total_libras
  FROM document_details dd
  WHERE dd.id_document IN (SELECT id_document FROM ultimo_documento_guia)
  GROUP BY dd.id_document
),

guias_por_ultimo_documento AS (
  SELECT DISTINCT
    udg.id_document,
    p.package_id
  FROM ultimo_documento_guia udg
  JOIN document_details dd
    ON dd.id_document = udg.id_document
   AND dd.package_id IS NOT NULL
   AND TRIM(dd.package_id) <> ''
   AND TRIM(dd.package_id) REGEXP '^[0-9]+$'
  JOIN paquetes p
    ON p.package_id = CAST(TRIM(dd.package_id) AS UNSIGNED)
),

impuestos_documento AS (
  SELECT
    gpd.id_document,
    SUM(IFNULL(p.total_iva, 0)) AS iva,
    ROUND(SUM(IFNULL(p.dai, 0)), 2) AS dai
  FROM guias_por_ultimo_documento gpd
  JOIN paquetes p
    ON p.package_id = gpd.package_id
  GROUP BY gpd.id_document
),

conciliacion_documento AS (
  SELECT
    ar.document_id,
    MAX(ar.status = 'DONE') AS any_done
  FROM account_reconciliation ar
  WHERE ar.document_id IN (SELECT id_document FROM ultimo_documento_guia)
  GROUP BY ar.document_id
)

${FINAL_SELECT}
FROM guias_base gb
${JOIN_TAIL}
ORDER BY gb.package_id ASC
`

  return sql
}
