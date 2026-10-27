import api from '@/services/api'

import type { ProductListResponse, ProductResponse } from '@/types/product'
import type { ApiResponse } from '@/types/api'

export const uploadProductImage = async (
  file: File,
  signal: AbortSignal,
  onProgress: (percent: number | null) => void,
): Promise<ApiResponse<{ imageUrl: string }>> => {
  const body = new FormData()
  body.append('image', file)
  const response = await api.post<ApiResponse<{ imageUrl: string }>>('/products/image', body, {
    signal,
    timeout: 60000,
    onUploadProgress: ({ loaded, total }) => {
      onProgress(total ? Math.min(100, Math.round((loaded / total) * 100)) : null)
    },
  })
  return response.data
}

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
  signal?: AbortSignal,
): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>('/products', {
    params: query,
    signal,
  })

  return response.data
}

export const getProductById = async (id: string): Promise<ProductResponse> => {
  const response = await api.get<ProductResponse>(`/products/${id}`)

  return response.data
}

export const createProduct = async (payload: ProductPayload): Promise<ProductResponse> => {
  const response = await api.post<ProductResponse>('/products', payload)

  return response.data
}

export const updateProduct = async (
  id: string,
  payload: ProductPayload,
): Promise<ProductResponse> => {
  const response = await api.put<ProductResponse>(`/products/${id}`, payload)

  return response.data
}

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`)

  return response.data
}
