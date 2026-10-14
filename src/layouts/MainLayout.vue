<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()

const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const navigationItems = [
  {
    label: 'รายการสินค้า',
    description: 'เลือกซื้อสินค้า',
    routeName: 'products',
    icon: 'inventory_2',
  },
  {
    label: 'ออเดอร์ของฉัน',
    description: 'ติดตามคำสั่งซื้อ',
    routeName: 'orders',
    icon: 'receipt_long',
  },
] as const

const username = computed(
  () => authStore.user?.username ?? 'Customer',
)

const userInitial = computed(() =>
  username.value.charAt(0).toUpperCase(),
)

const roleLabel = computed(() =>
  authStore.isAdmin ? 'Administrator' : 'Customer',
)

const handleLogout = async (): Promise<void> => {
  authStore.logout()
  cartStore.clearState()

  await router.push({ name: 'login' })

  toastStore.success('ออกจากระบบแล้ว')
}

onMounted(async () => {
  await cartStore.fetchCart()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Announcement -->
    <div class="hidden border-b border-orange-100 bg-orange-50 md:block">
      <div class="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-xs sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 font-medium text-orange-700">
          <span class="material-symbols-rounded text-[17px]">
            local_shipping
          </span>

          <span>
            ยินดีต้อนรับสู่ ShopFlow Store
          </span>

          <span class="text-orange-600">
            เลือกสินค้าที่ใช่สำหรับคุณ
          </span>
        </div>

        <div class="flex items-center gap-4 text-slate-500">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-rounded text-[16px]">
              shopping_bag
            </span>

            <span>ช้อปง่าย</span>
          </div>

          <span class="h-3 w-px bg-slate-300" />

          <div class="flex items-center gap-1.5">
            <span class="material-symbols-rounded text-[16px]">
              verified_user
            </span>

            <span>ปลอดภัย</span>
          </div>

          <span class="h-3 w-px bg-slate-300" />

          <div class="flex items-center gap-1.5">
            <span class="material-symbols-rounded text-[16px]">
              package_2
            </span>

            <span>ติดตามออเดอร์ได้</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div class="mx-auto flex min-h-24 max-w-7xl items-center gap-5 px-5 sm:px-6 lg:px-8">
        <!-- Brand -->
        <RouterLink :to="{ name: 'products' }"
          class="group flex shrink-0 items-center gap-3.5 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          aria-label="ShopFlow Store">
          <!-- logo -->
          <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white">
            <img src="/logo-app.png" alt="ShopFlow logo" class="h-full w-full object-cover" />
          </div>

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
          </div>
        </RouterLink>

        <div class="hidden h-9 w-px bg-slate-200 lg:block" />

        <!-- Desktop Navigation -->
        <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <RouterLink v-for="item in navigationItems" :key="item.routeName" :to="{ name: item.routeName }"
            class="group rounded-xl px-4 py-2.5 transition hover:bg-slate-50" active-class="bg-orange-50">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-rounded text-[21px] text-slate-400 transition group-hover:text-orange-500">
                {{ item.icon }}
              </span>

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

        <div class="flex-1" />

        <!-- Cart -->
        <RouterLink :to="{ name: 'cart' }"
          class="group relative hidden items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-100 sm:flex">
          <div class="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <span class="material-symbols-rounded text-[21px]">
              shopping_cart
            </span>

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
            <p class="text-[10px] text-white/60">
              ตะกร้าของคุณ
            </p>

            <p class="text-sm font-bold">
              {{
                cartStore.itemCount
                  ? `${cartStore.itemCount} รายการ`
                  : 'ยังไม่มีสินค้า'
              }}
            </p>
          </div>
        </RouterLink>

        <!-- User -->
        <div class="flex items-center gap-3">
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

          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-sm font-black text-orange-600">
            {{ userInitial }}
          </div>

          <!-- Logout -->
          <button type="button"
            class="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
            title="ออกจากระบบ" aria-label="ออกจากระบบ" @click="handleLogout">
            <span class="material-symbols-rounded text-[21px] transition group-hover:translate-x-0.5">
              logout
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav class="border-t border-slate-100 bg-white px-4 py-2 lg:hidden" aria-label="Mobile navigation">
        <div class="mx-auto flex max-w-xl items-center gap-1">
          <RouterLink v-for="item in navigationItems" :key="item.routeName" :to="{ name: item.routeName }"
            class="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            active-class="bg-orange-50 !text-orange-600">
            <span class="material-symbols-rounded text-[20px]">
              {{ item.icon }}
            </span>

            {{ item.label }}
          </RouterLink>

          <RouterLink :to="{ name: 'cart' }"
            class="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 sm:hidden"
            active-class="bg-orange-50 !text-orange-600">
            <div class="relative">
              <span class="material-symbols-rounded text-[20px]">
                shopping_cart
              </span>

              <span v-if="cartStore.itemCount > 0"
                class="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                {{ cartStore.itemCount }}
              </span>
            </div>

            ตะกร้า
          </RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="mt-16 border-t border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white">
            <img src="/logo-app.png" alt="ShopFlow logo" class="h-full w-full object-cover" />
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-700">
              ShopFlow Store
            </p>

            <p class="text-xs text-slate-400">
              Gaming & Accessories
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="material-symbols-rounded text-[17px]">
            shopping_bag
          </span>

          <span>
            ดีลพิเศษแบรนด์เกมมิ่งเกียร์ชั้นนำให้คุณเลือก
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
