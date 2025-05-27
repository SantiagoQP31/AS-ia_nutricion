"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, TrendingUp, Zap, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { childApiService } from "@/services/child-api"
import { aiApiService } from "@/services/ai-api"
import PredictionForm from "./components/prediction-form"
import PredictionResult from "./components/prediction-result"
import ClassificationHistory from "./components/classification-history"
import ClassificationStats from "./components/classification-stats"
import type { ChildSummary } from "@/types/child"
import type { PredictionResponse } from "@/types/ai"

export default function AnalisisIAPage() {
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>("")
  const [selectedChild, setSelectedChild] = useState<ChildSummary | null>(null)
  const [lastPrediction, setLastPrediction] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState<any>(null)

  useEffect(() => {
    fetchChildren()
    checkAIHealth()
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      const child = children.find((c) => c.id === selectedChildId)
      setSelectedChild(child || null)
      setLastPrediction(null) // Reset prediction when changing child
    }
  }, [selectedChildId, children])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const data = await childApiService.getChildren()
      setChildren(data)

      // Auto-select first child if available
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching children:", error)
      toast.error("Error al cargar la lista de niños")
    } finally {
      setLoading(false)
    }
  }

  const checkAIHealth = async () => {
    try {
      const health = await aiApiService.checkHealth()
      setHealthStatus(health)
    } catch (error) {
      console.error("Error checking AI health:", error)
      setHealthStatus({ status: "error", message: "Servicio no disponible" })
    }
  }

  const handlePredictionComplete = (result: PredictionResponse) => {
    setLastPrediction(result)
  }

  const testAIConnection = async () => {
    try {
      toast.info("Probando conexión con el servicio de IA...")
      const health = await aiApiService.checkHealth()
      console.log("🔍 Estado del servicio IA:", health)
      setHealthStatus(health)

      if (health.status === "healthy") {
        toast.success("Conexión con IA exitosa")
      } else {
        toast.warning("Servicio de IA con problemas")
      }
    } catch (error) {
      console.error("❌ Error probando IA:", error)
      toast.error("Error de conexión con el servicio de IA")
      setHealthStatus({ status: "error", message: "Conexión fallida" })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando módulo de IA...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis IA</h1>
          <p className="text-gray-600 mt-1">Predicción del estado nutricional usando inteligencia artificial</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Estado del servicio */}
          <div className="flex items-center gap-2">
            <Badge
              variant={healthStatus?.status === "healthy" ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              <div
                className={`w-2 h-2 rounded-full ${healthStatus?.status === "healthy" ? "bg-green-500" : "bg-red-500"}`}
              />
              {healthStatus?.status === "healthy" ? "IA Activa" : "IA Inactiva"}
            </Badge>
          </div>

          <Button variant="outline" onClick={testAIConnection}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Probar Conexión IA
          </Button>
        </div>
      </div>

      {/* Selector de niño */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Seleccionar Niño para Análisis
          </CardTitle>
          <CardDescription>Elige un niño para realizar predicciones y ver su historial de análisis IA</CardDescription>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay niños registrados</h3>
              <p className="text-gray-600">
                Primero debes registrar niños en el sistema para poder realizar análisis IA
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un niño..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {child.nombre} {child.apellido}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {child.sexo === "M" ? "Masculino" : "Femenino"}
                        </Badge>
                        {child.institucion && <span className="text-sm text-gray-500">- {child.institucion}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedChild && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    Niño seleccionado: {selectedChild.nombre} {selectedChild.apellido}
                  </h4>
                  <div className="text-sm text-blue-700 mt-1 space-y-1">
                    <p>Documento: {selectedChild.documento}</p>
                    <p>Fecha de nacimiento: {new Date(selectedChild.fecha_nacimiento).toLocaleDateString("es-ES")}</p>
                    {selectedChild.institucion && <p>Institución: {selectedChild.institucion}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenido principal - Solo si hay un niño seleccionado */}
      {selectedChild && (
        <Tabs defaultValue="prediction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prediction" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Nueva Predicción
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="space-y-6">
            <PredictionForm
              childId={selectedChild.id}
              childName={`${selectedChild.nombre} ${selectedChild.apellido}`}
              onPredictionComplete={handlePredictionComplete}
            />

            {lastPrediction && <PredictionResult result={lastPrediction} />}
          </TabsContent>

          <TabsContent value="history">
            <ClassificationHistory
              childId={selectedChild.id}
              childName={`${selectedChild.nombre} ${selectedChild.apellido}`}
            />
          </TabsContent>

          <TabsContent value="stats">
            <ClassificationStats
              childId={selectedChild.id}
              childName={`${selectedChild.nombre} ${selectedChild.apellido}`}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
