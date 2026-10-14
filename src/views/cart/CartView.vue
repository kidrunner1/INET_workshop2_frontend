<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'

import { checkout } from '@/services/order.service'

import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()

const cartStore = useCartStore()
const toastStore = useToastStore()

const isUpdatingCart = ref(false)
const isCheckingOut = ref(false)
const showCheckoutConfirmation = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const cartHeading = ref<HTMLElement | null>(null)

const pendingRemoval = ref<
  | {
    productId: string
    productName: string
  }
  | 'all'
  | null
>(null)

/* Computed */

const totalItems = computed(() => cartStore.itemCount)

const totalPrice = computed(() => cartStore.totalPrice)

const removalDescription = computed(() => {
  if (pendingRemoval.value === 'all') {
    return `สินค้าทั้งหมด ${totalItems.value} ชิ้นจะถูกนำออกจากตะกร้า คุณสามารถเลือกเพิ่มใหม่ได้ภายหลัง`
  }

  return `ต้องการนำ “${pendingRemoval.value?.productName ?? ''}” ออกจากตะกร้าใช่ไหม? คุณสามารถเพิ่มสินค้านี้ใหม่ได้ภายหลัง`
})

/* Cart Actions */

const runCartAction = async (
  action: () => Promise<void>,
  message: string,
): Promise<boolean> => {
  if (isUpdatingCart.value || isCheckingOut.value) {
    return false
  }

  try {
    isUpdatingCart.value = true
    errorMessage.value = ''

    await action()

    toastStore.success(message)

    return true
  } catch (error) {
    errorMessage.value = axios.isAxiosError(error)
      ? (error.response?.data?.message ??
        'อัปเดตตะกร้าไม่สำเร็จ กรุณาลองอีกครั้ง')
      : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'

    toastStore.error(errorMessage.value)

    return false
  } finally {
    isUpdatingCart.value = false
  }
}

const handleIncrease = async (
  productId: string,
  currentQuantity: number,
  stock: number,
): Promise<void> => {
  if (currentQuantity >= stock) return

  await runCartAction(
    () =>
      cartStore.updateItem(
        productId,
        currentQuantity + 1,
      ),
    'อัปเดตจำนวนสินค้าแล้ว',
  )
}

const handleDecrease = async (
  productId: string,
  currentQuantity: number,
): Promise<void> => {
  if (currentQuantity <= 1) return

  await runCartAction(
    () =>
      cartStore.updateItem(
        productId,
        currentQuantity - 1,
      ),
    'อัปเดตจำนวนสินค้าแล้ว',
  )
}

const handleRemove = (
  productId: string,
  productName: string,
): void => {
  if (isUpdatingCart.value || isCheckingOut.value) {
    return
  }

  errorMessage.value = ''

  pendingRemoval.value = {
    productId,
    productName,
  }
}

const handleClearCart = (): void => {
  if (isUpdatingCart.value || isCheckingOut.value) {
    return
  }

  errorMessage.value = ''
  pendingRemoval.value = 'all'
}

const confirmRemoval = async (): Promise<void> => {
  const removal = pendingRemoval.value

  if (
    !removal ||
    isUpdatingCart.value ||
    isCheckingOut.value
  ) {
    return
  }

  const succeeded =
    removal === 'all'
      ? await runCartAction(
        () => cartStore.clearCart(),
        'ล้างตะกร้าสำเร็จ',
      )
      : await runCartAction(
        () =>
          cartStore.removeItem(
            removal.productId,
          ),
        'นำสินค้าออกจากตะกร้าแล้ว',
      )

  if (succeeded) {
    pendingRemoval.value = null
  }
}

const cancelRemoval = (): void => {
  if (!isUpdatingCart.value) {
    pendingRemoval.value = null
  }
}

/* Checkout */

const handleCheckout = (): void => {
  if (
    isCheckingOut.value ||
    isUpdatingCart.value
  ) {
    return
  }

  if (!cartStore.cart?.items.length) {
    return
  }

  errorMessage.value = ''
  showCheckoutConfirmation.value = true
}

