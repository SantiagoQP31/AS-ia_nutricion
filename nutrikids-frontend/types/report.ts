// Tipos para el módulo de reportes
export interface ReportFilter {
  fecha_inicio?: string // YYYY-MM-DD
  fecha_fin?: string // YYYY-MM-DD
  sexo?: "M" | "F"
  rango_edad_min?: number
  rango_edad_max?: number
  institucion?: string
  barrio?: string
}

export interface MedicionReporte {
  peso: number
  talla: number
  imc: number
  fecha_medicion: string // YYYY-MM-DD
}

export interface ClasificacionReporte {
  resultado: string
  modelo: string
  fecha_resultado: string // ISO string
  confidence_score?: number
}

export interface ReporteIndividual {
  child_id: string
  nombre: string
  apellido: string
  fecha_nacimiento: string
  sexo: "M" | "F"
  edad_actual: number
  institucion?: string
  barrio?: string
  mediciones: MedicionReporte[]
  clasificaciones: ClasificacionReporte[]
  ultima_clasificacion?: string
  tendencia_imc?: "mejorando" | "estable" | "empeorando"
}

export interface EstadisticasNutricionales {
  normal: number
  riesgo_desnutricion: number
  desnutricion_aguda_moderada: number
  desnutricion_aguda_severa: number
  sobrepeso: number
  obesidad: number
  total: number
}

export interface EstadisticasSexo {
  masculino: number
  femenino: number
  total: number
}

export interface ReporteGrupal {
  total_ninos: number
  estadisticas_nutricionales: EstadisticasNutricionales
  estadisticas_sexo: EstadisticasSexo
  promedio_imc_general?: number
  promedio_edad?: number
  instituciones_representadas: string[]
  fecha_generacion: string
}

export interface ReporteSeguimiento {
  child_id: string
  nombre: string
  apellido: string
  total_mediciones: number
  primera_medicion?: string
  ultima_medicion?: string
  cambio_peso?: number // kg
  cambio_talla?: number // cm
  cambio_imc?: number
  meses_seguimiento?: number
}

export interface EstadisticasRapidas {
  total_ninos: number
  total_mediciones: number
  total_clasificaciones: number
  ultima_medicion?: string
  ultima_clasificacion?: string
}

// Tipos para gráficos y visualizaciones
export interface ChartDataNutricional {
  estado: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface ChartDataSexo {
  sexo: string
  cantidad: number
  porcentaje: number
}

export interface TendenciaData {
  fecha: string
  peso: number
  talla: number
  imc: number
}
