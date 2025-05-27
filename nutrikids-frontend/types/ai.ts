// Tipos para el módulo de IA basados en el backend

// Modelo principal para predicción (EstadoNutricionalInput del backend)
export interface EstadoNutricionalInput {
  location_type: "urbano" | "rural"
  caregiver_education_level: string
  monthly_income: number
  food_security: "seguro" | "moderado" | "grave"
  water_access: boolean | number // 0 o 1 si es number
  enfermedades: boolean | number // 0 o 1 si es number
  medicamentos: boolean | number // 0 o 1 si es number
  alergias: boolean | number // 0 o 1 si es number
  antecedentes_familiares: boolean | number // 0 o 1 si es number
  consumo_frutas: boolean | number // 0 o 1 si es number
  consumo_verduras: boolean | number // 0 o 1 si es number
  actividad_fisica: boolean | number // 0 o 1 si es number
  tiempo_pantalla: number // horas/día
  peso: number
  talla: number
  imc: number
}

// Respuesta de predicción
export interface PredictionResponse {
  success: boolean
  data: {
    estado_nutricional: string
    confidence_score: number
    modelo: string
    child_id: string
    classification_id?: string
  }
  message: string
}

// Resultado de clasificación individual
export interface ClassificationResult {
  _id: string
  child_id: string
  resultado: string
  modelo: string
  fecha_resultado: string
  confidence_score: number
}

// Respuesta del historial
export interface HistorialResponse {
  success: boolean
  data: {
    child_id: string
    historial: ClassificationResult[]
  }
  message: string
}

// Estadísticas de clasificaciones
export interface EstadisticasResponse {
  success: boolean
  data: {
    child_id: string
    total_predicciones: number
    estadisticas: {
      distribucion_resultados: Record<string, number>
      resultado_mas_frecuente: string | null
      confidence_promedio: number | null
      ultima_prediccion: string | null
    }
  }
  message: string
}

// Valores válidos para los campos
export const LOCATION_TYPES = ["urbano", "rural"] as const
export const FOOD_SECURITY_LEVELS = ["seguro", "moderado", "grave"] as const
export const EDUCATION_LEVELS = [
  "sin_educacion",
  "primaria_incompleta",
  "primaria_completa",
  "secundaria_incompleta",
  "secundaria_completa",
  "tecnica",
  "universitaria_incompleta",
  "universitaria_completa",
  "posgrado",
] as const

export const NUTRITIONAL_STATES = [
  "desnutricion_aguda_severa",
  "desnutricion_aguda_moderada",
  "riesgo_desnutricion",
  "normal",
  "sobrepeso",
  "obesidad",
] as const

export const AI_MODELS = ["random_forest_v1", "svm_v1", "neural_network_v1", "ensemble_v1"] as const

// Tipos para la UI
export type PredictionMode = "automatic" | "manual"

export interface PredictionRequest {
  child_id: string
  input_data?: EstadoNutricionalInput
  save_to_db?: boolean
}
