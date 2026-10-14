export const MINIMUM_LOADING_MS = 1000

/** Start the request immediately; only hold fast responses to avoid flashing skeletons. */
export async function withMinimumLoading<T>(
  request: () => Promise<T>,
  minimumMs = MINIMUM_LOADING_MS,
): Promise<T> {
  const startedAt = Date.now()

  try {
    return await request()
  } finally {
    const remaining = minimumMs - (Date.now() - startedAt)
    if (remaining > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remaining))
    }
  }
}
