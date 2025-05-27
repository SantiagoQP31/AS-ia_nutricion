"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)

    return minLength && hasUpper && hasLower && hasNumber
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validaciones
    if (!validatePassword(formData.password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        // No enviamos role_name, el backend asignará "usuario" por defecto
      })

      toast.success("Usuario registrado exitosamente. Ahora puedes iniciar sesión.")
      router.push("/auth/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate en NutriKids</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirma tu contraseña"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
