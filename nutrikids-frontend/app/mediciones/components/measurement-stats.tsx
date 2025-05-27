"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Ruler, Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { MeasurementStats } from "@/types/measurement"

interface MeasurementStatsProps {
  stats: MeasurementStats
  childName: string
}

export default function MeasurementStatsComponent({ stats, childName }: MeasurementStatsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getIMCCategory = (imc: number | null) => {
    if (!imc) return { category: "N/A", color: "bg-gray-100 text-gray-800" }
    if (imc < 18.5) return { category: "Bajo peso", color: "bg-blue-100 text-blue-800" }
    if (imc < 25) return { category: "Normal", color: "bg-green-100 text-green-800" }
    if (imc < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" }
    return { category: "Obesidad", color: "bg-red-100 text-red-800" }
  }

  const getTrend = (actual: number | null, promedio: number | null) => {
    if (!actual || !promedio) return null
    const diff = actual - promedio
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: "text-gray-500", text: "Estable" }
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500", text: "Creciendo" }
    return { icon: TrendingDown, color: "text-red-500", text: "Disminuyendo" }
  }

  const imcCategory = getIMCCategory(stats.imc.actual)
  const pesoTrend = getTrend(stats.peso.actual, stats.peso.promedio)
  const tallaTrend = getTrend(stats.talla.actual, stats.talla.promedio)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas de {childName}</h2>
        <p className="text-gray-600 mt-1">
          {stats.total_mediciones} mediciones registradas
          {stats.primera_medicion && stats.ultima_medicion && (
            <span className="block text-sm">
              Desde {formatDate(stats.primera_medicion)} hasta {formatDate(stats.ultima_medicion)}
            </span>
          )}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Peso */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-blue-600" />
              Peso
              {pesoTrend && (
                <div className="flex items-center gap-1 ml-auto">
                  <pesoTrend.icon className={`w-4 h-4 ${pesoTrend.color}`} />
                  <span className={`text-xs ${pesoTrend.color}`}>{pesoTrend.text}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.peso.actual ? `${stats.peso.actual} kg` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Peso actual</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">{stats.peso.minimo ? `${stats.peso.minimo} kg` : "N/A"}</div>
                <div className="text-gray-500">Mínimo</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.peso.promedio ? `${stats.peso.promedio} kg` : "N/A"}</div>
                <div className="text-gray-500">Promedio</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.peso.maximo ? `${stats.peso.maximo} kg` : "N/A"}</div>
                <div className="text-gray-500">Máximo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Talla */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ruler className="w-5 h-5 text-green-600" />
              Talla
              {tallaTrend && (
                <div className="flex items-center gap-1 ml-auto">
                  <tallaTrend.icon className={`w-4 h-4 ${tallaTrend.color}`} />
                  <span className={`text-xs ${tallaTrend.color}`}>{tallaTrend.text}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.talla.actual ? `${stats.talla.actual} cm` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Talla actual</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">{stats.talla.minimo ? `${stats.talla.minimo} cm` : "N/A"}</div>
                <div className="text-gray-500">Mínimo</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.talla.promedio ? `${stats.talla.promedio} cm` : "N/A"}</div>
                <div className="text-gray-500">Promedio</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.talla.maximo ? `${stats.talla.maximo} cm` : "N/A"}</div>
                <div className="text-gray-500">Máximo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IMC */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-purple-600" />
              IMC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.imc.actual ? stats.imc.actual : "N/A"}</div>
              <div className="text-sm text-gray-600">IMC actual</div>
              {stats.imc.actual && <Badge className={`mt-2 ${imcCategory.color}`}>{imcCategory.category}</Badge>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">{stats.imc.minimo || "N/A"}</div>
                <div className="text-gray-500">Mínimo</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.imc.promedio || "N/A"}</div>
                <div className="text-gray-500">Promedio</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{stats.imc.maximo || "N/A"}</div>
                <div className="text-gray-500">Máximo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información del IMC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Bajo peso: &lt; 18.5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Normal: 18.5 - 24.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Sobrepeso: 25 - 29.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Obesidad: ≥ 30</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
