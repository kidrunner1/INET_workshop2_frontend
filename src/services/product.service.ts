import api from '@/services/api'

import type {
  ProductListResponse,
  ProductResponse,
} from '@/types/product'

export interface ProductQuery {
  search?: string
  category?: string
  page?: number
  limit?: number
}

export interface ProductPayload {
  name: string
  price: number
  stock: number
  description?: string
  imageUrl?: string
  category?: string
}

export const getProducts = async (
  query: ProductQuery = {},
): Promise<ProductListResponse> => {
  const response =
    await api.get<ProductListResponse>(
      '/products',
      {
        params: query,
      },
    )

  return response.data
}

export const getProductById = async (
  id: string,
): Promise<ProductResponse> => {
  const response =
    await api.get<ProductResponse>(
      `/products/${id}`,
    )

  return response.data
}

export const createProduct = async (
  payload: ProductPayload,
): Promise<ProductResponse> => {
  const response =
    await api.post<ProductResponse>(
      '/products',
      payload,
    )

  return response.data
}

export const updateProduct = async (
  id: string,
  payload: ProductPayload,
): Promise<ProductResponse> => {
  const response =
    await api.put<ProductResponse>(
      `/products/${id}`,
      payload,
    )

  return response.data
}

export const deleteProduct = async (
  id: string,
) => {
  const response =
    await api.delete(
      `/products/${id}`,
    )

  return response.data
}
