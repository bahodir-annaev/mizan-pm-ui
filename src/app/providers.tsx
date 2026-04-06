import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { TranslationProvider } from './contexts/TranslationContext';
import { TimeTrackingProvider } from '@/contexts/TimeTrackingContext';
import { OverlayProvider } from '@/app/contexts/OverlayContext';
import { BudgetProvider } from '@/app/contexts/BudgetContext';
import { AuthProvider } from '@/app/auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <OverlayProvider>
            <BudgetProvider>
              <AuthProvider>
                <TimeTrackingProvider>
                  <RouterProvider router={router} />
                </TimeTrackingProvider>
              </AuthProvider>
            </BudgetProvider>
          </OverlayProvider>
        </TranslationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
