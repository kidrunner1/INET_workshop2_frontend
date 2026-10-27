import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCatalogQuery, serializeCatalogQuery } from '../../src/utils/catalog-query.ts'

test('invalid and repeated URL values cannot produce an invalid API page/limit', () => {
  for (const page of ['0', '-2', 'NaN', '1.5', 'Infinity', '9007199254740992']) {
    assert.equal(parseCatalogQuery({ page }).page, 1)
  }
  assert.deepEqual(
    parseCatalogQuery({
      search: [' Mouse ', 'ignored'],
      category: ' Custom ',
      page: '2',
      limit: '9999',
      sort: 'unsupported',
    }),
    {
      search: 'Mouse',
      category: 'Custom',
      page: 2,
      limit: 12,
      sort: 'default',
    },
  )
})

test('deep links round-trip search, unknown backend categories, page size and ordering', () => {
  const state = {
    search: 'เมาส์ & USB',
    category: 'New category',
    page: 3,
    limit: 48,
    sort: 'price-high',
  }
  assert.deepEqual(parseCatalogQuery(serializeCatalogQuery(state)), state)
  assert.deepEqual(serializeCatalogQuery(parseCatalogQuery({})), {})
})
