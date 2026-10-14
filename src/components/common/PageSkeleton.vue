<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'

withDefaults(
  defineProps<{
    variant: 'products' | 'product-detail' | 'table' | 'orders' | 'order-detail' | 'cart'
    label?: string
    count?: number
    columns?: number
    admin?: boolean
  }>(),
  {
    label: 'กำลังโหลดข้อมูล...',
    count: 3,
    columns: 5,
    admin: false,
  },
)
</script>

<template>
  <div role="status" aria-live="polite" aria-busy="true" :aria-label="label">
    <span class="sr-only">{{ label }}</span>
    <div v-if="variant === 'products'" aria-hidden="true"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="item in count" :key="item"
        class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AppSkeleton class="aspect-4/3 w-full rounded-none" />
        <div class="p-5">
          <AppSkeleton class="h-5 w-4/5" />
          <AppSkeleton class="mt-2 h-5 w-3/5" />
          <AppSkeleton class="mt-3 h-4 w-full" />
          <AppSkeleton class="mt-2 h-4 w-3/4" />
          <AppSkeleton class="mt-5 h-10 w-1/2" />
          <AppSkeleton class="mt-5 h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'product-detail'" aria-hidden="true"
      class="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
      <AppSkeleton class="min-h-105 rounded-none" />
      <div class="p-6 sm:p-8 lg:p-10">
        <AppSkeleton class="h-4 w-32" />
        <AppSkeleton class="mt-4 h-10 w-4/5" />
        <AppSkeleton class="mt-4 h-9 w-36" />
        <AppSkeleton class="mt-6 h-8 w-48" />
        <div class="mt-8 space-y-3 border-t border-slate-100 pt-6">
          <AppSkeleton class="h-4 w-32" />
          <AppSkeleton class="h-4 w-full" />
          <AppSkeleton class="h-4 w-3/4" />
        </div>
        <AppSkeleton class="mt-8 h-40 w-full rounded-xl" />
      </div>
    </div>

    <div v-else-if="variant === 'table'" aria-hidden="true" class="overflow-x-auto">
      <table class="w-full min-w-160 table-fixed">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th v-for="column in columns" :key="column" class="px-6 py-4">
              <AppSkeleton class="h-4 w-3/4" />
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="row in count" :key="row">
            <td v-for="column in columns" :key="column" class="px-6 py-5">
              <AppSkeleton :class="column === 1 ? 'h-10 w-full' : 'h-6 w-4/5'" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="variant === 'orders'" aria-hidden="true" class="space-y-4">
      <div v-for="item in count" :key="item" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div class="flex flex-col justify-between gap-5 lg:flex-row">
          <div class="space-y-3">
            <AppSkeleton class="h-7 w-56" />
            <AppSkeleton class="h-4 w-40" />
          </div>
          <div class="grid grid-cols-3 gap-5 lg:w-105">
            <AppSkeleton v-for="column in 3" :key="column" class="h-12 w-full" />
          </div>
        </div>
        <div class="mt-5 space-y-3 border-t border-slate-100 pt-5">
          <AppSkeleton class="h-10 w-full" />
          <AppSkeleton class="h-10 w-4/5" />
          <AppSkeleton class="ml-auto mt-5 h-10 w-32" />
        </div>
      </div>
    </div>

    <div v-else aria-hidden="true" class="space-y-6">
      <div v-if="variant === 'order-detail'" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <AppSkeleton class="h-4 w-28" />
        <AppSkeleton class="mt-3 h-8 w-3/4 max-w-md" />
        <AppSkeleton class="mt-3 h-4 w-48" />
      </div>
      <div class="grid gap-6" :class="variant === 'cart'
        ? 'lg:grid-cols-[1fr_360px]'
        : admin
          ? 'lg:grid-cols-[1fr_320px]'
          : 'lg:grid-cols-[1fr_340px]'
        ">
        <div class="space-y-4">
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <AppSkeleton class="h-6 w-40" />
            <AppSkeleton class="mt-2 h-4 w-24" />
          </div>
          <div v-for="item in count" :key="item"
            class="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
            <AppSkeleton v-if="variant === 'cart'" class="h-32 w-full shrink-0 rounded-xl sm:w-32" />
            <div class="flex-1 space-y-3">
              <AppSkeleton class="h-6 w-3/4" />
              <AppSkeleton class="h-4 w-1/2" />
              <AppSkeleton class="h-4 w-1/3" />
              <AppSkeleton v-if="variant === 'cart'" class="h-10 w-32" />
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AppSkeleton class="h-5 w-32" />
            <AppSkeleton class="mt-3 h-7 w-48" />
            <div class="mt-6 space-y-4">
              <AppSkeleton v-for="row in 3" :key="row" class="h-5 w-full" />
            </div>
            <AppSkeleton class="mt-6 h-10 w-full" />
            <AppSkeleton v-if="variant === 'cart'" class="mt-6 h-12 w-full rounded-xl" />
          </div>
          <div v-if="variant === 'order-detail'"
            class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AppSkeleton class="h-6 w-40" />
            <AppSkeleton class="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
