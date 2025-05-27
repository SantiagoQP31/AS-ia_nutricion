import type {
  ReporteIndividual,
  ReporteGrupal,
  ReporteSeguimiento,
  ReportFilter,
  EstadisticasRapidas,
} from "@/types/report"

class ReportApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Obtener reporte individual de un niño
  async getReporteIndividual(childId: string): Promise<ReporteIndividual> {
    const response = await fetch(`${this.apiBase}/reports/individual/${childId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al cargar el reporte individual")
    }

    return response.json()
  }

  // Obtener reporte grupal con filtros opcionales
  async getReporteGrupal(filtros?: ReportFilter): Promise<ReporteGrupal> {
    const params = new URLSearchParams()

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(
            key === "rango_edad_min" ? "edad_min" : key === "rango_edad_max" ? "edad_max" : key,
            value.toString(),
          )
        }
      })
    }

    const url = `${this.apiBase}/reports/group${params.toString() ? `?${params}` : ""}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al cargar el reporte grupal")
    }

    return response.json()
  }

  // Obtener reporte de seguimiento de un niño
  async getReporteSeguimiento(childId: string): Promise<ReporteSeguimiento> {
    const response = await fetch(`${this.apiBase}/reports/seguimiento/${childId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al cargar el reporte de seguimiento")
    }

    return response.json()
  }

  // Obtener estadísticas rápidas
  async getEstadisticasRapidas(): Promise<EstadisticasRapidas> {
    const response = await fetch(`${this.apiBase}/reports/stats/quick`)

    if (!response.ok) {
      throw new Error("Error al cargar las estadísticas rápidas")
    }

    return response.json()
  }

  // Método de verificación de salud
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.apiBase}/reports/health`)
    return response.json()
  }
}

export const reportApiService = new ReportApiService()
