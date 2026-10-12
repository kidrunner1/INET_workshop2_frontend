import api from '@/services/api'

import type {
  AdminOrderListResponse,
  AdminOrderResponse,
  OrderListResponse,
  OrderResponse,
  OrderStatus,
} from '@/types/order'

export const checkout =
  async (): Promise<OrderResponse> => {
    const response =
      await api.post<OrderResponse>(
        '/orders',
        {},
      )

    return response.data
  }

export const getMyOrders =
  async (): Promise<OrderListResponse> => {
    const response =
      await api.get<OrderListResponse>(
        '/orders/me',
      )

    return response.data
  }

export const getMyOrderById = async (
  id: string,
): Promise<OrderResponse> => {
  const response =
    await api.get<OrderResponse>(
      `/orders/${id}`,
    )

  return response.data
}

export const getAdminOrders =
  async (): Promise<AdminOrderListResponse> => {
    const response =
      await api.get<AdminOrderListResponse>(
        '/admin/orders',
      )

    return response.data
  }

export const getAdminOrderById = async (
  id: string,
): Promise<AdminOrderResponse> => {
  const response =
    await api.get<AdminOrderResponse>(
      `/admin/orders/${id}`,
    )

  return response.data
}

export const updateAdminOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<AdminOrderResponse> => {
  const response =
    await api.put<AdminOrderResponse>(
      `/admin/orders/${id}/status`,
      {
        status,
      },
    )

  return response.data
}
