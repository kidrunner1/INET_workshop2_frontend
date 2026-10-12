<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

import AppSkeleton from '@/components/common/AppSkeleton.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import { computed, onMounted, ref } from 'vue'

import axios from 'axios'

import { approveUser, getAdminUsers } from '@/services/user.service'

import type { AdminUser } from '@/types/user'

const toastStore = useToastStore()

const users = ref<AdminUser[]>([])

const isLoading = ref(true)
const approvingUserId = ref<string | null>(null)

const errorMessage = ref('')
const successMessage = ref('')
const search = ref('')

const fetchUsers = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await getAdminUsers()

    users.value = response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'โหลด Users ไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const filteredUsers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) {
    return users.value
  }

  return users.value.filter((user) => user.username.toLowerCase().includes(keyword))
})

const totalUsers = computed(() => users.value.length)

const pendingUsers = computed(() => users.value.filter((user) => user.status === 'pending').length)

const approvedUsers = computed(
  () => users.value.filter((user) => user.status === 'approved').length,
)

const handleApprove = async (user: AdminUser) => {
  const confirmed = window.confirm(`อนุมัติผู้ใช้ "${user.username}" หรือไม่?`)

  if (!confirmed) return

  try {
    approvingUserId.value = user._id

    errorMessage.value = ''
    successMessage.value = ''

    const response = await approveUser(user._id)

    const index = users.value.findIndex((item) => item._id === user._id)

    if (index !== -1) {
      users.value[index] = response.data
    }

    successMessage.value = `อนุมัติ ${user.username} สำเร็จ`
    toastStore.success(successMessage.value)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'Approve ไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
    }

    toastStore.error(errorMessage.value)
  } finally {
    approvingUserId.value = null
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString('th-TH')

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <section class="px-5 py-6 sm:px-8 sm:py-8">
    <div class="mx-auto max-w-7xl">
      <!-- Summary -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Users ทั้งหมด</p>

          <p class="mt-3 text-3xl font-bold text-slate-900">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ totalUsers }}</span
            >
          </p>

          <p class="mt-1 text-sm text-slate-400">บัญชีในระบบทั้งหมด</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">รออนุมัติ</p>

          <p class="mt-3 text-3xl font-bold text-orange-500">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ pendingUsers }}</span
            >
          </p>

          <p class="mt-1 text-sm text-slate-400">บัญชีที่ต้องตรวจสอบ</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-medium text-slate-500">อนุมัติแล้ว</p>

          <p class="mt-3 text-3xl font-bold text-green-600">
            <AppSkeleton v-if="isLoading" class="inline-block h-[1em] w-16 align-middle" /><span
              v-else
              >{{ approvedUsers }}</span
            >
          </p>

          <p class="mt-1 text-sm text-slate-400">สามารถเข้าสู่ระบบได้</p>
        </div>
      </div>

      <!-- Search -->
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          v-model="search"
          type="text"
          placeholder="ค้นหา Username..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
        />
      </div>

      <div
        v-if="successMessage"
        class="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>

      <!-- Table -->
      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <PageSkeleton v-if="isLoading" variant="table" label="กำลังโหลด Users..." :count="5" />

        <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-slate-500">
          ไม่พบผู้ใช้งาน
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th class="px-6 py-4">User</th>

                <th class="px-6 py-4">Role</th>

                <th class="px-6 py-4">Status</th>

                <th class="px-6 py-4">Created</th>

                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="user in filteredUsers"
                :key="user._id"
                class="transition hover:bg-slate-50/70"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600"
                    >
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>

                    <div>
                      <p class="font-semibold text-slate-900">
                        {{ user.username }}
                      </p>

                      <p class="mt-0.5 text-xs text-slate-400">
                        {{ user._id }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span
                    class="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                  >
                    {{ user.role }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <span
                    class="rounded-full px-3 py-1.5 text-xs font-semibold"
                    :class="
                      user.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-orange-50 text-orange-700'
                    "
                  >
                    {{ user.status === 'approved' ? 'Approved' : 'Pending' }}
                  </span>
                </td>

                <td class="px-6 py-4 text-sm text-slate-500">
                  {{ formatDate(user.createdAt) }}
                </td>

                <td class="px-6 py-4 text-right">
                  <button
                    v-if="user.status === 'pending' && user.role === 'user'"
                    :disabled="approvingUserId === user._id"
                    class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    @click="handleApprove(user)"
                  >
                    {{ approvingUserId === user._id ? 'กำลังอนุมัติ...' : 'Approve' }}
                  </button>

                  <span v-else class="text-sm text-slate-400"> — </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
