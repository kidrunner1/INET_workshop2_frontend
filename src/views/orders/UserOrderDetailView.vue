<script setup lang="ts">
import { withMinimumLoading } from '@/utils/with-minimum-loading'

import { useToastStore } from '@/stores/toast.store'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { computed, onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'

import axios from 'axios'

import { getMyOrderById } from '@/services/order.service'

import type { Order, OrderStatus } from '@/types/order'

const toastStore = useToastStore()

const route = useRoute()

const order = ref<Order | null>(null)

const isLoading = ref(true)
const errorMessage = ref('')

const orderId = computed(() => route.params.id as string)

const fetchOrder = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await withMinimumLoading(() => getMyOrderById(orderId.value))

    order.value = response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'โหลด Order ไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด'
    }
    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    pending: 'รอดำเนินการ',
    confirmed: 'ยืนยันแล้ว',
    processing: 'กำลังจัดเตรียม',
    shipped: 'จัดส่งแล้ว',
    completed: 'สำเร็จ',
    cancelled: 'ยกเลิก',
  }

  return labels[status]
}

const getStatusClass = (status: OrderStatus) => {
  const classes: Record<OrderStatus, string> = {
    pending: 'bg-orange-50 text-orange-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-amber-50 text-amber-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  }

  return classes[status]
}

const formatDate = (date: string) => new Date(date).toLocaleString('th-TH')

const totalQuantity = computed(
  () => order.value?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
)

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
    <RouterLink to="/orders"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600">
      <span class="material-symbols-rounded align-middle text-[20px]" aria-hidden="true">arrow_back</span> กลับไป My Orders
    </RouterLink>

    <!-- Loading -->
    <PageSkeleton v-if="isLoading" variant="order-detail" label="กำลังโหลด Order..." class="mt-6" />

    <!-- Error -->
    <div v-else-if="errorMessage" class="mt-6 rounded-xl border border-red-100 bg-red-50 p-5 text-red-600">
      {{ errorMessage }}
    </div>

    <div v-else-if="order" class="mt-6 space-y-6">
      <!-- Header -->
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.15em] text-orange-500">
              Order Detail
            </p>

            <h1 class="mt-2 break-all text-xl font-bold tracking-tight text-slate-900 sm:text-xl">
              #{{ order._id }}
            </h1>

            <p class="mt-2 text-sm text-slate-500">
              สั่งซื้อเมื่อ
              {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <span class="w-fit rounded-full px-4 py-2 text-sm font-semibold" :class="getStatusClass(order.status)">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-[1fr_340px]">
        <!-- Products -->
        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-end justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">รายการสินค้า</h2>

              <p class="mt-1 text-sm text-slate-500">
                {{ order.items.length }}
                รายการ ·
                {{ totalQuantity }}
                ชิ้น
              </p>
            </div>
          </div>

          <div class="mt-5 divide-y divide-slate-100">
            <article v-for="item in order.items" :key="item.productId" class="py-5 first:pt-0 last:pb-0">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900">
                    {{ item.name }}
                  </p>

                  <p class="mt-2 text-sm text-slate-500">
                    ราคาต่อชิ้น ฿{{ item.price.toLocaleString() }}
                  </p>

                  <p class="mt-1 text-sm text-slate-500">
                    จำนวน
                    {{ item.quantity }}
                    ชิ้น
                  </p>
                </div>

                <div class="sm:text-right">
                  <p class="text-xs font-medium text-slate-400">Subtotal</p>

                  <p class="mt-1 text-xl font-bold text-slate-900">
                    ฿{{ item.subtotal.toLocaleString() }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Right -->
        <aside class="space-y-6">
          <!-- Summary -->
          <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold text-orange-500">Order Summary</p>

            <h2 class="mt-1 text-lg font-bold text-slate-900">สรุปคำสั่งซื้อ</h2>

            <div class="mt-6 space-y-4 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-slate-500"> จำนวนรายการ </span>

                <span class="font-semibold text-slate-900">
                  {{ order.items.length }}
                  รายการ
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-slate-500"> จำนวนสินค้า </span>

                <span class="font-semibold text-slate-900">
                  {{ totalQuantity }}
                  ชิ้น
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-slate-500"> สถานะ </span>

                <span class="font-semibold text-slate-900">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>

            <div class="mt-6 border-t border-slate-200 pt-5">
              <div class="flex items-end justify-between">
                <span class="font-semibold text-slate-600"> ยอดรวม </span>

                <span class="text-xl font-bold text-orange-600">
                  ฿{{ order.totalPrice.toLocaleString() }}
                </span>
              </div>
            </div>
          </section>

          <!-- Status -->
          <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="font-bold text-slate-900">สถานะคำสั่งซื้อ</h2>

            <p class="mt-1 text-sm text-slate-500">ติดตามขั้นตอนปัจจุบันของ Order</p>

            <div class="mt-5 rounded-xl bg-slate-50 p-4">
              <span class="inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>

              <p class="mt-3 text-sm leading-6 text-slate-500">
                {{
                  order.status === 'pending'
                    ? 'กำลังรอ Admin ตรวจสอบคำสั่งซื้อ'
                    : order.status === 'confirmed'
                      ? 'Admin ยืนยันคำสั่งซื้อแล้ว'
                      : order.status === 'processing'
                        ? 'กำลังจัดเตรียมสินค้า'
                        : order.status === 'shipped'
                          ? 'สินค้าอยู่ระหว่างการจัดส่ง'
                          : order.status === 'completed'
                            ? 'คำสั่งซื้อนี้ดำเนินการเสร็จสมบูรณ์แล้ว'
                            : 'คำสั่งซื้อนี้ถูกยกเลิก'
                }}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </main>
</template>
