"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, Activity, Scale, Ruler } from "lucide-react"
import type { ReporteSeguimiento } from "@/types/report"

interface SeguimientoReportProps {
  reporte: ReporteSeguimiento
}

export default function SeguimientoReport({ reporte }: SeguimientoReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCambioInfo = (cambio: number | undefined, unidad: string) => {
    if (cambio === undefined || cambio === null) return { color: "text-gray-600", icon: Activity, text: "Sin datos" }

    if (cambio > 0) {
      return {
        color: "text-green-600",
        icon: TrendingUp,
        text: `+${cambio.toFixed(2)} ${unidad}`,
      }
    } else if (cambio < 0) {
      return {
        color: "text-red-600",
        icon: TrendingDown,
        text: `${cambio.toFixed(2)} ${unidad}`,
      }
    } else {
      return {
        color: "text-blue-600",
        icon: Activity,
        text: `Sin cambio`,
      }
    }
  }

  const pesoInfo = getCambioInfo(reporte.cambio_peso, "kg")
  const tallaInfo = getCambioInfo(reporte.cambio_talla, "cm")
  const imcInfo = getCambioInfo(reporte.cambio_imc, "")

  const getRecomendaciones = () => {
    const recomendaciones = []

    if (reporte.total_mediciones < 3) {
      recomendaciones.push({
        tipo: "info",
        mensaje: "Se recomienda realizar más mediciones para obtener un análisis más preciso de la evolución.",
      })
    }

    if (reporte.cambio_imc && reporte.cambio_imc > 2) {
      recomendaciones.push({
        tipo: "warning",
        mensaje: "El aumento significativo del IMC requiere atención. Considere consultar con un especialista.",
      })
    }

    if (reporte.cambio_imc && reporte.cambio_imc < -2) {
      recomendaciones.push({
        tipo: "warning",
        mensaje: "La disminución significativa del IMC requiere evaluación médica.",
      })
    }

    if (reporte.meses_seguimiento && reporte.meses_seguimiento > 12) {
      recomendaciones.push({
        tipo: "success",
        mensaje: "Excelente seguimiento a largo plazo. Los datos permiten un análisis confiable de la evolución.",
      })
    }

    if (reporte.cambio_peso && reporte.cambio_peso > 0 && reporte.cambio_talla && reporte.cambio_talla > 0) {
      recomendaciones.push({
        tipo: "success",
        mensaje: "Crecimiento positivo tanto en peso como en talla. Evolución favorable.",
      })
    }

    return recomendaciones
  }

  const recomendaciones = getRecomendaciones()

  const getRecomendacionColor = (tipo: string) => {
    switch (tipo) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6" />
            Reporte de Seguimiento - {reporte.nombre} {reporte.apellido}
          </CardTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Período: {reporte.primera_medicion ? formatDate(reporte.primera_medicion) : "N/A"} -{" "}
              {reporte.ultima_medicion ? formatDate(reporte.ultima_medicion) : "N/A"}
            </div>
            <div>Duración: {reporte.meses_seguimiento?.toFixed(1) || "N/A"} meses</div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas de seguimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{reporte.total_mediciones}</div>
            <div className="text-sm text-gray-600">Total Mediciones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Scale className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className={`text-lg font-bold ${pesoInfo.color}`}>{pesoInfo.text}</div>
            <div className="text-sm text-gray-600">Cambio de Peso</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Ruler className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className={`text-lg font-bold ${tallaInfo.color}`}>{tallaInfo.text}</div>
            <div className="text-sm text-gray-600">Cambio de Talla</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className={`text-lg font-bold ${imcInfo.color}`}>{imcInfo.text}</div>
            <div className="text-sm text-gray-600">Cambio de IMC</div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de cambios */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cambios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-green-600" />
                <span className="font-medium">Peso</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${pesoInfo.color}`}>{pesoInfo.text}</div>
                <div className="text-sm text-gray-600">
                  {reporte.meses_seguimiento && reporte.cambio_peso
                    ? `${(reporte.cambio_peso / reporte.meses_seguimiento).toFixed(2)} kg/mes`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Talla</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${tallaInfo.color}`}>{tallaInfo.text}</div>
                <div className="text-sm text-gray-600">
                  {reporte.meses_seguimiento && reporte.cambio_talla
                    ? `${(reporte.cambio_talla / reporte.meses_seguimiento).toFixed(2)} cm/mes`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="font-medium">IMC</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${imcInfo.color}`}>{imcInfo.text}</div>
                <div className="text-sm text-gray-600">
                  {reporte.meses_seguimiento && reporte.cambio_imc
                    ? `${(reporte.cambio_imc / reporte.meses_seguimiento).toFixed(3)} /mes`
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del período */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Primera Medición</span>
              <span>{reporte.primera_medicion ? formatDate(reporte.primera_medicion) : "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Última Medición</span>
              <span>{reporte.ultima_medicion ? formatDate(reporte.ultima_medicion) : "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Duración del Seguimiento</span>
              <span>{reporte.meses_seguimiento?.toFixed(1) || "N/A"} meses</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Frecuencia Promedio</span>
              <span>
                {reporte.meses_seguimiento && reporte.total_mediciones > 1
                  ? `${(reporte.meses_seguimiento / (reporte.total_mediciones - 1)).toFixed(1)} meses/medición`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recomendaciones.map((recomendacion, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getRecomendacionColor(recomendacion.tipo)}`}>
                  <p>{recomendacion.mensaje}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
