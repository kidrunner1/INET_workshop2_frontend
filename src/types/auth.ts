import type { ApiResponse } from '@/types/api'

export type UserRole =
  | 'user'
  | 'admin'

export type UserStatus =
  | 'pending'
  | 'approved'

export interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role: UserRole
  status: UserStatus
}

export interface UserWithTimestamps extends User {
  createdAt: string
  updatedAt: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginData {
  token: string
  user: User
}

export type RegisterResponse =
  ApiResponse<User>

export type LoginResponse =
  ApiResponse<LoginData>
