"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Users, Activity, TrendingUp, MapPin, Calendar, AlertCircle } from "lucide-react"
import type { ReporteGrupal, ChartDataNutricional, ChartDataSexo } from "@/types/report"

interface GroupReportProps {
  reporte: ReporteGrupal
}

export default function GroupReport({ reporte }: GroupReportProps) {
  // Debug logging
  console.log("🔍 GroupReport - Datos recibidos:", reporte)
  console.log("🔍 Estadísticas nutricionales:", reporte?.estadisticas_nutricionales)
  console.log("🔍 Total niños:", reporte?.total_ninos)
  console.log("🔍 Estadísticas sexo:", reporte?.estadisticas_sexo)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Verificar si hay datos válidos - RELAJAR VALIDACIÓN
  const hasValidData = reporte && reporte.total_ninos > 0
  console.log("🔍 hasValidData:", hasValidData)

  if (!hasValidData) {
    console.log("❌ No hay datos válidos - mostrando mensaje de error")
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🔧 Información de Debug:</h4>
              <pre className="text-xs text-yellow-700 overflow-auto">{JSON.stringify(reporte, null, 2)}</pre>
            </div>
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
              <p className="text-gray-500">No se encontraron datos para generar el reporte grupal.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Preparar datos para gráfico nutricional con validación MEJORADA
  const estadisticasNut = reporte.estadisticas_nutricionales || {}
  const dataNutricional: ChartDataNutricional[] = [
    {
      estado: "Normal",
      cantidad: estadisticasNut.normal || 0,
      porcentaje: ((estadisticasNut.normal || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#10b981",
    },
    {
      estado: "Riesgo Desnutrición",
      cantidad: estadisticasNut.riesgo_desnutricion || 0,
      porcentaje: ((estadisticasNut.riesgo_desnutricion || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#f59e0b",
    },
    {
      estado: "Desnutrición Moderada",
      cantidad: estadisticasNut.desnutricion_aguda_moderada || 0,
      porcentaje: ((estadisticasNut.desnutricion_aguda_moderada || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#f97316",
    },
    {
      estado: "Desnutrición Severa",
      cantidad: estadisticasNut.desnutricion_aguda_severa || 0,
      porcentaje: ((estadisticasNut.desnutricion_aguda_severa || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#dc2626",
    },
    {
      estado: "Sobrepeso",
      cantidad: estadisticasNut.sobrepeso || 0,
      porcentaje: ((estadisticasNut.sobrepeso || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#eab308",
    },
    {
      estado: "Obesidad",
      cantidad: estadisticasNut.obesidad || 0,
      porcentaje: ((estadisticasNut.obesidad || 0) / (reporte.total_ninos || 1)) * 100,
      color: "#ef4444",
    },
  ]

  console.log("🔍 Datos nutricionales preparados:", dataNutricional)

  // Preparar datos para gráfico de sexo con validación MEJORADA
  const estadisticasSexo = reporte.estadisticas_sexo || { masculino: 0, femenino: 0, total: 0 }
  const dataSexo: ChartDataSexo[] = [
    {
      sexo: "Masculino",
      cantidad: estadisticasSexo.masculino || 0,
      porcentaje: ((estadisticasSexo.masculino || 0) / (reporte.total_ninos || 1)) * 100,
    },
    {
      sexo: "Femenino",
      cantidad: estadisticasSexo.femenino || 0,
      porcentaje: ((estadisticasSexo.femenino || 0) / (reporte.total_ninos || 1)) * 100,
    },
  ]

  console.log("🔍 Datos de sexo preparados:", dataSexo)

  const COLORS = ["#3b82f6", "#ec4899"]

  // Custom label para el pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // No mostrar labels para segmentos muy pequeños

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6" />
                Reporte Grupal
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Generado: {formatDate(reporte.fecha_generacion)}
                </div>
                <div>Total de niños: {reporte.total_ninos}</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{reporte.total_ninos}</div>
            <div className="text-sm text-gray-600">Total Niños</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{reporte.promedio_imc_general?.toFixed(1) || "N/A"}</div>
            <div className="text-sm text-gray-600">IMC Promedio</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{reporte.promedio_edad?.toFixed(1) || "N/A"}</div>
            <div className="text-sm text-gray-600">Edad Promedio</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{reporte.instituciones_representadas?.length || 0}</div>
            <div className="text-sm text-gray-600">Instituciones</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de estado nutricional */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado Nutricional</CardTitle>
          </CardHeader>
          <CardContent>
            {dataNutricional.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataNutricional}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {dataNutricional.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} niños (${props.payload.porcentaje.toFixed(1)}%)`,
                      props.payload.estado,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay datos nutricionales disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de distribución por sexo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            {dataSexo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataSexo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sexo" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} niños (${props.payload.porcentaje.toFixed(1)}%)`,
                      "Cantidad",
                    ]}
                  />
                  <Bar dataKey="cantidad" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay datos de distribución por sexo disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalles estadísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estadísticas nutricionales detalladas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Nutricionales Detalladas</CardTitle>
          </CardHeader>
          <CardContent>
            {dataNutricional.length > 0 ? (
              <div className="space-y-3">
                {dataNutricional.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.estado}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.cantidad}</div>
                      <div className="text-sm text-gray-600">{item.porcentaje.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No hay estadísticas nutricionales disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instituciones representadas */}
        <Card>
          <CardHeader>
            <CardTitle>Instituciones Representadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reporte.instituciones_representadas && reporte.instituciones_representadas.length > 0 ? (
                reporte.instituciones_representadas.map((institucion, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {institucion}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay instituciones registradas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
