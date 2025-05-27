"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2, Calendar, Scale, Ruler, Calculator } from "lucide-react"
import { toast } from "sonner"
import { measurementApiService } from "@/services/measurement-api"
import MeasurementForm from "./measurement-form"
import type { Measurement } from "@/types/measurement"

interface MeasurementHistoryProps {
  measurements: Measurement[]
  childId: string
  childName: string
  onUpdate: () => void
}

export default function MeasurementHistory({ measurements, childId, childName, onUpdate }: MeasurementHistoryProps) {
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  const handleDelete = async (measurementId: string) => {
    if (!confirm("¿Está seguro de eliminar esta medición? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const result = await measurementApiService.deleteMeasurement(measurementId)
      toast.success(result.message || "Medición eliminada exitosamente")
      onUpdate()
    } catch (error) {
      toast.error("No se pudo eliminar la medición")
    }
  }

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { category: "Bajo peso", color: "bg-blue-100 text-blue-800" }
    if (imc < 25) return { category: "Normal", color: "bg-green-100 text-green-800" }
    if (imc < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" }
    return { category: "Obesidad", color: "bg-red-100 text-red-800" }
  }

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.fecha_medicion).getTime() - new Date(a.fecha_medicion).getTime(),
  )

  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mediciones registradas</h3>
          <p className="text-gray-600">Aún no se han registrado mediciones para {childName}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Mediciones - {childName} ({measurements.length} registros)
        </h3>
      </div>

      <div className="grid gap-4">
        {sortedMeasurements.map((measurement) => {
          const imcInfo = getIMCCategory(measurement.imc)
          return (
            <Card key={measurement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Fecha */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {new Date(measurement.fecha_medicion).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Mediciones */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Peso</p>
                          <p className="font-semibold text-blue-600">{measurement.peso} kg</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Talla</p>
                          <p className="font-semibold text-green-600">{measurement.talla} cm</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">IMC</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-purple-600">{measurement.imc}</p>
                            <Badge className={imcInfo.color}>{imcInfo.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 ml-4">
                    <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingMeasurement(measurement.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Medición</DialogTitle>
                        </DialogHeader>
                        <MeasurementForm
                          measurementId={editingMeasurement}
                          preselectedChildId={childId}
                          onSuccess={() => {
                            setShowEditForm(false)
                            setEditingMeasurement(null)
                            onUpdate()
                          }}
                          onCancel={() => {
                            setShowEditForm(false)
                            setEditingMeasurement(null)
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(measurement.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
