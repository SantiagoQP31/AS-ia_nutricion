"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Home, MapPin, GraduationCap, DollarSign, Utensils, Droplets, Gift, X, Plus } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import type { HouseholdCreate, LocationType, FoodSecurity } from "@/types/child"
import { VALID_EDUCATION_LEVELS, VALID_GOVERNMENT_AIDS } from "@/types/child"

interface HouseholdFormProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function HouseholdForm({ childId, onSuccess, onCancel }: HouseholdFormProps) {
  const [formData, setFormData] = useState<HouseholdCreate>({
    location_type: "urbano",
    caregiver_education_level: undefined,
    monthly_income: undefined,
    food_security: undefined,
    water_access: undefined,
    government_aid: [],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newAid, setNewAid] = useState("")

  const educationLevelLabels: Record<string, string> = {
    sin_educacion: "Sin educación formal",
    primaria_incompleta: "Primaria incompleta",
    primaria_completa: "Primaria completa",
    secundaria_incompleta: "Secundaria incompleta",
    secundaria_completa: "Secundaria completa",
    tecnica: "Técnico",
    universitaria_incompleta: "Universitario incompleto",
    universitaria_completa: "Universitario completo",
    posgrado: "Posgrado",
  }

  const governmentAidLabels: Record<string, string> = {
    familias_en_accion: "Familias en Acción",
    joven_en_accion: "Joven en Acción",
    colombia_mayor: "Colombia Mayor",
    subsidio_vivienda: "Subsidio de Vivienda",
    sisben: "SISBEN",
    otro: "Otro",
  }

  const handleInputChange = (field: keyof HouseholdCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addGovernmentAid = () => {
    if (newAid.trim()) {
      const currentAids = formData.government_aid || []
      if (!currentAids.includes(newAid.trim())) {
        setFormData((prev) => ({
          ...prev,
          government_aid: [...currentAids, newAid.trim()],
        }))
        setNewAid("")
      } else {
        toast.error("Esta ayuda gubernamental ya está en la lista")
      }
    }
  }

  const removeGovernmentAid = (index: number) => {
    const currentAids = formData.government_aid || []
    setFormData((prev) => ({
      ...prev,
      government_aid: currentAids.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.location_type) newErrors.location_type = "El tipo de ubicación es obligatorio"

    if (formData.monthly_income !== undefined && formData.monthly_income < 0) {
      newErrors.monthly_income = "El ingreso mensual no puede ser negativo"
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
      const dataToSend: HouseholdCreate = {
        location_type: formData.location_type,
        caregiver_education_level: formData.caregiver_education_level || undefined,
        monthly_income: formData.monthly_income || undefined,
        food_security: formData.food_security || undefined,
        water_access: formData.water_access || undefined,
        government_aid: formData.government_aid || [],
      }

      const result = await childApiService.addHouseholdData(childId, dataToSend)
      toast.success(result.message || "Datos del hogar registrados exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar los datos")
    } finally {
      setLoading(false)
    }
  }

  const getIncomeCategory = (income?: number) => {
    if (!income) return null
    const salarioMinimo = 1300000 // Aproximado para Colombia 2024

    if (income < salarioMinimo) return { category: "Bajo", color: "text-red-600" }
    if (income < salarioMinimo * 2) return { category: "Medio-Bajo", color: "text-yellow-600" }
    if (income < salarioMinimo * 4) return { category: "Medio", color: "text-green-600" }
    return { category: "Alto", color: "text-blue-600" }
  }

  const getFoodSecurityColor = (security?: FoodSecurity) => {
    switch (security) {
      case "seguro":
        return "text-green-600"
      case "moderado":
        return "text-yellow-600"
      case "grave":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const incomeInfo = getIncomeCategory(formData.monthly_income)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Datos del Hogar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Ubicación */}
          <div>
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Tipo de Ubicación *
            </Label>
            <Select
              value={formData.location_type}
              onValueChange={(value: LocationType) => handleInputChange("location_type", value)}
            >
              <SelectTrigger className={errors.location_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urbano">Urbano</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
              </SelectContent>
            </Select>
            {errors.location_type && <p className="text-sm text-red-500 mt-1">{errors.location_type}</p>}
          </div>

          {/* Nivel Educativo del Cuidador */}
          <div>
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Nivel Educativo del Cuidador
            </Label>
            <Select
              value={formData.caregiver_education_level || ""}
              onValueChange={(value) => handleInputChange("caregiver_education_level", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel educativo" />
              </SelectTrigger>
              <SelectContent>
                {VALID_EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {educationLevelLabels[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ingreso Mensual */}
          <div>
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ingreso Mensual del Hogar (COP)
            </Label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={formData.monthly_income || ""}
              onChange={(e) => handleInputChange("monthly_income", e.target.value ? Number(e.target.value) : undefined)}
              className={errors.monthly_income ? "border-red-500" : ""}
              placeholder="Ej: 1500000"
            />
            {errors.monthly_income && <p className="text-sm text-red-500 mt-1">{errors.monthly_income}</p>}
            {incomeInfo && <p className={`text-sm mt-1 ${incomeInfo.color}`}>Categoría: {incomeInfo.category}</p>}
          </div>

          {/* Seguridad Alimentaria */}
          <div>
            <Label className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Seguridad Alimentaria
            </Label>
            <Select
              value={formData.food_security || ""}
              onValueChange={(value: FoodSecurity) => handleInputChange("food_security", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel de seguridad alimentaria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seguro">Seguro</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="grave">Grave</SelectItem>
              </SelectContent>
            </Select>
            {formData.food_security && (
              <p className={`text-sm mt-1 ${getFoodSecurityColor(formData.food_security)}`}>
                Nivel: {formData.food_security}
              </p>
            )}
          </div>

          {/* Acceso al Agua */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="water_access"
              checked={formData.water_access || false}
              onCheckedChange={(checked) => handleInputChange("water_access", checked)}
            />
            <Label htmlFor="water_access" className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Acceso a Agua Potable
            </Label>
          </div>

          {/* Ayudas Gubernamentales */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Ayudas Gubernamentales
            </Label>
            <div className="flex gap-2">
              <Select value={newAid} onValueChange={setNewAid}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar ayuda gubernamental..." />
                </SelectTrigger>
                <SelectContent>
                  {VALID_GOVERNMENT_AIDS.map((aid) => (
                    <SelectItem key={aid} value={aid}>
                      {governmentAidLabels[aid]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={addGovernmentAid} disabled={!newAid}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.government_aid || []).map((aid, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {governmentAidLabels[aid] || aid}
                  <button type="button" onClick={() => removeGovernmentAid(index)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Hogar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Ubicación:</span>
                <span className="font-medium">{formData.location_type}</span>
              </div>
              {formData.caregiver_education_level && (
                <div className="flex justify-between">
                  <span>Educación:</span>
                  <span className="font-medium">{educationLevelLabels[formData.caregiver_education_level]}</span>
                </div>
              )}
              {formData.monthly_income && (
                <div className="flex justify-between">
                  <span>Ingresos:</span>
                  <span className={`font-medium ${incomeInfo?.color}`}>
                    ${formData.monthly_income.toLocaleString()}
                  </span>
                </div>
              )}
              {formData.food_security && (
                <div className="flex justify-between">
                  <span>Seg. Alimentaria:</span>
                  <span className={`font-medium ${getFoodSecurityColor(formData.food_security)}`}>
                    {formData.food_security}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Agua Potable:</span>
                <span className={`font-medium ${formData.water_access ? "text-green-600" : "text-red-600"}`}>
                  {formData.water_access ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ayudas Gub.:</span>
                <span className="font-medium">{(formData.government_aid || []).length}</span>
              </div>
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
