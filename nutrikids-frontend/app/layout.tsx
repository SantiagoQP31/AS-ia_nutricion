import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import AuthWrapper from "../components/auth-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NutriKids - Seguimiento Nutricional Infantil",
  description: "Sistema de seguimiento nutricional para niños",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
