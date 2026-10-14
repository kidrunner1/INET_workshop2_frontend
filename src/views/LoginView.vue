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
const showPassword = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')

const features = [
  { title: 'Cart', text: 'จัดการสินค้าในตะกร้า' },
  { title: 'Order', text: 'ติดตามสถานะคำสั่งซื้อ' },
  { title: 'Admin', text: 'จัดการระบบร้านค้า' },
] as const

const handleLogin = async (): Promise<void> => {
  if (isLoading.value) return

  const normalizedUsername = username.value.trim()
  errorMessage.value = ''

  if (!normalizedUsername || !password.value) {
    errorMessage.value = 'กรุณากรอก Username และ Password'
    return
  }

  isLoading.value = true

  try {
    await authStore.login(normalizedUsername, password.value)

    toastStore.success('เข้าสู่ระบบสำเร็จ')

    await router.push({
      name: authStore.isAdmin ? 'admin-users' : 'products',
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
  <main class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
    <!-- Branding -->
    <section
      class="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <!-- Background -->
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full" />
      <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-orange-600/10 blur-xl" />

      <!-- Logo -->
      <div class="relative flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
          <img src="/logo-app.png" alt="ShopFlow logo" class="h-full w-full object-cover" />
        </div>

        <div>
          <h1 class="text-xl font-bold tracking-tight">
            ShopFlow
          </h1>

          <p class="text-xs text-slate-400">
            E-commerce Workshop
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="relative max-w-xl">
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
          Simple · Fast · Connected
        </p>

        <h2 class="mt-5 max-w-xl text-5xl font-bold leading-[1.15] tracking-tight">
          ระบบร้านค้าที่เชื่อม
          <span class="text-orange-500">
            Customer
          </span>
          และ Admin
        </h2>

        <p class="mt-6 max-w-lg text-base leading-8 text-slate-400">
          เลือกสินค้า จัดการตะกร้า สั่งซื้อ
          และติดตามสถานะ Order ภายในระบบเดียว
        </p>

        <!-- Features -->
        <div class="mt-10 grid grid-cols-3 gap-3">
          <div v-for="feature in features" :key="feature.title"
            class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-orange-500/30 hover:bg-white/10">
            <p class="font-bold text-white">
              {{ feature.title }}
            </p>

            <p class="mt-1 text-xs leading-5 text-slate-400">
              {{ feature.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Login -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white">
            S
          </div>

          <div>
            <h1 class="font-bold text-slate-900">
              ShopFlow
            </h1>

            <p class="text-xs text-slate-400">
              E-commerce Workshop
            </p>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <p class="text-sm font-semibold text-orange-500">
            Welcome back
          </p>

          <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">
            เข้าสู่ระบบ
          </h2>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            เข้าสู่ระบบเพื่อเลือกซื้อสินค้า
            และจัดการบัญชีของคุณ
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Username -->
          <div>
            <div class="group relative">
              <!-- Icon -->
              <span
                class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
                person
              </span>

              <!-- Input -->
              <input id="username" v-model="username" type="text" autocomplete="username" placeholder=" "
                class="peer h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 pt-1 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

              <!-- Floating Label -->
              <label for="username" class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-white px-1.5 text-sm font-medium text-slate-400 transition-all duration-200
          peer-focus:top-0
          peer-focus:left-3
          peer-focus:text-xs
          peer-focus:font-semibold
          peer-focus:text-orange-500
          peer-not-placeholder-shown:top-0
          peer-not-placeholder-shown:left-3
          peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:font-semibold">
                Username
              </label>
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="group relative">
              <!-- Icon -->
              <span
                class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
                lock
              </span>

              <!-- Input -->
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" placeholder=" "
                class="peer h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 pt-1 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

              <!-- Floating Label -->
              <label for="password" class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-white px-1.5 text-sm font-medium text-slate-400 transition-all duration-200
          peer-focus:top-0
          peer-focus:left-3
          peer-focus:text-xs
          peer-focus:font-semibold
          peer-focus:text-orange-500
          peer-not-placeholder-shown:top-0
          peer-not-placeholder-shown:left-3
          peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:font-semibold">
                Password
              </label>

              <!-- Show / Hide Password -->
              <button type="button"
                class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100"
                :aria-label="showPassword
                  ? 'ซ่อน Password'
                  : 'แสดง Password'
                  " @click="showPassword = !showPassword">
                <span class="material-symbols-rounded text-[21px]">
                  {{
                    showPassword
                      ? 'visibility_off'
                      : 'visibility'
                  }}
                </span>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMessage" role="alert"
            class="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span class="material-symbols-rounded mt-0.5 text-[19px]">
              error
            </span>

            <span>
              {{ errorMessage }}
            </span>
          </div>

          <!-- Login Button -->
          <button type="submit" :disabled="isLoading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50">
            <span class="material-symbols-rounded text-[20px]" :class="{
              'animate-spin': isLoading,
            }">
              {{
                isLoading
                  ? 'progress_activity'
                  : 'login'
              }}
            </span>

            {{
              isLoading
                ? 'กำลังเข้าสู่ระบบ...'
                : 'เข้าสู่ระบบ'
            }}
          </button>
        </form>

        <!-- Register -->
        <div class="mt-8 border-t border-slate-200 pt-6 text-center">
          <p class="text-sm text-slate-500">
            ยังไม่มีบัญชี?
          </p>

          <RouterLink :to="{ name: 'register' }"
            class="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50">
            สมัครสมาชิก <span class="material-symbols-rounded align-middle text-[18px]" aria-hidden="true">arrow_forward</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
