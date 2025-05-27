"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "./sidebar"

const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"]

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Si es una ruta pública, mostrar sin sidebar
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Si no está autenticado y no es ruta pública, redirigir al login
  if (!isAuthenticated) {
    window.location.href = "/auth/login"
    return null
  }

  // Si está autenticado, mostrar con sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
