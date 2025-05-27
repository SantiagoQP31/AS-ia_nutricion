"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, Calendar, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import type { ClassificationResultCreate } from "@/types/child"
import { VALID_CLASSIFICATION_RESULTS, VALID_MODELS } from "@/types/child"

interface ClassificationFormProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ClassificationForm({ childId, onSuccess, onCancel }: ClassificationFormProps) {
  const [formData, setFormData] = useState<ClassificationResultCreate>({
    resultado: "",
    modelo: "",
    fecha_resultado: undefined,
    confidence_score: undefined,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resultLabels: Record<string, string> = {
    desnutricion_aguda_severa: "Desnutrición Aguda Severa",
    desnutricion_aguda_moderada: "Desnutrición Aguda Moderada",
    riesgo_desnutricion: "Riesgo de Desnutrición",
    normal: "Normal",
    sobrepeso: "Sobrepeso",
    obesidad: "Obesidad",
  }

  const modelLabels: Record<string, string> = {
    random_forest_v1: "Random Forest v1",
    svm_v1: "SVM v1",
    neural_network_v1: "Neural Network v1",
    ensemble_v1: "Ensemble v1",
  }

  const handleInputChange = (field: keyof ClassificationResultCreate, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.resultado.trim()) newErrors.resultado = "El resultado es obligatorio"
    if (!formData.modelo.trim()) newErrors.modelo = "El modelo es obligatorio"

    if (formData.confidence_score !== undefined) {
      if (formData.confidence_score < 0 || formData.confidence_score > 1) {
        newErrors.confidence_score = "El score de confianza debe estar entre 0 y 1"
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
      const dataToSend: ClassificationResultCreate = {
        resultado: formData.resultado,
        modelo: formData.modelo,
        fecha_resultado: formData.fecha_resultado || undefined,
        confidence_score: formData.confidence_score || undefined,
      }

      const result = await childApiService.addClassificationResult(childId, dataToSend)
      toast.success(result.message || "Resultado de clasificación registrado exitosamente")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar el resultado")
    } finally {
      setLoading(false)
    }
  }

  const getResultadoBadgeColor = (resultado: string) => {
    switch (resultado) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "riesgo_desnutricion":
        return "bg-yellow-100 text-yellow-800"
      case "desnutricion_aguda_moderada":
      case "sobrepeso":
        return "bg-orange-100 text-orange-800"
      case "desnutricion_aguda_severa":
      case "obesidad":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return "text-gray-600"
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (score?: number) => {
    if (!score) return "No especificado"
    if (score >= 0.8) return "Alta confianza"
    if (score >= 0.6) return "Confianza media"
    return "Baja confianza"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Resultado de Clasificación IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resultado */}
          <div>
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Resultado de la Clasificación *
            </Label>
            <Select value={formData.resultado} onValueChange={(value) => handleInputChange("resultado", value)}>
              <SelectTrigger className={errors.resultado ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar resultado" />
              </SelectTrigger>
              <SelectContent>
                {VALID_CLASSIFICATION_RESULTS.map((resultado) => (
                  <SelectItem key={resultado} value={resultado}>
                    {resultLabels[resultado]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resultado && <p className="text-sm text-red-500 mt-1">{errors.resultado}</p>}
            {formData.resultado && (
              <div className="mt-2">
                <Badge className={getResultadoBadgeColor(formData.resultado)}>{resultLabels[formData.resultado]}</Badge>
              </div>
            )}
          </div>

          {/* Modelo */}
          <div>
            <Label className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Modelo Utilizado *
            </Label>
            <Select value={formData.modelo} onValueChange={(value) => handleInputChange("modelo", value)}>
              <SelectTrigger className={errors.modelo ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar modelo" />
              </SelectTrigger>
              <SelectContent>
                {VALID_MODELS.map((modelo) => (
                  <SelectItem key={modelo} value={modelo}>
                    {modelLabels[modelo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modelo && <p className="text-sm text-red-500 mt-1">{errors.modelo}</p>}
          </div>

          {/* Score de Confianza */}
          <div>
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Score de Confianza (0.0 - 1.0) - Opcional
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.confidence_score || ""}
              onChange={(e) =>
                handleInputChange("confidence_score", e.target.value ? Number(e.target.value) : undefined)
              }
              className={errors.confidence_score ? "border-red-500" : ""}
              placeholder="Ej: 0.85"
            />
            {errors.confidence_score && <p className="text-sm text-red-500 mt-1">{errors.confidence_score}</p>}
            {formData.confidence_score !== undefined && (
              <p className={`text-sm mt-1 ${getConfidenceColor(formData.confidence_score)}`}>
                {getConfidenceLabel(formData.confidence_score)} ({(formData.confidence_score * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          {/* Fecha del Resultado */}
          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha del Resultado - Opcional
            </Label>
            <Input
              type="datetime-local"
              value={formData.fecha_resultado || ""}
              onChange={(e) => handleInputChange("fecha_resultado", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Si no se especifica, se usará la fecha y hora actual</p>
          </div>

          {/* Resumen del Resultado */}
          {formData.resultado && formData.modelo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Resumen de la Clasificación</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Resultado:</span>
                  <Badge className={getResultadoBadgeColor(formData.resultado)}>
                    {resultLabels[formData.resultado]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Modelo:</span>
                  <span className="font-medium">{modelLabels[formData.modelo]}</span>
                </div>
                {formData.confidence_score !== undefined && (
                  <div className="flex justify-between">
                    <span>Confianza:</span>
                    <span className={`font-medium ${getConfidenceColor(formData.confidence_score)}`}>
                      {(formData.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Recomendaciones basadas en el resultado */}
              {formData.resultado && (
                <div className="mt-3 p-3 bg-white rounded border-l-4 border-indigo-500">
                  <h5 className="font-medium text-indigo-900 mb-1">Recomendación:</h5>
                  <p className="text-sm text-indigo-700">
                    {formData.resultado === "normal" &&
                      "Mantener hábitos alimentarios saludables y seguimiento regular."}
                    {formData.resultado.includes("desnutricion") &&
                      "Requiere intervención nutricional inmediata y seguimiento médico."}
                    {formData.resultado === "sobrepeso" &&
                      "Implementar plan de alimentación balanceada y actividad física."}
                    {formData.resultado === "obesidad" && "Requiere intervención multidisciplinaria urgente."}
                    {formData.resultado === "riesgo_desnutricion" && "Monitoreo cercano y medidas preventivas."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Registrando..." : "Registrar Resultado"}
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
