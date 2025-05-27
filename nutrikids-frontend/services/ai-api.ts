import type { EstadoNutricionalInput, PredictionResponse, HistorialResponse, EstadisticasResponse } from "@/types/ai"

class AIApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Realizar predicción del estado nutricional
  async predictNutritionalState(
    childId: string,
    inputData?: EstadoNutricionalInput,
    saveToDb = true,
  ): Promise<PredictionResponse> {
    const url = new URL(`${this.apiBase}/ai/predecir-estado/${childId}`)
    url.searchParams.append("save_to_db", saveToDb.toString())

    console.log("🤖 Realizando predicción IA:", { childId, inputData, saveToDb })

    // Si se envían datos manuales, validar y limpiar antes de enviar
    let cleanedInputData = inputData
    if (inputData) {
      cleanedInputData = this.cleanInputData(inputData)
      console.log("🧹 Datos limpiados para IA:", cleanedInputData)
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: cleanedInputData ? JSON.stringify(cleanedInputData) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }))
      console.error("❌ Error en predicción IA:", error)

      // Mejorar el mensaje de error para problemas de validación
      if (response.status === 400 && error.detail?.includes("validation errors")) {
        throw new Error(
          "Error de validación: Los datos del niño no están completos o tienen formato incorrecto. Verifica que tenga datos antropométricos, conductuales, del hogar e historial médico recientes.",
        )
      }

      throw new Error(error.detail || "Error al realizar la predicción")
    }

    const result = await response.json()
    console.log("✅ Predicción IA exitosa:", result)
    return result
  }

  // Limpiar y validar datos de entrada
  private cleanInputData(inputData: EstadoNutricionalInput): EstadoNutricionalInput {
    return {
      ...inputData,
      // Asegurar que los campos booleanos sean 0 o 1
      water_access: inputData.water_access ? 1 : 0,
      enfermedades: inputData.enfermedades ? 1 : 0,
      medicamentos: inputData.medicamentos ? 1 : 0,
      alergias: inputData.alergias ? 1 : 0,
      antecedentes_familiares: inputData.antecedentes_familiares ? 1 : 0,
      consumo_frutas: inputData.consumo_frutas ? 1 : 0,
      consumo_verduras: inputData.consumo_verduras ? 1 : 0,
      actividad_fisica: inputData.actividad_fisica ? 1 : 0,
      // Asegurar que los números sean válidos
      monthly_income: Math.max(0, inputData.monthly_income || 0),
      tiempo_pantalla: Math.max(0, inputData.tiempo_pantalla || 0),
      peso: Math.max(0.1, inputData.peso || 0.1),
      talla: Math.max(1, inputData.talla || 1),
      imc: Math.max(0.1, inputData.imc || 0.1),
    }
  }

  // Obtener historial de clasificaciones
  async getClassificationHistory(childId: string, limit = 10): Promise<HistorialResponse> {
    const url = new URL(`${this.apiBase}/ai/historial/${childId}`)
    url.searchParams.append("limit", limit.toString())

    console.log("📊 Obteniendo historial IA:", { childId, limit })

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }))
      console.error("❌ Error obteniendo historial IA:", error)
      throw new Error(error.detail || "Error al obtener el historial")
    }

    const result = await response.json()
    console.log("✅ Historial IA obtenido:", result)
    return result
  }

  // Obtener estadísticas de clasificaciones
  async getClassificationStats(childId: string): Promise<EstadisticasResponse> {
    console.log("📈 Obteniendo estadísticas IA:", { childId })

    const response = await fetch(`${this.apiBase}/ai/estadisticas/${childId}`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }))
      console.error("❌ Error obteniendo estadísticas IA:", error)
      throw new Error(error.detail || "Error al obtener las estadísticas")
    }

    const result = await response.json()
    console.log("✅ Estadísticas IA obtenidas:", result)
    return result
  }

  // Verificar salud del servicio de IA
  async checkHealth(): Promise<any> {
    console.log("🔍 Verificando salud del servicio IA")

    const response = await fetch(`${this.apiBase}/ai/health`)
    const result = await response.json()

    console.log("🏥 Estado del servicio IA:", result)
    return result
  }

  // Verificar si un niño tiene datos completos para predicción automática
  async checkChildDataCompleteness(childId: string): Promise<{
    hasAnthropometric: boolean
    hasBehavioral: boolean
    hasHousehold: boolean
    hasMedicalHistory: boolean
    canPredict: boolean
    missingData: string[]
  }> {
    console.log("🔍 Verificando completitud de datos para:", childId)

    try {
      // Intentar una predicción de prueba sin guardar
      await this.predictNutritionalState(childId, undefined, false)
      return {
        hasAnthropometric: true,
        hasBehavioral: true,
        hasHousehold: true,
        hasMedicalHistory: true,
        canPredict: true,
        missingData: [],
      }
    } catch (error) {
      console.log("❌ Datos incompletos:", error)

      const missingData: string[] = []
      const errorMessage = error instanceof Error ? error.message : ""

      if (errorMessage.includes("antropométricos")) missingData.push("Datos antropométricos")
      if (errorMessage.includes("conductuales")) missingData.push("Datos conductuales")
      if (errorMessage.includes("hogar")) missingData.push("Datos del hogar")
      if (errorMessage.includes("médico")) missingData.push("Historial médico")

      return {
        hasAnthropometric: !missingData.includes("Datos antropométricos"),
        hasBehavioral: !missingData.includes("Datos conductuales"),
        hasHousehold: !missingData.includes("Datos del hogar"),
        hasMedicalHistory: !missingData.includes("Historial médico"),
        canPredict: false,
        missingData,
      }
    }
  }
}

export const aiApiService = new AIApiService()
