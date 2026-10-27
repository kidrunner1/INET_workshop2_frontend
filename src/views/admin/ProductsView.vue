<script setup lang="ts">
import { withMinimumLoading } from '@/utils/with-minimum-loading'

import { useToastStore } from '@/stores/toast.store'

import AppSearchField from '@/components/common/AppSearchField.vue'
import AppIconSelect from '@/components/common/AppIconSelect.vue'
import { PRODUCT_CATEGORIES } from '@/utils/catalog-query'
import { getProductCategoryIcon } from '@/utils/product-icons'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { onMounted, computed, nextTick, ref, useId } from 'vue'

import axios from 'axios'

import ProductForm from '@/components/admin/ProductForm.vue'

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '@/services/product.service'

import type { Product } from '@/types/product'

import type { ProductPayload } from '@/services/product.service'

const toastStore = useToastStore()
const filterId = useId()

const search = ref('')
const pendingDeletion = ref<Product | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')
const listHeading = ref<HTMLElement | null>(null)

const requestDelete = (product: Product) => {
  if (isDeleting.value) return
  deleteError.value = ''
  pendingDeletion.value = product
}
const cancelDelete = () => {
  if (!isDeleting.value) pendingDeletion.value = null
}

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesSearch =
      !keyword ||
      product.name.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)

    const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value

    const matchesStock =
      stockFilter.value === 'all' ||
      (stockFilter.value === 'in-stock' && product.stock > 0) ||
      (stockFilter.value === 'out-of-stock' && product.stock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })
})

const categoryOptions = [
  { value: '', label: 'ทุกหมวดหมู่', icon: 'category' },
  ...PRODUCT_CATEGORIES.map((value) => ({ value, label: value, icon: getProductCategoryIcon(value) })),
]
const stockOptions = [
  { value: 'all', label: 'Stock ทั้งหมด', icon: 'inventory_2' },
  { value: 'in-stock', label: 'พร้อมขาย', icon: 'check_circle' },
  { value: 'out-of-stock', label: 'สินค้าหมด', icon: 'remove_shopping_cart' },
]

const resetFilters = (): void => {
  search.value = ''
  categoryFilter.value = ''
  stockFilter.value = 'all'
}

const inStockCount = computed(() => products.value.filter((product) => product.stock > 0).length)

const outOfStockCount = computed(
  () => products.value.filter((product) => product.stock === 0).length,
)
const products = ref<Product[]>([])

const isLoading = ref(true)
const isSaving = ref(false)
const categoryFilter = ref('')
const stockFilter = ref('all')
const errorMessage = ref('')
const successMessage = ref('')

const showForm = ref(false)

const editingProduct = ref<Product | null>(null)

const fetchProducts = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await withMinimumLoading(() =>
      getProducts({
        page: 1,
        limit: 100,
      }),
    )

    products.value = response.data.products
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'โหลดสินค้าไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const openCreateForm = () => {
  editingProduct.value = null
  showForm.value = true

  successMessage.value = ''
  errorMessage.value = ''
}

const openEditForm = (product: Product) => {
  editingProduct.value = product
  showForm.value = true

  successMessage.value = ''
  errorMessage.value = ''
}

const closeForm = () => {
  showForm.value = false
  editingProduct.value = null
  void nextTick(() => listHeading.value?.focus())
}

