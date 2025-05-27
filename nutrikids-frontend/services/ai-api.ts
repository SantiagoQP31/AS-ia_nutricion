import type { EstadoNutricionalInput, PredictionResponse, HistorialResponse, EstadisticasResponse } from "@/types/ai"

class AIApiService {
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Mapear datos de la BD al formato esperado por IA
  private mapChildDataToAIInput(
    childData: any,
    measurementData: any,
    behavioralData: any,
    householdData: any,
    medicalData: any,
  ): EstadoNutricionalInput | null {
    try {
      console.log("🔄 Mapeando datos para IA:", {
        childData,
        measurementData,
        behavioralData,
        householdData,
        medicalData,
      })

      // Validar que tenemos los datos mínimos necesarios
      if (!measurementData?.peso || !measurementData?.talla) {
        throw new Error("Faltan datos antropométricos básicos (peso/talla)")
      }

      // Calcular IMC si no está disponible
      const peso = Number.parseFloat(measurementData.peso)
      const talla = Number.parseFloat(measurementData.talla)
      const tallaMts = talla / 100
      const imc = peso / (tallaMts * tallaMts)

      // Mapear datos del hogar
      const location_type = householdData?.tipo_ubicacion || householdData?.location_type || "urbano"
      const caregiver_education_level =
        householdData?.nivel_educativo_cuidador || householdData?.caregiver_education_level || "primaria_completa"
      const monthly_income = Number.parseFloat(
        householdData?.ingresos_mensuales || householdData?.monthly_income || "0",
      )
      const food_security = householdData?.seguridad_alimentaria || householdData?.food_security || "seguro"
      const water_access = this.convertToBoolean(householdData?.acceso_agua || householdData?.water_access)

      // Mapear datos médicos (convertir strings descriptivos a booleanos)
      const enfermedades = this.convertToBoolean(medicalData?.enfermedades)
      const medicamentos = this.convertToBoolean(medicalData?.medicamentos)
      const alergias = this.convertToBoolean(medicalData?.alergias)
      const antecedentes_familiares = this.convertToBoolean(medicalData?.antecedentes_familiares)

      // Mapear datos conductuales
      const consumo_frutas = this.convertToBoolean(behavioralData?.consumo_frutas)
      const consumo_verduras = this.convertToBoolean(behavioralData?.consumo_verduras)
      const actividad_fisica = this.convertToBoolean(behavioralData?.actividad_fisica)
      const tiempo_pantalla = Number.parseFloat(behavioralData?.tiempo_pantalla || "2")

      const mappedData: EstadoNutricionalInput = {
        location_type,
        caregiver_education_level,
        monthly_income,
        food_security,
        water_access,
        enfermedades,
        medicamentos,
        alergias,
        antecedentes_familiares,
        consumo_frutas,
        consumo_verduras,
        actividad_fisica,
        tiempo_pantalla,
        peso,
        talla,
        imc: Math.round(imc * 100) / 100,
      }

      console.log("✅ Datos mapeados exitosamente:", mappedData)
      return mappedData
    } catch (error) {
      console.error("❌ Error mapeando datos:", error)
      return null
    }
  }

