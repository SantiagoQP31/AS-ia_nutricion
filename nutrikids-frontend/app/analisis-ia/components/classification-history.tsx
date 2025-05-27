"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Calendar, Brain, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { aiApiService } from "@/services/ai-api"
import type { ClassificationResult } from "@/types/ai"

interface ClassificationHistoryProps {
  childId: string
  childName: string
}

export default function ClassificationHistory({ childId, childName }: ClassificationHistoryProps) {
  const [history, setHistory] = useState<ClassificationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchHistory()
  }, [childId, limit])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await aiApiService.getClassificationHistory(childId, limit)
      if (response.success) {
        setHistory(response.data.historial)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      toast.error("Error al cargar el historial")
    } finally {
      setLoading(false)
    }
  }

  const getStateColor = (state: string) => {
    const colorMap = {
      normal: "bg-green-100 text-green-800",
      riesgo_desnutricion: "bg-yellow-100 text-yellow-800",
      desnutricion_aguda_moderada: "bg-orange-100 text-orange-800",
      desnutricion_aguda_severa: "bg-red-100 text-red-800",
      sobrepeso: "bg-blue-100 text-blue-800",
      obesidad: "bg-purple-100 text-purple-800",
    }
    return colorMap[state as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  }

  const getStateLabel = (state: string) => {
    const labelMap = {
      normal: "Normal",
      riesgo_desnutricion: "Riesgo Desnutrición",
      desnutricion_aguda_moderada: "Desnutrición Moderada",
      desnutricion_aguda_severa: "Desnutrición Severa",
      sobrepeso: "Sobrepeso",
      obesidad: "Obesidad",
    }
    return labelMap[state as keyof typeof labelMap] || state
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Historial de Clasificaciones
            </CardTitle>
            <CardDescription>Historial de análisis IA para {childName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number.parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 registros</SelectItem>
                <SelectItem value="10">10 registros</SelectItem>
                <SelectItem value="20">20 registros</SelectItem>
                <SelectItem value="50">50 registros</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchHistory}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
            <p className="text-gray-600">No hay clasificaciones previas para este niño</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formatDate(item.fecha_resultado)}</span>
                  </div>
                  <Badge className={getStateColor(item.resultado)}>{getStateLabel(item.resultado)}</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Confianza: {(item.confidence_score * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">
                      {item.modelo.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>

                  {index === 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Más reciente
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {history.length >= limit && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">Mostrando los últimos {limit} registros</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
