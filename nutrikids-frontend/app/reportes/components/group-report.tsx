"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Users, Activity, TrendingUp, MapPin, Calendar } from "lucide-react"
import type { ReporteGrupal, ChartDataNutricional, ChartDataSexo } from "@/types/report"

interface GroupReportProps {
  reporte: ReporteGrupal
}

export default function GroupReport({ reporte }: GroupReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Preparar datos para gráfico nutricional
  const dataNutricional: ChartDataNutricional[] = [
    {
      estado: "Normal",
      cantidad: reporte.estadisticas_nutricionales.normal,
      porcentaje: (reporte.estadisticas_nutricionales.normal / reporte.estadisticas_nutricionales.total) * 100,
      color: "#10b981",
    },
    {
      estado: "Riesgo Desnutrición",
      cantidad: reporte.estadisticas_nutricionales.riesgo_desnutricion,
      porcentaje:
        (reporte.estadisticas_nutricionales.riesgo_desnutricion / reporte.estadisticas_nutricionales.total) * 100,
      color: "#f59e0b",
    },
    {
      estado: "Desnutrición Moderada",
      cantidad: reporte.estadisticas_nutricionales.desnutricion_aguda_moderada,
      porcentaje:
        (reporte.estadisticas_nutricionales.desnutricion_aguda_moderada / reporte.estadisticas_nutricionales.total) *
        100,
      color: "#f97316",
    },
    {
      estado: "Desnutrición Severa",
      cantidad: reporte.estadisticas_nutricionales.desnutricion_aguda_severa,
      porcentaje:
        (reporte.estadisticas_nutricionales.desnutricion_aguda_severa / reporte.estadisticas_nutricionales.total) * 100,
      color: "#dc2626",
    },
    {
      estado: "Sobrepeso",
      cantidad: reporte.estadisticas_nutricionales.sobrepeso,
      porcentaje: (reporte.estadisticas_nutricionales.sobrepeso / reporte.estadisticas_nutricionales.total) * 100,
      color: "#eab308",
    },
    {
      estado: "Obesidad",
      cantidad: reporte.estadisticas_nutricionales.obesidad,
      porcentaje: (reporte.estadisticas_nutricionales.obesidad / reporte.estadisticas_nutricionales.total) * 100,
      color: "#ef4444",
    },
  ].filter((item) => item.cantidad > 0)

  // Preparar datos para gráfico de sexo
  const dataSexo: ChartDataSexo[] = [
    {
      sexo: "Masculino",
      cantidad: reporte.estadisticas_sexo.masculino,
      porcentaje: (reporte.estadisticas_sexo.masculino / reporte.estadisticas_sexo.total) * 100,
    },
    {
      sexo: "Femenino",
      cantidad: reporte.estadisticas_sexo.femenino,
      porcentaje: (reporte.estadisticas_sexo.femenino / reporte.estadisticas_sexo.total) * 100,
    },
  ]

  const COLORS = ["#3b82f6", "#ec4899"]

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
            <div className="text-2xl font-bold text-orange-600">{reporte.instituciones_representadas.length}</div>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataNutricional}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, porcentaje }) => `${estado}: ${porcentaje.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {dataNutricional.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de distribución por sexo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataSexo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sexo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
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
          </CardContent>
        </Card>

        {/* Instituciones representadas */}
        <Card>
          <CardHeader>
            <CardTitle>Instituciones Representadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reporte.instituciones_representadas.length > 0 ? (
                reporte.instituciones_representadas.map((institucion, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {institucion}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No hay instituciones registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
