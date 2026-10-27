<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder?: string
    debounceMs?: number
  }>(),
  { placeholder: '', debounceMs: 300 },
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()
const id = useId()
const input = ref<HTMLInputElement | null>(null)
const draft = ref(props.modelValue)
let composing = false
let timer: ReturnType<typeof setTimeout> | undefined
const cancelPending = () => clearTimeout(timer)

watch(
  () => props.modelValue,
  (value) => {
    if (value !== draft.value) {
      cancelPending()
      draft.value = value
    }
  },
)

function submit() {
  cancelPending()
  if (!composing) emit('search', draft.value)
}
function update(event: Event) {
  draft.value = (event.target as HTMLInputElement).value
  emit('update:modelValue', draft.value)
  cancelPending()
  if (!composing) {
    if (!draft.value || props.debounceMs === 0) submit()
    else timer = setTimeout(submit, props.debounceMs)
  }
}
function clear() {
  cancelPending()
  composing = false
  draft.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  input.value?.focus()
}
function compositionEnd(event: CompositionEvent) {
  composing = false
  update(event)
}
function compositionStart() {
  composing = true
  cancelPending()
}
onBeforeUnmount(cancelPending)
</script>

<template>
  <form role="search" novalidate @submit.prevent="submit">
    <label :for="id" class="mb-2 block text-sm font-semibold text-slate-700">{{ label }}</label>
    <div class="flex min-w-0 gap-2">
      <div class="relative min-w-0 flex-1">
        <span
          aria-hidden="true"
          class="material-symbols-rounded pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-500"
          >search</span
        >
        <input
          :id="id"
          ref="input"
          :value="draft"
          type="search"
          :placeholder="placeholder"
          autocomplete="off"
          class="app-field h-12 w-full pl-10 pr-11"
          @input="update"
          @compositionstart="compositionStart"
          @compositionend="compositionEnd"
          @keydown.enter="
            ($event.isComposing || composing || $event.keyCode === 229) && $event.preventDefault()
          "
        />
        <button
          v-if="draft"
          type="button"
          aria-label="ล้างคำค้นหา"
          class="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          @click="clear"
        >
          <span aria-hidden="true" class="material-symbols-rounded text-xl">close</span>
        </button>
      </div>
      <button
        type="submit"
        class="h-12 shrink-0 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-700"
      >
        ค้นหา
      </button>
    </div>
  </form>
</template>
