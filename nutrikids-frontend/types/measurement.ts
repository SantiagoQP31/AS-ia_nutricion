// Tipos para el módulo de mediciones
export interface MeasurementCreate {
  child_id: string
  peso: number // kg
  talla: number // cm
  fecha_medicion: string // YYYY-MM-DD
}

export interface MeasurementUpdate {
  peso?: number
  talla?: number
  fecha_medicion?: string
  child_id?: string
}

export interface Measurement {
  id: string
  child_id: string
  peso: number // kg
  talla: number // cm
  imc: number // calculado automáticamente
  fecha_medicion: string
}

export interface MeasurementStats {
  total_mediciones: number
  peso: {
    actual: number | null
    minimo: number | null
    maximo: number | null
    promedio: number | null
  }
  talla: {
    actual: number | null
    minimo: number | null
    maximo: number | null
    promedio: number | null
  }
  imc: {
    actual: number | null
    minimo: number | null
    maximo: number | null
    promedio: number | null
  }
  primera_medicion: string | null
  ultima_medicion: string | null
}

export interface ApiResponse {
  message: string
  measurement_id?: string
}

// Tipos para gráficos
export interface ChartDataPoint {
  fecha: string
  peso: number
  talla: number
  imc: number
}

// Categorías de IMC para niños (simplificado)
export interface IMCCategory {
  category: string
  color: string
  range: string
}