const cancelCheckout = (): void => {
  if (!isCheckingOut.value) {
    showCheckoutConfirmation.value = false
  }
}

const confirmCheckout = async (): Promise<void> => {
  if (
    !showCheckoutConfirmation.value ||
    isCheckingOut.value ||
    isUpdatingCart.value
  ) {
    return
  }

  if (!cartStore.cart?.items.length) {
    return
  }

  try {
    isCheckingOut.value = true

    errorMessage.value = ''
    successMessage.value = ''

    const response = await checkout()

    cartStore.clearState()

    successMessage.value = 'สร้าง Order สำเร็จ'

    toastStore.success(successMessage.value)

    showCheckoutConfirmation.value = false

    await router.push({
      name: 'user-order-detail',
      params: {
        id: response.data._id,
      },
    })
  } catch (error) {
    errorMessage.value = axios.isAxiosError(error)
      ? (error.response?.data?.message ??
        'Checkout ไม่สำเร็จ')
      : 'เกิดข้อผิดพลาด'

    toastStore.error(errorMessage.value)
  } finally {
    isCheckingOut.value = false
  }
}

/* Lifecycle */

onMounted(() => {
  cartStore.fetchCart()
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Shopping Cart
        </p>

        <h1 ref="cartHeading" tabindex="-1" class="mt-2 text-xl font-bold tracking-tight text-slate-900">
          ตะกร้าสินค้า
        </h1>

        <p class="mt-2 text-sm text-slate-500">
          ตรวจสอบสินค้าและจำนวนก่อนดำเนินการสั่งซื้อ
        </p>
      </div>

      <RouterLink :to="{ name: 'products' }"
        class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
        <span class="material-symbols-rounded text-[19px]">
          arrow_back
        </span>

        เลือกสินค้าต่อ
      </RouterLink>
    </div>

    <!-- Error -->
    <div v-if="
      errorMessage ||
      cartStore.errorMessage
    " role="alert"
      class="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      <span class="material-symbols-rounded mt-0.5 text-[20px]">
        error
      </span>

      <span>
        {{
          errorMessage ||
          cartStore.errorMessage
        }}
      </span>
    </div>

    <!-- Success -->
    <div v-if="successMessage" role="status"
      class="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <span class="material-symbols-rounded mt-0.5 text-[20px]">
        check_circle
      </span>

      <span>
        {{ successMessage }}
      </span>
    </div>

    <!-- Loading -->
    <PageSkeleton v-if="cartStore.isLoading" variant="cart" label="กำลังโหลดตะกร้า..." class="mt-6" />

    <!-- Load Error -->
    <div v-else-if="
      cartStore.errorMessage &&
      !cartStore.cart
    " class="mt-6">
      <button type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        @click="cartStore.fetchCart()">
        <span class="material-symbols-rounded text-[20px]">
          refresh
        </span>

        ลองโหลดตะกร้าอีกครั้ง
      </button>
    </div>

    <!-- Empty Cart -->
    <div v-else-if="
      !cartStore.cart ||
      cartStore.cart.items.length === 0
    " class="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <span class="material-symbols-rounded text-[34px]">
          shopping_cart
        </span>
      </div>

      <h2 class="mt-5 text-xl font-bold text-slate-900">
        ตะกร้าของคุณยังว่างอยู่
      </h2>

      <p class="mt-2 text-sm text-slate-500">
        ลองเลือกสินค้าที่คุณสนใจจากหน้าร้าน
      </p>

      <RouterLink :to="{ name: 'products' }"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
        <span class="material-symbols-rounded text-[19px]">
          storefront
        </span>

        ไปเลือกสินค้า
      </RouterLink>
    </div>

    <!-- Cart Content -->
    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <!-- Items -->
      <section class="space-y-4">
        <!-- Items Header -->
        <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-[21px] text-orange-500">
                shopping_cart
              </span>

              <h2 class="font-bold text-slate-900">
                รายการสินค้า
              </h2>
            </div>

            <p class="mt-1 text-sm text-slate-500">
              {{ totalItems }} ชิ้นในตะกร้า
            </p>
          </div>

          <button type="button" :disabled="isUpdatingCart ||
            isCheckingOut
            "
            class="flex items-center gap-1.5 text-sm font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleClearCart">
            <span class="material-symbols-rounded text-[19px]">
              delete_sweep
            </span>

            ล้างตะกร้า
          </button>
        </div>

        <!-- Cart Item -->
        <article v-for="item in cartStore.cart.items" :key="item.productId._id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-100 hover:shadow-md sm:p-5">
          <div class="flex flex-col gap-5 sm:flex-row">
            <!-- Image -->
            <RouterLink :to="{
              name: 'product-detail',
              params: {
                id: item.productId._id,
              },
            }" class="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-32 sm:w-32">
              <img v-if="
                item.productId.imageUrl
              " :src="item.productId.imageUrl
                  " :alt="item.productId.name
                  " loading="lazy" class="h-full w-full object-contain p-2" />

              <div v-else class="flex h-full flex-col items-center justify-center gap-1 text-slate-300">
                <span class="material-symbols-rounded text-[32px]">
                  image
                </span>

                <span class="text-xs">
                  No Image
                </span>
              </div>
            </RouterLink>

            <!-- Details -->
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <RouterLink :to="{
                    name: 'product-detail',
                    params: {
                      id:
                        item.productId
                          ._id,
                    },
                  }" class="text-lg font-semibold text-slate-900 transition hover:text-orange-600">
                    {{
                      item.productId.name
                    }}
                  </RouterLink>

                  <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <span class="material-symbols-rounded text-[17px]">
                      category
                    </span>

                    {{
                      item.productId
                        .category
                    }}
                  </div>

                  <p class="mt-2 text-sm font-semibold text-orange-600">
                    ฿{{
                      item.productId.price.toLocaleString()
                    }}
                    / ชิ้น
                  </p>
                </div>

                <!-- Remove -->
                <button type="button" :disabled="isUpdatingCart ||
                  isCheckingOut
                  "
                  class="flex w-fit items-center gap-1.5 text-sm font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="
                    handleRemove(
                      item.productId
                        ._id,
                      item.productId
                        .name,
                    )
                    ">
                  <span class="material-symbols-rounded text-[18px]">
                    delete
                  </span>

                  นำออก
                </button>
              </div>

              <div
                class="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                <!-- Quantity -->
                <div>
                  <p class="mb-2 text-xs font-medium text-slate-400">
                    จำนวน
                  </p>

                  <div class="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <!-- Decrease -->
                    <button type="button" :disabled="isUpdatingCart ||
                      isCheckingOut ||
                      item.quantity <= 1
                      " aria-label="ลดจำนวนสินค้า"
                      class="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      @click="
                        handleDecrease(
                          item.productId
                            ._id,
                          item.quantity,
                        )
                        ">
                      <span class="material-symbols-rounded text-[20px]">
                        remove
                      </span>
                    </button>

                    <!-- Quantity -->
                    <div
                      class="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 font-semibold text-slate-900">
                      {{ item.quantity }}
                    </div>

                    <!-- Increase -->
                    <button type="button" :disabled="isUpdatingCart ||
                      isCheckingOut ||
                      item.quantity >=
                      item.productId
                        .stock
                      " aria-label="เพิ่มจำนวนสินค้า"
                      class="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      @click="
                        handleIncrease(
                          item.productId
                            ._id,
                          item.quantity,
                          item.productId
                            .stock,
                        )
                        ">
                      <span class="material-symbols-rounded text-[20px]">
                        add
                      </span>
                    </button>
                  </div>

                  <div class="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <span class="material-symbols-rounded text-[15px]">
                      inventory_2
                    </span>

                    Stock:
                    {{
                      item.productId.stock
                    }}
                  </div>
                </div>

                <!-- Subtotal -->
                <div class="sm:text-right">
                  <p class="text-xs font-medium text-slate-400">
                    Subtotal
                  </p>

                  <p class="mt-1 text-xl font-bold text-slate-900">
                    ฿{{
                      (
                        item.productId
                          .price *
                        item.quantity
                      ).toLocaleString()
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- Order Summary -->
      <aside>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-orange-500">
                Order Summary
              </p>

              <h2 class="mt-1 text-xl font-bold text-slate-900">
                สรุปคำสั่งซื้อ
              </h2>
            </div>

            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <span class="material-symbols-rounded text-[22px]">
                receipt_long
              </span>
            </div>
          </div>

          <div class="mt-6 space-y-4 text-sm">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-500">
                <span class="material-symbols-rounded text-[18px]">
                  shopping_bag
                </span>

                จำนวนสินค้า
              </span>

              <span class="font-semibold text-slate-900">
                {{ totalItems }} ชิ้น
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-500">
                <span class="material-symbols-rounded text-[18px]">
                  payments
                </span>

                ค่าสินค้า
              </span>

              <span class="font-semibold text-slate-900">
                ฿{{
                  totalPrice.toLocaleString()
                }}
              </span>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-6 border-t border-slate-200 pt-5">
            <div class="flex items-end justify-between gap-4">
              <span class="font-semibold text-slate-700">
                ยอดรวม
              </span>

              <p class="text-xl font-bold text-orange-600">
                ฿{{
                  totalPrice.toLocaleString()
                }}
              </p>
            </div>
          </div>

          <!-- Checkout -->
          <button type="button" :disabled="isUpdatingCart ||
            isCheckingOut ||
            totalItems === 0
            "
            class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleCheckout">
            <span class="material-symbols-rounded text-[20px]" :class="{
              'animate-spin':
                isCheckingOut,
            }">
              {{
                isCheckingOut
                  ? 'progress_activity'
                  : 'shopping_bag'
              }}
            </span>

            {{
              isCheckingOut
                ? 'กำลังสร้าง Order...'
                : 'ดำเนินการสั่งซื้อ'
            }}
          </button>

          <div class="mt-4 flex items-start justify-center gap-1.5 text-xs leading-5 text-slate-400">
            <span class="material-symbols-rounded mt-0.5 text-[16px]">
              verified
            </span>

            <p>
              ระบบจะตรวจสอบ Stock
              และราคาปัจจุบันอีกครั้งก่อนสร้าง
              Order
            </p>
          </div>
        </div>
      </aside>
    </div>
  </main>

  <!-- Remove Confirmation -->
  <AppConfirmDialog :open="pendingRemoval !== null" :title="pendingRemoval === 'all'
      ? 'ล้างตะกร้าสินค้า?'
      : 'นำสินค้าออกจากตะกร้า?'
    " :description="removalDescription" :confirm-label="pendingRemoval === 'all'
        ? 'ล้างตะกร้า'
        : 'นำสินค้าออก'
      " :busy="isUpdatingCart" :error="errorMessage" :fallback-focus="cartHeading" @confirm="confirmRemoval"
    @cancel="cancelRemoval" />

  <!-- Checkout Confirmation -->
  <AppConfirmDialog :open="showCheckoutConfirmation" title="ยืนยันการสั่งซื้อ"
    :description="`สั่งซื้อสินค้าทั้งหมด ${totalItems} ชิ้น เป็นเงิน ฿${totalPrice.toLocaleString()} ระบบจะตรวจสอบ Stock และราคาปัจจุบันอีกครั้งก่อนสร้างคำสั่งซื้อ`"
    confirm-label="ยืนยันสั่งซื้อ" cancel-label="ตรวจสอบตะกร้า" busy-label="กำลังสร้าง Order..."
    intent="primary" :busy="isCheckingOut" :error="errorMessage" :fallback-focus="cartHeading"
    @confirm="confirmCheckout" @cancel="cancelCheckout" />
</template>
