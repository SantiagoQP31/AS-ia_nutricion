"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Zap, Settings, AlertCircle, CheckCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { aiApiService } from "@/services/ai-api"
import type { EstadoNutricionalInput, PredictionResponse, PredictionMode } from "@/types/ai"
import { LOCATION_TYPES, FOOD_SECURITY_LEVELS, EDUCATION_LEVELS } from "@/types/ai"

interface PredictionFormProps {
  childId: string
  childName: string
  onPredictionComplete: (result: PredictionResponse) => void
}

interface DataCompleteness {
  hasAnthropometric: boolean
  hasBehavioral: boolean
  hasHousehold: boolean
  hasMedicalHistory: boolean
  canPredict: boolean
  missingData: string[]
}

export default function PredictionForm({ childId, childName, onPredictionComplete }: PredictionFormProps) {
  const [mode, setMode] = useState<PredictionMode>("automatic")
  const [loading, setLoading] = useState(false)
  const [saveToDb, setSaveToDb] = useState(true)
  const [dataCompleteness, setDataCompleteness] = useState<DataCompleteness | null>(null)
  const [checkingData, setCheckingData] = useState(false)
  const [manualData, setManualData] = useState<EstadoNutricionalInput>({
    location_type: "urbano",
    caregiver_education_level: "primaria_completa",
    monthly_income: 0,
    food_security: "seguro",
    water_access: true,
    enfermedades: false,
    medicamentos: false,
    alergias: false,
    antecedentes_familiares: false,
    consumo_frutas: true,
    consumo_verduras: true,
    actividad_fisica: true,
    tiempo_pantalla: 2,
    peso: 0,
    talla: 0,
    imc: 0,
  })

  const checkDataCompleteness = async () => {
    try {
      setCheckingData(true)
      const completeness = await aiApiService.checkChildDataCompleteness(childId)
      setDataCompleteness(completeness)
    } catch (error) {
      console.error("Error verificando datos:", error)
    } finally {
      setCheckingData(false)
    }
  }

  // Verificar completitud de datos al cargar
  useEffect(() => {
    checkDataCompleteness()
  }, [childId])

  const handleAutomaticPrediction = async () => {
    try {
      setLoading(true)
      const result = await aiApiService.predictNutritionalState(childId, undefined, saveToDb)
      onPredictionComplete(result)
      toast.success("Predicción realizada exitosamente")
    } catch (error) {
      console.error("Error en predicción automática:", error)
      toast.error(error instanceof Error ? error.message : "Error al realizar la predicción")
    } finally {
      setLoading(false)
    }
  }

  const handleManualPrediction = async () => {
    // Validar datos antes de enviar
    if (manualData.peso <= 0 || manualData.talla <= 0 || manualData.imc <= 0) {
      toast.error("Por favor ingresa valores válidos para peso, talla e IMC")
      return
    }

    try {
      setLoading(true)
      const result = await aiApiService.predictNutritionalState(childId, manualData, saveToDb)
      onPredictionComplete(result)
      toast.success("Predicción realizada exitosamente")
    } catch (error) {
      console.error("Error en predicción manual:", error)
      toast.error(error instanceof Error ? error.message : "Error al realizar la predicción")
    } finally {
      setLoading(false)
    }
  }

  const updateManualData = (field: keyof EstadoNutricionalInput, value: any) => {
    setManualData((prev) => ({ ...prev, [field]: value }))
  }

  // Calcular IMC automáticamente
  useEffect(() => {
    if (manualData.peso > 0 && manualData.talla > 0) {
      const tallaMts = manualData.talla / 100
      const imc = manualData.peso / (tallaMts * tallaMts)
      updateManualData("imc", Math.round(imc * 100) / 100)
    }
  }, [manualData.peso, manualData.talla])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Análisis de Estado Nutricional con IA
        </CardTitle>
        <CardDescription>Genera una predicción del estado nutricional para {childName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de los datos */}
        {checkingData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>Verificando completitud de datos...</AlertDescription>
          </Alert>
        )}

        {dataCompleteness && (
          <Alert
            className={dataCompleteness.canPredict ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}
          >
            <div className="flex items-start gap-3">
              {dataCompleteness.canPredict ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-medium">
                  {dataCompleteness.canPredict ? "Datos completos" : "Datos incompletos"}
                </div>
                <div className="text-sm mt-1">
                  {dataCompleteness.canPredict ? (
                    "El niño tiene todos los datos necesarios para predicción automática"
                  ) : (
                    <>
                      Faltan los siguientes datos: {dataCompleteness.missingData.join(", ")}
                      <br />
                      <span className="text-amber-700">Usa el modo manual o completa los datos faltantes primero.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Selector de modo */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as PredictionMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic" className="flex items-center gap-2" disabled={!dataCompleteness?.canPredict}>
              <Zap className="w-4 h-4" />
              Automático
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automatic" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Predicción Automática</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    El sistema utilizará automáticamente todos los datos disponibles del niño (antropométricos,
                    conductuales, del hogar e historial médico) para realizar la predicción.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Guardar resultado en base de datos</Label>
                <p className="text-sm text-gray-600">El resultado se guardará en el historial del niño</p>
              </div>
              <Switch checked={saveToDb} onCheckedChange={setSaveToDb} />
            </div>

            <Button
              onClick={handleAutomaticPrediction}
              disabled={loading || !dataCompleteness?.canPredict}
              className="w-full"
              size="lg"
            >
              {loading ? "Analizando..." : "Realizar Predicción Automática"}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Predicción Manual</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Ingresa manualmente todos los datos necesarios para la predicción. Útil para hacer simulaciones o
                    cuando faltan datos en el sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario manual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos del hogar */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Datos del Hogar</h4>

                <div className="space-y-2">
                  <Label>Tipo de ubicación</Label>
                  <Select
                    value={manualData.location_type}
                    onValueChange={(value) => updateManualData("location_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "urbano" ? "Urbano" : "Rural"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nivel educativo del cuidador</Label>
                  <Select
                    value={manualData.caregiver_education_level}
                    onValueChange={(value) => updateManualData("caregiver_education_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ingresos mensuales (COP)</Label>
                  <Input
                    type="number"
                    value={manualData.monthly_income}
                    onChange={(e) => updateManualData("monthly_income", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seguridad alimentaria</Label>
                  <Select
                    value={manualData.food_security}
                    onValueChange={(value) => updateManualData("food_security", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_SECURITY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level === "seguro" ? "Seguro" : level === "moderado" ? "Moderado" : "Grave"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Datos antropométricos y conductuales */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Datos Antropométricos</h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={manualData.peso}
                      onChange={(e) => updateManualData("peso", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Talla (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={manualData.talla}
                      onChange={(e) => updateManualData("talla", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IMC (auto)</Label>
                    <Input type="number" step="0.1" value={manualData.imc} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tiempo de pantalla (horas/día)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={manualData.tiempo_pantalla}
                    onChange={(e) => updateManualData("tiempo_pantalla", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <h4 className="font-medium text-gray-900 pt-4">Datos de Salud y Conducta</h4>

                {/* Switches para datos binarios */}
                <div className="space-y-3">
                  {[
                    { key: "water_access", label: "Acceso a agua potable" },
                    { key: "enfermedades", label: "Tiene enfermedades" },
                    { key: "medicamentos", label: "Toma medicamentos" },
                    { key: "alergias", label: "Tiene alergias" },
                    { key: "antecedentes_familiares", label: "Antecedentes familiares" },
                    { key: "consumo_frutas", label: "Consume frutas regularmente" },
                    { key: "consumo_verduras", label: "Consume verduras regularmente" },
                    { key: "actividad_fisica", label: "Realiza actividad física" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">{label}</Label>
                      <Switch
                        checked={Boolean(manualData[key as keyof EstadoNutricionalInput])}
                        onCheckedChange={(checked) => updateManualData(key as keyof EstadoNutricionalInput, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label>Guardar resultado en base de datos</Label>
                <p className="text-sm text-gray-600">El resultado se guardará en el historial del niño</p>
              </div>
              <Switch checked={saveToDb} onCheckedChange={setSaveToDb} />
            </div>

            <Button onClick={handleManualPrediction} disabled={loading} className="w-full" size="lg">
              {loading ? "Analizando..." : "Realizar Predicción Manual"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Botón para recargar verificación de datos */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={checkDataCompleteness} disabled={checkingData} className="w-full">
            {checkingData ? "Verificando..." : "Verificar datos nuevamente"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
