<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  id: string
  labelId: string
  modelValue: string
  icon: string
  options: ReadonlyArray<{ value: string; label: string; icon?: string }>
  describedBy?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)
const above = ref(false)
const menuHeight = ref(300)
const selected = computed(() => props.options.find((option) => option.value === props.modelValue))
let typed = ''
let lastTyped = 0

function close() {
  open.value = false
  typed = ''
}
function revealActive() {
  void nextTick(() => {
    const option = list.value?.children[activeIndex.value] as HTMLElement | undefined
    option?.scrollIntoView({ block: 'nearest' })
  })
}
function expand() {
  if (!props.options.length) return
  const bounds = trigger.value?.getBoundingClientRect()
  if (bounds) {
    const below = window.innerHeight - bounds.bottom - 12
    above.value = below < 280 && bounds.top > below
    menuHeight.value = Math.max(96, Math.min(300, above.value ? bounds.top - 12 : below))
  }
  activeIndex.value = Math.max(0, props.options.findIndex((option) => option.value === props.modelValue))
  open.value = true
  revealActive()
}
function choose(index: number, restoreFocus = true) {
  const option = props.options[index]
  if (!option) return
  close()
  if (option.value !== props.modelValue) emit('update:modelValue', option.value)
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}
function onKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.ctrlKey || event.metaKey) return
  const key = event.key
  if (key === 'Tab') {
    if (open.value) choose(activeIndex.value, false)
    return
  }
  if (key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
    return
  }
  if (key === 'Enter' || key === ' ') {
    event.preventDefault()
    if (open.value) choose(activeIndex.value)
    else expand()
    return
  }
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(key)) {
    event.preventDefault()
    const wasOpen = open.value
    if (!wasOpen) expand()
    if (key === 'Home') activeIndex.value = 0
    else if (key === 'End') activeIndex.value = props.options.length - 1
    else if (wasOpen) {
      const step = key === 'PageDown' ? 10 : key === 'PageUp' ? -10 : key === 'ArrowDown' ? 1 : -1
      activeIndex.value = Math.max(0, Math.min(props.options.length - 1, activeIndex.value + step))
    }
    revealActive()
    return
  }
  if (key.length === 1 && !event.altKey) {
    event.preventDefault()
    if (!open.value) expand()
    const now = Date.now()
    typed = now - lastTyped > 700 ? key : typed + key
    lastTyped = now
    const repeated = [...typed].every((character) => character === typed[0])
    const prefix = (repeated ? key : typed).toLocaleLowerCase()
    const start = repeated ? activeIndex.value + 1 : activeIndex.value
    for (let offset = 0; offset < props.options.length; offset++) {
      const index = (start + offset) % props.options.length
      if (props.options[index]?.label.toLocaleLowerCase().startsWith(prefix)) {
        activeIndex.value = index
        revealActive()
        break
      }
    }
  }
}
function onOutsidePointer(event: PointerEvent) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) close()
}
function onFocusOut(event: FocusEvent) {
  if (!(event.relatedTarget instanceof Node) || !root.value?.contains(event.relatedTarget)) close()
}
watch(() => props.modelValue, close)
watch(() => props.options, close)
onMounted(() => {
  document.addEventListener('pointerdown', onOutsidePointer)
  window.addEventListener('resize', close)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutsidePointer)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div ref="root" class="relative min-w-0" @focusout="onFocusOut">
    <button
      :id="id"
      ref="trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? id + '-list' : undefined"
      :aria-activedescendant="open ? id + '-option-' + activeIndex : undefined"
      :aria-labelledby="labelId + ' ' + id + '-value'"
      :aria-describedby="describedBy"
      class="app-field flex min-h-12 w-full items-center gap-2 px-3 py-2 text-left"
      :class="{ 'border-orange-700': open }"
      @click="open ? close() : expand()"
      @keydown="onKeydown"
    >
      <span aria-hidden="true" class="material-symbols-rounded shrink-0 text-xl text-orange-700">{{ selected?.icon || icon }}</span>
      <span :id="id + '-value'" class="min-w-0 flex-1 wrap-break-word">{{ selected?.label || modelValue }}</span>
      <span aria-hidden="true" class="material-symbols-rounded shrink-0 text-xl text-slate-500">{{ open ? 'expand_less' : 'expand_more' }}</span>
    </button>
    <ul
      v-if="open"
      :id="id + '-list'"
      ref="list"
      role="listbox"
      :aria-labelledby="labelId"
      :style="{ maxHeight: menuHeight + 'px' }"
      class="absolute inset-x-0 z-50 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
      :class="above ? 'bottom-full mb-2' : 'top-full mt-2'"
    >
      <li
        v-for="(option, index) in options"
        :id="id + '-option-' + index"
        :key="option.value"
        role="option"
        :aria-selected="option.value === modelValue"
        :data-active="index === activeIndex"
        class="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm"
        :class="index === activeIndex ? 'border-orange-200 bg-orange-50 text-orange-900' : 'text-slate-700'"
        @pointermove="activeIndex = index"
        @mousedown.prevent
        @click="choose(index)"
      >
        <span aria-hidden="true" class="material-symbols-rounded shrink-0 text-xl">{{ option.icon || icon }}</span>
        <span class="min-w-0 flex-1 wrap-break-word">{{ option.label }}</span>
        <span v-if="option.value === modelValue" aria-hidden="true" class="material-symbols-rounded shrink-0 text-lg text-orange-700">check</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@media (forced-colors: active) {
  [role='option'][aria-selected='true'] {
    border-color: Highlight;
  }
  [role='option']:hover {
    outline: 1px solid Highlight;
  }
  [role='option'][data-active='true'] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
</style>
