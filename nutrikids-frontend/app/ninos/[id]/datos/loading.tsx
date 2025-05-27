"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import ChildDataTabs from "../../components/child-data-tabs"
import { childApiService } from "@/services/child-api"

interface ChildBasicInfo {
  id: string
  nombre: string
  apellido: string
}

export default function ChildDataPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.id as string
  const [child, setChild] = useState<ChildBasicInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (childId) {
      fetchChildBasicInfo()
    }
  }, [childId])

  const fetchChildBasicInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching child data for ID:", childId) // Debug log

      const data = await childApiService.getChildById(childId)
      setChild({
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
      })
    } catch (error) {
      console.error("Error fetching child data:", error) // Debug log
      setError("No se pudieron cargar los datos del niño")
      toast.error("No se pudieron cargar los datos del niño")
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

  if (error || !child) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push("/ninos")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Niños
          </Button>
        </div>

        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">{error || "No se encontró el niño especificado"}</p>
          <div className="space-x-4">
            <Button onClick={() => fetchChildBasicInfo()} variant="outline">
              Reintentar
            </Button>
            <Button onClick={() => router.push("/ninos")}>Volver a la lista</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/ninos")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Niños
        </Button>
      </div>

      {/* Componente de pestañas con todos los datos */}
      <ChildDataTabs childId={childId} childName={`${child.nombre} ${child.apellido}`} />
    </div>
  )
}
