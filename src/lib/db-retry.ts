/**
 * Retry logic untuk database operations yang mungkin fail karena network issues
 * Useful untuk Railway database yang sometimes unstable
 */

interface RetryOptions {
  maxRetries?: number
  delayMs?: number
  backoffMultiplier?: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 100, backoffMultiplier = 2 } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry on validation errors or auth errors
      if (error.code?.startsWith('P20') || error.code?.startsWith('P40') || error.code === 'P2002') {
        throw error
      }

      // Check if it's a connection error
      const isConnectionError =
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Connection reset') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('getaddrinfo')

      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }

      // Wait before retry with exponential backoff
      const waitTime = delayMs * Math.pow(backoffMultiplier, attempt)
      console.warn(
        `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${waitTime}ms...`,
        error.message
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw lastError || new Error('Database operation failed after retries')
}
