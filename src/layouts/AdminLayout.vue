<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useToastStore } from '@/stores/toast.store'
import { confirmLeavingForm } from '@/utils/leave-confirmation'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const isSidebarOpen = ref(false)

const navigationItems = [
  {
    label: 'Users',
    description: 'จัดการผู้ใช้งาน',
    routeName: 'admin-users',
    path: '/admin/users',
    icon: 'group',
    title: 'User Management',
    pageDescription: 'จัดการผู้ใช้งานและอนุมัติบัญชีใหม่',
  },
  {
    label: 'Products',
    description: 'จัดการสินค้า',
    routeName: 'admin-products',
    path: '/admin/products',
    icon: 'inventory_2',
    title: 'Product Management',
    pageDescription: 'เพิ่ม แก้ไข และจัดการสินค้าในระบบ',
  },
  {
    label: 'Orders',
    description: 'จัดการคำสั่งซื้อ',
    routeName: 'admin-orders',
    path: '/admin/orders',
    icon: 'receipt_long',
    title: 'Order Management',
    pageDescription: 'ตรวจสอบคำสั่งซื้อและจัดการสถานะ Order',
  },
] as const

const activePage = computed(() => navigationItems.find((item) => route.path.startsWith(item.path)))

const pageTitle = computed(() => activePage.value?.title ?? 'Admin Dashboard')

const pageDescription = computed(() => activePage.value?.pageDescription ?? 'จัดการระบบร้านค้า')

const displayName = computed(() => {
  const user = authStore.user
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.username || 'Admin'
})

const userInitial = computed(() => displayName.value.charAt(0).toUpperCase())

const isActive = (path: string): boolean => route.path.startsWith(path)

const closeSidebar = (): void => {
  isSidebarOpen.value = false
}

const handleLogout = async (): Promise<void> => {
  if (!(await confirmLeavingForm())) return
  authStore.logout()
  cartStore.clearState()

  await router.push({
    name: 'products',
  })

  toastStore.success('ออกจากระบบแล้ว')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-slate-950 text-white shadow-xl transition-transform duration-300 lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand -->
      <div class="flex h-24 items-center border-b border-white/10 px-6">
        <RouterLink
          :to="{ name: 'admin-users' }"
          class="flex items-center gap-3"
          @click="closeSidebar"
        >
          <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
            <img src="/logo-app.png" alt="ShopFlow logo" class="h-full w-full object-contain" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-bold tracking-tight">ShopFlow</h1>

              <span
                class="rounded-md bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400"
              >
                Admin
              </span>
            </div>

            <p class="mt-0.5 text-xs text-slate-500">Management Console</p>
          </div>
        </RouterLink>
      </div>
      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto px-4 py-6">
        <p class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Management
        </p>

        <nav class="space-y-1.5">
          <RouterLink
            v-for="item in navigationItems"
            :key="item.routeName"
            :to="{ name: item.routeName }"
            class="group flex items-center gap-3 rounded-xl px-3 py-3 transition"
            :class="
              isActive(item.path)
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            "
            @click="closeSidebar"
          >
            <!-- Icon -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition"
              :class="
                isActive(item.path)
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
              "
            >
              <span class="material-symbols-rounded text-[21px]">
                {{ item.icon }}
              </span>
            </div>

            <!-- Label -->
            <div class="min-w-0">
              <p class="text-sm font-semibold">
                {{ item.label }}
              </p>

              <p
                class="mt-0.5 truncate text-[11px]"
                :class="
                  isActive(item.path)
                    ? 'text-orange-100'
                    : 'text-slate-600 group-hover:text-slate-400'
                "
              >
                {{ item.description }}
              </p>
            </div>

            <span v-if="isActive(item.path)" class="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
          </RouterLink>
        </nav>

        <!-- System Status -->
        <div class="mt-8 rounded-xl border border-white/5 bg-white/3 p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-[18px] text-slate-500"> monitoring </span>

            <p class="text-xs font-semibold text-slate-300">System Status</p>
          </div>

          <div class="mt-3 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-400" />

            <span class="text-xs text-slate-500"> ระบบพร้อมใช้งาน </span>
          </div>
        </div>
      </div>

      <!-- Admin Profile -->
      <div class="border-t border-white/10 p-4">
        <div class="rounded-xl border border-white/5 bg-white/4 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 font-bold text-white"
            >
              {{ userInitial }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">
                {{ displayName }}
              </p>

              <div class="mt-1 flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span class="text-xs text-slate-500"> Administrator </span>
              </div>
            </div>
          </div>

          <!-- Logout -->
          <button
            type="button"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            @click="handleLogout"
          >
            <span class="material-symbols-rounded text-[19px]"> logout </span>

            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="min-h-screen lg:pl-72">
      <!-- Header -->
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div class="flex min-h-24 items-center gap-4 px-5 sm:px-8">
          <!-- Mobile Menu -->
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="เปิดเมนู"
            @click="isSidebarOpen = true"
          >
            <span class="material-symbols-rounded text-[22px]"> menu </span>
          </button>

          <!-- Page Info -->
          <div class="min-w-0">
            <div class="mb-1 flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Admin Console
              </span>

              <span class="h-1 w-1 rounded-full bg-slate-300" />

              <span class="text-[10px] font-medium text-slate-400"> ShopFlow </span>
            </div>

            <h2 class="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-xl">
              {{ pageTitle }}
            </h2>

            <p class="mt-1 hidden text-sm text-slate-500 sm:block">
              {{ pageDescription }}
            </p>
          </div>

          <!-- Account -->
          <div class="ml-auto flex items-center gap-3">
            <div class="hidden text-right md:block">
              <p class="text-xs text-slate-400">Signed in as</p>

              <p class="mt-0.5 max-w-40 truncate text-sm font-semibold text-slate-700">
                {{ displayName }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-sm font-bold text-orange-600"
            >
              {{ userInitial }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page -->
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
