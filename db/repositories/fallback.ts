// This function wraps a database repository function with a fallback to mock data
export function withFallback<T, Args extends any[]>(
  dbFunction: (...args: Args) => Promise<T>,
  mockFunction: (...args: Args) => T,
  errorMessage: string,
) {
  return async (...args: Args): Promise<T> => {
    try {
      return await dbFunction(...args)
    } catch (error) {
      console.error(`${errorMessage}. Falling back to mock data:`, error)
      return mockFunction(...args)
    }
  }
}
