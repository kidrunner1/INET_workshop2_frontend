<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter, type RouteLocationNormalized } from 'vue-router'
import { MINIMUM_LOADING_MS } from '@/utils/with-minimum-loading'

const router = useRouter()
const isLoading = ref(false)
let target: RouteLocationNormalized | undefined
let startedAt = 0
let timer: ReturnType<typeof setTimeout> | undefined

const removeBefore = router.beforeEach((to) => {
  clearTimeout(timer)
  target = to
  startedAt = Date.now()
  isLoading.value = true
})

const finish = (to: RouteLocationNormalized) => {
  if (target !== to) return
  clearTimeout(timer)
  timer = setTimeout(
    () => {
      isLoading.value = false
      target = undefined
    },
    Math.max(0, MINIMUM_LOADING_MS - (Date.now() - startedAt)),
  )
}

const removeAfter = router.afterEach(finish)
const removeError = router.onError((_error, to) => finish(to))

onBeforeUnmount(() => {
  clearTimeout(timer)
  removeBefore()
  removeAfter()
  removeError()
})
</script>

<template>
  <div
    v-if="isLoading"
    role="status"
    aria-live="polite"
    class="pointer-events-none fixed inset-x-0 top-0 z-100 h-1 bg-orange-100"
  >
    <span class="sr-only">กำลังเปิดหน้า...</span>
    <div class="h-full animate-pulse bg-orange-500 motion-reduce:animate-none" />
  </div>
</template>
