import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css"
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from "sonner";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <App />
    <Toaster
        position="top-center"
        richColors
        closeButton
      />
    </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
