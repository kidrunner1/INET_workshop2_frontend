import type { ApiResponse } from '@/types/api'
import type { UserWithTimestamps } from '@/types/auth'

export type AdminUser = UserWithTimestamps

export type AdminUserResponse =
  ApiResponse<AdminUser>

export type AdminUserListResponse =
  ApiResponse<AdminUser[]>
