import type {
  ChildCreate,
  ChildUpdate,
  ChildSummary,
  ChildInResponse,
  SearchFilters,
  AnthropometricDataCreate,
  BehavioralDataCreate,
  MedicalHistoryCreate,
  HouseholdCreate,
  ClassificationResultCreate,
  ApiResponse,
} from "@/types/child"

class ChildApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // PASO 1: CRUD básico para niños (datos primarios)
  async createChild(data: ChildCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar el niño")
    }

    return response.json()
  }

  async getChildren(): Promise<ChildSummary[]> {
    const response = await fetch(`${this.apiBase}/children/`)

    if (!response.ok) {
      throw new Error("Error al cargar los niños")
    }

    return response.json()
  }

  async searchChildren(filters: SearchFilters): Promise<ChildSummary[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    const response = await fetch(`${this.apiBase}/children/search?${params}`)

    if (!response.ok) {
      throw new Error("Error en la búsqueda")
    }

    return response.json()
  }

  async getChildById(childId: string): Promise<ChildInResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}`)

    if (!response.ok) {
      throw new Error("Error al cargar los datos del niño")
    }

    return response.json()
  }

  async updateChild(childId: string, data: ChildUpdate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al actualizar el niño")
    }

    return response.json()
  }

  async deleteChild(childId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Error al eliminar el niño")
    }

    return response.json()
  }

  // PASO 2-6: Métodos para datos secundarios - SIGUIENDO EL FLUJO DEL SNIPPET

  // PASO 2: Datos antropométricos
  async addAnthropometricData(childId: string, data: AnthropometricDataCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}/anthropometric`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar datos antropométricos")
    }

    return response.json()
  }

  // PASO 3: Datos conductuales
  async addBehavioralData(childId: string, data: BehavioralDataCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}/behavioral`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar datos conductuales")
    }

    return response.json()
  }

  // PASO 4: Historial médico
  async addMedicalHistory(childId: string, data: MedicalHistoryCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}/medical-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar historial médico")
    }

    return response.json()
  }

  // PASO 5: Datos del hogar
  async addHouseholdData(childId: string, data: HouseholdCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}/household`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar datos del hogar")
    }

    return response.json()
  }

  // PASO 6: Resultado de clasificación
  async addClassificationResult(childId: string, data: ClassificationResultCreate): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBase}/children/${childId}/classification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al registrar resultado de clasificación")
    }

    return response.json()
  }

  // Método de verificación de salud
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.apiBase}/children/health/check`)
    return response.json()
  }
}

export const childApiService = new ChildApiService()
