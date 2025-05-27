"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { User, Calendar, MapPin, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import type { ReporteIndividual, TendenciaData } from "@/types/report"

interface IndividualReportProps {
  reporte: ReporteIndividual
}

export default function IndividualReport({ reporte }: IndividualReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Preparar datos para gráfico de evolución
  const tendenciaData: TendenciaData[] = reporte.mediciones.map((medicion) => ({
    fecha: formatDate(medicion.fecha_medicion),
    peso: medicion.peso,
    talla: medicion.talla,
    imc: medicion.imc,
  }))

  // Obtener la clasificación más reciente
  const ultimaClasificacion = reporte.clasificaciones[0]

  // Determinar color y icono de tendencia
  const getTendenciaInfo = (tendencia?: string) => {
    switch (tendencia) {
      case "mejorando":
        return { color: "text-green-600", icon: TrendingUp, bg: "bg-green-100", text: "Mejorando" }
      case "empeorando":
        return { color: "text-red-600", icon: TrendingDown, bg: "bg-red-100", text: "Empeorando" }
      case "estable":
        return { color: "text-blue-600", icon: Minus, bg: "bg-blue-100", text: "Estable" }
      default:
        return { color: "text-gray-600", icon: Activity, bg: "bg-gray-100", text: "Sin datos" }
    }
  }

  const tendenciaInfo = getTendenciaInfo(reporte.tendencia_imc)

  // Determinar color de la clasificación
  const getClasificacionColor = (resultado: string) => {
    switch (resultado.toLowerCase()) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "riesgo_desnutricion":
        return "bg-yellow-100 text-yellow-800"
      case "desnutricion_aguda_moderada":
        return "bg-orange-100 text-orange-800"
      case "desnutricion_aguda_severa":
        return "bg-red-100 text-red-800"
      case "sobrepeso":
        return "bg-purple-100 text-purple-800"
      case "obesidad":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatClasificacion = (resultado: string) => {
    return resultado
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="w-6 h-6" />
                {reporte.nombre} {reporte.apellido}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {reporte.edad_actual} años ({formatDate(reporte.fecha_nacimiento)})
                </div>
                <div>Sexo: {reporte.sexo === "M" ? "Masculino" : "Femenino"}</div>
                {reporte.institucion && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {reporte.institucion}
                  </div>
                )}
              </div>
            </div>
            {reporte.ultima_clasificacion && (
              <Badge className={getClasificacionColor(reporte.ultima_clasificacion)}>
                {formatClasificacion(reporte.ultima_clasificacion)}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{reporte.mediciones.length}</div>
            <div className="text-sm text-gray-600">Total Mediciones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{reporte.clasificaciones.length}</div>
            <div className="text-sm text-gray-600">Clasificaciones IA</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <tendenciaInfo.icon className={`w-8 h-8 ${tendenciaInfo.color} mx-auto mb-2`} />
            <div className={`text-lg font-bold ${tendenciaInfo.color}`}>{tendenciaInfo.text}</div>
            <div className="text-sm text-gray-600">Tendencia IMC</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-600">
              {reporte.mediciones.length > 0
                ? formatDate(reporte.mediciones[reporte.mediciones.length - 1].fecha_medicion)
                : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Última Medición</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de evolución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución del IMC */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del IMC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="imc" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolución del peso */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="peso" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Historial de mediciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Mediciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Peso (kg)</th>
                  <th className="text-left p-2">Talla (cm)</th>
                  <th className="text-left p-2">IMC</th>
                </tr>
              </thead>
              <tbody>
                {reporte.mediciones.map((medicion, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{formatDate(medicion.fecha_medicion)}</td>
                    <td className="p-2">{medicion.peso}</td>
                    <td className="p-2">{medicion.talla}</td>
                    <td className="p-2">{medicion.imc.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historial de clasificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Clasificaciones IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reporte.clasificaciones.map((clasificacion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getClasificacionColor(clasificacion.resultado)}>
                    {formatClasificacion(clasificacion.resultado)}
                  </Badge>
                  <div>
                    <div className="font-medium">Modelo: {clasificacion.modelo}</div>
                    <div className="text-sm text-gray-600">{formatDateTime(clasificacion.fecha_resultado)}</div>
                  </div>
                </div>
                {clasificacion.confidence_score && (
                  <div className="text-right">
                    <div className="font-bold">{(clasificacion.confidence_score * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Confianza</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
