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
    try {
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
      console.log("Llamando a:", url)

      const response = await fetch(url)
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Reporte grupal recibido:", data)
      return data
    } catch (error) {
      console.error("Error en getReporteGrupal:", error)
      throw error
    }
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
    try {
      const url = `${this.apiBase}/reports/stats/quick`
      console.log("🔍 Llamando a estadísticas rápidas:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Estadísticas recibidas:", data)

      // Verificar la estructura de los datos
      console.log("🔍 Estructura de datos:")
      console.log("- total_ninos:", data.total_ninos)
      console.log("- total_mediciones:", data.total_mediciones)
      console.log("- total_clasificaciones:", data.total_clasificaciones)
      console.log("- ultima_medicion:", data.ultima_medicion)
      console.log("- ultima_clasificacion:", data.ultima_clasificacion)

      return data
    } catch (error) {
      console.error("💥 Error completo en getEstadisticasRapidas:", error)
      throw error
    }
  }

  // Método de verificación de salud
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.apiBase}/reports/health`)
    return response.json()
  }
}

export const reportApiService = new ReportApiService()
