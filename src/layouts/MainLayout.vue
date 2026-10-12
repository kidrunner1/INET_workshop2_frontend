<script setup lang="ts">
import {
  computed,
  onMounted,
} from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()

const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

// Navigation

const navigationItems = [
  {
    label: 'รายการสินค้า',
    description: 'เลือกซื้อสินค้า',
    routeName: 'products',
  },
  {
    label: 'ออเดอร์ของฉัน',
    description: 'ติดตามคำสั่งซื้อ',
    routeName: 'orders',
  },
] as const

// Computed

const username = computed(() => {
  return authStore.user?.username ?? 'Customer'
})

const userInitial = computed(() => {
  return username.value
    .charAt(0)
    .toUpperCase()
})

const roleLabel = computed(() => {
  return authStore.isAdmin
    ? 'Administrator'
    : 'Customer'
})

// Actions

const handleLogout = async (): Promise<void> => {
  authStore.logout()
  cartStore.clearState()

  await router.push({
    name: 'login',
  })

  toastStore.success('ออกจากระบบแล้ว')
}

// Lifecycle

onMounted(async () => {
  await cartStore.fetchCart()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
         <!-- Announcement Bar -->

    <div class="hidden border-b border-orange-100 bg-orange-50 md:block">
      <div class="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-xs sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 font-medium text-orange-700">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h11v9H3zM14 10h3l4 4v2h-7z" />

            <circle cx="7" cy="18" r="2" />

            <circle cx="17" cy="18" r="2" />
          </svg>

          <span>
            ยินดีต้อนรับสู่ ShopFlow Store
          </span>

          <span class="text-orange-300">
            •
          </span>

          <span class="text-orange-600">
            เลือกสินค้าที่ใช่สำหรับคุณ
          </span>
        </div>

        <div class="flex items-center gap-4 text-slate-500">
          <span>
            ช้อปง่าย
          </span>

          <span class="h-3 w-px bg-slate-300" />

          <span>
            ปลอดภัย
          </span>

          <span class="h-3 w-px bg-slate-300" />

          <span>
            ติดตามออเดอร์ได้
          </span>
        </div>
      </div>
    </div>

    <!-- ========================================
         Main Header
    ========================================= -->
    <header
      class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div class="mx-auto flex min-h-24 max-w-7xl items-center gap-5 px-5 sm:px-6 lg:px-8">
        <!-- ========================================
             Brand
        ========================================= -->
        <RouterLink :to="{ name: 'products' }"
          class="group flex shrink-0 items-center gap-3.5 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          aria-label="ShopFlow Store">
          <!-- Logo -->
          <div
            class="relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg shadow-slate-200 transition duration-300 group-hover:-translate-y-0.5">
            <span class="relative z-10">
              S
            </span>

            <div class="absolute -bottom-3 -right-3 h-8 w-8 rounded-full bg-orange-500" />
          </div>

          <!-- Brand Text -->
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-black tracking-tight text-slate-950">
                ShopFlow
              </span>

              <span
                class="hidden rounded-md bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 sm:inline">
                Store
              </span>
            </div>

            <p class="mt-0.5 hidden text-[11px] font-medium tracking-wide text-slate-400 sm:block">
              Gaming & Accessories
            </p>
          </div>
        </RouterLink>

        <!-- Divider -->
        <div class="hidden h-9 w-px bg-slate-200 lg:block" />

        <!-- ========================================
             Desktop Navigation
        ========================================= -->
        <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <RouterLink v-for="item in navigationItems" :key="item.routeName" :to="{ name: item.routeName }"
            class="group relative rounded-xl px-4 py-2.5 transition duration-200 hover:bg-slate-50"
            active-class="bg-orange-50">
            <div class="flex items-center gap-2.5">
              <!-- Product icon -->
              <svg v-if="item.routeName === 'products'"
                class="h-5 w-5 text-slate-400 transition group-hover:text-orange-500" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

                <path stroke-linecap="round" stroke-linejoin="round" d="m4 7.5 8 4.5 8-4.5M12 12v9" />
              </svg>

              <!-- Order icon -->
              <svg v-else class="h-5 w-5 text-slate-400 transition group-hover:text-orange-500" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-4 2-4-2-3 2V4a1 1 0 0 1 1-1Z" />

                <path stroke-linecap="round" d="M8 8h8M8 12h6" />
              </svg>

              <div>
                <p class="text-sm font-semibold text-slate-700 transition group-hover:text-slate-950">
                  {{ item.label }}
                </p>

                <p class="hidden text-[10px] text-slate-400 xl:block">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </RouterLink>
        </nav>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- ========================================
             Cart
        ========================================= -->
        <RouterLink :to="{ name: 'cart' }"
          class="group relative hidden items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-200 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-100 sm:flex"
          aria-label="ตะกร้าสินค้า">
          <div class="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />

              <circle cx="10" cy="20" r="1" />

              <circle cx="18" cy="20" r="1" />
            </svg>

            <span v-if="cartStore.itemCount > 0"
              class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white ring-2 ring-slate-950 transition group-hover:bg-slate-950 group-hover:ring-orange-500">
              {{
                cartStore.itemCount > 99
                  ? '99+'
                  : cartStore.itemCount
              }}
            </span>
          </div>

          <div class="hidden text-left xl:block">
            <p class="text-[10px] font-medium text-white/60">
              ตะกร้าของคุณ
            </p>

            <p class="text-sm font-bold">
              {{
                cartStore.itemCount > 0
                  ? `${cartStore.itemCount} รายการ`
                  : 'ยังไม่มีสินค้า'
              }}
            </p>
          </div>
        </RouterLink>

        <!-- ========================================
             User
        ========================================= -->
        <div class="flex items-center gap-3">
          <!-- User Info -->
          <div class="hidden text-right md:block">
            <p class="max-w-32 truncate text-sm font-bold text-slate-800">
              {{ username }}
            </p>

            <div class="mt-0.5 flex items-center justify-end gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span class="text-[11px] font-medium text-slate-400">
                {{ roleLabel }}
              </span>
            </div>
          </div>

          <!-- Avatar -->
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-sm font-black text-orange-600"
            :title="username">
            {{ userInitial }}
          </div>

          <!-- Logout -->
          <button type="button"
            class="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            title="ออกจากระบบ" aria-label="ออกจากระบบ" @click="handleLogout">
            <svg class="h-5 w-5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 8l4 4-4 4M18 12H8" />

              <path stroke-linecap="round" stroke-linejoin="round"
                d="M11 5V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a1 1 0 0 0 1-1v-1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- ========================================
           Mobile Navigation
      ========================================= -->
      <nav class="border-t border-slate-100 bg-white px-4 py-2 lg:hidden" aria-label="Mobile navigation">
        <div class="mx-auto flex max-w-xl items-center gap-1">
          <RouterLink v-for="item in navigationItems" :key="item.routeName" :to="{ name: item.routeName }"
            class="flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            active-class="bg-orange-50 !text-orange-600">
            {{ item.label }}
          </RouterLink>

          <RouterLink :to="{ name: 'cart' }"
            class="relative flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 sm:hidden"
            active-class="bg-orange-50 !text-orange-600">
            ตะกร้า

            <span v-if="cartStore.itemCount > 0"
              class="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
              {{ cartStore.itemCount }}
            </span>
          </RouterLink>
        </div>
      </nav>
    </header>

         <!-- Page Content -->

    <main>
      <RouterView />
    </main>


    <footer class="mt-16 border-t border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
            S
          </div>

          <div>
            <p class="font-semibold text-slate-600">
              ShopFlow Store
            </p>

            <p class="text-xs">
              Gaming & Accessories
            </p>
          </div>
        </div>

        <p class="text-xs">
          ShopFlow • Smart shopping experience
        </p>
      </div>
    </footer>
  </div>
</template>
