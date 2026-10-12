<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/get-error-message'

const router = useRouter()

const authStore = useAuthStore()
const toastStore = useToastStore()

const username = ref('')
const password = ref('')

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async (): Promise<void> => {
  if (isLoading.value) {
    return
  }

  errorMessage.value = ''

  if (!username.value.trim() || !password.value) {
    errorMessage.value =
      'กรุณากรอก Username และ Password'

    return
  }

  isLoading.value = true

  try {
    await authStore.login(
      username.value.trim(),
      password.value,
    )

    toastStore.success('เข้าสู่ระบบสำเร็จ')

    await router.push({
      name: authStore.isAdmin
        ? 'admin-users'
        : 'products',
    })
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'เข้าสู่ระบบไม่สำเร็จ',
    )

    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
    <!-- Left Branding -->
    <section
      class="hidden bg-linear-to-br from-orange-500 to-orange-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
            S
          </div>

          <div>
            <h1 class="text-2xl font-bold">ShopFlow</h1>

            <p class="text-sm text-orange-100">E-commerce Workshop</p>
          </div>
        </div>
      </div>

      <div class="max-w-xl">
        <p class="text-sm font-medium uppercase tracking-[0.25em] text-orange-100">
          Simple. Fast. Connected.
        </p>

        <h2 class="mt-5 text-5xl font-bold leading-tight">
          ระบบร้านค้า ที่เชื่อมทั้ง Customer และ Admin
        </h2>

        <p class="mt-6 max-w-lg text-lg leading-8 text-orange-100">
          เลือกสินค้า จัดการตะกร้า สั่งซื้อ และติดตาม Order ภายในระบบเดียว
        </p>

        <div class="mt-10 grid grid-cols-3 gap-4">
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p class="text-2xl font-bold">Cart</p>

            <p class="mt-1 text-sm text-orange-100">Manage items</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p class="text-2xl font-bold">Order</p>

            <p class="mt-1 text-sm text-orange-100">Track status</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p class="text-2xl font-bold">Admin</p>

            <p class="mt-1 text-sm text-orange-100">Manage system</p>
          </div>
        </div>
      </div>

      <p class="text-sm text-orange-100">Vue 3 · TypeScript · Tailwind CSS</p>
    </section>

    <!-- Right Login -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold text-white">
            S
          </div>

          <div>
            <h1 class="font-bold text-slate-900">ShopFlow</h1>

            <p class="text-sm text-slate-500">E-commerce Workshop</p>
          </div>
        </div>

        <div class="mb-8">
          <p class="text-sm font-semibold text-orange-500">Welcome back</p>

          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">เข้าสู่ระบบ</h2>

          <p class="mt-2 text-slate-500">เข้าสู่ระบบเพื่อจัดการบัญชี และใช้งานร้านค้า</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>

            <input id="username" v-model="username" type="text" autocomplete="username" placeholder="กรอก Username"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input id="password" v-model="password" type="password" autocomplete="current-password"
              placeholder="กรอก Password"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
          </div>

          <div v-if="errorMessage" role="alert"
            class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="isLoading"
            class="w-full rounded-xl bg-orange-500 px-4 py-3.5 font-semibold text-white transition hover:bg-orange-600 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50">
            {{
              isLoading
                ? 'กำลังเข้าสู่ระบบ...'
                : 'เข้าสู่ระบบ'
            }}
          </button>
        </form>

        <div class="mt-8 border-t border-slate-200 pt-6 text-center">
          <p class="text-sm text-slate-500">ยังไม่มีบัญชี?</p>

          <RouterLink to="/register"
            class="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
            สมัครสมาชิก
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
