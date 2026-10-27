<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import ProductFilter from '@/components/product/ProductFilter.vue'
import { getProducts } from '@/services/product.service'
import type { Product, ProductPagination } from '@/types/product'
import { getErrorMessage } from '@/utils/get-error-message'
import {
  PAGE_SIZES,
  SORT_OPTIONS,
  parseCatalogQuery,
  serializeCatalogQuery,
} from '@/utils/catalog-query'
import type { CatalogQuery, CatalogSort } from '@/utils/catalog-query'

const route = useRoute()
const router = useRouter()
const query = computed(() => parseCatalogQuery(route.query))
const searchDraft = ref(query.value.search)
const products = ref<Product[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const resultsHeading = ref<HTMLElement | null>(null)
const pagination = ref<ProductPagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
let controller: AbortController | undefined
let requestId = 0

const hasFilter = computed(() =>
  Boolean(query.value.search || query.value.category || query.value.sort !== 'default'),
)
const activeSortLabel = computed(
  () => SORT_OPTIONS.find((option) => option.value === query.value.sort)?.label,
)
const displayedProducts = computed(() => {
  const list = [...products.value]
  switch (query.value.sort) {
    case 'price-low':
      return list.sort((a, b) => a.price - b.price)
    case 'price-high':
      return list.sort((a, b) => b.price - a.price)
    case 'stock-high':
      return list.sort((a, b) => b.stock - a.stock)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'th-TH'))
    default:
      return list
  }
})
const visiblePages = computed(() => {
  const start = Math.max(1, Math.min(pagination.value.page - 2, pagination.value.totalPages - 4))
  return Array.from(
    { length: Math.min(5, pagination.value.totalPages) },
    (_, index) => start + index,
  )
})
const rangeStart = computed(() =>
  pagination.value.total ? (pagination.value.page - 1) * pagination.value.limit + 1 : 0,
)
const rangeEnd = computed(() =>
  Math.min(pagination.value.total, rangeStart.value + products.value.length - 1),
)

async function updateQuery(change: Partial<CatalogQuery>, replace = false) {
  const next = { ...query.value, ...change }
  const location = { name: 'products', query: serializeCatalogQuery(next) }
  await (replace ? router.replace(location) : router.push(location))
}

async function fetchProducts() {
  controller?.abort()
  controller = new AbortController()
  const signal = controller.signal
  const currentRequest = ++requestId
  const requested = { ...query.value }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data } = await getProducts(
      {
        search: requested.search || undefined,
        category: requested.category || undefined,
        page: requested.page,
        limit: requested.limit,
      },
      signal,
    )
    if (currentRequest !== requestId || signal.aborted) return
    const lastPage = Math.max(1, data.pagination.totalPages)
    if (requested.page > lastPage) {
      await updateQuery({ page: lastPage }, true)
      return
    }
    products.value = data.products
    pagination.value = { ...data.pagination, totalPages: lastPage }
  } catch (error) {
    if (currentRequest !== requestId || signal.aborted) return
    errorMessage.value = getErrorMessage(error, 'โหลดสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง')
  } finally {
    if (currentRequest === requestId && !signal.aborted) isLoading.value = false
  }
}

