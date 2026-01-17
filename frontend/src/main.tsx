import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SignalingProvider } from './context/SignalingContext.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignalingProvider>
      <RouterProvider router={router} />
    </SignalingProvider>
  </StrictMode>,
)
