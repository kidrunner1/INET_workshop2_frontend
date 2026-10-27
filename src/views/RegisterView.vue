<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { register } from '@/services/auth.service'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/get-error-message'

const toastStore = useToastStore()
const route = useRoute()
const formElement = ref<HTMLFormElement | null>(null)
const form = reactive({
  firstName: '', lastName: '', email: '', phone: '',
  username: '', password: '', confirmPassword: '',
})
type Field = keyof typeof form
const errors = ref<Partial<Record<Field, string>>>({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const profileFields = [
  { key: 'firstName', label: 'ชื่อ', type: 'text', autocomplete: 'given-name', icon: 'person', max: 80, required: true },
  { key: 'lastName', label: 'นามสกุล', type: 'text', autocomplete: 'family-name', icon: 'person', max: 80, required: true },
  { key: 'email', label: 'อีเมล', type: 'email', autocomplete: 'email', icon: 'mail', max: 254, required: true },
  { key: 'phone', label: 'เบอร์โทร (ไม่บังคับ)', type: 'tel', autocomplete: 'tel', icon: 'call', max: 30, required: false },
] as const
const accountFields = [
  { key: 'username', label: 'ชื่อผู้ใช้สำหรับเข้าสู่ระบบ', autocomplete: 'username', icon: 'account_circle', max: 50 },
  { key: 'password', label: 'รหัสผ่าน', autocomplete: 'new-password', icon: 'lock', max: 72 },
  { key: 'confirmPassword', label: 'ยืนยันรหัสผ่าน', autocomplete: 'new-password', icon: 'lock_reset', max: 72 },
] as const
const steps = [
  { number: '01', title: 'กรอกข้อมูลผู้สมัคร', description: 'ระบุชื่อ อีเมล และตั้งข้อมูลเข้าสู่ระบบ', icon: 'person_add' },
  { number: '02', title: 'รอแอดมินอนุมัติ', description: 'ดูสินค้าได้ระหว่างรอตรวจสอบบัญชี', icon: 'hourglass_top' },
  { number: '03', title: 'เข้าสู่ระบบเพื่อซื้อสินค้า', description: 'เพิ่มลงตะกร้า สั่งซื้อ และติดตามออเดอร์', icon: 'shopping_bag' },
] as const

async function focusFirstError() {
  await nextTick()
  formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
function resetForm() {
  for (const key of Object.keys(form) as Field[]) form[key] = ''
  showPassword.value = false
  showConfirmPassword.value = false
}
async function handleRegister(): Promise<void> {
  if (isLoading.value) return
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = {}
  const payload = {
    firstName: form.firstName.trim(), lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(), phone: form.phone.replace(/[\s()-]/g, ''),
    username: form.username.trim(), password: form.password,
  }
  if (!payload.firstName || payload.firstName.length > 80) errors.value.firstName = 'กรอกชื่อ 1–80 ตัวอักษร'
  if (!payload.lastName || payload.lastName.length > 80) errors.value.lastName = 'กรอกนามสกุล 1–80 ตัวอักษร'
  if (payload.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
    errors.value.email = 'กรุณากรอกอีเมลให้ถูกต้อง'
  if (payload.phone && !/^\+?[0-9]{8,15}$/.test(payload.phone))
    errors.value.phone = 'เบอร์โทรต้องมี 8–15 หลัก ใส่ + รหัสประเทศได้'
  if (payload.username.length < 3 || payload.username.length > 50)
    errors.value.username = 'ชื่อผู้ใช้ต้องมี 3–50 ตัวอักษร'
  if (payload.password.length < 8) errors.value.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
  else if (new TextEncoder().encode(payload.password).length > 72)
    errors.value.password = 'รหัสผ่านยาวเกินไป กรุณาลดจำนวนตัวอักษรหรืออีโมจิ'
  if (!form.confirmPassword || form.confirmPassword !== form.password)
    errors.value.confirmPassword = 'กรุณายืนยันรหัสผ่านให้ตรงกัน'
  if (Object.keys(errors.value).length) {
    errorMessage.value = 'กรุณาตรวจสอบช่องที่ระบุ ก่อนสมัครสมาชิกอีกครั้ง'
    await focusFirstError()
    return
  }
  isLoading.value = true
  try {
    await register(payload)
    successMessage.value = 'สร้างบัญชีสำเร็จ คุณดูสินค้าได้ทันที และเข้าสู่ระบบเพื่อซื้อสินค้าได้เมื่อ Admin อนุมัติบัญชีแล้ว'
    toastStore.success('สมัครสมาชิกสำเร็จ')
    resetForm()
  } catch (error) {
    if (axios.isAxiosError(error) && Array.isArray(error.response?.data?.data)) {
      for (const issue of error.response.data.data) {
        if (typeof issue?.field !== 'string' || typeof issue.message !== 'string') continue
        const key = issue.field.replace(/^body\./, '') as Field
        if (Object.prototype.hasOwnProperty.call(form, key)) errors.value[key] = issue.message
      }
    }
    errorMessage.value = Object.keys(errors.value).length
      ? 'กรุณาตรวจสอบช่องที่ระบุ ก่อนสมัครสมาชิกอีกครั้ง'
      : getErrorMessage(error, 'สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง')
    toastStore.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
  if (Object.keys(errors.value).length) await focusFirstError()
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
    <!-- Registration guide -->
    <aside
      aria-labelledby="registration-guide-title"
      class="hidden border-r border-slate-800 bg-slate-950 text-white lg:block"
    >
      <div class="registration-guide mx-auto flex max-w-xl flex-col gap-10 px-8 py-10 xl:gap-12 xl:px-12">
        <RouterLink
          :to="{ name: 'products' }"
          aria-label="ShopFlow กลับไปดูสินค้า"
          class="inline-flex min-h-11 w-fit items-center gap-3 rounded-xl focus-visible:outline-white"
        >
          <img src="/logo-app.png" alt="" width="44" height="44" class="h-11 w-11 rounded-xl  object-contain p-1" />
          <div>
            <p class="text-xl font-bold tracking-tight">ShopFlow<span class="text-orange-400">.</span></p>
            <p class="mt-0.5 text-xs text-slate-400">อุปกรณ์ไอทีสำหรับคุณ</p>
          </div>
        </RouterLink>

        <div>
          <p class="mb-4 flex items-center gap-2 text-sm font-medium text-orange-300">
            <span aria-hidden="true" class="h-1.5 w-6 rounded-full bg-orange-400" />
            เริ่มต้นใช้งาน ShopFlow
          </p>
          <h2 id="registration-guide-title" class="text-3xl font-bold leading-snug tracking-tight xl:text-4xl">
            สร้างบัญชีของคุณ<br />
            <span class="text-orange-400">พร้อมสำหรับการซื้อครั้งต่อไป</span>
          </h2>
          <p class="mt-5 max-w-md text-sm leading-7 text-slate-300">
            กรอกข้อมูลในแบบฟอร์มเพื่อสมัครสมาชิก
            เมื่อแอดมินอนุมัติแล้ว คุณจะเข้าสู่ระบบและสั่งซื้อสินค้าได้
          </p>
        </div>

        <ol aria-label="ขั้นตอนการสมัครสมาชิก" class="space-y-0">
          <li
            v-for="(step, index) in steps"
            :key="step.number"
            :aria-current="index === (successMessage ? 1 : 0) ? 'step' : undefined"
            class="relative flex gap-4 pb-7 last:pb-0"
          >
            <span v-if="index < steps.length - 1" aria-hidden="true" class="absolute bottom-0 left-5.75 top-12 w-px bg-slate-700" />
            <div
              class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
              :class="index === (successMessage ? 1 : 0) ? 'border-orange-400/50 bg-orange-400/10 text-orange-300' : successMessage && index === 0 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'"
            >
              <span aria-hidden="true" class="material-symbols-rounded text-[23px]">{{ successMessage && index === 0 ? 'check' : step.icon }}</span>
            </div>
            <div class="min-w-0 pt-0.5">
              <p class="text-sm font-semibold leading-6" :class="index === (successMessage ? 1 : 0) ? 'text-orange-200' : 'text-slate-100'">
                <span class="mr-2 text-xs text-slate-400">{{ step.number }}</span>{{ step.title }}
              </p>
              <p class="mt-1 text-sm leading-6 text-slate-400">{{ step.description }}</p>
            </div>
          </li>
        </ol>

        <div class="border-t border-slate-800 pt-6">
          <p class="text-sm leading-6 text-slate-300">ยังไม่พร้อมสมัคร? ดูสินค้าก่อนได้เลย</p>
          <RouterLink
            :to="{ name: 'products' }"
            class="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:border-orange-400 hover:bg-slate-900 focus-visible:outline-white"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-xl">storefront</span>
            ไปดูสินค้าทั้งหมด
            <span aria-hidden="true" class="material-symbols-rounded text-lg">arrow_forward</span>
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- Register -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:min-h-0">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white"
          >
            S
          </div>

          <div>
            <h1 class="font-bold text-slate-900">ShopFlow</h1>

            <p class="text-xs text-slate-400">E-commerce Workshop</p>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <p class="text-sm font-semibold text-orange-500">Create account</p>

          <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">สมัครสมาชิก</h2>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            สร้างบัญชีเพื่อเริ่มเลือกซื้อสินค้า และใช้งานระบบ ShopFlow
          </p>
        </div>

        <!-- Form -->
        <form ref="formElement" novalidate :aria-busy="isLoading" class="space-y-5" @submit.prevent="handleRegister">
          <p v-if="errorMessage" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ errorMessage }}
          </p>
          <fieldset :disabled="isLoading" class="space-y-5">
            <legend class="mb-4 text-base font-semibold text-slate-900">ข้อมูลผู้สมัคร</legend>
            <p class="text-sm leading-6 text-slate-500">ใช้เป็นข้อมูลบัญชีให้แอดมินตรวจสอบ กรุณากรอกทุกช่องยกเว้นเบอร์โทร</p>
            <div class="grid gap-4 sm:grid-cols-2">
              <div v-for="field in profileFields" :key="field.key" :class="{ 'sm:col-span-2': field.key === 'email' || field.key === 'phone' }">
                <label :for="'register-' + field.key" class="mb-2 block text-sm font-semibold text-slate-700">{{ field.label }}</label>
                <div class="relative">
                  <span aria-hidden="true" class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">{{ field.icon }}</span>
                  <input
                    :id="'register-' + field.key"
                    v-model="form[field.key]"
                    :type="field.type"
                    :name="field.key"
                    :autocomplete="field.autocomplete"
                    :maxlength="field.max"
                    :required="field.required"
                    :aria-invalid="Boolean(errors[field.key])"
                    :aria-describedby="errors[field.key] ? 'register-' + field.key + '-error' : field.key === 'phone' ? 'register-phone-help' : undefined"
                    class="app-field min-h-12 w-full py-3 pl-10 pr-3 disabled:bg-slate-100"
                    @input="errors[field.key] = undefined"
                  />
                </div>
                <p v-if="errors[field.key]" :id="'register-' + field.key + '-error'" class="mt-2 text-sm text-red-700">{{ errors[field.key] }}</p>
                <p v-else-if="field.key === 'phone'" id="register-phone-help" class="mt-2 text-xs leading-5 text-slate-500">8–15 หลัก ใส่ + รหัสประเทศได้ เช่น +66812345678</p>
              </div>
            </div>
          </fieldset>
          <fieldset :disabled="isLoading" class="space-y-4 border-t border-slate-200 pt-5">
            <legend class="px-1 text-base font-semibold text-slate-900">ข้อมูลเข้าสู่ระบบ</legend>
            <div v-for="field in accountFields" :key="field.key">
              <label :for="'register-' + field.key" class="mb-2 block text-sm font-semibold text-slate-700">{{ field.label }}</label>
              <div class="relative">
                <span aria-hidden="true" class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">{{ field.icon }}</span>
                <input
                  :id="'register-' + field.key"
                  v-model="form[field.key]"
                  :name="field.key"
                  :type="field.key === 'username' || (field.key === 'password' ? showPassword : showConfirmPassword) ? 'text' : 'password'"
                  :autocomplete="field.autocomplete"
                  :maxlength="field.max"
                  required
                  :aria-invalid="Boolean(errors[field.key])"
                  :aria-describedby="errors[field.key] ? 'register-' + field.key + '-error' : field.key === 'password' ? 'register-password-help' : undefined"
                  class="app-field min-h-12 w-full py-3 pl-10 pr-12 disabled:bg-slate-100"
                  @input="errors[field.key] = undefined"
                />
                <button
                  v-if="field.key !== 'username'"
                  type="button"
                  :aria-label="(field.key === 'password' ? showPassword : showConfirmPassword) ? 'ซ่อน' + field.label : 'แสดง' + field.label"
                  :aria-pressed="field.key === 'password' ? showPassword : showConfirmPassword"
                  class="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  @click="field.key === 'password' ? showPassword = !showPassword : showConfirmPassword = !showConfirmPassword"
                >
                  <span aria-hidden="true" class="material-symbols-rounded text-xl">{{ (field.key === 'password' ? showPassword : showConfirmPassword) ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <p v-if="errors[field.key]" :id="'register-' + field.key + '-error'" class="mt-2 text-sm text-red-700">{{ errors[field.key] }}</p>
              <p v-else-if="field.key === 'password'" id="register-password-help" class="mt-2 text-xs leading-5 text-slate-500">อย่างน้อย 8 ตัวอักษร ใช้ตัวอักษร ตัวเลข หรือสัญลักษณ์ร่วมกัน</p>
            </div>
          </fieldset>
          <div v-if="successMessage" role="status" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            <p class="font-semibold">สมัครสมาชิกสำเร็จ</p>
            <p class="mt-1">{{ successMessage }}</p>
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <span aria-hidden="true" class="material-symbols-rounded text-xl" :class="{ 'animate-spin': isLoading }">{{ isLoading ? 'progress_activity' : 'person_add' }}</span>
            {{ isLoading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี' }}
          </button>
        </form>

        <!-- Login -->
        <div class="mt-8 border-t border-slate-200 pt-6 text-center">
          <p class="text-sm text-slate-500">มีบัญชีอยู่แล้ว?</p>

          <RouterLink
            :to="{ name: 'login', query: { redirect: route.query.redirect } }"
            class="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            กลับไปเข้าสู่ระบบ
            <span class="material-symbols-rounded align-middle text-[18px]" aria-hidden="true"
              >arrow_forward</span
            >
          </RouterLink>
          <RouterLink
            :to="{ name: 'products' }"
            class="mt-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >ดูสินค้าระหว่างรออนุมัติ</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>


<style scoped>
/* Short windows use document scrolling; tall desktops keep the guide in view. */
@media (min-width: 1024px) and (min-height: 900px) {
  .registration-guide {
    position: sticky;
    top: 0;
  }
}
</style>

