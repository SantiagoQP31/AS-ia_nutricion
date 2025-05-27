"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { childApiService } from "@/services/child-api"
import type { ReportFilter } from "@/types/report"
import type { ChildSummary } from "@/types/child"

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFilter) => void
  loading?: boolean
}

export default function ReportFilters({ onFiltersChange, loading = false }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilter>({})
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [barrios, setBarrios] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    fetchChildrenData()
  }, [])

  const fetchChildrenData = async () => {
    try {
      const childrenData = await childApiService.getChildren()
      setChildren(childrenData)

      // Extraer instituciones y barrios únicos
      const institucionesSet = new Set<string>()
      const barriosSet = new Set<string>()

      childrenData.forEach((child) => {
        if (child.institucion) institucionesSet.add(child.institucion)
        // Nota: barrio no está en ChildSummary, pero podríamos agregarlo si es necesario
      })

      setInstituciones(Array.from(institucionesSet).sort())
      setBarrios(Array.from(barriosSet).sort())
    } catch (error) {
      console.error("Error cargando datos para filtros:", error)
    }
  }

  const handleFilterChange = (key: keyof ReportFilter, value: string | number | undefined) => {
    const newFilters = { ...filters }

    if (value === "" || value === undefined) {
      delete newFilters[key]
    } else {
      newFilters[key] = value as any
    }

    setFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(filters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Reporte
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Ocultar" : "Mostrar"} Filtros Avanzados
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={filters.sexo || ""}
              onValueChange={(value) => handleFilterChange("sexo", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edad_min">Edad Mínima</Label>
            <Input
              id="edad_min"
              type="number"
              min="0"
              max="18"
              value={filters.rango_edad_min || ""}
              onChange={(e) =>
                handleFilterChange("rango_edad_min", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="edad_max">Edad Máxima</Label>
            <Input
              id="edad_max"
              type="number"
              min="0"
              max="18"
              value={filters.rango_edad_max || ""}
              onChange={(e) =>
                handleFilterChange("rango_edad_max", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="18"
            />
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={filters.fecha_inicio || ""}
                  onChange={(e) => handleFilterChange("fecha_inicio", e.target.value || undefined)}
                />
              </div>

              <div>
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={filters.fecha_fin || ""}
                  onChange={(e) => handleFilterChange("fecha_fin", e.target.value || undefined)}
                />
              </div>

              <div>
                <Label htmlFor="institucion">Institución</Label>
                <Select
                  value={filters.institucion || ""}
                  onValueChange={(value) => handleFilterChange("institucion", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las instituciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las instituciones</SelectItem>
                    {instituciones.map((institucion) => (
                      <SelectItem key={institucion} value={institucion}>
                        {institucion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="barrio">Barrio</Label>
                <Input
                  id="barrio"
                  value={filters.barrio || ""}
                  onChange={(e) => handleFilterChange("barrio", e.target.value || undefined)}
                  placeholder="Nombre del barrio"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Aplicando..." : "Aplicar Filtros"}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">Filtros activos: {Object.keys(filters).length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
