"use client"

import { useState, useEffect } from "react"
import { FileText, Users, TrendingUp, BarChart3, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import ReportFilters from "./components/report-filters"
import GroupReport from "./components/group-report"
import IndividualReport from "./components/individual-report"
import SeguimientoReport from "./components/seguimiento-report"
import { reportApiService } from "@/services/report-api"
import { childApiService } from "@/services/child-api"
import type {
  ReporteGrupal,
  ReporteIndividual,
  ReporteSeguimiento,
  ReportFilter,
  EstadisticasRapidas,
} from "@/types/report"
import type { ChildSummary } from "@/types/child"

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("grupal")
  const [reporteGrupal, setReporteGrupal] = useState<ReporteGrupal | null>(null)
  const [reporteIndividual, setReporteIndividual] = useState<ReporteIndividual | null>(null)
  const [reporteSeguimiento, setReporteSeguimiento] = useState<ReporteSeguimiento | null>(null)
  const [estadisticasRapidas, setEstadisticasRapidas] = useState<EstadisticasRapidas | null>(null)
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<ReportFilter>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🚀 Iniciando carga de datos...")

      // Verificar la URL de la API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      console.log("🌐 API URL configurada:", apiUrl)

      // Cargar estadísticas rápidas primero
      try {
        console.log("📊 Cargando estadísticas rápidas...")
        const statsData = await reportApiService.getEstadisticasRapidas()
        console.log("✅ Estadísticas cargadas exitosamente:", statsData)
        setEstadisticasRapidas(statsData)
      } catch (error) {
        console.error("❌ Error cargando estadísticas:", error)
        setError(`Error cargando estadísticas: ${error}`)
        toast.error("No se pudieron cargar las estadísticas rápidas")
      }

      // Cargar reporte grupal con fallback mejorado
      try {
        console.log("📈 Cargando reporte grupal...")
        const grupalData = await reportApiService.getReporteGrupal()
        console.log("✅ Reporte grupal cargado - ESTRUCTURA COMPLETA:", grupalData)
        console.log("📊 Total niños en reporte:", grupalData?.total_ninos)
        console.log("📊 Estadísticas nutricionales:", grupalData?.estadisticas_nutricionales)
        console.log("📊 Estadísticas sexo:", grupalData?.estadisticas_sexo)
        setReporteGrupal(grupalData)
      } catch (error) {
        console.error("❌ Error cargando reporte grupal:", error)
        toast.error("No se pudo cargar el reporte grupal")
      }

      // Cargar lista de niños
      try {
        console.log("👶 Cargando lista de niños...")
        const childrenData = await childApiService.getChildren()
        console.log("✅ Niños cargados:", childrenData.length, "niños encontrados")
        setChildren(childrenData)
      } catch (error) {
        console.error("❌ Error cargando niños:", error)
        toast.error("No se pudo cargar la lista de niños")
      }
    } catch (error) {
      console.error("💥 Error general:", error)
      setError(`Error general: ${error}`)
      toast.error("Error al cargar los datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = async (filters: ReportFilter) => {
    try {
      setLoading(true)
      setCurrentFilters(filters)
      const grupalData = await reportApiService.getReporteGrupal(filters)
      setReporteGrupal(grupalData)
      toast.success("Filtros aplicados exitosamente")
    } catch (error) {
      toast.error("Error al aplicar filtros")
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualReport = async (childId: string) => {
    if (!childId) return

    try {
      setLoading(true)
      const individualData = await reportApiService.getReporteIndividual(childId)
      setReporteIndividual(individualData)
      setActiveTab("individual")
    } catch (error) {
      toast.error("No se pudo cargar el reporte individual")
    } finally {
      setLoading(false)
    }
  }

  const handleSeguimientoReport = async (childId: string) => {
    if (!childId) return

    try {
      setLoading(true)
      const seguimientoData = await reportApiService.getReporteSeguimiento(childId)
      setReporteSeguimiento(seguimientoData)
      setActiveTab("seguimiento")
    } catch (error) {
      toast.error("No se pudo cargar el reporte de seguimiento")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Aquí se implementaría la funcionalidad de exportación
    toast.info("Funcionalidad de exportación en desarrollo")
  }

  const testConnection = async () => {
    try {
      console.log("Probando conexión...")
      const health = await reportApiService.checkHealth()
      console.log("Health check:", health)
      toast.success("Conexión exitosa con el backend")
    } catch (error) {
      console.error("Error de conexión:", error)
      toast.error(`Error de conexión: ${error}`)
    }
  }

  const testIndividualEndpoints = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    console.log("🧪 Probando endpoints individuales...")

    // Probar health check
    try {
      const healthUrl = `${apiUrl}/reports/health`
      console.log("🏥 Probando health check:", healthUrl)
      const healthResponse = await fetch(healthUrl)
      const healthData = await healthResponse.json()
      console.log("✅ Health check:", healthData)
      toast.success("Health check exitoso")
    } catch (error) {
      console.error("❌ Health check falló:", error)
      toast.error("Health check falló")
    }

    // Probar stats/quick
    try {
      const statsUrl = `${apiUrl}/reports/stats/quick`
      console.log("📊 Probando stats/quick:", statsUrl)
      const statsResponse = await fetch(statsUrl)
      console.log("📊 Stats response status:", statsResponse.status)

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log("✅ Stats data:", statsData)
        toast.success("Stats endpoint funcionando")
      } else {
        const errorText = await statsResponse.text()
        console.error("❌ Stats error:", errorText)
        toast.error(`Stats endpoint error: ${statsResponse.status}`)
      }
    } catch (error) {
      console.error("❌ Stats endpoint falló:", error)
      toast.error("Stats endpoint falló")
    }

    // Probar group report
    try {
      const groupUrl = `${apiUrl}/reports/group`
      console.log("👥 Probando group report:", groupUrl)
      const groupResponse = await fetch(groupUrl)
      console.log("👥 Group response status:", groupResponse.status)

      if (groupResponse.ok) {
        const groupData = await groupResponse.json()
        console.log("✅ Group data:", groupData)
        toast.success("Group report endpoint funcionando")
      } else {
        const errorText = await groupResponse.text()
        console.error("❌ Group error:", errorText)
        toast.error(`Group endpoint error: ${groupResponse.status}`)
      }
    } catch (error) {
      console.error("❌ Group endpoint falló:", error)
      toast.error("Group endpoint falló")
    }
  }

  const testGroupReport = async () => {
    try {
      console.log("🧪 Probando reporte grupal manualmente...")
      const grupalData = await reportApiService.getReporteGrupal()
      console.log("📊 Datos del reporte grupal:", grupalData)

      // Verificar estructura específica
      console.log("🔍 Verificando estructura:")
      console.log("- total_ninos:", grupalData?.total_ninos)
      console.log("- estadisticas_nutricionales:", grupalData?.estadisticas_nutricionales)
      console.log("- estadisticas_sexo:", grupalData?.estadisticas_sexo)
      console.log("- fecha_generacion:", grupalData?.fecha_generacion)

      setReporteGrupal(grupalData)
      toast.success("Reporte grupal cargado manualmente")
    } catch (error) {
      console.error("❌ Error en test de reporte grupal:", error)
      toast.error(`Error: ${error}`)
    }
  }

  if (loading && !reporteGrupal && !estadisticasRapidas) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de reportes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-1">Genera reportes detallados y análisis estadísticos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Filtros de Reporte</DialogTitle>
              </DialogHeader>
              <ReportFilters onFiltersChange={handleFiltersChange} loading={loading} />
            </DialogContent>
          </Dialog>

          <Button onClick={exportReport} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <p className="text-sm text-yellow-800 mb-2">🔧 Modo diagnóstico - Verificar conexión con backend:</p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testConnection} variant="outline" size="sm">
            Health Check
          </Button>
          <Button onClick={testIndividualEndpoints} variant="outline" size="sm">
            Probar Todos los Endpoints
          </Button>
          <Button onClick={testGroupReport} variant="outline" size="sm">
            Probar Reporte Grupal
          </Button>
          <Button onClick={fetchInitialData} variant="outline" size="sm">
            Recargar Datos
          </Button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 rounded text-red-800 text-xs">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Selector de niño para reportes individuales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar niño para reporte individual o seguimiento" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.nombre} {child.apellido} - {child.documento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleIndividualReport(selectedChild)}
              disabled={!selectedChild || loading}
              variant="outline"
            >
              Reporte Individual
            </Button>
            <Button
              onClick={() => handleSeguimientoReport(selectedChild)}
              disabled={!selectedChild || loading}
              variant="outline"
            >
              Seguimiento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de reportes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grupal" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Reporte Grupal
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2" disabled={!reporteIndividual}>
            <FileText className="w-4 h-4" />
            Reporte Individual
          </TabsTrigger>
          <TabsTrigger value="seguimiento" className="flex items-center gap-2" disabled={!reporteSeguimiento}>
            <TrendingUp className="w-4 h-4" />
            Seguimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grupal" className="space-y-4">
          {reporteGrupal ? (
            <GroupReport reporte={reporteGrupal} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay datos disponibles para el reporte grupal</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          {reporteIndividual ? (
            <IndividualReport reporte={reporteIndividual} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Selecciona un niño y genera un reporte individual</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seguimiento" className="space-y-4">
          {reporteSeguimiento ? (
            <SeguimientoReport reporte={reporteSeguimiento} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Selecciona un niño y genera un reporte de seguimiento</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