  // Convertir valores diversos a booleano (0/1)
  private convertToBoolean(value: any): number {
    if (value === null || value === undefined || value === "") {
      return 0
    }

    if (typeof value === "boolean") {
      return value ? 1 : 0
    }

    if (typeof value === "number") {
      return value > 0 ? 1 : 0
    }

    if (typeof value === "string") {
      const lowerValue = value.toLowerCase().trim()

      // Si es una string descriptiva (como "Diabetes", "Ibuprofeno"), considerarla como true
      if (
        lowerValue.length > 0 &&
        lowerValue !== "no" &&
        lowerValue !== "false" &&
        lowerValue !== "ninguno" &&
        lowerValue !== "ninguna"
      ) {
        return 1
      }

      return 0
    }

    return 0
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

      if (response.status === 400) {
        if (error.detail?.includes("validation errors")) {
          throw new Error(
            "Los datos del niño no están en el formato correcto para el análisis de IA. Algunos campos contienen texto descriptivo en lugar de valores numéricos.",
          )
        }
        throw new Error(error.detail || "Faltan datos necesarios para la predicción")
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
      water_access: this.convertToBoolean(inputData.water_access),
      enfermedades: this.convertToBoolean(inputData.enfermedades),
      medicamentos: this.convertToBoolean(inputData.medicamentos),
      alergias: this.convertToBoolean(inputData.alergias),
      antecedentes_familiares: this.convertToBoolean(inputData.antecedentes_familiares),
      consumo_frutas: this.convertToBoolean(inputData.consumo_frutas),
      consumo_verduras: this.convertToBoolean(inputData.consumo_verduras),
      actividad_fisica: this.convertToBoolean(inputData.actividad_fisica),
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
    details: any
  }> {
    console.log("🔍 Verificando completitud de datos para:", childId)

    try {
      // Obtener todos los datos del niño para verificar completitud
      const [childResponse, measurementResponse, behavioralResponse, householdResponse, medicalResponse] =
        await Promise.all([
          fetch(`${this.apiBase}/children/${childId}`),
          fetch(`${this.apiBase}/measurements/child/${childId}?limit=1`),
          fetch(`${this.apiBase}/children/${childId}/behavioral`),
          fetch(`${this.apiBase}/children/${childId}/household`),
          fetch(`${this.apiBase}/children/${childId}/medical-history`),
        ])

      const childData = childResponse.ok ? await childResponse.json() : null
      const measurementData = measurementResponse.ok ? (await measurementResponse.json())?.data?.[0] : null
      const behavioralData = behavioralResponse.ok ? await behavioralResponse.json() : null
      const householdData = householdResponse.ok ? await householdResponse.json() : null
      const medicalData = medicalResponse.ok ? await medicalResponse.json() : null

      console.log("📊 Datos obtenidos:", {
        child: !!childData?.data,
        measurement: !!measurementData,
        behavioral: !!behavioralData?.data,
        household: !!householdData?.data,
        medical: !!medicalData?.data,
      })

      // Verificar cada tipo de dato
      const hasAnthropometric = !!(measurementData?.peso && measurementData?.talla)
      const hasBehavioral = !!behavioralData?.data
      const hasHousehold = !!householdData?.data
      const hasMedicalHistory = !!medicalData?.data

      const missingData: string[] = []
      if (!hasAnthropometric) missingData.push("Datos antropométricos")
      if (!hasBehavioral) missingData.push("Datos conductuales")
      if (!hasHousehold) missingData.push("Datos del hogar")
      if (!hasMedicalHistory) missingData.push("Historial médico")

      const canPredict = missingData.length === 0

      // Si tenemos todos los datos, intentar mapearlos para verificar que son válidos
      if (canPredict) {
        const mappedData = this.mapChildDataToAIInput(
          childData?.data,
          measurementData,
          behavioralData?.data,
          householdData?.data,
          medicalData?.data,
        )

        if (!mappedData) {
          missingData.push("Error en formato de datos")
          return {
            hasAnthropometric,
            hasBehavioral,
            hasHousehold,
            hasMedicalHistory,
            canPredict: false,
            missingData,
            details: "Los datos existen pero no están en el formato correcto",
          }
        }
      }

      return {
        hasAnthropometric,
        hasBehavioral,
        hasHousehold,
        hasMedicalHistory,
        canPredict,
        missingData,
        details: canPredict ? "Todos los datos están disponibles" : `Faltan: ${missingData.join(", ")}`,
      }
    } catch (error) {
      console.error("❌ Error verificando completitud:", error)
      return {
        hasAnthropometric: false,
        hasBehavioral: false,
        hasHousehold: false,
        hasMedicalHistory: false,
        canPredict: false,
        missingData: ["Error de conexión"],
        details: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Realizar predicción con mapeo automático de datos
  async predictWithAutoMapping(childId: string, saveToDb = true): Promise<PredictionResponse> {
    console.log("🔄 Iniciando predicción con mapeo automático para:", childId)

    try {
      // Obtener todos los datos necesarios
      const [childResponse, measurementResponse, behavioralResponse, householdResponse, medicalResponse] =
        await Promise.all([
          fetch(`${this.apiBase}/children/${childId}`),
          fetch(`${this.apiBase}/measurements/child/${childId}?limit=1`),
          fetch(`${this.apiBase}/children/${childId}/behavioral`),
          fetch(`${this.apiBase}/children/${childId}/household`),
          fetch(`${this.apiBase}/children/${childId}/medical-history`),
        ])

      const childData = childResponse.ok ? await childResponse.json() : null
      const measurementData = measurementResponse.ok ? (await measurementResponse.json())?.data?.[0] : null
      const behavioralData = behavioralResponse.ok ? await behavioralResponse.json() : null
      const householdData = householdResponse.ok ? await householdResponse.json() : null
      const medicalData = medicalResponse.ok ? await medicalResponse.json() : null

      // Mapear los datos al formato esperado por IA
      const mappedData = this.mapChildDataToAIInput(
        childData?.data,
        measurementData,
        behavioralData?.data,
        householdData?.data,
        medicalData?.data,
      )

      if (!mappedData) {
        throw new Error("No se pudieron mapear los datos del niño al formato requerido por IA")
      }

      // Realizar la predicción con los datos mapeados
      return await this.predictNutritionalState(childId, mappedData, saveToDb)
    } catch (error) {
      console.error("❌ Error en predicción con mapeo automático:", error)
      throw error
    }
  }
}

export const aiApiService = new AIApiService()
