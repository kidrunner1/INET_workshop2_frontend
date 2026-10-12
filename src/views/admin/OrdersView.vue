<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

import AppSkeleton from '@/components/common/AppSkeleton.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { computed, onMounted, ref } from 'vue'

import axios from 'axios'

import { getAdminOrders, updateAdminOrderStatus } from '@/services/order.service'

import type { AdminOrder, OrderStatus } from '@/types/order'

const toastStore = useToastStore()

const orders = ref<AdminOrder[]>([])

const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

const updatingOrderId = ref<string | null>(null)

const fetchOrders = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await getAdminOrders()

    orders.value = response.data
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('th-TH')
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

const handleStatusChange = async (order: AdminOrder, newStatus: OrderStatus) => {
  try {
    updatingOrderId.value = order._id

    errorMessage.value = ''
    successMessage.value = ''

    const response = await updateAdminOrderStatus(order._id, newStatus)

    const index = orders.value.findIndex((item) => item._id === order._id)

    if (index !== -1) {
      orders.value[index] = response.data
    }

    successMessage.value = 'อัปเดตสถานะ Order สำเร็จ'
    toastStore.success(successMessage.value)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'อัปเดตสถานะไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    updatingOrderId.value = null
  }
}

const totalOrders = computed(() => orders.value.length)

const pendingOrders = computed(
  () => orders.value.filter((order) => order.status === 'pending').length,
)

const completedOrders = computed(
  () => orders.value.filter((order) => order.status === 'completed').length,
)

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <section class="p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>

        <p class="mt-1 text-gray-500">จัดการคำสั่งซื้อของลูกค้า</p>
      </div>

      <div class="mb-6 grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Orders ทั้งหมด</p>

          <p class="mt-2 text-3xl font-bold">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ totalOrders }}</span
            >
          </p>
        </div>

        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">รอดำเนินการ</p>

          <p class="mt-2 text-3xl font-bold text-orange-500">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ pendingOrders }}</span
            >
          </p>
        </div>

        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">สำเร็จแล้ว</p>

          <p class="mt-2 text-3xl font-bold text-green-600">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ completedOrders }}</span
            >
          </p>
        </div>
      </div>

      <div v-if="successMessage" class="mb-5 rounded-lg bg-green-50 p-4 text-green-600">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
        {{ errorMessage }}
      </div>

      <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <PageSkeleton
          v-if="isLoading"
          variant="table"
          label="กำลังโหลด Orders..."
          :count="5"
          :columns="7"
        />

        <div v-else-if="orders.length === 0" class="p-10 text-center text-gray-500">
          ยังไม่มี Order
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b bg-gray-50 text-sm text-gray-500">
              <tr>
                <th class="px-6 py-4">Order</th>

                <th class="px-6 py-4">Customer</th>

                <th class="px-6 py-4">Items</th>

                <th class="px-6 py-4">Total</th>

                <th class="px-6 py-4">Status</th>

                <th class="px-6 py-4">Date</th>

                <th class="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in orders" :key="order._id" class="border-b last:border-0">
                <td class="px-6 py-4">
                  <RouterLink
                    :to="`/admin/orders/${order._id}`"
                    class="font-medium text-gray-900 hover:text-orange-500"
                  >
                    {{ order._id.slice(-8) }}
                  </RouterLink>
                </td>

                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900">
                    {{ order.userId?.username ?? 'Unknown User' }}
                  </p>

                  <p class="text-xs text-gray-400">
                    {{ order.userId?._id ?? '-' }}
                  </p>
                </td>

                <td class="px-6 py-4">
                  {{ order.items.reduce((total, item) => total + item.quantity, 0) }}
                </td>

                <td class="px-6 py-4">
                  <span class="font-semibold text-orange-600">
                    ฿{{ order.totalPrice.toLocaleString() }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <span class="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>

                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(order.createdAt) }}
                </td>

                <td class="px-6 py-4">
                  <select
                    v-if="getAllowedStatuses(order.status).length > 0"
                    :disabled="updatingOrderId === order._id"
                    class="rounded-lg border px-3 py-2 text-sm"
                    @change="
                      handleStatusChange(
                        order,
                        ($event.target as HTMLSelectElement).value as OrderStatus,
                      )
                    "
                  >
                    <option value="">เปลี่ยนสถานะ</option>

                    <option
                      v-for="status in getAllowedStatuses(order.status)"
                      :key="status"
                      :value="status"
                    >
                      {{ getStatusLabel(status) }}
                    </option>
                  </select>

                  <span v-else class="text-sm text-gray-400"> Final </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
