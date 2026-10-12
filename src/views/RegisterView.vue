<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { register } from '@/services/auth.service'

const toastStore = useToastStore()

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  if (isLoading.value) return
  errorMessage.value = ''
  successMessage.value = ''

  if (!username.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'

    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password และ Confirm Password ไม่ตรงกัน'

    return
  }

  try {
    isLoading.value = true

    await register({
      username: username.value,
      password: password.value,
    })

    successMessage.value = 'สมัครสมาชิกสำเร็จ กรุณารอ Admin อนุมัติก่อนเข้าสู่ระบบ'
    toastStore.success(successMessage.value)

    username.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'สมัครสมาชิกไม่สำเร็จ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด'
    }
    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const goToLogin = async () => {
  await router.push('/login')
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
    <!-- Left Branding -->
    <section
      class="hidden bg-gradient-to-br from-orange-500 to-orange-600 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div>
        <div class="inline-flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur"
          >
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
          Start your journey
        </p>

        <h2 class="mt-5 text-5xl font-bold leading-tight">
          สมัครสมาชิก แล้วเริ่มเลือกซื้อสินค้า ได้ในไม่กี่ขั้นตอน
        </h2>

        <p class="mt-6 max-w-lg text-lg leading-8 text-orange-100">
          หลังสมัครสมาชิก บัญชีจะอยู่ในสถานะ Pending และสามารถเข้าสู่ระบบได้หลังจาก Admin
          อนุมัติแล้ว
        </p>

        <div class="mt-10 space-y-4">
          <div class="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold"
            >
              1
            </div>

            <div>
              <p class="font-semibold">Create Account</p>

              <p class="mt-1 text-sm text-orange-100">กรอก Username และ Password</p>
            </div>
          </div>

          <div class="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold"
            >
              2
            </div>

            <div>
              <p class="font-semibold">Wait for Approval</p>

              <p class="mt-1 text-sm text-orange-100">Admin ตรวจสอบและอนุมัติบัญชี</p>
            </div>
          </div>

          <div class="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold"
            >
              3
            </div>

            <div>
              <p class="font-semibold">Start Shopping</p>

              <p class="mt-1 text-sm text-orange-100">Login แล้วใช้งานร้านค้าได้ทันที</p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-sm text-orange-100">Vue 3 · TypeScript · Tailwind CSS</p>
    </section>

    <!-- Right Register Form -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold text-white"
          >
            S
          </div>

          <div>
            <h1 class="font-bold text-slate-900">ShopFlow</h1>

            <p class="text-sm text-slate-500">E-commerce Workshop</p>
          </div>
        </div>

        <div class="mb-8">
          <p class="text-sm font-semibold text-orange-500">Create account</p>

          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">สมัครสมาชิก</h2>

          <p class="mt-2 text-slate-500">สร้างบัญชีใหม่เพื่อเริ่มใช้งานระบบ</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700"> Username </label>

            <input
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="อย่างน้อย 3 ตัวอักษร"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700"> Password </label>

            <input
              v-model="password"
              type="password"
              autocomplete="new-password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700"> Confirm Password </label>

            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="กรอก Password อีกครั้ง"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div
            v-if="errorMessage"
            class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <p class="font-medium">สมัครสมาชิกสำเร็จ</p>

            <p class="mt-1">กรุณารอ Admin อนุมัติบัญชีก่อนเข้าสู่ระบบ</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-xl bg-orange-500 px-4 py-3.5 font-semibold text-white transition hover:bg-orange-600 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isLoading ? 'กำลังสมัครสมาชิก...' : 'สร้างบัญชี' }}
          </button>
        </form>

        <div class="mt-8 border-t border-slate-200 pt-6 text-center">
          <p class="text-sm text-slate-500">มีบัญชีอยู่แล้ว?</p>

          <button
            type="button"
            class="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            @click="goToLogin"
          >
            กลับไปเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
