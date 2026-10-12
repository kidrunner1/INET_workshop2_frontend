import api from '@/services/api'

import type {
  AdminUserListResponse,
  AdminUserResponse,
} from '@/types/user'

export const getAdminUsers =
  async (): Promise<AdminUserListResponse> => {
    const response =
      await api.get<AdminUserListResponse>(
        '/admin/users',
      )

    return response.data
  }

export const approveUser = async (
  id: string,
): Promise<AdminUserResponse> => {
  const response =
    await api.put<AdminUserResponse>(
      `/users/${id}/approve`,
    )

  return response.data
}