const handleSubmit = async (payload: ProductPayload) => {
  if (isSaving.value) return
  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (editingProduct.value) {
      await updateProduct(editingProduct.value._id, payload)

      successMessage.value = 'แก้ไขสินค้าสำเร็จ'
      toastStore.success(successMessage.value)
    } else {
      await createProduct(payload)

      successMessage.value = 'เพิ่มสินค้าสำเร็จ'
      toastStore.success(successMessage.value)
    }

    closeForm()
    await nextTick()
    listHeading.value?.focus()

    await fetchProducts()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'บันทึกสินค้าไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async () => {
  const product = pendingDeletion.value
  if (!product || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteProduct(product._id)
    products.value = products.value.filter((item) => item._id !== product._id)
    pendingDeletion.value = null
    toastStore.success('ลบสินค้าสำเร็จ')
    await fetchProducts()
  } catch (error) {
    deleteError.value = axios.isAxiosError(error)
      ? (error.response?.data?.message ?? 'ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง')
      : 'ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <section class="px-5 py-6 sm:px-8 sm:py-8">
    <div class="mx-auto max-w-7xl">
      <h1 ref="listHeading" tabindex="-1" class="mb-5 text-2xl font-bold text-slate-900">
        จัดการสินค้า
      </h1>
      <!-- Summary -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Products ทั้งหมด</p>

          <p class="mt-3 text-xl font-bold text-slate-900">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ products.length }}</span
            >
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">พร้อมขาย</p>

          <p class="mt-3 text-xl font-bold text-green-600">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ inStockCount }}</span
            >
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">สินค้าหมด</p>

          <p class="mt-3 text-xl font-bold text-red-500">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ outOfStockCount }}</span
            >
          </p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(180px,220px)_minmax(180px,220px)_auto]">
          <AppSearchField
            v-model="search"
            label="ค้นหาสินค้าในรายการที่โหลด"
            placeholder="ชื่อสินค้าหรือหมวดหมู่"
            :debounce-ms="0"
          />

          <!-- Category -->
          <div>
            <label
              :id="filterId + '-category-label'"
              :for="filterId + '-category'"
              class="mb-2 block text-sm font-semibold text-slate-700"
            >หมวดหมู่</label>
            <AppIconSelect
              :id="filterId + '-category'"
              :label-id="filterId + '-category-label'"
              v-model="categoryFilter"
              :options="categoryOptions"
              icon="category"
            />
          </div>

          <!-- Stock -->
          <div>
            <label
              :id="filterId + '-stock-label'"
              :for="filterId + '-stock'"
              class="mb-2 block text-sm font-semibold text-slate-700"
            >สถานะสต็อก</label>
            <AppIconSelect
              :id="filterId + '-stock'"
              :label-id="filterId + '-stock-label'"
              v-model="stockFilter"
              :options="stockOptions"
              icon="inventory_2"
            />
          </div>

          <!-- Add Product -->
          <button
            type="button"
            class="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
            :disabled="showForm || isDeleting"
            @click="openCreateForm"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-[20px]"> add </span>

            เพิ่มสินค้า
          </button>
        </div>

        <!-- Filter Footer -->
        <div
          class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"
        >
          <p class="text-xs text-slate-400">
            พบ {{ filteredProducts.length }} จาก {{ products.length }} รายการ
          </p>

          <button
            type="button"
            :disabled="!search && !categoryFilter && stockFilter === 'all'"
            class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            @click="resetFilters"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-[17px]">
              restart_alt
            </span>

            ล้างตัวกรอง
          </button>
        </div>
      </div>

      <div
        v-if="successMessage"
        class="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <div
        role="alert"
        v-if="errorMessage"
        class="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <div v-if="showForm" class="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">
              {{ editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}
            </h2>

            <p class="mt-1 text-sm text-slate-500">กรอกข้อมูลสินค้าให้ครบถ้วน</p>
          </div>
        </div>

        <ProductForm
          :product="editingProduct"
          :is-loading="isSaving"
          @submit="handleSubmit"
          @cancel="closeForm"
        />
      </div>

      <!-- Product Table -->
      <div class="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <PageSkeleton v-if="isLoading" variant="table" label="กำลังโหลดสินค้า..." :count="5" />

        <div v-else-if="filteredProducts.length === 0" class="p-12 text-center text-slate-500">
          ไม่พบสินค้า
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th class="px-6 py-4">Product</th>

                <th class="px-6 py-4">Category</th>

                <th class="px-6 py-4">Price</th>

                <th class="px-6 py-4">Stock</th>

                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="product in filteredProducts"
                :key="product._id"
                class="transition hover:bg-slate-50/70"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        v-if="product.imageUrl"
                        :src="product.imageUrl"
                        :alt="product.name"
                        class="h-full w-full object-cover"
                      />

                      <div
                        v-else
                        class="flex h-full items-center justify-center text-xs text-slate-400"
                      >
                        No image
                      </div>
                    </div>

                    <div>
                      <p class="font-semibold text-slate-900">
                        {{ product.name }}
                      </p>

                      <p class="mt-1 max-w-xs truncate text-xs text-slate-400">
                        {{ product.description || 'ไม่มีรายละเอียด' }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                    {{ product.category }}
                  </span>
                </td>

                <td class="px-6 py-4 font-semibold text-slate-900">
                  ฿{{ product.price.toLocaleString() }}
                </td>

                <td class="px-6 py-4">
                  <span
                    class="rounded-full px-3 py-1.5 text-xs font-semibold"
                    :class="
                      product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    "
                  >
                    {{ product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด' }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      :disabled="showForm || isDeleting"
                      @click="openEditForm(product)"
                    >
                      แก้ไข
                    </button>

                    <button
                      class="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      :disabled="showForm || isDeleting"
                      @click="requestDelete(product)"
                    >
                      ลบสินค้า
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
  <AppConfirmDialog
    :open="pendingDeletion !== null"
    title="ลบสินค้า?"
    :description="
      'ลบ ' + (pendingDeletion?.name ?? '') + ' ออกจากร้านอย่างถาวร การลบนี้ไม่สามารถย้อนกลับได้'
    "
    confirm-label="ลบสินค้า"
    cancel-label="เก็บสินค้าไว้"
    busy-label="กำลังลบ..."
    :busy="isDeleting"
    :error="deleteError"
    :fallback-focus="listHeading"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>
