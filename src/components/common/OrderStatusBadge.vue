<script setup lang="ts">
import {
  computed,
} from 'vue'

import type {
  OrderStatus,
} from '@/types/order'

import {
  getOrderStatusClass,
  getOrderStatusLabel,
} from '@/utils/order-status'

const props = defineProps<{
  status: OrderStatus
}>()

const label = computed(
  () =>
    getOrderStatusLabel(
      props.status,
    ),
)

const statusClass = computed(
  () =>
    getOrderStatusClass(
      props.status,
    ),
)
</script>

<template>
  <span class="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold" :class="statusClass">
    {{ label }}
  </span>
</template>
