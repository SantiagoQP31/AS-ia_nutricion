"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Activity, Users, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import MeasurementForm from "./components/measurement-form"
import { toast } from "sonner"
import { measurementApiService } from "@/services/measurement-api"
import { childApiService } from "@/services/child-api"
import type { Measurement } from "@/types/measurement"
import type { ChildSummary } from "@/types/child"

export default function MedicionesPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterMeasurements()
  }, [measurements, searchTerm, selectedChild])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [measurementsData, childrenData] = await Promise.all([
        measurementApiService.getAllMeasurements(),
        childApiService.getChildren(),
      ])
      setMeasurements(measurementsData)
      setChildren(childrenData)
    } catch (error) {
      toast.error("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const filterMeasurements = () => {
    let filtered = measurements

    if (selectedChild) {
      filtered = filtered.filter((measurement) => measurement.child_id === selectedChild)
    }

    if (searchTerm) {
      const childrenMap = new Map(children.map((child) => [child.id, child]))
      filtered = filtered.filter((measurement) => {
        const child = childrenMap.get(measurement.child_id)
        if (!child) return false
        return (
          child.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.documento.includes(searchTerm)
        )
      })
    }

    setFilteredMeasurements(filtered)
  }

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId)
    return child ? `${child.nombre} ${child.apellido}` : "Niño no encontrado"
  }

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { category: "Bajo peso", color: "bg-blue-100 text-blue-800" }
    if (imc < 25) return { category: "Normal", color: "bg-green-100 text-green-800" }
    if (imc < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" }
    return { category: "Obesidad", color: "bg-red-100 text-red-800" }
  }

  const calculateStats = () => {
    const totalMeasurements = measurements.length
    const uniqueChildren = new Set(measurements.map((m) => m.child_id)).size
    const recentMeasurements = measurements.filter(
      (m) => new Date(m.fecha_medicion) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length

    return { totalMeasurements, uniqueChildren, recentMeasurements }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mediciones Antropométricas</h1>
          <p className="text-gray-600 mt-1">Gestiona las mediciones de peso, talla e IMC de los niños</p>
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
              <DialogTitle>Registrar Nueva Medición</DialogTitle>
            </DialogHeader>
            <MeasurementForm
              onSuccess={() => {
                setShowForm(false)
                fetchData()
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Mediciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMeasurements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Niños con Mediciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mediciones Recientes (30 días)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentMeasurements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre del niño o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por niño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niños</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.nombre} {child.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements List */}
      <div className="grid gap-4">
        {filteredMeasurements.length > 0 ? (
          filteredMeasurements
            .sort((a, b) => new Date(b.fecha_medicion).getTime() - new Date(a.fecha_medicion).getTime())
            .map((measurement) => {
              const imcInfo = getIMCCategory(measurement.imc)
              return (
                <Card key={measurement.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{getChildName(measurement.child_id)}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(measurement.fecha_medicion).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Measurements */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Peso</p>
                            <p className="text-xl font-bold text-blue-700">{measurement.peso} kg</p>
                          </div>

                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Talla</p>
                            <p className="text-xl font-bold text-green-700">{measurement.talla} cm</p>
                          </div>

                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600 font-medium">IMC</p>
                            <p className="text-xl font-bold text-purple-700">{measurement.imc}</p>
                          </div>

                          <div className="flex items-center justify-center">
                            <Badge className={imcInfo.color}>{imcInfo.category}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-6">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/mediciones/${measurement.child_id}/page.tsx`)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        >
                          Ver Historial
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mediciones</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedChild
                  ? "No hay mediciones que coincidan con los criterios de búsqueda"
                  : "Aún no hay mediciones registradas en el sistema"}
              </p>
              {!searchTerm && !selectedChild && (
                <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primera Medición
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
