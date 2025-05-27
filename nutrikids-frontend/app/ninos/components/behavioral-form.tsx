"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Apple, Salad, Dumbbell, Monitor } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import type { BehavioralDataCreate } from "@/types/child"

interface BehavioralFormProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function BehavioralForm({ childId, onSuccess, onCancel }: BehavioralFormProps) {
  const [formData, setFormData] = useState<BehavioralDataCreate>({
    consumo_frutas: false,
    consumo_verduras: false,
    actividad_fisica: false,
    tiempo_pantalla: undefined,
    fecha_registro: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCheckboxChange = (field: keyof BehavioralDataCreate, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleInputChange = (field: keyof BehavioralDataCreate, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.tiempo_pantalla !== undefined) {
      if (formData.tiempo_pantalla < 0) {
        newErrors.tiempo_pantalla = "El tiempo de pantalla no puede ser negativo"
      }
      if (formData.tiempo_pantalla > 24) {
        newErrors.tiempo_pantalla = "El tiempo de pantalla no puede exceder 24 horas al día"
      }
    }

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
      // Preparar datos según el formato del backend
      const dataToSend: BehavioralDataCreate = {
        consumo_frutas: formData.consumo_frutas,
        consumo_verduras: formData.consumo_verduras,
        actividad_fisica: formData.actividad_fisica,
        tiempo_pantalla: formData.tiempo_pantalla || undefined,
        fecha_registro: formData.fecha_registro || undefined,
      }

      const result = await childApiService.addBehavioralData(childId, dataToSend)
      toast.success(result.message || "Datos conductuales registrados exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar los datos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5" />
          Datos Conductuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Consumo de Frutas */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="consumo_frutas"
              checked={formData.consumo_frutas}
              onCheckedChange={(checked) => handleCheckboxChange("consumo_frutas", checked as boolean)}
            />
            <Label htmlFor="consumo_frutas" className="flex items-center gap-2">
              <Apple className="w-4 h-4 text-red-500" />
              Consumo adecuado de frutas
            </Label>
          </div>

          {/* Consumo de Verduras */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="consumo_verduras"
              checked={formData.consumo_verduras}
              onCheckedChange={(checked) => handleCheckboxChange("consumo_verduras", checked as boolean)}
            />
            <Label htmlFor="consumo_verduras" className="flex items-center gap-2">
              <Salad className="w-4 h-4 text-green-500" />
              Consumo adecuado de verduras
            </Label>
          </div>

          {/* Actividad Física */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="actividad_fisica"
              checked={formData.actividad_fisica}
              onCheckedChange={(checked) => handleCheckboxChange("actividad_fisica", checked as boolean)}
            />
            <Label htmlFor="actividad_fisica" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              Realiza actividad física regular
            </Label>
          </div>

          {/* Tiempo de Pantalla */}
          <div>
            <Label htmlFor="tiempo_pantalla" className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-500" />
              Tiempo de Pantalla (horas por día) - Opcional
            </Label>
            <Input
              id="tiempo_pantalla"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.tiempo_pantalla || ""}
              onChange={(e) =>
                handleInputChange("tiempo_pantalla", e.target.value ? Number(e.target.value) : undefined)
              }
              className={errors.tiempo_pantalla ? "border-red-500" : ""}
              placeholder="Ej: 2.5"
            />
            {errors.tiempo_pantalla && <p className="text-sm text-red-500 mt-1">{errors.tiempo_pantalla}</p>}
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

          {/* Resumen de Hábitos */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Resumen de Hábitos</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Frutas:</span>
                <span className={formData.consumo_frutas ? "text-green-600" : "text-red-600"}>
                  {formData.consumo_frutas ? "Adecuado" : "Inadecuado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Verduras:</span>
                <span className={formData.consumo_verduras ? "text-green-600" : "text-red-600"}>
                  {formData.consumo_verduras ? "Adecuado" : "Inadecuado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Actividad Física:</span>
                <span className={formData.actividad_fisica ? "text-green-600" : "text-red-600"}>
                  {formData.actividad_fisica ? "Regular" : "Insuficiente"}
                </span>
              </div>
              {formData.tiempo_pantalla !== undefined && (
                <div className="flex justify-between">
                  <span>Tiempo de Pantalla:</span>
                  <span className={formData.tiempo_pantalla <= 2 ? "text-green-600" : "text-yellow-600"}>
                    {formData.tiempo_pantalla} horas/día
                  </span>
                </div>
              )}
            </div>
          </div>

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
