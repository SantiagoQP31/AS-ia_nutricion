"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BarChart3, PieChartIcon, RefreshCw, Brain } from "lucide-react"
import { toast } from "sonner"
import { aiApiService } from "@/services/ai-api"
import type { EstadisticasResponse } from "@/types/ai"

interface ClassificationStatsProps {
  childId: string
  childName: string
}

const COLORS = {
  normal: "#10b981",
  riesgo_desnutricion: "#f59e0b",
  desnutricion_aguda_moderada: "#f97316",
  desnutricion_aguda_severa: "#ef4444",
  sobrepeso: "#3b82f6",
  obesidad: "#8b5cf6",
}

export default function ClassificationStats({ childId, childName }: ClassificationStatsProps) {
  const [stats, setStats] = useState<EstadisticasResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [childId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await aiApiService.getClassificationStats(childId)
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
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

  const prepareChartData = () => {
    if (!stats?.estadisticas.distribucion_resultados) return []

    return Object.entries(stats.estadisticas.distribucion_resultados).map(([state, count]) => ({
      name: getStateLabel(state),
      value: count,
      color: COLORS[state as keyof typeof COLORS] || "#6b7280",
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando estadísticas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.total_predicciones === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Estadísticas de Clasificaciones
          </CardTitle>
          <CardDescription>Análisis estadístico para {childName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos estadísticos</h3>
            <p className="text-gray-600">No hay suficientes clasificaciones para generar estadísticas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = prepareChartData()

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total_predicciones}</div>
              <p className="text-sm text-gray-600">Total Predicciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.estadisticas.confidence_promedio
                  ? `${(stats.estadisticas.confidence_promedio * 100).toFixed(1)}%`
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600">Confianza Promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge
                className={`text-sm ${
                  stats.estadisticas.resultado_mas_frecuente
                    ? COLORS[stats.estadisticas.resultado_mas_frecuente as keyof typeof COLORS]
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {stats.estadisticas.resultado_mas_frecuente
                  ? getStateLabel(stats.estadisticas.resultado_mas_frecuente)
                  : "N/A"}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">Más Frecuente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {stats.estadisticas.ultima_prediccion ? getStateLabel(stats.estadisticas.ultima_prediccion) : "N/A"}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">Última Predicción</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Distribución de Resultados
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchStats}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de torta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Proporción de Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
