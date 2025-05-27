"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Users, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import ChildForm from "./components/child-form"
import ChildDetails from "./components/child-details"
import { toast } from "sonner"

interface ChildSummary {
  id: string
  nombre: string
  apellido: string
  documento: string
  fecha_nacimiento: string
  sexo: string
  institucion?: string
}

interface SearchFilters {
  nombre?: string
  apellido?: string
  documento?: string
  institucion?: string
  sexo?: string
}

export default function NinosPage() {
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [filteredChildren, setFilteredChildren] = useState<ChildSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const router = useRouter()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    fetchChildren()
  }, [])

  useEffect(() => {
    filterChildren()
  }, [children, searchTerm, searchFilters])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/children/`)
      if (!response.ok) throw new Error("Error al cargar los niños")
      const data = await response.json()
      setChildren(data)
    } catch (error) {
      toast.error("No se pudieron cargar los niños")
    } finally {
      setLoading(false)
    }
  }

  const filterChildren = () => {
    let filtered = children

    if (searchTerm) {
      filtered = filtered.filter(
        (child) =>
          child.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.documento.includes(searchTerm),
      )
    }

    setFilteredChildren(filtered)
  }

  const handleAdvancedSearch = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      if (params.toString()) {
        const response = await fetch(`${API_BASE}/children/search?${params}`)
        if (!response.ok) throw new Error("Error en la búsqueda")
        const data = await response.json()
        setFilteredChildren(data)
      } else {
        toast.error("Debe proporcionar al menos un criterio de búsqueda")
      }
    } catch (error) {
      toast.error("Error al realizar la búsqueda")
    }
  }

  const handleDelete = async (childId: string) => {
    if (
      !confirm(
        "¿Está seguro de eliminar este niño? Esta acción eliminará permanentemente todos sus datos relacionados.",
      )
    ) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/children/${childId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Niño eliminado exitosamente")
      fetchChildren()
    } catch (error) {
      toast.error("No se pudo eliminar el niño")
    }
  }

  const handleNavigateToData = (childId: string) => {
    // Navegación corregida
    router.push(`/ninos/${childId}/datos`)
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const getSexoBadgeColor = (sexo: string) => {
    switch (sexo) {
      case "MASCULINO":
      case "M":
        return "bg-blue-100 text-blue-800"
      case "FEMENINO":
      case "F":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Niños</h1>
          <p className="text-gray-600 mt-1">Administra los registros de los niños en el sistema</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Niño
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChild ? "Editar Niño" : "Registrar Nuevo Niño"}</DialogTitle>
            </DialogHeader>
            <ChildForm
              childId={editingChild}
              onSuccess={() => {
                setShowForm(false)
                setEditingChild(null)
                fetchChildren()
              }}
              onCancel={() => {
                setShowForm(false)
                setEditingChild(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Niños Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{children.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, apellido o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              Búsqueda Avanzada
            </Button>
          </div>

          {showAdvancedSearch && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <Input
                placeholder="Nombre"
                value={searchFilters.nombre || ""}
                onChange={(e) => setSearchFilters({ ...searchFilters, nombre: e.target.value })}
              />
              <Input
                placeholder="Apellido"
                value={searchFilters.apellido || ""}
                onChange={(e) => setSearchFilters({ ...searchFilters, apellido: e.target.value })}
              />
              <Input
                placeholder="Documento"
                value={searchFilters.documento || ""}
                onChange={(e) => setSearchFilters({ ...searchFilters, documento: e.target.value })}
              />
              <Input
                placeholder="Institución"
                value={searchFilters.institucion || ""}
                onChange={(e) => setSearchFilters({ ...searchFilters, institucion: e.target.value })}
              />
              <Select
                value={searchFilters.sexo || ""}
                onValueChange={(value) => setSearchFilters({ ...searchFilters, sexo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-3 lg:col-span-5 flex gap-2">
                <Button onClick={handleAdvancedSearch} className="bg-indigo-600 hover:bg-indigo-700">
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchFilters({})
                    fetchChildren()
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {child.nombre} {child.apellido}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Doc: {child.documento}</p>
                </div>
                <Badge className={getSexoBadgeColor(child.sexo)}>{child.sexo}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Edad:</span> {calculateAge(child.fecha_nacimiento)} años
                </p>
                <p className="text-sm">
                  <span className="font-medium">Fecha de nacimiento:</span>{" "}
                  {new Date(child.fecha_nacimiento).toLocaleDateString()}
                </p>
                {child.institucion && (
                  <p className="text-sm">
                    <span className="font-medium">Institución:</span> {child.institucion}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedChild(child.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalles del Niño</DialogTitle>
                    </DialogHeader>
                    {selectedChild && <ChildDetails childId={selectedChild} />}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateToData(child.id)}
                  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Datos
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingChild(child.id)
                    setShowForm(true)
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(child.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChildren.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron niños</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(searchFilters).some((v) => v)
                ? "No hay niños que coincidan con los criterios de búsqueda"
                : "Aún no hay niños registrados en el sistema"}
            </p>
            {!searchTerm && !Object.values(searchFilters).some((v) => v) && (
              <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Niño
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
