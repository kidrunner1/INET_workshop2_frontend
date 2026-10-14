<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  search: string
  category: string
  sort: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:category': [value: string]
  'update:sort': [value: string]
  search: []
  reset: []
  categoryChange: [value: string]
}>()

const isCategoryOpen = ref(false)

const categories = [
  {
    label: 'ทั้งหมด',
    value: '',
    icon: 'grid_view',
  },
  {
    label: 'Mouse',
    value: 'Mouse',
    icon: 'mouse',
  },
  {
    label: 'Keyboard',
    value: 'Keyboard',
    icon: 'keyboard',
  },
  {
    label: 'Headset',
    value: 'Headset',
    icon: 'headphones',
  },
  {
    label: 'Gaming',
    value: 'Gaming',
    icon: 'sports_esports',
  },
  {
    label: 'Microphone',
    value: 'Microphone',
    icon: 'mic',
  },
  {
    label: 'Monitor',
    value: 'Monitor',
    icon: 'desktop_windows',
  },
] as const

const sortOptions = [
  {
    label: 'เรียงตามค่าเริ่มต้น',
    value: 'default',
  },
  {
    label: 'ราคาน้อย → มาก',
    value: 'price-low',
  },
  {
    label: 'ราคามาก → น้อย',
    value: 'price-high',
  },
  {
    label: 'Stock มาก → น้อย',
    value: 'stock-high',
  },
  {
    label: 'ชื่อสินค้า A → Z',
    value: 'name',
  },

] as const

const hasFilter = computed(() => {
  return Boolean(
    props.search.trim() ||
    props.category ||
    props.sort !== 'default',
  )
})

const selectedCategory = computed(() => {
  return (
    categories.find(
      (item) =>
        item.value === props.category,
    ) ?? categories[0]
  )
})

const isSortOpen = ref(false)

const selectedSort = computed(() => {
  return (
    sortOptions.find(
      (option) =>
        option.value === props.sort,
    ) ?? sortOptions[0]
  )
})

const selectSort = (
  value: string,
): void => {
  emit('update:sort', value)

  isSortOpen.value = false
}

const searchModel = computed({
  get: () => props.search,

  set: (value: string) => {
    emit('update:search', value)
  },
})

const selectCategory = (
  value: string,
): void => {
  emit('update:category', value)

  emit('categoryChange', value)

  isCategoryOpen.value = false
}
</script>

<template>
  <div class="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
    <!-- Header -->
    <div
      class="flex flex-col gap-3 rounded-t-2xl border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
          Product Finder
        </p>

        <h3 class="mt-1 text-base font-bold text-slate-900">
          ค้นหาและกรองสินค้า
        </h3>
      </div>

      <button type="button" :disabled="!hasFilter"
        class="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
        @click="emit('reset')">
        <span class="material-symbols-rounded text-[19px]">
          restart_alt
        </span>

        ล้างตัวกรอง
      </button>
    </div>

    <!-- Controls -->
    <div class="grid gap-4 p-5 lg:grid-cols-[1fr_240px_220px]">
      <!-- Search -->
      <form class="group relative" @submit.prevent="emit('search')">
        <span
          class="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[21px] text-slate-400 transition group-focus-within:text-orange-500">
          search
        </span>

        <input v-model="searchModel" type="text" placeholder="ค้นหาชื่อสินค้า เช่น Mouse, Keyboard..."
          class="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-28 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />

        <button type="submit"
          class="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-orange-500">
          ค้นหา
        </button>
      </form>

      <!-- Category -->
      <div class="relative z-20">
        <button type="button"
          class="flex h-13 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
          @click="
            isCategoryOpen =
            !isCategoryOpen
            ">
          <div class="flex min-w-0 items-center gap-3">
            <span class="material-symbols-rounded shrink-0 text-[21px] text-slate-600">
              {{
                selectedCategory.icon
              }}
            </span>

            <span class="truncate">
              {{
                selectedCategory.label ===
                  'ทั้งหมด'
                  ? 'หมวดหมู่สินค้า'
                  : selectedCategory.label
              }}
            </span>
          </div>

          <span class="material-symbols-rounded text-[21px] text-slate-400 transition" :class="{
            'rotate-180':
              isCategoryOpen,
          }">
            expand_more
          </span>
        </button>

        <!-- Dropdown -->
        <div v-if="isCategoryOpen"
          class="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-65 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          <button v-for="item in categories" :key="item.value" type="button"
            class="group flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
            :class="item.value === category
              ? 'bg-orange-50'
              : ''
              " @click="
                selectCategory(
                  item.value,
                )
                ">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <span class="material-symbols-rounded text-[21px]">
                  {{ item.icon }}
                </span>
              </div>

              <span class="truncate text-sm font-medium" :class="item.value ===
                category
                ? 'text-orange-600'
                : 'text-slate-700'
                ">
                {{ item.label }}
              </span>
            </div>

            <span v-if="
              item.value ===
              category
            " class="material-symbols-rounded text-[19px] text-orange-500">
              check
            </span>

            <span v-else class="material-symbols-rounded text-[20px] text-slate-300">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <!-- Sort Dropdown -->
      <div class="relative z-10">
        <!-- Trigger -->
        <button type="button"
          class="flex h-13 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
          @click="isSortOpen = !isSortOpen">
          <div class="flex min-w-0 items-center gap-3">
            <span class="material-symbols-rounded shrink-0 text-[21px] text-slate-600">
              swap_vert
            </span>

            <span class="truncate">
              {{ selectedSort.label }}
            </span>
          </div>

          <span class="material-symbols-rounded text-[21px] text-slate-400 transition duration-200" :class="{
            'rotate-180': isSortOpen,
          }">
            expand_more
          </span>
        </button>

        <!-- Menu -->
        <div v-if="isSortOpen"
          class="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-62.5 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          <button v-for="option in sortOptions" :key="option.value" type="button"
            class="group flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
            :class="option.value === sort
              ? 'bg-orange-50'
              : ''
              " @click="
                selectSort(
                  option.value,
                )
                ">
            <div class="flex min-w-0 items-center gap-3">
              <!-- Left Icon -->
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:text-orange-500">
                <span class="material-symbols-rounded text-[21px]">
                  {{
                    option.value === 'price-low'
                      ? 'south'
                      : option.value === 'price-high'
                        ? 'north'
                        : option.value === 'stock-high'
                          ? 'inventory_2'
                          : option.value === 'name'
                            ? 'sort_by_alpha'
                            : 'swap_vert'
                  }}
                </span>
              </div>

              <!-- Label -->
              <span class="truncate text-sm font-medium" :class="option.value === sort
                ? 'text-orange-600'
                : 'text-slate-700'
                ">
                {{ option.label }}
              </span>
            </div>

            <!-- Right Icon -->
            <span v-if="option.value === sort" class="material-symbols-rounded text-[19px] text-orange-500">
              check
            </span>

            <span v-else
              class="material-symbols-rounded text-[20px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
