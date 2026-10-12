import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/auth'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface BaseOrder {
  _id: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface Order extends BaseOrder {
  userId: string
}

export interface AdminOrder extends BaseOrder {
  userId: User | null
}

export type OrderResponse =
  ApiResponse<Order>

export type OrderListResponse =
  ApiResponse<Order[]>

export type AdminOrderResponse =
  ApiResponse<AdminOrder>

export type AdminOrderListResponse =
  ApiResponse<AdminOrder[]>
