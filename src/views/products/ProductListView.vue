<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
} from 'vue'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import ProductFilter from '@/components/product/ProductFilter.vue'

import { getProducts } from '@/services/product.service'

import type {
  Product,
  ProductPagination,
} from '@/types/product'

import { getErrorMessage } from '@/utils/get-error-message'
import { withMinimumLoading } from '@/utils/with-minimum-loading'

// State

const products = ref<Product[]>([])

const isLoading = ref(true)
const errorMessage = ref('')

const resultsHeading =
  ref<HTMLElement | null>(null)

const search = ref('')
const category = ref('')
const sort = ref('default')

const pagination = ref<ProductPagination>({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
})

let requestId = 0

// Computed

const hasFilter = computed(() => {
  return Boolean(
    search.value.trim() ||
    category.value ||
    sort.value !== 'default',
  )
})

const activeSortLabel = computed(() => {
  switch (sort.value) {
    case 'price-low':
      return 'ราคาน้อย → มาก'

    case 'price-high':
      return 'ราคามาก → น้อย'

    case 'stock-high':
      return 'Stock มาก → น้อย'

    case 'name':
      return 'ชื่อสินค้า A → Z'

    default:
      return ''
  }
})

const displayedProducts = computed(() => {
  const list = [...products.value]

  switch (sort.value) {
    case 'price-low':
      return list.sort(
        (a, b) =>
          a.price - b.price,
      )

    case 'price-high':
      return list.sort(
        (a, b) =>
          b.price - a.price,
      )

    case 'stock-high':
      return list.sort(
        (a, b) =>
          b.stock - a.stock,
      )

    case 'name':
      return list.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
          ),
      )

    default:
      return list
  }
})

const visiblePages = computed(() => {
  const currentPage =
    pagination.value.page

  const totalPages =
    pagination.value.totalPages

  const startPage = Math.max(
    1,
    currentPage - 2,
  )

  const endPage = Math.min(
    totalPages,
    currentPage + 2,
  )

  return Array.from(
    {
      length:
        endPage -
        startPage +
        1,
    },
    (_, index) =>
      startPage + index,
  )
})

// API

const fetchProducts = async (
  page = 1,
): Promise<void> => {
  const currentRequestId =
    ++requestId

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response =
      await withMinimumLoading(
        () =>
          getProducts({
            search:
              search.value.trim() ||
              undefined,

            category:
              category.value ||
              undefined,

            page,

            limit:
              pagination.value.limit,
          }),
      )

    if (
      currentRequestId !==
      requestId
    ) {
      return
    }

    products.value =
      response.data.products

    pagination.value =
      response.data.pagination
  } catch (error) {
    if (
      currentRequestId !==
      requestId
    ) {
      return
    }

    errorMessage.value =
      getErrorMessage(
        error,
        'โหลดสินค้าไม่สำเร็จ',
      )
  } finally {
    if (
      currentRequestId ===
      requestId
    ) {
      isLoading.value = false
    }
  }
}

// Actions

const handleSearch =
  async (): Promise<void> => {
    await fetchProducts(1)
  }

const handleCategory = async (
  value: string,
): Promise<void> => {
  category.value = value

  await fetchProducts(1)
}

const resetFilters =
  async (): Promise<void> => {
    search.value = ''
    category.value = ''
    sort.value = 'default'

    await fetchProducts(1)
  }

const changePage = async (
  page: number,
): Promise<void> => {
  if (
    isLoading.value ||
    page < 1 ||
    page >
    pagination.value.totalPages ||
    page ===
    pagination.value.page
  ) {
    return
  }

  const pending =
    fetchProducts(page)

  await nextTick()

  resultsHeading.value?.scrollIntoView(
    {
      block: 'start',
      behavior: 'instant',
    },
  )

  await pending
}

// Lifecycle

onMounted(async () => {
  await fetchProducts()
})
</script>

