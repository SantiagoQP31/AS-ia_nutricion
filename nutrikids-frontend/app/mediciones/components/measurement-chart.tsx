"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Measurement, ChartDataPoint } from "@/types/measurement"

interface MeasurementChartProps {
  measurements: Measurement[]
  childName: string
}

export default function MeasurementChart({ measurements, childName }: MeasurementChartProps) {
  // Preparar datos para el gráfico
  const chartData: ChartDataPoint[] = measurements
    .sort((a, b) => new Date(a.fecha_medicion).getTime() - new Date(b.fecha_medicion).getTime())
    .map((measurement) => ({
      fecha: new Date(measurement.fecha_medicion).toLocaleDateString(),
      peso: measurement.peso,
      talla: measurement.talla,
      imc: measurement.imc,
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No hay datos suficientes para mostrar el gráfico</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Peso y Talla */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Peso y Talla - {childName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="peso"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                name="Peso (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="talla"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                name="Talla (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de IMC */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución del IMC - {childName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="imc"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                name="IMC"
              />
              {/* Líneas de referencia para categorías de IMC */}
              <Line
                type="monotone"
                dataKey={() => 18.5}
                stroke="#6b7280"
                strokeDasharray="5 5"
                dot={false}
                name="Bajo peso (18.5)"
              />
              <Line
                type="monotone"
                dataKey={() => 25}
                stroke="#6b7280"
                strokeDasharray="5 5"
                dot={false}
                name="Sobrepeso (25)"
              />
              <Line
                type="monotone"
                dataKey={() => 30}
                stroke="#6b7280"
                strokeDasharray="5 5"
                dot={false}
                name="Obesidad (30)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
