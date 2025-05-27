"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Heart, Pill, AlertTriangle, Users } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import type { MedicalHistoryCreate } from "@/types/child"

interface MedicalHistoryFormProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function MedicalHistoryForm({ childId, onSuccess, onCancel }: MedicalHistoryFormProps) {
  const [formData, setFormData] = useState<MedicalHistoryCreate>({
    enfermedades: "",
    medicamentos: "",
    alergias: "",
    antecedentes_familiares: "",
    fecha_registro: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof MedicalHistoryCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar longitud de campos de texto
    const textFields = ["enfermedades", "medicamentos", "alergias", "antecedentes_familiares"] as const
    textFields.forEach((field) => {
      const value = formData[field]
      if (value && value.length > 1000) {
        newErrors[field] = "El texto no puede exceder 1000 caracteres"
      }
    })

    // Validar fecha no futura
    if (formData.fecha_registro) {
      const today = new Date().toISOString().split("T")[0]
      if (formData.fecha_registro > today) {
        newErrors.fecha_registro = "La fecha no puede ser futura"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Preparar datos según el formato del backend (strings, no arrays)
      const dataToSend: MedicalHistoryCreate = {
        enfermedades: formData.enfermedades?.trim() || undefined,
        medicamentos: formData.medicamentos?.trim() || undefined,
        alergias: formData.alergias?.trim() || undefined,
        antecedentes_familiares: formData.antecedentes_familiares?.trim() || undefined,
        fecha_registro: formData.fecha_registro || undefined,
      }

      const result = await childApiService.addMedicalHistory(childId, dataToSend)
      toast.success(result.message || "Historial médico registrado exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar el historial")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Historial Médico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enfermedades */}
          <div className="space-y-2">
            <Label htmlFor="enfermedades" className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Enfermedades
            </Label>
            <Textarea
              id="enfermedades"
              value={formData.enfermedades || ""}
              onChange={(e) => handleInputChange("enfermedades", e.target.value)}
              className={errors.enfermedades ? "border-red-500" : ""}
              placeholder="Describe las enfermedades actuales o pasadas del niño..."
              rows={3}
            />
            {errors.enfermedades && <p className="text-sm text-red-500">{errors.enfermedades}</p>}
            <p className="text-xs text-gray-500">{formData.enfermedades?.length || 0}/1000 caracteres</p>
          </div>

          {/* Medicamentos */}
          <div className="space-y-2">
            <Label htmlFor="medicamentos" className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-500" />
              Medicamentos
            </Label>
            <Textarea
              id="medicamentos"
              value={formData.medicamentos || ""}
              onChange={(e) => handleInputChange("medicamentos", e.target.value)}
              className={errors.medicamentos ? "border-red-500" : ""}
              placeholder="Lista los medicamentos que toma actualmente el niño..."
              rows={3}
            />
            {errors.medicamentos && <p className="text-sm text-red-500">{errors.medicamentos}</p>}
            <p className="text-xs text-gray-500">{formData.medicamentos?.length || 0}/1000 caracteres</p>
          </div>

          {/* Alergias */}
          <div className="space-y-2">
            <Label htmlFor="alergias" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Alergias
            </Label>
            <Textarea
              id="alergias"
              value={formData.alergias || ""}
              onChange={(e) => handleInputChange("alergias", e.target.value)}
              className={errors.alergias ? "border-red-500" : ""}
              placeholder="Describe las alergias conocidas del niño..."
              rows={3}
            />
            {errors.alergias && <p className="text-sm text-red-500">{errors.alergias}</p>}
            <p className="text-xs text-gray-500">{formData.alergias?.length || 0}/1000 caracteres</p>
          </div>

          {/* Antecedentes Familiares */}
          <div className="space-y-2">
            <Label htmlFor="antecedentes_familiares" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Antecedentes Familiares
            </Label>
            <Textarea
              id="antecedentes_familiares"
              value={formData.antecedentes_familiares || ""}
              onChange={(e) => handleInputChange("antecedentes_familiares", e.target.value)}
              className={errors.antecedentes_familiares ? "border-red-500" : ""}
              placeholder="Describe los antecedentes médicos familiares relevantes..."
              rows={3}
            />
            {errors.antecedentes_familiares && <p className="text-sm text-red-500">{errors.antecedentes_familiares}</p>}
            <p className="text-xs text-gray-500">{formData.antecedentes_familiares?.length || 0}/1000 caracteres</p>
          </div>

          {/* Fecha de Registro */}
          <div>
            <Label htmlFor="fecha_registro">Fecha de Registro</Label>
            <Input
              id="fecha_registro"
              type="date"
              value={formData.fecha_registro || ""}
              onChange={(e) => handleInputChange("fecha_registro", e.target.value)}
              className={errors.fecha_registro ? "border-red-500" : ""}
            />
            {errors.fecha_registro && <p className="text-sm text-red-500 mt-1">{errors.fecha_registro}</p>}
          </div>

          {/* Resumen */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Historial</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Enfermedades:</span>{" "}
                {formData.enfermedades ? "Registradas" : "Sin registrar"}
              </div>
              <div>
                <span className="font-medium">Medicamentos:</span>{" "}
                {formData.medicamentos ? "Registrados" : "Sin registrar"}
              </div>
              <div>
                <span className="font-medium">Alergias:</span> {formData.alergias ? "Registradas" : "Sin registrar"}
              </div>
              <div>
                <span className="font-medium">Antecedentes:</span>{" "}
                {formData.antecedentes_familiares ? "Registrados" : "Sin registrar"}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Registrando..." : "Registrar Historial"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
