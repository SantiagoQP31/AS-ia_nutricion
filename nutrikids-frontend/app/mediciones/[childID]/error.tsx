"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error in child measurements page:", error)
  }, [error])

  return (
    <div className="p-6">
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Algo salió mal</h3>
        <p className="text-gray-600 mb-4">No se pudieron cargar las mediciones del niño</p>
        <div className="space-x-4">
          <Button onClick={reset} variant="outline">
            Reintentar
          </Button>
          <Button onClick={() => window.history.back()}>Volver</Button>
        </div>
      </div>
    </div>
  )
}
