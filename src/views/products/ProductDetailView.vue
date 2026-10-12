<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { getProductById } from '@/services/product.service'
import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'
import type { Product } from '@/types/product'
import { getErrorMessage } from '@/utils/get-error-message'

const route = useRoute()

const cartStore = useCartStore()
const toastStore = useToastStore()

// State

const product = ref<Product | null>(null)

const quantity = ref(1)

const isLoading = ref(false)
const isAdding = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

let requestId = 0

// Computed

const productId = computed(() => {
  return String(route.params.id ?? '')
})

const canDecrease = computed(() => {
  return quantity.value > 1
})

const canIncrease = computed(() => {
  return Boolean(
    product.value &&
    quantity.value < product.value.stock,
  )
})

const isOutOfStock = computed(() => {
  return !product.value || product.value.stock <= 0
})

const subtotal = computed(() => {
  if (!product.value) {
    return 0
  }

  return product.value.price * quantity.value
})

// API

const fetchProduct = async (): Promise<void> => {
  if (!productId.value) {
    errorMessage.value = 'ไม่พบรหัสสินค้า'
    product.value = null
    return
  }

  const currentRequestId = ++requestId

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  product.value = null
  quantity.value = 1

  try {
    const response = await getProductById(
      productId.value,
    )

    if (currentRequestId !== requestId) {
      return
    }

    product.value = response.data
  } catch (error) {
    if (currentRequestId !== requestId) {
      return
    }

    errorMessage.value = getErrorMessage(
      error,
      'โหลดสินค้าไม่สำเร็จ',
    )

    toastStore.error(errorMessage.value)
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false
    }
  }
}

// Quantity

const decreaseQuantity = (): void => {
  if (!canDecrease.value) {
    return
  }

  quantity.value -= 1
}

const increaseQuantity = (): void => {
  if (!canIncrease.value) {
    return
  }

  quantity.value += 1
}

// Cart

const handleAddToCart = async (): Promise<void> => {
  if (
    isAdding.value ||
    !product.value ||
    isOutOfStock.value
  ) {
    return
  }

  isAdding.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await cartStore.addItem(
      product.value._id,
      quantity.value,
    )

    successMessage.value =
      `เพิ่ม ${product.value.name} ลงตะกร้าแล้ว`

    toastStore.success('เพิ่มสินค้าลงตะกร้าแล้ว')
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'เพิ่มสินค้าไม่สำเร็จ',
    )

    toastStore.error(errorMessage.value)
  } finally {
    isAdding.value = false
  }
}

// Route

watch(
  productId,
  async () => {
    await fetchProduct()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
    <!-- Back -->
    <RouterLink :to="{ name: 'products' }"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600">
      ← กลับไปหน้าสินค้า
    </RouterLink>

    <!-- Loading -->
    <PageSkeleton v-if="isLoading" variant="product-detail" label="กำลังโหลดสินค้า..." class="mt-6" />

    <!-- Load Error -->
    <div v-else-if="errorMessage && !product" role="alert"
      class="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
      <p class="font-semibold">
        โหลดสินค้าไม่สำเร็จ
      </p>

      <p class="mt-1 text-sm">
        {{ errorMessage }}
      </p>

      <button type="button"
        class="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        @click="fetchProduct">
        ลองใหม่
      </button>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="mt-6">
      <div class="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
        <!-- Image -->
        <section class="relative min-h-105 bg-slate-100">
          <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
            class="h-full min-h-105 w-full object-cover" />

          <div v-else class="flex min-h-105 items-center justify-center text-slate-400">
            No Image
          </div>

          <span
            class="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
            {{ product.category }}
          </span>
        </section>

        <!-- Info -->
        <section class="flex flex-col p-6 sm:p-8 lg:p-10">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
              Product Detail
            </p>

            <h1 class="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {{ product.name }}
            </h1>

            <p class="mt-4 text-3xl font-bold text-orange-600">
              ฿{{ product.price.toLocaleString() }}
            </p>
          </div>

          <!-- Stock -->
          <div class="mt-6 flex items-center gap-3">
            <span class="rounded-full px-3 py-1.5 text-sm font-semibold" :class="product.stock > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
              ">
              {{
                product.stock > 0
                  ? 'พร้อมจำหน่าย'
                  : 'สินค้าหมด'
              }}
            </span>

            <span class="text-sm text-slate-500">
              {{
                product.stock > 0
                  ? `เหลือ ${product.stock} ชิ้น`
                  : 'ไม่มีสินค้าใน Stock'
              }}
            </span>
          </div>

          <!-- Description -->
          <div class="mt-8 border-t border-slate-100 pt-6">
            <h2 class="text-sm font-semibold text-slate-900">
              รายละเอียดสินค้า
            </h2>

            <p class="mt-3 whitespace-pre-line leading-7 text-slate-500">
              {{
                product.description ||
                'ไม่มีรายละเอียดสินค้า'
              }}
            </p>
          </div>

          <!-- Success -->
          <div v-if="successMessage" role="status"
            class="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {{ successMessage }}
              </span>

              <RouterLink :to="{ name: 'cart' }" class="font-semibold text-green-700 underline underline-offset-4">
                ไปที่ตะกร้า
              </RouterLink>
            </div>
          </div>

          <!-- Action Error -->
          <div v-if="errorMessage && product" role="alert"
            class="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </div>

          <!-- Purchase -->
          <div class="mt-auto pt-8">
            <div v-if="!isOutOfStock" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex flex-col gap-5 sm:flex-row sm:items-end">
                <!-- Quantity -->
                <div>
                  <p class="mb-2 text-sm font-medium text-slate-600">
                    จำนวน
                  </p>

                  <div class="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <button type="button" :disabled="!canDecrease" aria-label="ลดจำนวนสินค้า"
                      class="flex h-11 w-11 items-center justify-center text-lg font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      @click="decreaseQuantity">
                      −
                    </button>

                    <div
                      class="flex h-11 min-w-14 items-center justify-center border-x border-slate-200 px-3 font-semibold text-slate-900">
                      {{ quantity }}
                    </div>

                    <button type="button" :disabled="!canIncrease" aria-label="เพิ่มจำนวนสินค้า"
                      class="flex h-11 w-11 items-center justify-center text-lg font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      @click="increaseQuantity">
                      +
                    </button>
                  </div>
                </div>

                <!-- Add Cart -->
                <button type="button" :disabled="isAdding"
                  class="flex-1 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="handleAddToCart">
                  {{
                    isAdding
                      ? 'กำลังเพิ่มลงตะกร้า...'
                      : 'เพิ่มลงตะกร้า'
                  }}
                </button>
              </div>

              <!-- Subtotal -->
              <div class="mt-4 flex justify-between border-t border-slate-200 pt-4 text-sm">
                <span class="text-slate-500">
                  ยอดสำหรับจำนวนที่เลือก
                </span>

                <span class="font-bold text-slate-900">
                  ฿{{ subtotal.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Out of Stock -->
            <div v-else class="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p class="font-semibold text-red-600">
                สินค้านี้หมดชั่วคราว
              </p>

              <p class="mt-1 text-sm text-red-500">
                กรุณาเลือกสินค้าอื่นจากหน้าร้าน
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
