// src/utils/get-error-message.ts

import axios from 'axios'

export const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage
  }

  return error.response?.data?.message ?? fallbackMessage
}
