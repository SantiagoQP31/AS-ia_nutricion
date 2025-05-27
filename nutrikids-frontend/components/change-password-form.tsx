"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ChangePasswordFormProps {
  onSuccess: () => void
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)

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
    if (!validatePassword(formData.newPassword)) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número")
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      })

      toast.success("Contraseña cambiada exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cambiar contraseña")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Contraseña Actual</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
            placeholder="Tu contraseña actual"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("current")}
          >
            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="newPassword">Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Nueva contraseña"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("new")}
          >
            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Confirma la nueva contraseña"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? "Cambiando..." : "Cambiar Contraseña"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
