'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'

// BRAINSAIT: Global providers for healthcare platform
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // MEDICAL: Don't retry on authentication errors
          if (error?.status === 401 || error?.status === 403) {
            return false
          }
          return failureCount < 3
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
