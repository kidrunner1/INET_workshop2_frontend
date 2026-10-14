<script setup lang="ts">
import type { Product } from '@/types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/70">
    <!-- Image -->
    <div class="relative aspect-4/3 overflow-hidden bg-slate-50">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" loading="lazy"
        class="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105" />

      <div v-else class="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
        <span class="material-symbols-rounded text-5xl">
          image
        </span>

        <span class="text-xs font-medium">
          ไม่มีรูปสินค้า
        </span>
      </div>

      <!-- Category -->
      <span
        class="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
        {{ product.category }}
      </span>

      <!-- Stock -->
      <span
        class="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
        :class="product.stock > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-600'
          ">
        <span class="h-1.5 w-1.5 rounded-full" :class="product.stock > 0
            ? 'bg-emerald-500'
            : 'bg-red-500'
          " />

        {{
          product.stock > 0
            ? `${product.stock} in stock`
            : 'Out of stock'
        }}
      </span>

      <!-- Out of stock overlay -->
      <div v-if="product.stock === 0"
        class="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
        <span class="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          สินค้าหมด
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-5">
      <div>
        <h2
          class="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-slate-900 transition group-hover:text-orange-600">
          {{ product.name }}
        </h2>

        <p class="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {{
            product.description ||
            'ไม่มีรายละเอียดสินค้า'
          }}
        </p>
      </div>

      <!-- Price -->
      <div class="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          <p class="text-xs font-medium text-slate-400">
            ราคา
          </p>

          <div class="mt-1 flex items-end gap-1">
            <p class="text-xl font-bold tracking-tight text-slate-950">
              ฿{{ product.price.toLocaleString() }}
            </p>

            <span class="mb-1 text-xs text-slate-400">
              / ชิ้น
            </span>
          </div>
        </div>

        <span
          class="material-symbols-rounded text-[22px] text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500">
          arrow_forward
        </span>
      </div>

      <!-- Action -->
      <RouterLink :to="{
        name: 'product-detail',
        params: { id: product._id },
      }" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4"
        :class="product.stock > 0
            ? 'bg-slate-950 text-white hover:bg-orange-500 focus:ring-orange-100'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 focus:ring-orange-100'
          ">
        <span class="material-symbols-rounded text-[19px]">
          visibility
        </span>

        {{
          product.stock > 0
            ? 'ดูรายละเอียดสินค้า'
            : 'ดูรายละเอียด'
        }}
      </RouterLink>

    </div>
  </article>
</template>
