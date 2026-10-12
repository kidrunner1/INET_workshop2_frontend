import api from '@/services/api'

import type {
  CartResponse,
} from '@/types/cart'

export interface AddCartItemRequest {
  productId: string
  quantity: number
}

export const getCart =
  async (): Promise<CartResponse> => {
    const response =
      await api.get<CartResponse>(
        '/cart',
      )

    return response.data
  }

export const addCartItem = async (
  payload: AddCartItemRequest,
): Promise<CartResponse> => {
  const response =
    await api.post<CartResponse>(
      '/cart/items',
      payload,
    )

  return response.data
}

export interface UpdateCartItemRequest {
  quantity: number
}

export const updateCartItem = async (
  productId: string,
  payload: UpdateCartItemRequest,
): Promise<CartResponse> => {
  const response =
    await api.put<CartResponse>(
      `/cart/items/${productId}`,
      payload,
    )

  return response.data
}

export const removeCartItem = async (
  productId: string,
): Promise<CartResponse> => {
  const response =
    await api.delete<CartResponse>(
      `/cart/items/${productId}`,
    )

  return response.data
}

export const clearCart =
  async (): Promise<CartResponse> => {
    const response =
      await api.delete<CartResponse>(
        '/cart',
      )

    return response.data
  }