<template>
  <main>
    <section class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <!-- Search / Filter -->
      <ProductFilter v-model:search="search" v-model:category="category" v-model:sort="sort" @search="handleSearch"
        @category-change="handleCategory" @reset="resetFilters" />

      <!-- Active Filters -->
      <div v-if="hasFilter" class="mt-5 flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-slate-500">
          ตัวกรอง:
        </span>

        <span v-if="search.trim()"
          class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <span class="material-symbols-rounded text-[15px]">
            search
          </span>

          {{ search.trim() }}
        </span>

        <span v-if="category"
          class="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
          {{ category }}
        </span>

        <span v-if="
          sort !== 'default'
        "
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {{ activeSortLabel }}
        </span>
      </div>

      <!-- Section Heading -->
      <div ref="resultsHeading"
        class="mt-8 scroll-mt-40 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900">
            {{
              category ||
              'สินค้าทั้งหมด'
            }}
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            พบทั้งหมด
            {{ pagination.total }}
            รายการ
          </p>
        </div>

        <div class="text-sm text-slate-400">
          หน้า
          {{ pagination.page }}
          จาก
          {{
            pagination.totalPages
          }}
        </div>
      </div>

      <!-- Loading -->
      <PageSkeleton v-if="isLoading" variant="products" label="กำลังโหลดสินค้า..." :count="pagination.limit"
        class="mt-6" />

      <!-- Error -->
      <div v-else-if="errorMessage" role="alert" class="mt-6 rounded-xl border border-red-100 bg-red-50 p-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-rounded text-[22px] text-red-600">
            error
          </span>

          <div>
            <h3 class="font-semibold text-red-700">
              โหลดสินค้าไม่สำเร็จ
            </h3>

            <p class="mt-1 text-sm text-red-600">
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <button type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          @click="
            fetchProducts(
              pagination.page,
            )
            ">
          <span class="material-symbols-rounded text-[18px]">
            refresh
          </span>

          ลองใหม่
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="
        displayedProducts.length === 0
      " class="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <span class="material-symbols-rounded text-[34px]">
            search_off
          </span>
        </div>

        <h3 class="mt-5 text-xl font-bold text-slate-900">
          ไม่พบสินค้าที่ค้นหา
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          ลองเปลี่ยนคำค้นหา
          หรือเลือกหมวดหมู่อื่น
        </p>

        <button type="button"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          @click="resetFilters">
          <span class="material-symbols-rounded text-[19px]">
            restart_alt
          </span>

          ดูสินค้าทั้งหมด
        </button>
      </div>

      <!-- Product Grid -->
      <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard v-for="
product in displayedProducts
          " :key="product._id" :product="product" />
      </div>

      <!-- Pagination -->
      <div v-if="
        !errorMessage &&
        pagination.totalPages > 1
      " class="mt-12 flex justify-center">
        <nav
          class="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
          aria-label="Pagination">
          <button type="button" :disabled="isLoading ||
            pagination.page <= 1
            "
            class="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            @click="
              changePage(
                pagination.page - 1,
              )
              ">
            <span class="material-symbols-rounded text-[19px]">
              chevron_left
            </span>

            <span class="hidden sm:inline">
              ก่อนหน้า
            </span>
          </button>

          <span class="hidden h-6 w-px bg-slate-200 sm:block" />

          <div class="flex items-center gap-1">
            <button v-for="
page in visiblePages
              " :key="page" type="button" :disabled="isLoading" :aria-current="page ===
                pagination.page
                ? 'page'
                : undefined
                " class="flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition"
              :class="page ===
                pagination.page
                ? 'bg-slate-950 text-white shadow-md shadow-slate-200'
                : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                " @click="
                  changePage(page)
                  ">
              {{ page }}
            </button>
          </div>

          <span class="hidden h-6 w-px bg-slate-200 sm:block" />

          <button type="button" :disabled="isLoading ||
            pagination.page >=
            pagination.totalPages
            "
            class="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            @click="
              changePage(
                pagination.page + 1,
              )
              ">
            <span class="hidden sm:inline">
              ถัดไป
            </span>

            <span class="material-symbols-rounded text-[19px]">
              chevron_right
            </span>
          </button>
        </nav>
      </div>
    </section>
  </main>
</template>
