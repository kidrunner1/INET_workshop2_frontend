<script setup lang="ts">
import { withMinimumLoading } from '@/utils/with-minimum-loading'

import { useToastStore } from '@/stores/toast.store'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { onMounted, ref } from 'vue'

import axios from 'axios'

import { getMyOrders } from '@/services/order.service'

import type { Order, OrderStatus } from '@/types/order'

const toastStore = useToastStore()

const orders = ref<Order[]>([])

const isLoading = ref(true)
const errorMessage = ref('')

const fetchOrders = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await withMinimumLoading(() => getMyOrders())

    orders.value = response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'โหลด Orders ไม่สำเร็จ'
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

const getTotalQuantity = (order: Order) =>
  order.items.reduce((total, item) => total + item.quantity, 0)

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Order History
        </p>

        <h1 class="mt-2 text-xl font-bold tracking-tight text-slate-900">คำสั่งซื้อของฉัน</h1>

        <p class="mt-2 text-sm text-slate-500">
          ตรวจสอบรายการสั่งซื้อ และติดตามสถานะของแต่ละ Order
        </p>
      </div>

      <RouterLink to="/products"
        class="inline-flex w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
        เลือกซื้อสินค้าเพิ่ม
      </RouterLink>
    </div>

    <!-- Loading -->
    <PageSkeleton v-if="isLoading" variant="orders" label="กำลังโหลด Orders..." class="mt-6" />

    <!-- Error -->
    <div v-else-if="errorMessage" class="mt-6 rounded-xl border border-red-100 bg-red-50 p-5 text-red-600">
      {{ errorMessage }}
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0"
      class="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-orange-50 text-xl">
        <span class="material-symbols-rounded align-middle text-[32px]" aria-hidden="true">inventory_2</span>
      </div>

      <h2 class="mt-5 text-xl font-bold text-slate-900">ยังไม่มีคำสั่งซื้อ</h2>

      <p class="mt-2 text-sm text-slate-500">เมื่อคุณ Checkout แล้ว Order จะมาแสดงที่หน้านี้</p>

      <RouterLink to="/products"
        class="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
        ไปเลือกสินค้า
      </RouterLink>
    </div>

    <!-- Orders -->
    <div v-else class="mt-6 space-y-4">
      <article v-for="order in orders" :key="order._id"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 sm:p-6">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <RouterLink :to="`/orders/${order._id}`"
                class="text-lg font-bold text-slate-900 transition hover:text-orange-600">
                Order #{{ order._id.slice(-8) }}
              </RouterLink>

              <span class="rounded-full px-3 py-1.5 text-xs font-semibold" :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>

            <p class="mt-2 text-sm text-slate-500">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:min-w-[420px]">
            <div>
              <p class="text-xs font-medium text-slate-400">รายการสินค้า</p>

              <p class="mt-1 font-semibold text-slate-900">
                {{ order.items.length }}
                รายการ
              </p>
            </div>

            <div>
              <p class="text-xs font-medium text-slate-400">จำนวนทั้งหมด</p>

              <p class="mt-1 font-semibold text-slate-900">
                {{ getTotalQuantity(order) }}
                ชิ้น
              </p>
            </div>

            <div class="col-span-2 sm:col-span-1">
              <p class="text-xs font-medium text-slate-400">ยอดรวม</p>

              <p class="mt-1 text-xl font-bold text-orange-600">
                ฿{{ order.totalPrice.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Product Preview -->
        <div class="mt-5 border-t border-slate-100 pt-5">
          <div class="flex flex-col gap-3">
            <div v-for="item in order.items.slice(0, 2)" :key="item.productId"
              class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-slate-700">
                  {{ item.name }}
                </p>

                <p class="mt-1 text-xs text-slate-400">
                  {{ item.quantity }}
                  × ฿{{ item.price.toLocaleString() }}
                </p>
              </div>

              <p class="shrink-0 text-sm font-semibold text-slate-700">
                ฿{{ item.subtotal.toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-between">
            <p v-if="order.items.length > 2" class="text-xs text-slate-400">
              และอีก
              {{ order.items.length - 2 }}
              รายการ
            </p>

            <span v-else />

            <RouterLink :to="`/orders/${order._id}`"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
              ดูรายละเอียด
            </RouterLink>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
