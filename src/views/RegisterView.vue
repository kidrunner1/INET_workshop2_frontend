<script setup lang="ts">
import { ref } from 'vue'

import { register } from '@/services/auth.service'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/get-error-message'

const toastStore = useToastStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const confirmPassword = ref('')

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'กรอก Username และ Password',
  },
  {
    number: '02',
    title: 'Wait for Approval',
    description: 'รอ Admin ตรวจสอบและอนุมัติบัญชี',
  },
  {
    number: '03',
    title: 'Start Shopping',
    description: 'เข้าสู่ระบบและเริ่มเลือกซื้อสินค้า',
  },
] as const

const resetForm = (): void => {
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
}

const handleRegister = async (): Promise<void> => {
  if (isLoading.value) return

  errorMessage.value = ''
  successMessage.value = ''

  const normalizedUsername = username.value.trim()

  if (!normalizedUsername || !password.value || !confirmPassword.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }

  if (normalizedUsername.length < 3) {
    errorMessage.value = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password ต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password และ Confirm Password ไม่ตรงกัน'
    return
  }

  isLoading.value = true

  try {
    await register({
      username: normalizedUsername,
      password: password.value,
    })

    successMessage.value =
      'สร้างบัญชีสำเร็จ กรุณารอ Admin อนุมัติก่อนเข้าสู่ระบบ'

    toastStore.success('สมัครสมาชิกสำเร็จ')
    resetForm()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'สมัครสมาชิกไม่สำเร็จ',
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
          Start your journey
        </p>

        <h2 class="mt-5 max-w-xl text-5xl font-bold leading-[1.15] tracking-tight">
          สร้างบัญชี
          <span class="text-orange-500">
            ShopFlow
          </span>
          และเริ่มช้อปได้ในไม่กี่ขั้นตอน
        </h2>

        <p class="mt-6 max-w-lg text-base leading-8 text-slate-400">
          หลังสมัครสมาชิก บัญชีจะอยู่ในสถานะ Pending
          และสามารถเข้าสู่ระบบได้หลังจาก Admin อนุมัติ
        </p>

        <!-- Steps -->
        <div class="mt-10 space-y-3">
          <div v-for="step in steps" :key="step.number"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-orange-500/30 hover:bg-white/10">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-orange-400">
              {{ step.number }}
            </div>

            <div>
              <p class="font-semibold text-white">
                {{ step.title }}
              </p>

              <p class="mt-1 text-sm text-slate-400">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Register -->
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
            Create account
          </p>

          <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">
            สมัครสมาชิก
          </h2>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            สร้างบัญชีเพื่อเริ่มเลือกซื้อสินค้า
            และใช้งานระบบ ShopFlow
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleRegister">
          <!-- Username -->
          <div class="group relative">
            <span
              class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
              person
            </span>

            <input id="username" v-model="username" type="text" autocomplete="username" placeholder=" "
              class="peer h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 pt-1 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

            <label for="username" class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-white px-1.5 text-sm font-medium text-slate-400 transition-all duration-200
        peer-focus:left-3
        peer-focus:top-0
        peer-focus:text-xs
        peer-focus:font-semibold
        peer-focus:text-orange-500
        peer-not-placeholder-shown:left-3
        peer-not-placeholder-shown:top-0
        peer-not-placeholder-shown:text-xs
        peer-not-placeholder-shown:font-semibold">
              Username
            </label>
          </div>

          <!-- Password -->
          <div class="group relative">
            <span
              class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
              lock
            </span>

            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password" placeholder=" "
              class="peer h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 pt-1 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

            <label for="password" class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-white px-1.5 text-sm font-medium text-slate-400 transition-all duration-200
        peer-focus:left-3
        peer-focus:top-0
        peer-focus:text-xs
        peer-focus:font-semibold
        peer-focus:text-orange-500
        peer-not-placeholder-shown:left-3
        peer-not-placeholder-shown:top-0
        peer-not-placeholder-shown:text-xs
        peer-not-placeholder-shown:font-semibold">
              Password
            </label>

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

          <!-- Confirm Password -->
          <div class="group relative">
            <span
              class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
              lock_reset
            </span>

            <input id="confirm-password" v-model="confirmPassword" :type="showConfirmPassword
              ? 'text'
              : 'password'
              " autocomplete="new-password" placeholder=" "
              class="peer h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 pt-1 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

            <label for="confirm-password" class="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 bg-white px-1.5 text-sm font-medium text-slate-400 transition-all duration-200
        peer-focus:left-3
        peer-focus:top-0
        peer-focus:text-xs
        peer-focus:font-semibold
        peer-focus:text-orange-500
        peer-not-placeholder-shown:left-3
        peer-not-placeholder-shown:top-0
        peer-not-placeholder-shown:text-xs
        peer-not-placeholder-shown:font-semibold">
              Confirm Password
            </label>

            <button type="button"
              class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100"
              :aria-label="showConfirmPassword
                ? 'ซ่อน Confirm Password'
                : 'แสดง Confirm Password'
                " @click="
                  showConfirmPassword =
                  !showConfirmPassword
                  ">
              <span class="material-symbols-rounded text-[21px]">
                {{
                  showConfirmPassword
                    ? 'visibility_off'
                    : 'visibility'
                }}
              </span>
            </button>
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

          <!-- Success -->
          <div v-if="successMessage" role="status" class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <span class="material-symbols-rounded text-[21px]">
                  check_circle
                </span>
              </div>

              <div>
                <p class="text-sm font-bold text-emerald-700">
                  สมัครสมาชิกสำเร็จ
                </p>

                <p class="mt-1 text-sm leading-6 text-emerald-600">
                  {{ successMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="isLoading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-100 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50">
            <span class="material-symbols-rounded text-[20px]" :class="{
              'animate-spin': isLoading,
            }">
              {{
                isLoading
                  ? 'progress_activity'
                  : 'person_add'
              }}
            </span>

            {{
              isLoading
                ? 'กำลังสร้างบัญชี...'
                : 'สร้างบัญชี'
            }}
          </button>
        </form>

        <!-- Login -->
        <div class="mt-8 border-t border-slate-200 pt-6 text-center">
          <p class="text-sm text-slate-500">
            มีบัญชีอยู่แล้ว?
          </p>

          <RouterLink :to="{ name: 'login' }"
            class="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50">
            กลับไปเข้าสู่ระบบ <span class="material-symbols-rounded align-middle text-[18px]" aria-hidden="true">arrow_forward</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
