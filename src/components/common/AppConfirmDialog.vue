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

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)

const cancelButton = ref<HTMLButtonElement | null>(null)

const titleId = useId()
const descriptionId = useId()

let opener: HTMLElement | null = null
let previousOverflow: string | null = null

const restorePage = (): void => {
  if (previousOverflow === null) return

  document.documentElement.style.overflow = previousOverflow

  previousOverflow = null
}

const requestCancel = (): void => {
  if (props.busy) return

  emit('cancel')
}

const handleClose = (): void => {
  // A queued close event from the previous opening must not cancel a new dialog.
  if (dialog.value?.open) return

  restorePage()

  const target = opener?.isConnected ? opener : props.fallbackFocus

  target?.focus({
    preventScroll: true,
  })
}

watch(
  () => props.open,
  async (open) => {
    await nextTick()

    if (open !== props.open || !dialog.value) {
      return
    }

    if (open && !dialog.value.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

      previousOverflow = document.documentElement.style.overflow

      document.documentElement.style.overflow = 'hidden'

      dialog.value.showModal()

      cancelButton.value?.focus()

      return
    }

    if (!open && dialog.value.open) {
      // Restore synchronously so reopening before the close event keeps the original value.
      restorePage()
      dialog.value.close()
    }
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(restorePage)
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
      :aria-busy="busy"
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm sm:p-8"
      @cancel.prevent="requestCancel"
      @close="handleClose"
    >
      <!-- Icon -->
      <div
        aria-hidden="true"
        class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
        :class="intent === 'danger' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'"
      >
        <span aria-hidden="true" class="material-symbols-rounded text-[26px]">
          {{ intent === 'danger' ? 'delete' : 'shopping_bag' }}
        </span>
      </div>

      <!-- Content -->
      <h2 :id="titleId" class="text-xl font-bold tracking-tight text-slate-900">
        {{ title }}
      </h2>

      <p :id="descriptionId" class="mt-3 wrap-break-word text-sm leading-6 text-slate-500">
        {{ description }}
      </p>

      <!-- Error -->
      <div
        v-if="error"
        role="alert"
        class="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
      >
        <span aria-hidden="true" class="material-symbols-rounded mt-0.5 text-[18px]"> error </span>

        <span>
          {{ error }}
        </span>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <!-- Cancel -->
        <button
          ref="cancelButton"
          type="button"
          :disabled="busy"
          class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          @click="requestCancel"
        >
          <span aria-hidden="true" class="material-symbols-rounded text-[18px]"> close </span>

          {{ cancelLabel }}
        </button>

        <!-- Confirm -->
        <button
          type="button"
          :disabled="busy"
          class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            intent === 'danger'
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600'
              : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 focus-visible:outline-orange-500'
          "
          @click="!busy && emit('confirm')"
        >
          <span
            aria-hidden="true"
            class="material-symbols-rounded text-[19px]"
            :class="{
              'animate-spin': busy,
            }"
          >
            {{ busy ? 'progress_activity' : intent === 'danger' ? 'delete' : 'check_circle' }}
          </span>

          {{ busy ? busyLabel : confirmLabel }}
        </button>
      </div>
    </dialog>
  </Teleport>
</template>
