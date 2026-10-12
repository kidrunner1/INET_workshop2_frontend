import type { ApiResponse } from '@/types/api'
import type { Product } from '@/types/product'

export interface CartItem {
  productId: Product
  quantity: number
}

export interface Cart {
  _id?: string
  userId: string
  items: CartItem[]
  createdAt?: string
  updatedAt?: string
}

export interface AddCartItemRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export type CartResponse = ApiResponse<Cart>
