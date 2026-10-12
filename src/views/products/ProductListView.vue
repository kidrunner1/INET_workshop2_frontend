<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import ProductCard from '@/components/product/ProductCard.vue'
import { getProducts } from '@/services/product.service'

import type {
  Product,
  ProductPagination,
} from '@/types/product'

import { getErrorMessage } from '@/utils/get-error-message'

// Options

const categories = [
  {
    label: 'ทั้งหมด',
    value: '',
  },
  {
    label: 'Mouse',
    value: 'Mouse',
  },
  {
    label: 'Keyboard',
    value: 'Keyboard',
  },
  {
    label: 'Headset',
    value: 'Headset',
  },
  {
    label: 'Gaming',
    value: 'Gaming',
  },
] as const

const sortOptions = [
  {
    label: 'เรียงตามค่าเริ่มต้น',
    value: 'default',
  },
  {
    label: 'ราคาน้อย → มาก',
    value: 'price-low',
  },
  {
    label: 'ราคามาก → น้อย',
    value: 'price-high',
  },
  {
    label: 'Stock มาก → น้อย',
    value: 'stock-high',
  },
  {
    label: 'ชื่อสินค้า A → Z',
    value: 'name',
  },
] as const

type CategoryValue =
  (typeof categories)[number]['value']

type SortValue =
  (typeof sortOptions)[number]['value']

// State

const products = ref<Product[]>([])

const isLoading = ref(false)
const errorMessage = ref('')

const search = ref('')
const category = ref<CategoryValue>('')
const sort = ref<SortValue>('default')

const pagination = ref<ProductPagination>({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
})

// ใช้ป้องกัน response เก่ามาทับ request ล่าสุด
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
  return (
    sortOptions.find(
      (option) => option.value === sort.value,
    )?.label ?? ''
  )
})

const displayedProducts = computed(() => {
  const list = [...products.value]

  switch (sort.value) {
    case 'price-low':
      return list.sort(
        (a, b) => a.price - b.price,
      )

    case 'price-high':
      return list.sort(
        (a, b) => b.price - a.price,
      )

    case 'stock-high':
      return list.sort(
        (a, b) => b.stock - a.stock,
      )

    case 'name':
      return list.sort(
        (a, b) =>
          a.name.localeCompare(b.name),
      )

    default:
      return list
  }
})

const visiblePages = computed(() => {
  const currentPage = pagination.value.page
  const totalPages = pagination.value.totalPages

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
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index,
  )
})

// API

const fetchProducts = async (
  page = 1,
): Promise<void> => {
  const currentRequestId = ++requestId

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getProducts({
      search:
        search.value.trim() ||
        undefined,

      category:
        category.value ||
        undefined,

      page,
      limit: pagination.value.limit,
    })

    // ถ้ามี request ใหม่กว่าแล้ว ไม่ใช้ response เก่า
    if (currentRequestId !== requestId) {
      return
    }

    products.value =
      response.data.products

    pagination.value =
      response.data.pagination
  } catch (error) {
    if (currentRequestId !== requestId) {
      return
    }

    errorMessage.value = getErrorMessage(
      error,
      'โหลดสินค้าไม่สำเร็จ',
    )
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false
    }
  }
}

// Actions

const handleSearch = async (): Promise<void> => {
  await fetchProducts(1)
}

const handleCategory = async (
  value: CategoryValue,
): Promise<void> => {
  category.value = value

  await fetchProducts(1)
}

const resetFilters = async (): Promise<void> => {
  search.value = ''
  category.value = ''
  sort.value = 'default'

  await fetchProducts(1)
}