async function handleSearch(value: string) {
  const search = value.trim()
  searchDraft.value = search
  if (search === query.value.search && query.value.page === 1) {
    if (errorMessage.value) await fetchProducts()
    return
  }
  await updateQuery({ search, page: 1 })
}
async function resetFilters() {
  searchDraft.value = ''
  await updateQuery({ search: '', category: '', sort: 'default', page: 1 })
  if (errorMessage.value && !hasFilter.value) await fetchProducts()
}
async function changePage(page: number) {
  if (
    isLoading.value ||
    page < 1 ||
    page > pagination.value.totalPages ||
    page === query.value.page
  )
    return
  await updateQuery({ page })
  await nextTick()
  resultsHeading.value?.focus({ preventScroll: true })
  resultsHeading.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

watch(
  () => query.value.search,
  (value) => {
    searchDraft.value = value
  },
)
watch(
  () =>
    JSON.stringify([query.value.search, query.value.category, query.value.page, query.value.limit]),
  fetchProducts,
  { immediate: true },
)
onBeforeUnmount(() => {
  requestId += 1
  controller?.abort()
})
</script>

<template>
  <main>
    <section class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <ProductFilter
        v-model:search="searchDraft"
        :category="query.category"
        :sort="query.sort"
        @search="handleSearch"
        @category-change="updateQuery({ category: $event, page: 1 })"
        @sort-change="updateQuery({ sort: $event as CatalogSort })"
        @reset="resetFilters"
      />

      <div
        v-if="hasFilter"
        class="mt-5 flex flex-wrap items-center gap-2"
        aria-label="ตัวกรองที่ใช้"
      >
        <span class="text-sm font-medium text-slate-500">ตัวกรอง:</span>
        <button
          v-if="query.search"
          type="button"
          :aria-label="'ล้างคำค้นหา ' + query.search"
          class="filter-chip"
          @click="handleSearch('')"
        >
          {{ query.search }} <span aria-hidden="true">×</span>
        </button>
        <button
          v-if="query.category"
          type="button"
          :aria-label="'ล้างหมวดหมู่ ' + query.category"
          class="filter-chip"
          @click="updateQuery({ category: '', page: 1 })"
        >
          {{ query.category }} <span aria-hidden="true">×</span>
        </button>
        <button
          v-if="query.sort !== 'default'"
          type="button"
          aria-label="คืนลำดับสินค้าเริ่มต้น"
          class="filter-chip"
          @click="updateQuery({ sort: 'default' })"
        >
          {{ activeSortLabel }} <span aria-hidden="true">×</span>
        </button>
      </div>

      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            ref="resultsHeading"
            tabindex="-1"
            class="scroll-mt-40 text-2xl font-bold tracking-tight text-slate-900"
          >
            {{ query.category || 'สินค้าทั้งหมด' }}
          </h1>
          <p role="status" class="mt-1 min-h-6 text-sm text-slate-600">
            <template v-if="isLoading">กำลังค้นหาสินค้า…</template>
            <template v-else-if="errorMessage">ยังแสดงผลการค้นหาไม่ได้</template>
            <template v-else-if="pagination.total"
              >แสดง {{ rangeStart }}–{{ rangeEnd }} จาก
              {{ pagination.total.toLocaleString('th-TH') }} รายการ</template
            >
            <template v-else>พบ 0 รายการ</template>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <label for="catalog-page-size" class="text-sm text-slate-600">รายการต่อหน้า</label>
          <select
            id="catalog-page-size"
            :value="query.limit"
            class="app-field h-11 px-3"
            @change="
              updateQuery({ limit: Number(($event.target as HTMLSelectElement).value), page: 1 })
            "
          >
            <option v-for="size in PAGE_SIZES" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>

      <div :aria-busy="isLoading" class="mt-6 min-h-72">
        <PageSkeleton
          v-if="isLoading"
          variant="products"
          label="กำลังโหลดสินค้า..."
          :count="query.limit"
        />
        <div
          v-else-if="errorMessage"
          role="alert"
          class="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h2 class="font-semibold text-red-800">โหลดสินค้าไม่สำเร็จ</h2>
          <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
            @click="fetchProducts"
          >
            ลองใหม่
          </button>
        </div>
        <div
          v-else-if="!displayedProducts.length"
          class="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"
        >
          <span aria-hidden="true" class="material-symbols-rounded text-5xl text-slate-400">{{
            hasFilter ? 'search_off' : 'inventory_2'
          }}</span>
          <h2 class="mt-4 text-xl font-bold text-slate-900">
            {{ hasFilter ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้าในร้าน' }}
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            {{
              hasFilter
                ? 'ลองใช้คำค้นอื่น หรือล้างตัวกรองเพื่อดูสินค้าทั้งหมด'
                : 'เมื่อมีสินค้าใหม่ คุณจะพบรายการสินค้าได้ที่นี่'
            }}
          </p>
          <button
            v-if="hasFilter"
            type="button"
            class="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            @click="resetFilters"
          >
            ดูสินค้าทั้งหมด
          </button>
        </div>
        <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="product in displayedProducts"
            :key="product._id"
            :product="product"
            :list-query="serializeCatalogQuery(query)"
          />
        </div>
      </div>

      <nav
        v-if="!errorMessage && pagination.totalPages > 1"
        aria-label="หน้ารายการสินค้า"
        class="mt-10 flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          :disabled="isLoading || pagination.page <= 1"
          class="page-button"
          aria-label="หน้าก่อนหน้า"
          @click="changePage(pagination.page - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :disabled="isLoading"
          :aria-current="page === pagination.page ? 'page' : undefined"
          :aria-label="'หน้า ' + page"
          class="page-button"
          :class="{ 'page-button-current': page === pagination.page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :disabled="isLoading || pagination.page >= pagination.totalPages"
          class="page-button"
          aria-label="หน้าถัดไป"
          @click="changePage(pagination.page + 1)"
        >
          ›
        </button>
        <p class="w-full pt-2 text-center text-xs text-slate-500">
          หน้า {{ pagination.page }} จาก {{ pagination.totalPages }}
        </p>
      </nav>
    </section>
  </main>
</template>
