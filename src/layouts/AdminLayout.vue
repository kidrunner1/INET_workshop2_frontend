<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
import { computed, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

import { useCartStore } from '@/stores/cart.store'

const route = useRoute()
const router = useRouter()

const toastStore = useToastStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isSidebarOpen = ref(false)

const pageTitle = computed(() => {
  if (route.path.startsWith('/admin/users')) {
    return 'User Management'
  }

  if (route.path.startsWith('/admin/products')) {
    return 'Product Management'
  }

  if (route.path.startsWith('/admin/orders')) {
    return 'Order Management'
  }

  return 'Admin Dashboard'
})

const pageDescription = computed(() => {
  if (route.path.startsWith('/admin/users')) {
    return 'จัดการผู้ใช้งานและอนุมัติบัญชีใหม่'
  }

  if (route.path.startsWith('/admin/products')) {
    return 'เพิ่ม แก้ไข และจัดการสินค้าในระบบ'
  }

  if (route.path.startsWith('/admin/orders')) {
    return 'ตรวจสอบคำสั่งซื้อและจัดการสถานะ Order'
  }

  return 'จัดการระบบร้านค้า'
})

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleLogout = async () => {
  authStore.logout()
  cartStore.clearState()

  await router.push('/login')
  toastStore.success('ออกจากระบบแล้ว')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand -->
      <div class="flex h-20 items-center border-b border-white/10 px-6">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold"
        >
          S
        </div>

        <div class="ml-3">
          <h1 class="font-bold tracking-tight">ShopFlow</h1>

          <p class="text-xs text-slate-400">Administration</p>
        </div>

        <button type="button" class="ml-auto text-slate-400 lg:hidden" @click="closeSidebar">
          ✕
        </button>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto px-4 py-6">
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Management
        </p>

        <nav class="space-y-1">
          <RouterLink
            to="/admin/users"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
            :class="
              isActive('/admin/users')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            "
            @click="closeSidebar"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"> U </span>

            <span> Users </span>
          </RouterLink>

          <RouterLink
            to="/admin/products"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
            :class="
              isActive('/admin/products')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            "
            @click="closeSidebar"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"> P </span>

            <span> Products </span>
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
            :class="
              isActive('/admin/orders')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            "
            @click="closeSidebar"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"> O </span>

            <span> Orders </span>
          </RouterLink>
        </nav>
      </div>

      <!-- Admin Profile -->
      <div class="border-t border-white/10 p-4">
        <div class="rounded-2xl bg-white/5 p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-semibold"
            >
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">
                {{ authStore.user?.username }}
              </p>

              <p class="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            class="mt-4 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="min-h-screen lg:pl-72">
      <!-- Header -->
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div class="flex h-20 items-center gap-4 px-5 sm:px-8">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            @click="isSidebarOpen = true"
          >
            ☰
          </button>

          <div>
            <h2 class="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {{ pageTitle }}
            </h2>

            <p class="hidden text-sm text-slate-500 sm:block">
              {{ pageDescription }}
            </p>
          </div>

          <div class="ml-auto flex items-center gap-3">
            <div
              class="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right sm:block"
            >
              <p class="text-xs text-slate-400">Signed in as</p>

              <p class="text-sm font-semibold text-slate-700">
                {{ authStore.user?.username }}
              </p>
            </div>

            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600"
            >
              A
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
