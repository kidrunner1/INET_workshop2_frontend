<script setup lang="ts">
import AppToast from '@/components/common/AppToast.vue'
import AppRouteLoading from '@/components/common/AppRouteLoading.vue'
</script>

<template>
  <AppRouteLoading />
  <RouterView />
  <AppToast />
</template>
