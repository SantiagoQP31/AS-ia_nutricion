import type {
  ReporteIndividual,
  ReporteGrupal,
  ReporteSeguimiento,
  ReportFilter,
  EstadisticasRapidas,
} from "@/types/report"
import { measurementApiService } from "@/services/measurement-api"
import { childApiService } from "@/services/child-api"

class ReportApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Función para calcular edad desde fecha de nacimiento
  private calculateAge(fechaNacimiento: string): number {
    const birthDate = new Date(fechaNacimiento)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Función para calcular estado nutricional desde IMC y edad
  private calculateNutritionalStatus(imc: number, edad: number): string {
    // Lógica simplificada para adultos y niños
    if (edad < 18) {
      // Para niños, usar percentiles (simplificado)
      if (imc < 16) {
        return "desnutricion_aguda_severa"
      } else if (imc < 17) {
        return "desnutricion_aguda_moderada"
      } else if (imc < 18.5) {
        return "riesgo_desnutricion"
      } else if (imc >= 18.5 && imc < 25) {
        return "normal"
      } else if (imc >= 25 && imc < 30) {
        return "sobrepeso"
      } else {
        return "obesidad"
      }
    } else {
      // Para adultos
      if (imc < 18.5) {
        return "riesgo_desnutricion"
      } else if (imc >= 18.5 && imc < 25) {
        return "normal"
      } else if (imc >= 25 && imc < 30) {
        return "sobrepeso"
      } else {
        return "obesidad"
      }
    }
  }

  // Función para generar reporte grupal desde mediciones (FALLBACK)
  private async generateGroupReportFromMeasurements(): Promise<ReporteGrupal> {
    try {
      console.log("🔧 Generando reporte grupal desde mediciones...")

      // Obtener todos los niños
      const children = await childApiService.getChildren()
      console.log("👶 Niños encontrados:", children.length)

      const estadisticasNutricionales = {
        normal: 0,
        riesgo_desnutricion: 0,
        desnutricion_aguda_moderada: 0,
        desnutricion_aguda_severa: 0,
        sobrepeso: 0,
        obesidad: 0,
        total: 0,
      }

      const estadisticasSexo = {
        masculino: 0,
        femenino: 0,
        total: 0,
      }

      let totalImc = 0
      let totalEdad = 0
      let contadorConMediciones = 0
      const instituciones = new Set<string>()

      // Procesar cada niño
      for (const child of children) {
        try {
          // Calcular edad desde fecha_nacimiento
          const edad = child.fecha_nacimiento ? this.calculateAge(child.fecha_nacimiento) : 0

          // Obtener mediciones del niño
          const measurements = await measurementApiService.getMeasurementsByChild(child.id)

          if (measurements.length > 0) {
            // Usar la medición más reciente
            const latestMeasurement = measurements[0]
            const imc = latestMeasurement.imc

            // Calcular estado nutricional
            const estado = this.calculateNutritionalStatus(imc, edad)

            console.log(`👶 ${child.nombre}: IMC=${imc}, Edad=${edad}, Estado=${estado}`)

            // Incrementar contador según estado
            switch (estado) {
              case "normal":
                estadisticasNutricionales.normal++
                break
              case "riesgo_desnutricion":
                estadisticasNutricionales.riesgo_desnutricion++
                break
              case "desnutricion_aguda_moderada":
                estadisticasNutricionales.desnutricion_aguda_moderada++
                break
              case "desnutricion_aguda_severa":
                estadisticasNutricionales.desnutricion_aguda_severa++
                break
              case "sobrepeso":
                estadisticasNutricionales.sobrepeso++
                break
              case "obesidad":
                estadisticasNutricionales.obesidad++
                break
            }

            totalImc += imc
            contadorConMediciones++
          }

          // Contar por sexo
          if (child.sexo === "M") {
            estadisticasSexo.masculino++
          } else if (child.sexo === "F") {
            estadisticasSexo.femenino++
          }

          totalEdad += edad

          // Agregar institución si existe
          if (child.institucion) {
            instituciones.add(child.institucion)
          }
        } catch (error) {
          console.warn(`Error procesando niño ${child.id}:`, error)
        }
      }

      estadisticasNutricionales.total = contadorConMediciones
      estadisticasSexo.total = children.length

      const reporte: ReporteGrupal = {
        total_ninos: children.length,
        estadisticas_nutricionales: estadisticasNutricionales,
        estadisticas_sexo: estadisticasSexo,
        promedio_imc_general: contadorConMediciones > 0 ? totalImc / contadorConMediciones : 0,
        promedio_edad: children.length > 0 ? totalEdad / children.length : 0,
        instituciones_representadas: Array.from(instituciones),
        fecha_generacion: new Date().toISOString(),
      }

      console.log("✅ Reporte generado desde frontend:", reporte)
      return reporte
    } catch (error) {
      console.error("❌ Error generando reporte desde mediciones:", error)
      throw error
    }
  }

  // Obtener reporte grupal con fallback
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
      console.log("🌐 Llamando a backend:", url)

      const response = await fetch(url)
      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        console.warn("⚠️ Backend falló, usando fallback...")
        return await this.generateGroupReportFromMeasurements()
      }

      const data = await response.json()
      console.log("✅ Reporte del backend:", data)

      // Verificar si el backend devolvió datos válidos
      const tieneEstadisticas =
        data.estadisticas_nutricionales && Object.values(data.estadisticas_nutricionales).some((val: any) => val > 0)

      if (!tieneEstadisticas && data.total_ninos > 0) {
        console.warn("⚠️ Backend devolvió datos vacíos, usando fallback...")
        return await this.generateGroupReportFromMeasurements()
      }

      return data
    } catch (error) {
      console.error("❌ Error en getReporteGrupal, usando fallback:", error)
      return await this.generateGroupReportFromMeasurements()
    }
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

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Estadísticas recibidas:", data)
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
