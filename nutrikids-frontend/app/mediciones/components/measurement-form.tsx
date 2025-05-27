"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Ruler, Calculator, User } from "lucide-react"
import { toast } from "sonner"
import { measurementApiService } from "@/services/measurement-api"
import { childApiService } from "@/services/child-api"
import type { MeasurementCreate, MeasurementUpdate } from "@/types/measurement"
import type { ChildSummary } from "@/types/child"

interface MeasurementFormProps {
  measurementId?: string | null
  preselectedChildId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

const initialFormData: MeasurementCreate = {
  child_id: "",
  peso: 0,
  talla: 0,
  fecha_medicion: new Date().toISOString().split("T")[0],
}

export default function MeasurementForm({
  measurementId,
  preselectedChildId,
  onSuccess,
  onCancel,
}: MeasurementFormProps) {
  const [formData, setFormData] = useState<MeasurementCreate>(initialFormData)
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchChildren()
    if (measurementId) {
      fetchMeasurementData()
    } else if (preselectedChildId) {
      setFormData((prev) => ({ ...prev, child_id: preselectedChildId }))
    }
  }, [measurementId, preselectedChildId])

  const fetchChildren = async () => {
    try {
      setLoadingChildren(true)
      const data = await childApiService.getChildren()
      setChildren(data)
    } catch (error) {
      toast.error("No se pudieron cargar los niños")
    } finally {
      setLoadingChildren(false)
    }
  }

  const fetchMeasurementData = async () => {
    try {
      const data = await measurementApiService.getMeasurementById(measurementId!)
      setFormData({
        child_id: data.child_id,
        peso: data.peso,
        talla: data.talla,
        fecha_medicion: data.fecha_medicion,
      })
    } catch (error) {
      toast.error("No se pudieron cargar los datos de la medición")
    }
  }

  // Calcular IMC automáticamente
  const calculateIMC = (peso: number, talla: number) => {
    if (peso > 0 && talla > 0) {
      const tallaMetros = talla / 100
      return Number((peso / (tallaMetros * tallaMetros)).toFixed(2))
    }
    return 0
  }

  const handleInputChange = (field: keyof MeasurementCreate, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.child_id) newErrors.child_id = "Debe seleccionar un niño"
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
      if (measurementId) {
        // Actualizar medición existente
        const updateData: MeasurementUpdate = {
          peso: formData.peso,
          talla: formData.talla,
          fecha_medicion: formData.fecha_medicion,
          child_id: formData.child_id,
        }

        const result = await measurementApiService.updateMeasurement(measurementId, updateData)
        toast.success(result.message || "Medición actualizada exitosamente")
      } else {
        // Crear nueva medición
        const result = await measurementApiService.createMeasurement(formData)
        toast.success(result.message || "Medición registrada exitosamente")
      }

      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud")
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

  const currentIMC = calculateIMC(formData.peso, formData.talla)
  const imcInfo = getIMCCategory(currentIMC)
  const selectedChild = children.find((child) => child.id === formData.child_id)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          {measurementId ? "Editar Medición" : "Nueva Medición Antropométrica"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Niño */}
          <div>
            <Label htmlFor="child_id" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Niño *
            </Label>
            <Select
              value={formData.child_id}
              onValueChange={(value) => handleInputChange("child_id", value)}
              disabled={!!preselectedChildId || loadingChildren}
            >
              <SelectTrigger className={errors.child_id ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingChildren ? "Cargando niños..." : "Seleccionar niño"} />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.nombre} {child.apellido} - {child.documento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.child_id && <p className="text-sm text-red-500 mt-1">{errors.child_id}</p>}
            {selectedChild && (
              <p className="text-sm text-gray-600 mt-1">
                Edad: {new Date().getFullYear() - new Date(selectedChild.fecha_nacimiento).getFullYear()} años
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Peso */}
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

            {/* Talla */}
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
          </div>

          {/* IMC Calculado */}
          {currentIMC > 0 && (
            <div>
              <Label className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                IMC (calculado automáticamente)
              </Label>
              <div className="flex items-center gap-2">
                <Input value={currentIMC} readOnly className="bg-gray-50" />
                <span className={`text-sm font-medium ${imcInfo.color}`}>{imcInfo.category}</span>
              </div>
            </div>
          )}

          {/* Fecha de Medición */}
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

          {/* Información del IMC */}
          {currentIMC > 0 && (
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
              {loading ? "Procesando..." : measurementId ? "Actualizar Medición" : "Registrar Medición"}
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
