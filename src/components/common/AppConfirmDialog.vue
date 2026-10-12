<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    cancelLabel?: string
    busyLabel?: string
    intent?: 'danger' | 'primary'
    busy?: boolean
    error?: string
    fallbackFocus?: HTMLElement | null
  }>(),
  {
    cancelLabel: 'เก็บไว้ในตะกร้า',
    busyLabel: 'กำลังนำออก...',
    intent: 'danger',
    busy: false,
    error: '',
    fallbackFocus: null,
  },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const titleId = useId()
const descriptionId = useId()
let opener: HTMLElement | null = null
let previousOverflow: string | null = null

const restorePage = () => {
  if (previousOverflow !== null) {
    document.documentElement.style.overflow = previousOverflow
    previousOverflow = null
  }
}

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    if (open !== props.open || !dialog.value) return
    if (open && !dialog.value.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
      previousOverflow = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      dialog.value.showModal()
      cancelButton.value?.focus()
    } else if (!open && dialog.value.open) {
      dialog.value.close()
    }
  },
  { immediate: true },
)

const requestCancel = () => {
  if (!props.busy) emit('cancel')
}

const handleClose = () => {
  restorePage()
  if (props.open) emit('cancel')
  const target = opener?.isConnected ? opener : props.fallbackFocus
  target?.focus({ preventScroll: true })
}

onBeforeUnmount(restorePage)
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
      :aria-busy="busy"
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm sm:p-8"
      @cancel.prevent="requestCancel"
      @close="handleClose"
    >
      <div
        aria-hidden="true"
        class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
        :class="intent === 'danger' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          class="h-6 w-6"
        >
          <path
            v-if="intent === 'danger'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 3h2l2.4 12h11.2L21 7H6M9 20h.01M18 20h.01"
          />
        </svg>
      </div>
      <h2 :id="titleId" class="text-xl font-bold">{{ title }}</h2>
      <p :id="descriptionId" class="mt-3 break-words text-sm leading-6 text-slate-500">
        {{ description }}
      </p>
      <p
        v-if="error"
        role="alert"
        class="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
      >
        {{ error }}
      </p>
      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          ref="cancelButton"
          type="button"
          :disabled="busy"
          class="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          @click="requestCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :disabled="busy"
          class="flex-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            intent === 'danger'
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600'
              : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus-visible:outline-orange-500'
          "
          @click="!busy && emit('confirm')"
        >
          {{ busy ? busyLabel : confirmLabel }}
        </button>
      </div>
    </dialog>
  </Teleport>
</template>
