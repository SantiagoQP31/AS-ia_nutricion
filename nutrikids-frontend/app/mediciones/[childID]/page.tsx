"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, BarChart3, List, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import MeasurementForm from "../components/measurement-form"
import MeasurementHistory from "../components/measurement-history"
import MeasurementChart from "../components/measurement-chart"
import MeasurementStatsComponent from "../components/measurement-stats"
import { measurementApiService } from "@/services/measurement-api"
import { childApiService } from "@/services/child-api"
import type { Measurement, MeasurementStats } from "@/types/measurement"
import type { ChildSummary } from "@/types/child"

export default function ChildMeasurementsPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.childId as string

  const [child, setChild] = useState<ChildSummary | null>(null)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [stats, setStats] = useState<MeasurementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("history")

  useEffect(() => {
    if (childId) {
      fetchData()
    }
  }, [childId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [childData, measurementsData] = await Promise.all([
        childApiService.getChildById(childId),
        measurementApiService.getMeasurementsByChild(childId),
      ])

      setChild(childData)
      setMeasurements(measurementsData)

      // Obtener estadísticas si hay mediciones
      if (measurementsData.length > 0) {
        const statsData = await measurementApiService.getChildStats(childId)
        setStats(statsData)
      }
    } catch (error) {
      toast.error("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del niño...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Niño no encontrado</h3>
          <p className="text-gray-600 mb-4">No se encontró el niño especificado</p>
          <Button onClick={() => router.push("/mediciones")}>Volver a Mediciones</Button>
        </div>
      </div>
    )
  }

  const childName = `${child.nombre} ${child.apellido}`

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/mediciones")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Mediciones
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mediciones de {childName}</h1>
            <p className="text-gray-600 mt-1">
              {measurements.length} mediciones registradas • Documento: {child.documento}
            </p>
          </div>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Medición
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Medición para {childName}</DialogTitle>
            </DialogHeader>
            <MeasurementForm
              preselectedChildId={childId}
              onSuccess={() => {
                setShowForm(false)
                fetchData()
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2" disabled={measurements.length === 0}>
            <BarChart3 className="w-4 h-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2" disabled={!stats}>
            <TrendingUp className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <MeasurementHistory
            measurements={measurements}
            childId={childId}
            childName={childName}
            onUpdate={fetchData}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {measurements.length > 0 ? (
            <MeasurementChart measurements={measurements} childName={childName} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Se necesitan al menos 2 mediciones para mostrar gráficos</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats ? (
            <MeasurementStatsComponent stats={stats} childName={childName} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay suficientes datos para mostrar estadísticas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
