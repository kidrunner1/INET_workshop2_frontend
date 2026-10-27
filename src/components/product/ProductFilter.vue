<script setup lang="ts">
import { computed, useId } from 'vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import AppIconSelect from '@/components/common/AppIconSelect.vue'
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '@/utils/catalog-query'
import { getProductCategoryIcon } from '@/utils/product-icons'

const props = defineProps<{ search: string; category: string; sort: string }>()
const emit = defineEmits<{
  'update:search': [value: string]
  search: [value: string]
  categoryChange: [value: string]
  sortChange: [value: string]
  reset: []
}>()
const id = useId()
const sortIcons: Record<string, string> = {
  default: 'schedule', 'price-low': 'trending_up', 'price-high': 'trending_down',
  'stock-high': 'inventory_2', name: 'sort_by_alpha',
}
const sortOptions = SORT_OPTIONS.map((option) => ({ ...option, icon: sortIcons[option.value] || 'sort' }))
const hasFilter = computed(() =>
  Boolean(props.search || props.category || props.sort !== 'default'),
)
const categories = computed(() => {
  const values: string[] = [...PRODUCT_CATEGORIES]
  if (props.category && !values.includes(props.category)) values.push(props.category)
  return [
    { value: '', label: 'ทุกหมวดหมู่', icon: 'category' },
    ...values.map((value) => ({ value, label: value, icon: getProductCategoryIcon(value) })),
  ]
})
</script>

<template>
  <section
    aria-label="ค้นหาและกรองสินค้า"
    class="rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-slate-100 bg-slate-50/70 px-5 py-4"
    >
      <h2 class="font-bold text-slate-900">ค้นหาอุปกรณ์ที่ต้องการ</h2>
      <button
        type="button"
        :disabled="!hasFilter"
        class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
        @click="emit('reset')"
      >
        ล้างตัวกรอง
      </button>
    </div>
    <div class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_200px_300px]">
      <AppSearchField
        :model-value="search"
        label="ค้นหาสินค้า"
        placeholder="เช่น Mouse, Keyboard"
        @update:model-value="emit('update:search', $event)"
        @search="emit('search', $event)"
      />
      <div>
        <label :id="id + '-category-label'" :for="id + '-category'" class="mb-2 block text-sm font-semibold text-slate-700"
          >หมวดหมู่</label
        >
        <AppIconSelect
          :id="id + '-category'"
          :label-id="id + '-category-label'"
          :model-value="category"
          :options="categories"
          icon="category"
          @update:model-value="emit('categoryChange', $event)"
        />
      </div>
      <div>
        <label :id="id + '-sort-label'" :for="id + '-sort'" class="mb-2 block text-sm font-semibold text-slate-700"
          >เรียงสินค้าในหน้านี้</label
        >
        <AppIconSelect
          :id="id + '-sort'"
          :label-id="id + '-sort-label'"
          :model-value="sort"
          :options="sortOptions"
          :described-by="id + '-sort-hint'"
          icon="sort"
          @update:model-value="emit('sortChange', $event)"
        />
      </div>
    </div>
    <p :id="id + '-sort-hint'" class="px-5 pb-4 text-xs leading-5 text-slate-500">
      แต่ละหน้าแสดงสินค้าล่าสุดก่อน การเลือกเรียงใหม่จะจัดลำดับเฉพาะสินค้าที่อยู่ในหน้านี้
    </p>
  </section>
</template>
