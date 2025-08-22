import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client with aggressive deduplication and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent duplicate requests within 5 seconds
      staleTime: 5 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't retry on 4xx errors
      retryOnMount: false,
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: false,
      // Refetch on reconnect only if data is stale
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations 1 time
      retry: 1,
    },
  },
})

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
