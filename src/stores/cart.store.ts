import { withMinimumLoading } from '@/utils/with-minimum-loading'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  addCartItem as addCartItemService,
  clearCart as clearCartService,
  getCart,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
} from '@/services/cart.service'

import { useToastStore } from '@/stores/toast.store'
import type { Cart } from '@/types/cart'
import { getErrorMessage } from '@/utils/get-error-message'

const CART_LOAD_ERROR_MESSAGE = 'โหลดตะกร้าไม่สำเร็จ กรุณาลองอีกครั้ง'

export const useCartStore = defineStore('cart', () => {
  const toastStore = useToastStore()

  // State
  const cart = ref<Cart | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  // Internal state
  let fetchPromise: Promise<void> | null = null
  let stateVersion = 0

  // Getters
  const itemCount = computed(() => {
    return cart.value?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
  })

  const totalPrice = computed(() => {
    return (
      cart.value?.items.reduce((total, item) => total + item.productId.price * item.quantity, 0) ??
      0
    )
  })

  // Actions
  const fetchCart = (): Promise<void> => {
    if (fetchPromise) {
      return fetchPromise
    }

    const requestVersion = stateVersion

    isLoading.value = true
    errorMessage.value = ''

    fetchPromise = (async () => {
      try {
        const { data } = await withMinimumLoading(() => getCart())

        if (requestVersion !== stateVersion) {
          return
        }

        cart.value = data
      } catch (error) {
        if (requestVersion !== stateVersion) {
          return
        }

        errorMessage.value = getErrorMessage(error, CART_LOAD_ERROR_MESSAGE)

        toastStore.error(errorMessage.value)
      } finally {
        if (requestVersion === stateVersion) {
          isLoading.value = false
          fetchPromise = null
        }
      }
    })()

    return fetchPromise
  }

  const addItem = async (productId: string, quantity: number): Promise<void> => {
    const { data } = await addCartItemService({
      productId,
      quantity,
    })

    cart.value = data
  }

  const updateItem = async (productId: string, quantity: number): Promise<void> => {
    const { data } = await updateCartItemService(productId, {
      quantity,
    })

    cart.value = data
  }

  const removeItem = async (productId: string): Promise<void> => {
    const { data } = await removeCartItemService(productId)

    cart.value = data
  }

  const clearCart = async (): Promise<void> => {
    const { data } = await clearCartService()

    cart.value = data
  }

  const clearState = (): void => {
    stateVersion += 1

    fetchPromise = null
    cart.value = null
    isLoading.value = false
    errorMessage.value = ''
  }

  return {
    cart,
    isLoading,
    errorMessage,

    itemCount,
    totalPrice,

    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    clearState,
  }
})
