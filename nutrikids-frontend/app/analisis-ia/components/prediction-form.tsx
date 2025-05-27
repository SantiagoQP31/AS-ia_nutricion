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
import { Brain, Zap, Settings, RefreshCw, User, CheckCircle, Info, AlertCircle } from "lucide-react"
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
  details: any
}

export default function PredictionForm({ childId, childName, onPredictionComplete }: PredictionFormProps) {
  const [mode, setMode] = useState<PredictionMode>("automatic")
  const [loading, setLoading] = useState(false)
  const [saveToDb, setSaveToDb] = useState(true)
  const [dataCompleteness, setDataCompleteness] = useState<DataCompleteness | null>(null)
  const [checkingData, setCheckingData] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
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
      console.log("🔍 Completitud de datos:", completeness)
    } catch (error) {
      console.error("Error verificando datos:", error)
      toast.error("Error al verificar los datos del niño")
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
      // Usar la nueva función con mapeo automático
      const result = await aiApiService.predictWithAutoMapping(childId, saveToDb)
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
    <div className="space-y-6">
      {/* Header Principal */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Análisis de Estado Nutricional con IA</div>
              <div className="text-sm text-gray-600 font-normal">Tecnología avanzada para evaluación nutricional</div>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-2">
            <User className="w-4 h-4 text-blue-600" />
            Genera una predicción del estado nutricional para <strong className="text-blue-700">{childName}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Estado de Verificación */}
      {checkingData && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Verificando datos...</strong> Analizando la completitud de la información disponible.
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario de Predicción */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as PredictionMode)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="automatic" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Automático
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automatic" className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-lg mb-2">Predicción Automática</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      El sistema utilizará automáticamente todos los datos disponibles del niño (antropométricos,
                      conductuales, del hogar e historial médico) para realizar la predicción con inteligencia
                      artificial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Guardar resultado en base de datos</Label>
                  <p className="text-sm text-gray-600">
                    El resultado se guardará en el historial del niño para seguimiento futuro
                  </p>
                </div>
                <Switch checked={saveToDb} onCheckedChange={setSaveToDb} />
              </div>

              <Button
                onClick={handleAutomaticPrediction}
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-3" />
                    Realizar Predicción Automática
                  </>
                )}
              </Button>

              {!dataCompleteness?.canPredict && (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Info className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    💡 Completa los datos faltantes en el módulo de niños o usa el modo manual para continuar
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 text-lg mb-2">Predicción Manual</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Ingresa manualmente todos los datos necesarios para la predicción. Útil para hacer simulaciones o
                      cuando faltan datos en el sistema.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario manual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Datos del hogar */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-900 text-lg">Datos del Hogar</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo de ubicación</Label>
                      <Select
                        value={manualData.location_type}
                        onValueChange={(value) => updateManualData("location_type", value)}
                      >
                        <SelectTrigger className="h-10">
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
                      <Label className="text-sm font-medium">Nivel educativo del cuidador</Label>
                      <Select
                        value={manualData.caregiver_education_level}
                        onValueChange={(value) => updateManualData("caregiver_education_level", value)}
                      >
                        <SelectTrigger className="h-10">
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
                      <Label className="text-sm font-medium">Ingresos mensuales (COP)</Label>
                      <Input
                        type="number"
                        className="h-10"
                        value={manualData.monthly_income}
                        onChange={(e) => updateManualData("monthly_income", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Seguridad alimentaria</Label>
                      <Select
                        value={manualData.food_security}
                        onValueChange={(value) => updateManualData("food_security", value)}
                      >
                        <SelectTrigger className="h-10">
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
                </div>

                {/* Datos antropométricos y conductuales */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-900 text-lg">Datos Antropométricos</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Peso (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        className="h-10"
                        value={manualData.peso}
                        onChange={(e) => updateManualData("peso", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Talla (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        className="h-10"
                        value={manualData.talla}
                        onChange={(e) => updateManualData("talla", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">IMC (auto)</Label>
                      <Input type="number" step="0.1" value={manualData.imc} readOnly className="bg-gray-50 h-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tiempo de pantalla (horas/día)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      className="h-10"
                      value={manualData.tiempo_pantalla}
                      onChange={(e) => updateManualData("tiempo_pantalla", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-2 border-b border-purple-200 mt-6">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-900 text-lg">Datos de Salud y Conducta</h4>
                  </div>

                  {/* Switches para datos binarios */}
                  <div className="space-y-4">
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
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <Label className="text-sm font-medium">{label}</Label>
                        <Switch
                          checked={Boolean(manualData[key as keyof EstadoNutricionalInput])}
                          onCheckedChange={(checked) => updateManualData(key as keyof EstadoNutricionalInput, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Guardar resultado en base de datos</Label>
                  <p className="text-sm text-gray-600">El resultado se guardará en el historial del niño</p>
                </div>
                <Switch checked={saveToDb} onCheckedChange={setSaveToDb} />
              </div>

              <Button
                onClick={handleManualPrediction}
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-3" />
                    Realizar Predicción Manual
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botón para recargar verificación de datos */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" onClick={checkDataCompleteness} disabled={checkingData} className="w-full h-11">
            {checkingData ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verificando datos...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar datos nuevamente
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
