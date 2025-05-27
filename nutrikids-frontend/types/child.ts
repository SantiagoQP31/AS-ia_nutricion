// Tipos base para el módulo de niños
export interface ChildCreate {
  nombre: string
  apellido: string
  tipo_documento: "CC" | "TI" | "RC" | "CE" | "PA"
  documento: string
  fecha_nacimiento: string // YYYY-MM-DD
  sexo: "M" | "F"
  direccion: string
  institucion?: string
  barrio?: string
  nombre_acudiente: string
  parentesco_acudiente?: string
  telefono_acudiente: string
  consentimiento_informado: boolean
}

export interface ChildUpdate {
  nombre?: string
  apellido?: string
  tipo_documento?: "CC" | "TI" | "RC" | "CE" | "PA"
  documento?: string
  fecha_nacimiento?: string
  sexo?: "M" | "F"
  direccion?: string
  institucion?: string
  barrio?: string
  nombre_acudiente?: string
  parentesco_acudiente?: string
  telefono_acudiente?: string
  consentimiento_informado?: boolean
}

export interface ChildSummary {
  id: string
  nombre: string
  apellido: string
  documento: string
  fecha_nacimiento: string
  sexo: "M" | "F"
  institucion?: string
}

export interface ChildInResponse extends ChildCreate {
  id: string
}

// Tipos para datos secundarios - CORREGIDOS SEGÚN EL BACKEND
export interface AnthropometricDataCreate {
  peso: number
  talla: number
  imc: number
  fecha_medicion: string // YYYY-MM-DD
}

export interface BehavioralDataCreate {
  consumo_frutas: boolean // CORREGIDO: ahora es boolean
  consumo_verduras: boolean // CORREGIDO: ahora es boolean
  actividad_fisica: boolean // CORREGIDO: ahora es boolean
  tiempo_pantalla?: number // horas/día - opcional
  fecha_registro?: string // YYYY-MM-DD - opcional
}

export interface MedicalHistoryCreate {
  enfermedades?: string // CORREGIDO: ahora es string, no array
  medicamentos?: string // CORREGIDO: ahora es string, no array
  alergias?: string // CORREGIDO: ahora es string, no array
  antecedentes_familiares?: string // CORREGIDO: ahora es string, no array
  fecha_registro?: string // YYYY-MM-DD - opcional
}

// Enums corregidos según el backend
export type LocationType = "urbano" | "rural" // CORREGIDO: lowercase
export type FoodSecurity = "seguro" | "moderado" | "grave" // CORREGIDO: valores simplificados

export interface HouseholdCreate {
  location_type: LocationType
  caregiver_education_level?: string // Debe ser uno de los valores válidos
  monthly_income?: number
  food_security?: FoodSecurity
  water_access?: boolean
  government_aid?: string[] // Array de strings
}

export interface ClassificationResultCreate {
  resultado: string // Debe ser uno de los valores válidos
  modelo: string // Debe ser uno de los valores válidos
  fecha_resultado?: string // ISO string - opcional
  confidence_score?: number // 0-1 - opcional
}

// Respuestas del servidor
export interface ApiResponse {
  message: string
  status: string
  child_id?: string
  inserted_id?: string
  updated_fields?: string[]
}

// Filtros de búsqueda
export interface SearchFilters {
  nombre?: string
  apellido?: string
  documento?: string
  institucion?: string
  sexo?: "M" | "F"
}

// Valores válidos para los enums del backend
export const VALID_EDUCATION_LEVELS = [
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

export const VALID_CLASSIFICATION_RESULTS = [
  "desnutricion_aguda_severa",
  "desnutricion_aguda_moderada",
  "riesgo_desnutricion",
  "normal",
  "sobrepeso",
  "obesidad",
] as const

export const VALID_MODELS = ["random_forest_v1", "svm_v1", "neural_network_v1", "ensemble_v1"] as const

export const VALID_GOVERNMENT_AIDS = [
  "familias_en_accion",
  "joven_en_accion",
  "colombia_mayor",
  "subsidio_vivienda",
  "sisben",
  "otro",
] as const
