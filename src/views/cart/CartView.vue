<script setup lang="ts">
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import { computed, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

import axios from 'axios'
import { useToastStore } from '@/stores/toast.store'

import { useCartStore } from '@/stores/cart.store'

import { checkout } from '@/services/order.service'

const router = useRouter()
const cartStore = useCartStore()
const toastStore = useToastStore()
const isUpdatingCart = ref(false)

const isCheckingOut = ref(false)
const showCheckoutConfirmation = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const cartHeading = ref<HTMLElement | null>(null)
const pendingRemoval = ref<{ productId: string; productName: string } | 'all' | null>(null)

const removalDescription = computed(() => {
  if (pendingRemoval.value === 'all') {
    return `สินค้าทั้งหมด ${totalItems.value} ชิ้นจะถูกนำออกจากตะกร้า คุณสามารถเลือกเพิ่มใหม่ได้ภายหลัง`
  }
  return `ต้องการนำ “${pendingRemoval.value?.productName ?? ''}” ออกจากตะกร้าใช่ไหม? คุณสามารถเพิ่มสินค้านี้ใหม่ได้ภายหลัง`
})

const totalItems = computed(() => cartStore.itemCount)

const totalPrice = computed(() => cartStore.totalPrice)

const runCartAction = async (action: () => Promise<void>, message: string) => {
  if (isUpdatingCart.value || isCheckingOut.value) return false

  try {
    isUpdatingCart.value = true
    errorMessage.value = ''
    await action()
    toastStore.success(message)
    return true
  } catch (error) {
    errorMessage.value = axios.isAxiosError(error)
      ? (error.response?.data?.message ?? 'อัปเดตตะกร้าไม่สำเร็จ กรุณาลองอีกครั้ง')
      : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    toastStore.error(errorMessage.value)
    return false
  } finally {
    isUpdatingCart.value = false
  }
}

const handleIncrease = async (productId: string, currentQuantity: number, stock: number) => {
  if (currentQuantity >= stock) return
  await runCartAction(
    () => cartStore.updateItem(productId, currentQuantity + 1),
    'อัปเดตจำนวนสินค้าแล้ว',
  )
}

const handleDecrease = async (productId: string, currentQuantity: number) => {
  if (currentQuantity <= 1) return
  await runCartAction(
    () => cartStore.updateItem(productId, currentQuantity - 1),
    'อัปเดตจำนวนสินค้าแล้ว',
  )
}

const handleRemove = (productId: string, productName: string) => {
  if (isUpdatingCart.value || isCheckingOut.value) return
  errorMessage.value = ''
  pendingRemoval.value = { productId, productName }
}

const handleClearCart = () => {
  if (isUpdatingCart.value || isCheckingOut.value) return
  errorMessage.value = ''
  pendingRemoval.value = 'all'
}

const confirmRemoval = async () => {
  const removal = pendingRemoval.value
  if (!removal || isUpdatingCart.value || isCheckingOut.value) return
  const succeeded =
    removal === 'all'
      ? await runCartAction(() => cartStore.clearCart(), 'ล้างตะกร้าสำเร็จ')
      : await runCartAction(
          () => cartStore.removeItem(removal.productId),
          'นำสินค้าออกจากตะกร้าแล้ว',
        )
  if (succeeded) pendingRemoval.value = null
}

const cancelRemoval = () => {
  if (!isUpdatingCart.value) pendingRemoval.value = null
}

const handleCheckout = () => {
  if (isCheckingOut.value || isUpdatingCart.value) return
  if (!cartStore.cart?.items.length) return
  errorMessage.value = ''
  showCheckoutConfirmation.value = true
}

const cancelCheckout = () => {
  if (!isCheckingOut.value) showCheckoutConfirmation.value = false
}

const confirmCheckout = async () => {
  if (!showCheckoutConfirmation.value || isCheckingOut.value || isUpdatingCart.value) return
  if (!cartStore.cart?.items.length) return
  try {
    isCheckingOut.value = true

    errorMessage.value = ''
    successMessage.value = ''

    const response = await checkout()

    cartStore.clearState()

    successMessage.value = 'สร้าง Order สำเร็จ'
    toastStore.success(successMessage.value)
    showCheckoutConfirmation.value = false

    await router.push(`/orders/${response.data._id}`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'Checkout ไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด'
    }
    toastStore.error(errorMessage.value)
  } finally {
    isCheckingOut.value = false
  }
}

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

        <h1
          ref="cartHeading"
          tabindex="-1"
          class="mt-2 text-3xl font-bold tracking-tight text-slate-900"
        >
          ตะกร้าสินค้า
        </h1>

        <p class="mt-2 text-sm text-slate-500">ตรวจสอบสินค้าและจำนวนก่อนดำเนินการสั่งซื้อ</p>
      </div>

      <RouterLink
        to="/products"
        class="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
      >
        ← เลือกสินค้าต่อ
      </RouterLink>
    </div>

    <!-- Error -->
    <div
      v-if="errorMessage || cartStore.errorMessage"
      class="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ errorMessage || cartStore.errorMessage }}
    </div>

    <!-- Success -->
    <div
      v-if="successMessage"
      class="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <PageSkeleton
      v-if="cartStore.isLoading"
      variant="cart"
      label="กำลังโหลดตะกร้า..."
      class="mt-6"
    />

    <div v-else-if="cartStore.errorMessage && !cartStore.cart" class="mt-6">
      <button
        type="button"
        class="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        @click="cartStore.fetchCart()"
      >
        ลองโหลดตะกร้าอีกครั้ง
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!cartStore.cart || cartStore.cart.items.length === 0"
      class="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-2xl"
      >
        🛒
      </div>

      <h2 class="mt-5 text-xl font-bold text-slate-900">ตะกร้าของคุณยังว่างอยู่</h2>

      <p class="mt-2 text-sm text-slate-500">ลองเลือกสินค้าที่คุณสนใจจากหน้าร้าน</p>

      <RouterLink
        to="/products"
        class="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        ไปเลือกสินค้า
      </RouterLink>
    </div>

    <!-- Cart -->
    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <!-- Items -->
      <section class="space-y-4">
        <div
          class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
        >
          <div>
            <h2 class="font-bold text-slate-900">รายการสินค้า</h2>

            <p class="mt-1 text-sm text-slate-500">{{ totalItems }} ชิ้นในตะกร้า</p>
          </div>

          <button
            type="button"
            :disabled="isUpdatingCart || isCheckingOut"
            class="disabled:opacity-50 text-sm font-semibold text-red-500 transition hover:text-red-600"
            @click="handleClearCart"
          >
            ล้างตะกร้า
          </button>
        </div>

        <article
          v-for="item in cartStore.cart.items"
          :key="item.productId._id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div class="flex flex-col gap-5 sm:flex-row">
            <!-- Image -->
            <RouterLink
              :to="`/products/${item.productId._id}`"
              class="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-32"
            >
              <img
                v-if="item.productId.imageUrl"
                :src="item.productId.imageUrl"
                :alt="item.productId.name"
                class="h-full w-full object-cover"
              />

              <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
                No Image
              </div>
            </RouterLink>

            <!-- Details -->
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <RouterLink
                    :to="`/products/${item.productId._id}`"
                    class="text-lg font-semibold text-slate-900 transition hover:text-orange-600"
                  >
                    {{ item.productId.name }}
                  </RouterLink>

                  <p class="mt-1 text-sm text-slate-500">
                    {{ item.productId.category }}
                  </p>

                  <p class="mt-2 text-sm font-semibold text-orange-600">
                    ฿{{ item.productId.price.toLocaleString() }}
                    / ชิ้น
                  </p>
                </div>

                <button
                  type="button"
                  :disabled="isUpdatingCart || isCheckingOut"
                  class="disabled:opacity-50 w-fit text-sm font-semibold text-red-500 transition hover:text-red-600"
                  @click="handleRemove(item.productId._id, item.productId.name)"
                >
                  นำออก
                </button>
              </div>

              <div
                class="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between"
              >
                <!-- Quantity -->
                <div>
                  <p class="mb-2 text-xs font-medium text-slate-400">จำนวน</p>

                  <div
                    class="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      :disabled="isUpdatingCart || isCheckingOut || item.quantity <= 1"
                      class="flex h-10 w-10 items-center justify-center font-semibold text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
                      @click="handleDecrease(item.productId._id, item.quantity)"
                    >
                      −
                    </button>

                    <div
                      class="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 font-semibold"
                    >
                      {{ item.quantity }}
                    </div>

                    <button
                      type="button"
                      :disabled="
                        isUpdatingCart || isCheckingOut || item.quantity >= item.productId.stock
                      "
                      class="flex h-10 w-10 items-center justify-center font-semibold text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
                      @click="
                        handleIncrease(item.productId._id, item.quantity, item.productId.stock)
                      "
                    >
                      +
                    </button>
                  </div>

                  <p class="mt-2 text-xs text-slate-400">
                    Stock:
                    {{ item.productId.stock }}
                  </p>
                </div>

                <!-- Subtotal -->
                <div class="sm:text-right">
                  <p class="text-xs font-medium text-slate-400">Subtotal</p>

                  <p class="mt-1 text-xl font-bold text-slate-900">
                    ฿{{ (item.productId.price * item.quantity).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- Summary -->
      <aside>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <div>
            <p class="text-sm font-semibold text-orange-500">Order Summary</p>

            <h2 class="mt-1 text-xl font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>
          </div>

          <div class="mt-6 space-y-4 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500"> จำนวนสินค้า </span>

              <span class="font-semibold text-slate-900"> {{ totalItems }} ชิ้น </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500"> ค่าสินค้า </span>

              <span class="font-semibold text-slate-900"> ฿{{ totalPrice.toLocaleString() }} </span>
            </div>
          </div>

          <div class="mt-6 border-t border-slate-200 pt-5">
            <div class="flex items-end justify-between gap-4">
              <span class="font-semibold text-slate-700"> ยอดรวม </span>

              <div class="text-right">
                <p class="text-3xl font-bold text-orange-600">฿{{ totalPrice.toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            :disabled="isUpdatingCart || isCheckingOut || totalItems === 0"
            class="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleCheckout"
          >
            {{ isCheckingOut ? 'กำลังสร้าง Order...' : 'ดำเนินการสั่งซื้อ' }}
          </button>

          <p class="mt-4 text-center text-xs leading-5 text-slate-400">
            ระบบจะตรวจสอบ Stock และราคาปัจจุบันอีกครั้งก่อนสร้าง Order
          </p>
        </div>
      </aside>
    </div>
  </main>
  <AppConfirmDialog
    :open="pendingRemoval !== null"
    :title="pendingRemoval === 'all' ? 'ล้างตะกร้าสินค้า?' : 'นำสินค้าออกจากตะกร้า?'"
    :description="removalDescription"
    :confirm-label="pendingRemoval === 'all' ? 'ล้างตะกร้า' : 'นำสินค้าออก'"
    :busy="isUpdatingCart"
    :error="errorMessage"
    :fallback-focus="cartHeading"
    @confirm="confirmRemoval"
    @cancel="cancelRemoval"
  />
  <AppConfirmDialog
    :open="showCheckoutConfirmation"
    title="ยืนยันการสั่งซื้อ"
    :description="`สั่งซื้อสินค้าทั้งหมด ${totalItems} ชิ้น เป็นเงิน ฿${totalPrice.toLocaleString()} ระบบจะตรวจสอบ Stock และราคาปัจจุบันอีกครั้งก่อนสร้างคำสั่งซื้อ`"
    confirm-label="ยืนยันสั่งซื้อ"
    cancel-label="ตรวจสอบตะกร้าอีกครั้ง"
    busy-label="กำลังสร้าง Order..."
    intent="primary"
    :busy="isCheckingOut"
    :error="errorMessage"
    :fallback-focus="cartHeading"
    @confirm="confirmCheckout"
    @cancel="cancelCheckout"
  />
</template>
