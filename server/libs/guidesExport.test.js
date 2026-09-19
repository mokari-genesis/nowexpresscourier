import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  GUIDE_CSV_COLUMNS,
  MAX_EXPORT_RANGE_DAYS,
  assertExportDateRange,
  buildExportKey,
  formatExportDate,
  formatExportDateTime,
  guidesToCsv,
  parseIsoDateOnly,
} from './guidesExport.js'

describe('guidesExport', () => {
  describe('assertExportDateRange', () => {
    it('requires both dates', () => {
      assert.throws(() => assertExportDateRange(null, '2025-01-31'), /required/)
      assert.throws(() => assertExportDateRange('2025-01-01', ''), /required/)
    })

    it('rejects end before start', () => {
      assert.throws(
        () => assertExportDateRange('2025-03-01', '2025-01-01'),
        /on or after/
      )
    })

    it('rejects ranges longer than 3 months', () => {
      assert.throws(
        () => assertExportDateRange('2025-01-01', '2025-05-01'),
        /3 months/
      )
    })

    it('accepts a range within 3 months', () => {
      const result = assertExportDateRange('2025-01-01', '2025-03-31')
      assert.equal(result.diffDays <= MAX_EXPORT_RANGE_DAYS, true)
    })

    it('rejects invalid date strings', () => {
      assert.throws(() => parseIsoDateOnly('01-01-2025'), /YYYY-MM-DD/)
      assert.throws(() => parseIsoDateOnly('2025-02-30'), /Invalid date/)
    })
  })

  describe('guidesToCsv', () => {
    it('writes Excel-compatible headers in order', () => {
      const csv = guidesToCsv([])
      const headerLine = csv.replace(/^\uFEFF/, '').split('\n')[0]
      assert.equal(
        headerLine,
        [
          'guia',
          'client_id',
          'nombre_cliente',
          'fecha',
          'tracking',
          'status',
          'peso_libras',
          'descripcion_guia',
          'documento_id',
          'fecha_documento',
          'factura_serie_sat',
          'cantidad_documentos_relacionados',
          'iva_guia',
          'dai_guia',
          'impuestos_guia',
          'sub_total_documento',
          'descuento_documento',
          'total_N_E_documento',
          'total_libras_documento',
          'impuestos_documento',
          'pago_total_documento',
          'status',
          'conciliada',
        ].join(',')
      )
      assert.equal(GUIDE_CSV_COLUMNS.length, 23)
    })

    it('maps statusGuia and status into the two status columns', () => {
      const csv = guidesToCsv([
        {
          guia: '135152',
          clientId: 'P05454',
          nombreCliente: 'Brislin Hernández',
          fecha: '2026-07-09T00:00:00.000Z',
          tracking: 'GFUS01052130138500',
          statusGuia: 'Entregado',
          pesoLibras: 1,
          descripcionGuia: '1 SANDALIAS',
          documentoId: 118135,
          fechaDocumento: '2026-07-09T00:00:00.000Z',
          facturaSerieSat: '3388819977',
          cantidadDocumentosRelacionados: 1,
          ivaGuia: 26.82,
          daiGuia: 29.15,
          impuestosGuia: 55.97,
          subTotalDocumento: 135,
          descuentoDocumento: 0,
          totalNEDocumento: 135,
          totalLibrasDocumento: 3,
          impuestosDocumento: 145.02,
          pagoTotalDocumento: 280.02,
          status: 'Facturado',
          conciliada: 'Conciliada',
        },
      ])

      const line = csv.replace(/^\uFEFF/, '').trim().split('\n')[1]
      assert.match(line, /^135152,P05454,Brislin Hernández,2026-07-09,/)
      assert.match(line, /,Entregado,1,1 SANDALIAS,118135,2026-07-09 00:00:00,/)
      assert.match(line, /,Facturado,Conciliada$/)
    })

    it('escapes commas quotes and newlines', () => {
      const csv = guidesToCsv(
        [
          {
            guia: 'G-1',
            nombreCliente: 'Doe, John',
            descripcionGuia: 'Said "hello"',
            statusGuia: 'Line1\nLine2',
          },
        ],
        [
          { header: 'guia', key: 'guia' },
          { header: 'nombre_cliente', key: 'nombreCliente' },
          { header: 'descripcion_guia', key: 'descripcionGuia' },
          { header: 'status', key: 'statusGuia' },
        ]
      )

      assert.match(csv, /^\uFEFF/)
      assert.match(csv, /"Doe, John"/)
      assert.match(csv, /"Said ""hello"""/)
      assert.match(csv, /"Line1\nLine2"/)
    })

    it('writes header and empty fields for missing values', () => {
      const csv = guidesToCsv([{ guia: '2' }], [
        { header: 'guia', key: 'guia' },
        { header: 'client_id', key: 'clientId' },
      ])
      const lines = csv.replace(/^\uFEFF/, '').trim().split('\n')
      assert.equal(lines[0], 'guia,client_id')
      assert.equal(lines[1], '2,')
    })
  })

  describe('date formatters', () => {
    it('formats fecha as YYYY-MM-DD', () => {
      assert.equal(formatExportDate('2026-07-09T06:00:00.000Z'), '2026-07-09')
      assert.equal(formatExportDate('2026-07-09'), '2026-07-09')
    })

    it('formats fecha_documento as YYYY-MM-DD HH:mm:ss', () => {
      assert.equal(
        formatExportDateTime('2026-07-09T00:00:00.000Z'),
        '2026-07-09 00:00:00'
      )
      assert.equal(formatExportDateTime('2026-07-09'), '2026-07-09 00:00:00')
    })
  })

  describe('buildExportKey', () => {
    it('builds a non-PII key under exports/guides', () => {
      const key = buildExportKey({
        stage: 'dev',
        now: new Date(Date.UTC(2026, 8, 16)),
        id: 'abc-123',
      })
      assert.equal(key, 'exports/guides/dev/2026/09/abc-123.csv')
    })
  })
})
