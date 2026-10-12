import api from '@/services/api'

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth'

export const login = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>(
    '/login',
    payload,
  )

  return data
}

export const register = async (
  payload: RegisterRequest,
): Promise<RegisterResponse> => {
  const { data } = await api.post<RegisterResponse>(
    '/register',
    payload,
  )

  return data
}
