import assert from 'node:assert/strict'
import { describe, it, before, after } from 'node:test'
import { closePool } from 'libs/db.js'
import { getGuides, getGuidesOriginal } from './guides.js'

const DEFAULT_PARAMS = {
  packageId: 0,
  direction: 'next',
  limit: 25,
  ingDate: '2025-07-01',
  endDate: '2026-07-01',
}

describe('guides report SQL parity', () => {
  before(async () => {
    // Fail fast if Secrets Manager / DB are unreachable
    await getGuides({ ...DEFAULT_PARAMS, limit: 1 })
  })

  after(async () => {
    await closePool()
  })

  it('optimized first page matches original query', async () => {
    const [original, optimized] = await Promise.all([
      getGuidesOriginal(DEFAULT_PARAMS),
      getGuides(DEFAULT_PARAMS),
    ])

    assert.deepEqual(
      optimized.guides,
      original.guides,
      'guide rows must be identical to the original report SQL'
    )
    assert.equal(optimized.pagination.hasMore, original.pagination.hasMore)
    assert.equal(optimized.pagination.nextCursor, original.pagination.nextCursor)
    assert.equal(optimized.pagination.prevCursor, original.pagination.prevCursor)
  })

  it('optimized next page matches original query', async () => {
    const first = await getGuides(DEFAULT_PARAMS)
    if (!first.pagination.nextCursor || !first.pagination.hasMore) {
      return
    }

    const pageParams = {
      ...DEFAULT_PARAMS,
      packageId: first.pagination.nextCursor,
      direction: 'next',
    }

    const [original, optimized] = await Promise.all([
      getGuidesOriginal(pageParams),
      getGuides(pageParams),
    ])

    assert.deepEqual(optimized.guides, original.guides)
    assert.equal(optimized.pagination.hasMore, original.pagination.hasMore)
  })

  it('optimized back page matches original query', async () => {
    const first = await getGuides(DEFAULT_PARAMS)
    if (!first.pagination.nextCursor) return

    const pageParams = {
      ...DEFAULT_PARAMS,
      packageId: first.pagination.nextCursor,
      direction: 'back',
      limit: 10,
    }

    const [original, optimized] = await Promise.all([
      getGuidesOriginal(pageParams),
      getGuides(pageParams),
    ])

    assert.deepEqual(optimized.guides, original.guides)
    assert.equal(optimized.pagination.hasMore, original.pagination.hasMore)
  })
})
