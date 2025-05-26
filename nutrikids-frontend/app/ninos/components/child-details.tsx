"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Phone, User, FileText, Building } from "lucide-react"
import { toast } from "sonner"

interface ChildDetails {
  id: string
  nombre: string
  apellido: string
  tipo_documento: string
  documento: string
  fecha_nacimiento: string
  sexo: string
  direccion: string
  institucion?: string
  barrio?: string
  nombre_acudiente: string
  parentesco_acudiente?: string
  telefono_acudiente: string
  consentimiento_informado: boolean
}

interface ChildDetailsProps {
  childId: string
}

export default function ChildDetails({ childId }: ChildDetailsProps) {
  const [child, setChild] = useState<ChildDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    fetchChildDetails()
  }, [childId])

  const fetchChildDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/children/${childId}`)
      if (!response.ok) throw new Error("Error al cargar los detalles del niño")
      const data = await response.json()
      setChild(data)
    } catch (error) {
      toast.error("No se pudieron cargar los detalles del niño")
    } finally {
      setLoading(false)
    }
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
        return "bg-blue-100 text-blue-800"
      case "FEMENINO":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se pudieron cargar los detalles del niño</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {child.nombre} {child.apellido}
          </h2>
          <p className="text-gray-600 mt-1">
            {calculateAge(child.fecha_nacimiento)} años • {child.tipo_documento}: {child.documento}
          </p>
        </div>
        <Badge className={getSexoBadgeColor(child.sexo)}>{child.sexo}</Badge>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                <p className="font-medium">{new Date(child.fecha_nacimiento).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Documento</p>
                <p className="font-medium">
                  {child.tipo_documento}: {child.documento}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Dirección</p>
            <p className="font-medium">{child.direccion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {child.barrio && (
              <div>
                <p className="text-sm text-gray-600">Barrio</p>
                <p className="font-medium">{child.barrio}</p>
              </div>
            )}

            {child.institucion && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Institución</p>
                  <p className="font-medium">{child.institucion}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del Acudiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Acudiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-medium">{child.nombre_acudiente}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {child.parentesco_acudiente && (
              <div>
                <p className="text-sm text-gray-600">Parentesco</p>
                <p className="font-medium">{child.parentesco_acudiente}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{child.telefono_acudiente}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consentimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Consentimiento Informado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${child.consentimiento_informado ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <p className="font-medium">
              {child.consentimiento_informado ? "Consentimiento otorgado" : "Consentimiento no otorgado"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
