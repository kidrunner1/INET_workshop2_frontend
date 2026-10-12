import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { login as loginService } from '@/services/auth.service'
import type { User } from '@/types/auth'

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
} as const

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.user)

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as User
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(
    localStorage.getItem(STORAGE_KEYS.token),
  )

  const user = ref<User | null>(getStoredUser())

  // Getters
  const isAuthenticated = computed(() => Boolean(token.value))

  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (
    username: string,
    password: string,
  ): Promise<void> => {
    const { data } = await loginService({
      username,
      password,
    })

    token.value = data.token
    user.value = data.user

    localStorage.setItem(STORAGE_KEYS.token, data.token)
    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(data.user),
    )
  }

  const logout = (): void => {
    token.value = null
    user.value = null

    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
  }

  return {
    token,
    user,

    isAuthenticated,
    isAdmin,

    login,
    logout,
  }
})
