import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css"
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from "sonner";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <App />
    <Toaster
        position="top-center"
        richColors
        closeButton
      />
    </AuthProvider>
  </StrictMode>,
)