const changePage = async (
  page: number,
): Promise<void> => {
  if (
    page < 1 ||
    page > pagination.value.totalPages ||
    page === pagination.value.page
  ) {
    return
  }

  await fetchProducts(page)

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// Lifecycle

onMounted(async () => {
  await fetchProducts()
})
</script>

<template>
  <main>
    <!-- Hero -->
    <section class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div class="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              ShopFlow Store
            </p>

            <h1 class="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              เลือกสินค้าที่เหมาะกับคุณ
            </h1>

            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              ค้นหาสินค้าเกมมิ่งและอุปกรณ์ที่คุณต้องการ
              พร้อมตรวจสอบราคาและ Stock ก่อนสั่งซื้อ
            </p>
          </div>

          <div
            class="rounded-3xl bg-linear-to-br from-orange-500 to-orange-600 p-7 text-white shadow-lg shadow-orange-100">
            <p class="text-sm font-medium text-orange-100">
              Available Products
            </p>

            <p class="mt-2 text-5xl font-bold">
              {{ pagination.total }}
            </p>

            <p class="mt-3 text-sm leading-6 text-orange-100">
              สินค้าทั้งหมดในระบบ พร้อมให้คุณเลือกดู
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <!-- Search / Filter -->
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <!-- Header -->
        <div
          class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Product Finder
            </p>

            <h3 class="mt-1 text-base font-bold text-slate-900">
              ค้นหาและกรองสินค้า
            </h3>
          </div>

          <button type="button" :disabled="!hasFilter"
            class="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
            @click="resetFilters">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M20 20v-6h-6" />

              <path stroke-linecap="round" stroke-linejoin="round"
                d="M5.6 15a7 7 0 0 0 11.7 2.3L20 14M4 10l2.7-3.3A7 7 0 0 1 18.4 9" />
            </svg>

            ล้างตัวกรอง
          </button>
        </div>

        <!-- Controls -->
        <div class="grid gap-4 p-5 lg:grid-cols-[1fr_220px_220px]">
          <!-- Search -->
          <form class="group relative" @submit.prevent="handleSearch">
            <div
              class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-orange-500">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="7" />

                <path stroke-linecap="round" d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <input v-model="search" type="text" placeholder="ค้นหาชื่อสินค้า เช่น Mouse, Keyboard..."
              class="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-28 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />

            <button type="submit"
              class="absolute right-1.5 top-1.5 h-10 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-orange-500">
              ค้นหา
            </button>
          </form>

          <!-- Category -->
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="4" y="4" width="6" height="6" rx="1" />

                <rect x="14" y="4" width="6" height="6" rx="1" />

                <rect x="4" y="14" width="6" height="6" rx="1" />

                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
            </div>

            <select v-model="category"
              class="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              @change="handleCategory(category)">
              <option v-for="item in categories" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>

            <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>

          <!-- Sort -->
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h10M8 12h7M8 18h4" />

                <path stroke-linecap="round" stroke-linejoin="round" d="m4 5-2 2 2 2M4 19l-2-2 2-2" />
              </svg>
            </div>

            <select v-model="sort"
              class="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Quick Filter -->
      <div class="mt-5 flex gap-2 overflow-x-auto pb-1">
        <button v-for="item in categories" :key="item.value" type="button"
          class="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition" :class="category === item.value
            ? 'border-orange-500 bg-orange-500 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
            " @click="handleCategory(item.value)">
          {{ item.label }}
        </button>
      </div>

      <!-- Active Filters -->
      <div v-if="hasFilter" class="mt-5 flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-slate-500">
          ตัวกรอง:
        </span>

        <span v-if="search.trim()" class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Search: {{ search.trim() }}
        </span>

        <span v-if="category" class="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
          {{ category }}
        </span>

        <span v-if="sort !== 'default'" class="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {{ activeSortLabel }}
        </span>
      </div>

      <!-- Section Heading -->
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">
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
          {{ pagination.totalPages }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="item in 8" :key="item"
          class="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="aspect-square bg-slate-200" />

          <div class="space-y-3 p-5">
            <div class="h-4 w-20 rounded bg-slate-200" />

            <div class="h-5 w-4/5 rounded bg-slate-200" />

            <div class="h-4 w-full rounded bg-slate-100" />

            <div class="h-4 w-2/3 rounded bg-slate-100" />

            <div class="mt-5 h-8 w-28 rounded bg-slate-200" />

            <div class="h-11 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" role="alert" class="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
        <h3 class="font-semibold text-red-700">
          โหลดสินค้าไม่สำเร็จ
        </h3>

        <p class="mt-1 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button type="button"
          class="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          @click="
            fetchProducts(
              pagination.page,
            )
            ">
          ลองใหม่
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="displayedProducts.length === 0"
        class="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

        <h3 class="mt-5 text-xl font-bold text-slate-900">
          ไม่พบสินค้าที่ค้นหา
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          ลองเปลี่ยนคำค้นหา
          หรือเลือกหมวดหมู่อื่น
        </p>

        <button type="button"
          class="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          @click="resetFilters">
          ดูสินค้าทั้งหมด
        </button>
      </div>

      <!-- Product Grid -->
      <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard v-for="product in displayedProducts" :key="product._id" :product="product" />
      </div>

      <!-- Pagination -->
      <div v-if="
        !isLoading &&
        !errorMessage &&
        pagination.totalPages > 1
      " class="mt-12 flex flex-wrap items-center justify-center gap-2">
        <!-- Previous -->
        <button type="button" :disabled="pagination.page <= 1"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          @click="
            changePage(
              pagination.page - 1,
            )
            ">
          ← ก่อนหน้า
        </button>

        <!-- Page -->
        <button v-for="page in visiblePages" :key="page" type="button"
          class="h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition" :class="page === pagination.page
            ? 'bg-orange-500 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            " @click="changePage(page)">
          {{ page }}
        </button>

        <!-- Next -->
        <button type="button" :disabled="pagination.page >=
          pagination.totalPages
          "
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          @click="
            changePage(
              pagination.page + 1,
            )
            ">
          ถัดไป →
        </button>
      </div>
    </section>
  </main>
</template>
