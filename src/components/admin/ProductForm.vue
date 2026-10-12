<script setup lang="ts">
import {
  reactive,
  watch,
} from 'vue'

import type {
  Product,
} from '@/types/product'

import type {
  ProductPayload,
} from '@/services/product.service'

const props = defineProps<{
  product?: Product | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: ProductPayload]
  cancel: []
}>()

const form = reactive<ProductPayload>({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
  category: 'general',
})

watch(
  () => props.product,
  (product) => {
    if (product) {
      form.name = product.name
      form.price = product.price
      form.stock = product.stock
      form.description =
        product.description ?? ''
      form.imageUrl =
        product.imageUrl ?? ''
      form.category =
        product.category ?? 'general'
    } else {
      form.name = ''
      form.price = 0
      form.stock = 0
      form.description = ''
      form.imageUrl = ''
      form.category = 'general'
    }
  },
  {
    immediate: true,
  },
)

const handleSubmit = () => {
  emit('submit', {
    ...form,
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid gap-5 md:grid-cols-2">
      <div class="md:col-span-2">
        <label class="mb-2 block text-sm font-medium text-slate-700">
          ชื่อสินค้า
        </label>

        <input v-model="form.name" type="text" required placeholder="เช่น Logitech G Pro X Superlight"
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          ราคา
        </label>

        <input v-model.number="form.price" type="number" min="0" required
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Stock
        </label>

        <input v-model.number="form.stock" type="number" min="0" step="1" required
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Category
        </label>

        <input v-model="form.category" type="text" placeholder="Mouse, Keyboard..."
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Image URL
        </label>

        <input v-model="form.imageUrl" type="text" placeholder="https://..."
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>

      <div class="md:col-span-2">
        <label class="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea v-model="form.description" rows="5" placeholder="รายละเอียดสินค้า..."
          class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
      </div>
    </div>

    <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button type="button"
        class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        @click="emit('cancel')">
        ยกเลิก
      </button>

      <button type="submit" :disabled="isLoading"
        class="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">
        {{
          isLoading
            ? 'กำลังบันทึก...'
            : 'บันทึกสินค้า'
        }}
      </button>
    </div>
  </form>
</template>
