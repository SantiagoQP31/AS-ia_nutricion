"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Ruler, Calculator } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import type { AnthropometricDataCreate } from "@/types/child"

interface AnthropometricFormProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function AnthropometricForm({ childId, onSuccess, onCancel }: AnthropometricFormProps) {
  const [formData, setFormData] = useState<AnthropometricDataCreate>({
    peso: 0,
    talla: 0,
    imc: 0,
    fecha_medicion: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calcular IMC automáticamente
  const calculateIMC = (peso: number, talla: number) => {
    if (peso > 0 && talla > 0) {
      const tallaMetros = talla / 100
      return Number((peso / (tallaMetros * tallaMetros)).toFixed(2))
    }
    return 0
  }

  const handleInputChange = (field: keyof AnthropometricDataCreate, value: string | number) => {
    const newFormData = { ...formData, [field]: value }

    // Recalcular IMC si cambia peso o talla
    if (field === "peso" || field === "talla") {
      newFormData.imc = calculateIMC(
        field === "peso" ? Number(value) : formData.peso,
        field === "talla" ? Number(value) : formData.talla,
      )
    }

    setFormData(newFormData)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.peso <= 0) newErrors.peso = "El peso debe ser mayor a 0"
    if (formData.peso > 200) newErrors.peso = "El peso no puede ser mayor a 200 kg"
    if (formData.talla <= 0) newErrors.talla = "La talla debe ser mayor a 0"
    if (formData.talla > 250) newErrors.talla = "La talla no puede ser mayor a 250 cm"
    if (!formData.fecha_medicion) newErrors.fecha_medicion = "La fecha de medición es obligatoria"

    // Validar fecha no futura
    if (formData.fecha_medicion) {
      const today = new Date().toISOString().split("T")[0]
      if (formData.fecha_medicion > today) {
        newErrors.fecha_medicion = "La fecha no puede ser futura"
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
      const result = await childApiService.addAnthropometricData(childId, formData)
      toast.success(result.message || "Datos antropométricos registrados exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar los datos")
    } finally {
      setLoading(false)
    }
  }

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { category: "Bajo peso", color: "text-blue-600" }
    if (imc < 25) return { category: "Normal", color: "text-green-600" }
    if (imc < 30) return { category: "Sobrepeso", color: "text-yellow-600" }
    return { category: "Obesidad", color: "text-red-600" }
  }

  const imcInfo = getIMCCategory(formData.imc)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Datos Antropométricos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="peso" className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Peso (kg) *
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={formData.peso || ""}
                onChange={(e) => handleInputChange("peso", Number(e.target.value))}
                className={errors.peso ? "border-red-500" : ""}
                placeholder="Ej: 15.5"
              />
              {errors.peso && <p className="text-sm text-red-500 mt-1">{errors.peso}</p>}
            </div>

            <div>
              <Label htmlFor="talla" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Talla (cm) *
              </Label>
              <Input
                id="talla"
                type="number"
                step="0.1"
                min="0"
                max="250"
                value={formData.talla || ""}
                onChange={(e) => handleInputChange("talla", Number(e.target.value))}
                className={errors.talla ? "border-red-500" : ""}
                placeholder="Ej: 105.5"
              />
              {errors.talla && <p className="text-sm text-red-500 mt-1">{errors.talla}</p>}
            </div>

            <div>
              <Label htmlFor="imc" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                IMC (calculado automáticamente)
              </Label>
              <div className="flex items-center gap-2">
                <Input id="imc" type="number" step="0.01" value={formData.imc} readOnly className="bg-gray-50" />
                {formData.imc > 0 && <span className={`text-sm font-medium ${imcInfo.color}`}>{imcInfo.category}</span>}
              </div>
            </div>

            <div>
              <Label htmlFor="fecha_medicion">Fecha de Medición *</Label>
              <Input
                id="fecha_medicion"
                type="date"
                value={formData.fecha_medicion}
                onChange={(e) => handleInputChange("fecha_medicion", e.target.value)}
                className={errors.fecha_medicion ? "border-red-500" : ""}
              />
              {errors.fecha_medicion && <p className="text-sm text-red-500 mt-1">{errors.fecha_medicion}</p>}
            </div>
          </div>

          {formData.imc > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Información del IMC</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="text-blue-600">Bajo peso: &lt; 18.5</div>
                <div className="text-green-600">Normal: 18.5 - 24.9</div>
                <div className="text-yellow-600">Sobrepeso: 25 - 29.9</div>
                <div className="text-red-600">Obesidad: ≥ 30</div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Registrando..." : "Registrar Datos"}
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
