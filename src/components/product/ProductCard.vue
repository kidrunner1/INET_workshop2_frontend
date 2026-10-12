<script setup lang="ts">
import { useRouter } from 'vue-router'

import type { Product } from '@/types/product'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()

const goToDetail = async () => {
  await router.push(
    `/products/${props.product._id}`,
  )
}
</script>

<template>
  <article
    class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div class="relative aspect-square overflow-hidden bg-slate-100">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />

      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        No Image
      </div>

      <div class="absolute left-3 top-3">
        <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
          {{ product.category }}
        </span>
      </div>

      <div v-if="product.stock === 0" class="absolute inset-0 flex items-center justify-center bg-slate-950/45">
        <span class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600">
          สินค้าหมด
        </span>
      </div>
    </div>

    <div class="p-5">
      <h2 class="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-slate-900">
        {{ product.name }}
      </h2>

      <p class="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
        {{
          product.description ||
          'ไม่มีรายละเอียดสินค้า'
        }}
      </p>

      <div class="mt-4 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-medium text-slate-400">
            ราคา
          </p>

          <p class="mt-1 text-2xl font-bold text-orange-600">
            ฿{{ product.price.toLocaleString() }}
          </p>
        </div>

        <span class="text-xs font-medium" :class="product.stock > 0
            ? 'text-green-600'
            : 'text-red-500'
          ">
          {{
            product.stock > 0
              ? `เหลือ ${product.stock} ชิ้น`
              : 'หมด'
          }}
        </span>
      </div>

      <button
        class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        :disabled="product.stock === 0" @click="goToDetail">
        ดูรายละเอียด
      </button>
    </div>
  </article>
</template>
