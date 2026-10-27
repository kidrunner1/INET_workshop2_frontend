type QueryValue = string | null | (string | null)[] | undefined

export const PRODUCT_CATEGORIES = [
  'Mouse',
  'Keyboard',
  'Headset',
  'Gaming',
  'Microphone',
  'Monitor',
] as const
export const PAGE_SIZES = [12, 24, 48] as const
export const SORT_OPTIONS = [
  { value: 'default', label: 'ล่าสุดก่อน' },
  { value: 'price-low', label: 'ราคาน้อย → มาก' },
  { value: 'price-high', label: 'ราคามาก → น้อย' },
  { value: 'stock-high', label: 'จำนวนคงเหลือมาก → น้อย' },
  { value: 'name', label: 'ชื่อสินค้า A → Z' },
] as const

export type CatalogSort = (typeof SORT_OPTIONS)[number]['value']
export interface CatalogQuery {
  search: string
  category: string
  sort: CatalogSort
  page: number
  limit: number
}

function first(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

export function parseCatalogQuery(query: Record<string, QueryValue>): CatalogQuery {
  const page = Number(first(query.page))
  const limit = Number(first(query.limit))
  const sort = first(query.sort)
  return {
    search: first(query.search).trim(),
    category: first(query.category).trim(),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as CatalogSort) : 'default',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZES.some((size) => size === limit) ? limit : 12,
  }
}

export function serializeCatalogQuery(query: CatalogQuery): Record<string, string> {
  return {
    ...(query.search ? { search: query.search } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.sort !== 'default' ? { sort: query.sort } : {}),
    ...(query.page > 1 ? { page: String(query.page) } : {}),
    ...(query.limit !== 12 ? { limit: String(query.limit) } : {}),
  }
}
