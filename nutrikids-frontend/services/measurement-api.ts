import type {
  Measurement,
  MeasurementCreate,
  MeasurementUpdate,
  MeasurementStats,
  ApiResponse,
} from "@/types/measurement"

class MeasurementApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Crear una nueva medición
  async createMeasurement(data: MeasurementCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/measurements/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al crear la medición")
    }

    return response.json()
  }

  // Obtener todas las mediciones con paginación
  async getAllMeasurements(skip = 0, limit = 100): Promise<Measurement[]> {
    const response = await fetch(`${this.apiBase}/measurements/?skip=${skip}&limit=${limit}`)

    if (!response.ok) {
      throw new Error("Error al cargar las mediciones")
    }

    return response.json()
  }

  // Obtener una medición por ID
  async getMeasurementById(measurementId: string): Promise<Measurement> {
    const response = await fetch(`${this.apiBase}/measurements/${measurementId}`)

    if (!response.ok) {
      throw new Error("Error al cargar la medición")
    }

    return response.json()
  }

  // Obtener todas las mediciones de un niño
  async getMeasurementsByChild(childId: string, latestOnly = false): Promise<Measurement[]> {
    const url = `${this.apiBase}/measurements/child/${childId}${latestOnly ? "?latest_only=true" : ""}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Error al cargar las mediciones del niño")
    }

    return response.json()
  }

  // Obtener la última medición de un niño
  async getLatestMeasurementByChild(childId: string): Promise<Measurement | null> {
    const measurements = await this.getMeasurementsByChild(childId, true)
    return measurements.length > 0 ? measurements[0] : null
  }

  // Actualizar una medición
  async updateMeasurement(measurementId: string, data: MeasurementUpdate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/measurements/${measurementId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al actualizar la medición")
    }

    return response.json()
  }

  // Eliminar una medición
  async deleteMeasurement(measurementId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/measurements/${measurementId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Error al eliminar la medición")
    }

    return response.json()
  }

  // Obtener estadísticas de un niño
  async getChildStats(childId: string): Promise<MeasurementStats> {
    const response = await fetch(`${this.apiBase}/measurements/child/${childId}/stats`)

    if (!response.ok) {
      throw new Error("Error al cargar las estadísticas")
    }

    return response.json()
  }

  // Método de verificación de salud
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.apiBase}/measurements/health/check`)
    return response.json()
  }
}

export const measurementApiService = new MeasurementApiService()
