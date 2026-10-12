<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { onMounted, ref } from 'vue'

import { useRoute } from 'vue-router'
import axios from 'axios'

import { getAdminOrderById, updateAdminOrderStatus } from '@/services/order.service'

import type { AdminOrder, OrderStatus } from '@/types/order'

const toastStore = useToastStore()

const route = useRoute()

const order = ref<AdminOrder | null>(null)

const isLoading = ref(true)
const isUpdating = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
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

const getAllowedStatuses = (status: OrderStatus): OrderStatus[] => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],

    confirmed: ['processing', 'cancelled'],

    processing: ['shipped'],

    shipped: ['completed'],

    completed: [],

    cancelled: [],
  }

  return transitions[status]
}

const fetchOrder = async () => {
  try {
    isLoading.value = true

    const id = route.params.id as string

    const response = await getAdminOrderById(id)

    order.value = response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'โหลด Order ไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const handleStatusChange = async (status: OrderStatus) => {
  if (!order.value) return

  try {
    isUpdating.value = true

    errorMessage.value = ''
    successMessage.value = ''

    const response = await updateAdminOrderStatus(order.value._id, status)

    order.value = response.data

    successMessage.value = 'อัปเดตสถานะสำเร็จ'
    toastStore.success(successMessage.value)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'อัปเดตสถานะไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    isUpdating.value = false
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString('th-TH')

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <section class="px-5 py-6 sm:px-8 sm:py-8">
    <div class="mx-auto max-w-6xl">
      <RouterLink
        to="/admin/orders"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        ← กลับไป Orders
      </RouterLink>

      <PageSkeleton v-if="isLoading" variant="order-detail" label="กำลังโหลด Order..." admin />

      <div
        v-else-if="errorMessage && !order"
        class="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600"
      >
        {{ errorMessage }}
      </div>

      <div v-else-if="order" class="space-y-6">
        <div
          v-if="errorMessage"
          class="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600"
        >
          {{ errorMessage }}
        </div>
        <div
          v-if="successMessage"
          class="rounded-xl border border-green-100 bg-green-50 p-4 text-green-700"
        >
          {{ successMessage }}
        </div>

        <!-- Order Header -->
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-sm font-medium text-slate-400">Order ID</p>

              <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                #{{ order._id }}
              </h1>

              <p class="mt-2 text-sm text-slate-500">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>

            <span
              class="w-fit rounded-full px-4 py-2 text-sm font-semibold"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <!-- Products -->
          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 class="text-lg font-bold text-slate-900">รายการสินค้า</h2>

              <p class="mt-1 text-sm text-slate-500">สินค้าทั้งหมดใน Order นี้</p>
            </div>

            <div class="mt-5 divide-y divide-slate-100">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="flex justify-between gap-5 py-5"
              >
                <div>
                  <p class="font-semibold text-slate-900">
                    {{ item.name }}
                  </p>

                  <p class="mt-1 text-sm text-slate-500">
                    ฿{{ item.price.toLocaleString() }}
                    ×
                    {{ item.quantity }}
                  </p>
                </div>

                <p class="font-bold text-slate-900">฿{{ item.subtotal.toLocaleString() }}</p>
              </div>
            </div>

            <div class="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span class="font-semibold text-slate-600"> ยอดรวมทั้งหมด </span>

              <span class="text-3xl font-bold text-orange-600">
                ฿{{ order.totalPrice.toLocaleString() }}
              </span>
            </div>
          </section>

          <div class="space-y-6">
            <!-- Customer -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p class="text-sm font-medium text-slate-400">Customer</p>

              <div class="mt-4 flex items-center gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600"
                >
                  {{ order.userId?.username?.charAt(0).toUpperCase() ?? '?' }}
                </div>

                <div>
                  <p class="font-semibold text-slate-900">
                    {{ order.userId?.username ?? 'Unknown User' }}
                  </p>

                  <p class="mt-0.5 text-xs text-slate-400">
                    {{ order.userId?._id ?? '-' }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Status Action -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="font-bold text-slate-900">Update Status</h2>

              <p class="mt-1 text-sm text-slate-500">เปลี่ยนขั้นตอนการดำเนินการของ Order</p>

              <div v-if="getAllowedStatuses(order.status).length > 0" class="mt-5 space-y-3">
                <button
                  v-for="status in getAllowedStatuses(order.status)"
                  :key="status"
                  :disabled="isUpdating"
                  class="w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
                  :class="
                    status === 'cancelled'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  "
                  @click="handleStatusChange(status)"
                >
                  {{ status === 'cancelled' ? 'ยกเลิก Order' : getStatusLabel(status) }}
                </button>
              </div>

              <div v-else class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Order นี้สิ้นสุดการดำเนินการแล้ว
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
