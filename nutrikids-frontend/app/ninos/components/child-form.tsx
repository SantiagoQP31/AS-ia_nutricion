"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface ChildFormData {
  nombre: string
  apellido: string
  tipo_documento: string
  documento: string
  fecha_nacimiento: string
  sexo: string
  direccion: string
  institucion: string
  barrio: string
  nombre_acudiente: string
  parentesco_acudiente: string
  telefono_acudiente: string
  consentimiento_informado: boolean
}

interface ChildFormProps {
  childId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

const initialFormData: ChildFormData = {
  nombre: "",
  apellido: "",
  tipo_documento: "",
  documento: "",
  fecha_nacimiento: "",
  sexo: "",
  direccion: "",
  institucion: "",
  barrio: "",
  nombre_acudiente: "",
  parentesco_acudiente: "",
  telefono_acudiente: "",
  consentimiento_informado: false,
}

export default function ChildForm({ childId, onSuccess, onCancel }: ChildFormProps) {
  const [formData, setFormData] = useState<ChildFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  useEffect(() => {
    if (childId) {
      fetchChildData()
    } else {
      setFormData(initialFormData)
    }
  }, [childId])

  const fetchChildData = async () => {
    try {
      const response = await fetch(`${API_BASE}/children/${childId}`)
      if (!response.ok) throw new Error("Error al cargar los datos del niño")
      const data = await response.json()

      setFormData({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        tipo_documento: data.tipo_documento || "",
        documento: data.documento || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
        sexo: data.sexo || "",
        direccion: data.direccion || "",
        institucion: data.institucion || "",
        barrio: data.barrio || "",
        nombre_acudiente: data.nombre_acudiente || "",
        parentesco_acudiente: data.parentesco_acudiente || "",
        telefono_acudiente: data.telefono_acudiente || "",
        consentimiento_informado: data.consentimiento_informado || false,
      })
    } catch (error) {
      toast.error("No se pudieron cargar los datos del niño")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
    if (!formData.tipo_documento) newErrors.tipo_documento = "El tipo de documento es obligatorio"
    if (!formData.documento.trim()) newErrors.documento = "El documento es obligatorio"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
    if (!formData.sexo) newErrors.sexo = "El sexo es obligatorio"
    if (!formData.direccion.trim()) newErrors.direccion = "La dirección es obligatoria"
    if (!formData.nombre_acudiente.trim()) newErrors.nombre_acudiente = "El nombre del acudiente es obligatorio"
    if (!formData.telefono_acudiente.trim()) newErrors.telefono_acudiente = "El teléfono del acudiente es obligatorio"

    if (!childId && !formData.consentimiento_informado) {
      newErrors.consentimiento_informado = "Debe aceptar el consentimiento informado"
    }

    // Validar fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (birthDate > today) {
        newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser futura"
      } else if (age > 18) {
        newErrors.fecha_nacimiento = "La edad no puede ser mayor a 18 años"
      }
    }

    // Validar teléfono (formato básico)
    if (formData.telefono_acudiente && !/^\d{7,15}$/.test(formData.telefono_acudiente.replace(/\s/g, ""))) {
      newErrors.telefono_acudiente = "El teléfono debe tener entre 7 y 15 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = childId ? `${API_BASE}/children/${childId}` : `${API_BASE}/children/`
      const method = childId ? "PUT" : "POST"

      // Preparar payload según el método
      const payload = childId
        ? (Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== "" && value !== false),
          ) as Partial<ChildFormData>)
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al procesar la solicitud")
      }

      const result = await response.json()

      toast.success(result.message || `Niño ${childId ? "actualizado" : "registrado"} exitosamente`)

      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ChildFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className={errors.apellido ? "border-red-500" : ""}
              />
              {errors.apellido && <p className="text-sm text-red-500 mt-1">{errors.apellido}</p>}
            </div>

            <div>
              <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
              <Select
                value={formData.tipo_documento}
                onValueChange={(value) => handleInputChange("tipo_documento", value)}
              >
                <SelectTrigger className={errors.tipo_documento ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RC">Registro Civil (RC)</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad (TI)</SelectItem>
                  <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_documento && <p className="text-sm text-red-500 mt-1">{errors.tipo_documento}</p>}
            </div>

            <div>
              <Label htmlFor="documento">Número de Documento *</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => handleInputChange("documento", e.target.value)}
                className={errors.documento ? "border-red-500" : ""}
              />
              {errors.documento && <p className="text-sm text-red-500 mt-1">{errors.documento}</p>}
            </div>

            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                className={errors.fecha_nacimiento ? "border-red-500" : ""}
              />
              {errors.fecha_nacimiento && <p className="text-sm text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
            </div>

            <div>
              <Label htmlFor="sexo">Sexo *</Label>
              <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  {/*<SelectItem value="OTRO">Otro</SelectItem>*/}
                </SelectContent>
              </Select>
              {errors.sexo && <p className="text-sm text-red-500 mt-1">{errors.sexo}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Ubicación */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Ubicación</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className={errors.direccion ? "border-red-500" : ""}
              />
              {errors.direccion && <p className="text-sm text-red-500 mt-1">{errors.direccion}</p>}
            </div>

            <div>
              <Label htmlFor="barrio">Barrio</Label>
              <Input
                id="barrio"
                value={formData.barrio}
                onChange={(e) => handleInputChange("barrio", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="institucion">Institución</Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => handleInputChange("institucion", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Acudiente */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Acudiente</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre_acudiente">Nombre del Acudiente *</Label>
              <Input
                id="nombre_acudiente"
                value={formData.nombre_acudiente}
                onChange={(e) => handleInputChange("nombre_acudiente", e.target.value)}
                className={errors.nombre_acudiente ? "border-red-500" : ""}
              />
              {errors.nombre_acudiente && <p className="text-sm text-red-500 mt-1">{errors.nombre_acudiente}</p>}
            </div>

            <div>
              <Label htmlFor="parentesco_acudiente">Parentesco</Label>
              <Input
                id="parentesco_acudiente"
                value={formData.parentesco_acudiente}
                onChange={(e) => handleInputChange("parentesco_acudiente", e.target.value)}
                placeholder="Ej: Madre, Padre, Abuelo..."
              />
            </div>

            <div>
              <Label htmlFor="telefono_acudiente">Teléfono del Acudiente *</Label>
              <Input
                id="telefono_acudiente"
                value={formData.telefono_acudiente}
                onChange={(e) => handleInputChange("telefono_acudiente", e.target.value)}
                className={errors.telefono_acudiente ? "border-red-500" : ""}
                placeholder="Ej: 3001234567"
              />
              {errors.telefono_acudiente && <p className="text-sm text-red-500 mt-1">{errors.telefono_acudiente}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consentimiento */}
      {!childId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentimiento"
                checked={formData.consentimiento_informado}
                onCheckedChange={(checked) => handleInputChange("consentimiento_informado", checked as boolean)}
                className={errors.consentimiento_informado ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="consentimiento"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Consentimiento Informado *
                </Label>
                <p className="text-sm text-gray-600">
                  Acepto que la información proporcionada sea utilizada para el seguimiento nutricional del menor y
                  autorizo el tratamiento de datos personales conforme a la ley de protección de datos.
                </p>
                {errors.consentimiento_informado && (
                  <p className="text-sm text-red-500">{errors.consentimiento_informado}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? "Procesando..." : childId ? "Actualizar Niño" : "Registrar Niño"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
