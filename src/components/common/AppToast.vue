<script setup lang="ts">
import { computed } from 'vue'

import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()

const toastClass = computed(() => {
  if (toastStore.type === 'success') {
    return ['border-green-200', 'bg-green-50', 'text-green-700']
  }

  if (toastStore.type === 'error') {
    return ['border-red-200', 'bg-red-50', 'text-red-600']
  }

  return ['border-blue-200', 'bg-blue-50', 'text-blue-700']
})
</script>

<template>
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ toastStore.isVisible && toastStore.type !== 'error' ? toastStore.message : '' }}
  </div>
  <div class="sr-only" role="alert" aria-atomic="true">
    {{ toastStore.isVisible && toastStore.type === 'error' ? toastStore.message : '' }}
  </div>
  <Transition
    enter-active-class="transition duration-200 motion-reduce:transition-none"
    enter-from-class="translate-y-3 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 motion-reduce:transition-none"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="toastStore.isVisible"
      class="fixed right-5 top-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border p-4 shadow-lg"
      :class="toastClass"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="text-sm font-semibold">
            {{
              toastStore.type === 'success'
                ? 'สำเร็จ'
                : toastStore.type === 'error'
                  ? 'เกิดข้อผิดพลาด'
                  : 'แจ้งเตือน'
            }}
          </p>

          <p class="mt-1 text-sm">
            {{ toastStore.message }}
          </p>
        </div>

        <button
          type="button"
          aria-label="ปิดการแจ้งเตือน"
          class="cursor-pointer rounded px-2 text-lg opacity-60 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
          @click="toastStore.hide()"
        >
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>
