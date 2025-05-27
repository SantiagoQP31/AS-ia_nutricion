"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { PredictionResponse } from "@/types/ai"

interface PredictionResultProps {
  result: PredictionResponse
}

const getStateInfo = (state: string) => {
  const stateMap = {
    normal: {
      label: "Normal",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      icon: CheckCircle,
      description: "El estado nutricional es adecuado para la edad",
    },
    riesgo_desnutricion: {
      label: "Riesgo de Desnutrición",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: AlertTriangle,
      description: "Existe riesgo de desarrollar desnutrición",
    },
    desnutricion_aguda_moderada: {
      label: "Desnutrición Aguda Moderada",
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: AlertTriangle,
      description: "Requiere intervención nutricional inmediata",
    },
    desnutricion_aguda_severa: {
      label: "Desnutrición Aguda Severa",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      icon: XCircle,
      description: "Requiere atención médica urgente",
    },
    sobrepeso: {
      label: "Sobrepeso",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: TrendingUp,
      description: "Peso por encima del rango normal para la edad",
    },
    obesidad: {
      label: "Obesidad",
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: TrendingUp,
      description: "Peso significativamente por encima del rango normal",
    },
  }

  return (
    stateMap[state as keyof typeof stateMap] || {
      label: state,
      color: "bg-gray-500",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      icon: Brain,
      description: "Estado nutricional clasificado",
    }
  )
}

const getModelInfo = (model: string) => {
  const modelMap = {
    random_forest_v1: "Random Forest v1",
    svm_v1: "Support Vector Machine v1",
    neural_network_v1: "Red Neuronal v1",
    ensemble_v1: "Modelo Ensemble v1",
  }
  return modelMap[model as keyof typeof modelMap] || model
}

const getConfidenceLevel = (score: number) => {
  if (score >= 0.9) return { level: "Muy Alta", color: "text-green-600" }
  if (score >= 0.8) return { level: "Alta", color: "text-blue-600" }
  if (score >= 0.7) return { level: "Media", color: "text-yellow-600" }
  if (score >= 0.6) return { level: "Baja", color: "text-orange-600" }
  return { level: "Muy Baja", color: "text-red-600" }
}

export default function PredictionResult({ result }: PredictionResultProps) {
  if (!result.success) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error en la Predicción</h3>
            <p className="text-sm">{result.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { data } = result
  const stateInfo = getStateInfo(data.estado_nutricional)
  const confidence = getConfidenceLevel(data.confidence_score)
  const IconComponent = stateInfo.icon

  return (
    <Card className="border-l-4" style={{ borderLeftColor: stateInfo.color.replace("bg-", "") }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Resultado del Análisis IA
        </CardTitle>
        <CardDescription>Predicción generada por {getModelInfo(data.modelo)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado nutricional principal */}
        <div className={`p-4 rounded-lg ${stateInfo.bgColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <IconComponent className={`w-6 h-6 ${stateInfo.textColor}`} />
            <div>
              <h3 className={`text-lg font-semibold ${stateInfo.textColor}`}>{stateInfo.label}</h3>
              <p className={`text-sm ${stateInfo.textColor} opacity-80`}>{stateInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Nivel de confianza */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Nivel de Confianza</span>
            <Badge variant="outline" className={confidence.color}>
              {confidence.level}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={data.confidence_score * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium">{(data.confidence_score * 100).toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Información técnica */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <span className="text-sm text-gray-500">Modelo Utilizado</span>
            <p className="font-medium">{getModelInfo(data.modelo)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">ID de Clasificación</span>
            <p className="font-mono text-sm">{data.classification_id || "No guardado"}</p>
          </div>
        </div>

        {/* Recomendaciones basadas en el resultado */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {data.estado_nutricional === "normal" && <p>• Mantener la dieta actual y hábitos saludables</p>}
            {data.estado_nutricional === "riesgo_desnutricion" && (
              <>
                <p>• Aumentar la frecuencia de comidas nutritivas</p>
                <p>• Monitorear el peso semanalmente</p>
                <p>• Consultar con un nutricionista</p>
              </>
            )}
            {(data.estado_nutricional === "desnutricion_aguda_moderada" ||
              data.estado_nutricional === "desnutricion_aguda_severa") && (
              <>
                <p>• Buscar atención médica inmediata</p>
                <p>• Implementar plan de recuperación nutricional</p>
                <p>• Seguimiento médico continuo</p>
              </>
            )}
            {(data.estado_nutricional === "sobrepeso" || data.estado_nutricional === "obesidad") && (
              <>
                <p>• Consultar con un nutricionista pediátrico</p>
                <p>• Aumentar la actividad física</p>
                <p>• Reducir alimentos procesados</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
