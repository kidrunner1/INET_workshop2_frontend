<script setup lang="ts">
import { withMinimumLoading } from '@/utils/with-minimum-loading'

import { computed, ref, watch } from 'vue'
import { parseCatalogQuery, serializeCatalogQuery } from '@/utils/catalog-query'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { getProductById } from '@/services/product.service'
import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'
import type { Product } from '@/types/product'
import { getErrorMessage } from '@/utils/get-error-message'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const listQuery = computed(() => serializeCatalogQuery(parseCatalogQuery(route.query)))
const cartStore = useCartStore()
const toastStore = useToastStore()

const product = ref<Product | null>(null)
const quantity = ref(1)

const isLoading = ref(false)
const isAdding = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

let requestId = 0

const productId = computed(() => String(route.params.id ?? ''))
const isOutOfStock = computed(() => !product.value?.stock)
const subtotal = computed(() => (product.value?.price ?? 0) * quantity.value)

const normalizeQuantity = (): void => {
  if (!product.value) return

  quantity.value = Math.min(product.value.stock, Math.max(1, Number(quantity.value) || 1))
}

const fetchProduct = async (): Promise<void> => {
  if (!productId.value) {
    errorMessage.value = 'ไม่พบรหัสสินค้า'
    return
  }

  const currentRequest = ++requestId

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  product.value = null
  quantity.value = 1

  try {
    const { data } = await withMinimumLoading(() => getProductById(productId.value))

    if (currentRequest === requestId) {
      product.value = data
    }
  } catch (error) {
    if (currentRequest !== requestId) return

    errorMessage.value = getErrorMessage(error, 'โหลดสินค้าไม่สำเร็จ')

    toastStore.error(errorMessage.value)
  } finally {
    if (currentRequest === requestId) {
      isLoading.value = false
    }
  }
}

const changeQuantity = (amount: number): void => {
  if (!product.value) return

  quantity.value = Math.min(product.value.stock, Math.max(1, quantity.value + amount))
}

const handleAddToCart = async (): Promise<void> => {
  if (!product.value || isAdding.value || isOutOfStock.value) return
  if (!authStore.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  isAdding.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await cartStore.addItem(product.value._id, quantity.value)

    successMessage.value = `เพิ่ม ${product.value.name} ลงตะกร้าแล้ว`
    toastStore.success('เพิ่มสินค้าลงตะกร้าแล้ว')
  } catch (error) {
    // The cart API returns 401 for missing/expired authentication.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authStore.logout()
      cartStore.clearState()
      await router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }
    errorMessage.value = getErrorMessage(error, 'เพิ่มสินค้าไม่สำเร็จ')

    toastStore.error(errorMessage.value)
  } finally {
    isAdding.value = false
  }
}

