import type { ApiResponse } from '@/types/api'

export interface Product {
  _id: string
  name: string
  price: number
  stock: number
  description: string
  imageUrl: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListData {
  products: Product[]
  pagination: ProductPagination
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

export type ProductResponse =
  ApiResponse<Product>

export type ProductListResponse =
  ApiResponse<ProductListData>
