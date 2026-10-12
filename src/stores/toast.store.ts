import { defineStore } from 'pinia'

import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref<ToastType>('info')

  const isVisible = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  const show = (newMessage: string, newType: ToastType = 'info') => {
    message.value = newMessage

    type.value = newType
    isVisible.value = true

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      hide()
    }, 3000)
  }

  const success = (message: string) => {
    show(message, 'success')
  }

  const error = (message: string) => {
    show(message, 'error')
  }

  const info = (message: string) => {
    show(message, 'info')
  }

  const hide = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    isVisible.value = false
  }

  return {
    message,
    type,
    isVisible,

    show,
    success,
    error,
    info,
    hide,
  }
})