watch(productId, fetchProduct, { immediate: true })
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <div class="mb-6 flex items-center gap-2 text-sm text-slate-400">
      <RouterLink
        :to="{ name: 'products', query: listQuery }"
        class="font-medium transition hover:text-orange-600"
      >
        สินค้าทั้งหมด
      </RouterLink>

      <span>/</span>

      <span v-if="product" class="truncate text-slate-600">
        {{ product.name }}
      </span>
    </div>

    <!-- Loading -->
    <PageSkeleton v-if="isLoading" variant="product-detail" label="กำลังโหลดสินค้า..." />

    <!-- Load Error -->
    <div
      v-else-if="errorMessage && !product"
      role="alert"
      class="mx-auto max-w-xl rounded-xl border border-red-100 bg-red-50 p-8 text-center"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-xl">
        <span class="material-symbols-rounded align-middle text-[28px]" aria-hidden="true"
          >error</span
        >
      </div>

      <h2 class="mt-4 text-lg font-bold text-red-700">ไม่สามารถโหลดสินค้าได้</h2>

      <p class="mt-2 text-sm text-red-500">
        {{ errorMessage }}
      </p>

      <button
        type="button"
        class="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        @click="fetchProduct"
      >
        ลองอีกครั้ง
      </button>
    </div>

    <!-- Product -->
    <div
      v-else-if="product"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="grid lg:grid-cols-[1.05fr_0.95fr]">
        <!-- Product Image -->
        <section
          class="relative flex min-h-110 items-center justify-center overflow-hidden bg-slate-50 lg:min-h-162.5"
        >
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="h-full w-full object-contain p-8 transition duration-500 hover:scale-[1.02] sm:p-12"
          />

          <div v-else class="flex flex-col items-center gap-3 text-slate-300">
            <span class="material-symbols-rounded align-middle text-[60px]" aria-hidden="true"
              >image</span
            >
            <span class="text-sm font-medium"> ไม่มีรูปสินค้า </span>
          </div>

          <!-- Category -->
          <span
            class="absolute left-6 top-6 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur"
          >
            {{ product.category }}
          </span>

          <!-- Stock badge -->
          <span
            class="absolute right-6 top-6 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-sm"
            :class="product.stock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="product.stock ? 'bg-emerald-500' : 'bg-red-500'"
            />

            {{ product.stock ? 'พร้อมจำหน่าย' : 'สินค้าหมด' }}
          </span>
        </section>

        <!-- Product Info -->
        <section class="flex flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
              ShopFlow Product
            </p>

            <h1
              class="mt-4 text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl xl:text-5xl"
            >
              {{ product.name }}
            </h1>

            <div class="mt-6 flex flex-wrap items-end gap-3">
              <p class="text-4xl font-bold tracking-tight text-orange-600">
                ฿{{ product.price.toLocaleString() }}
              </p>

              <span class="mb-1 text-sm text-slate-400"> / ชิ้น </span>
            </div>

            <!-- Stock info -->
            <div class="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <span>Stock:</span>

              <strong :class="product.stock ? 'text-slate-800' : 'text-red-500'">
                {{ product.stock }} ชิ้น
              </strong>
            </div>
          </div>

          <!-- Description -->
          <div class="my-8 border-y border-slate-100 py-7">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
              รายละเอียดสินค้า
            </p>

            <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {{ product.description || 'ไม่มีรายละเอียดสินค้า' }}
            </p>
          </div>

          <!-- Success -->
          <div
            v-if="successMessage"
            role="status"
            class="mb-5 flex items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"
          >
            <p class="text-sm font-medium text-emerald-700">
              {{ successMessage }}
            </p>

            <RouterLink
              :to="{ name: 'cart' }"
              class="shrink-0 text-sm font-bold text-emerald-700 hover:underline"
            >
              ดูตะกร้า
              <span class="material-symbols-rounded align-middle text-[18px]" aria-hidden="true"
                >arrow_forward</span
              >
            </RouterLink>
          </div>

          <!-- Action Error -->
          <div
            v-if="errorMessage && product"
            role="alert"
            class="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ errorMessage }}
          </div>

          <!-- Purchase -->
          <div class="mt-auto">
            <div
              v-if="!isOutOfStock"
              class="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
            >
              <!-- Quantity -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-slate-800">จำนวนสินค้า</p>

                  <p class="mt-1 text-xs text-slate-400">เลือกได้สูงสุด {{ product.stock }} ชิ้น</p>
                </div>

                <div
                  class="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
                >
                  <button
                    type="button"
                    :disabled="quantity <= 1"
                    aria-label="ลดจำนวนสินค้า"
                    class="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    @click="changeQuantity(-1)"
                  >
                    <span
                      class="material-symbols-rounded align-middle text-[20px]"
                      aria-hidden="true"
                      >remove</span
                    >
                  </button>

                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="product.stock"
                    inputmode="numeric"
                    class="h-10 w-16 border-x border-slate-200 bg-transparent px-2 text-center text-base font-bold text-slate-900 outline-none"
                    @change="normalizeQuantity"
                  />

                  <button
                    type="button"
                    :disabled="quantity >= product.stock"
                    aria-label="เพิ่มจำนวนสินค้า"
                    class="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    @click="changeQuantity(1)"
                  >
                    <span
                      class="material-symbols-rounded align-middle text-[20px]"
                      aria-hidden="true"
                      >add</span
                    >
                  </button>
                </div>
              </div>

              <!-- Price Summary -->
              <div class="my-5 flex items-end justify-between border-t border-slate-200 pt-5">
                <div>
                  <p class="text-xs text-slate-400">ยอดรวม</p>

                  <p class="mt-1 text-sm text-slate-500">
                    {{ quantity }} × ฿{{ product.price.toLocaleString() }}
                  </p>
                </div>

                <p class="text-xl font-bold text-slate-950">฿{{ subtotal.toLocaleString() }}</p>
              </div>

              <!-- Add Cart -->
              <button
                type="button"
                :disabled="isAdding"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                @click="handleAddToCart"
              >
                <span>
                  {{ isAdding ? 'กำลังเพิ่มสินค้า...' : authStore.isAuthenticated ? 'เพิ่มลงตะกร้า' : 'เข้าสู่ระบบเพื่อเพิ่มลงตะกร้า' }}
                </span>

                <span
                  v-if="!isAdding"
                  class="material-symbols-rounded text-[20px]"
                  aria-hidden="true"
                  >add_shopping_cart</span
                >
              </button>

              <p v-if="!authStore.isAuthenticated" class="mt-3 text-center text-sm leading-6 text-slate-500">
                ดูสินค้าได้โดยไม่ต้องเข้าสู่ระบบ การซื้อสินค้าต้องใช้บัญชีที่ได้รับอนุมัติแล้ว
              </p>

              <div
                class="mt-4 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400"
              >
                <span>ช้อปง่าย</span>
                <span>ตรวจสอบ Stock แบบเรียลไทม์</span>
              </div>
            </div>

            <!-- Out of Stock -->
            <div v-else class="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
              <p class="font-bold text-red-600">สินค้าหมดชั่วคราว</p>

              <p class="mt-2 text-sm text-red-400">สินค้านี้ยังไม่พร้อมจำหน่ายในขณะนี้</p>

              <RouterLink
                :to="{ name: 'products', query: listQuery }"
                class="mt-5 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-orange-600"
              >
                เลือกสินค้าอื่น
              </RouterLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
