"use client"

import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from "./lib/store"
import { ToastProvider } from "@/src/components/ui/Toast"
import { ThemeProvider } from "@/src/contexts/ThemeContext"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}
