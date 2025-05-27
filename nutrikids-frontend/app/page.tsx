"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, AlertTriangle, Calendar, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header con botón de logout adicional */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoreo nutricional infantil - Visión general del sistema</p>
        </div>

        {/* Botón de logout adicional en el header principal */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Esto se manejará desde el contexto de auth
              window.dispatchEvent(new CustomEvent("logout"))
            }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Niños Registrados</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-green-600">+12% desde el mes pasado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Edad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">4.2 años</p>
                <p className="text-xs text-gray-500">Rango: 1-6 años</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peso Promedio</p>
                <p className="text-2xl font-bold text-gray-900">18.5 kg</p>
                <p className="text-xs text-green-600">+0.8kg desde la última medición</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alertas Nutricionales</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-xs text-red-600">Requiere atención</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a NutriKids</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sistema integral para el seguimiento nutricional infantil. Utiliza el menú lateral para navegar entre las
            diferentes secciones del sistema.
          </p>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">Funcionalidades principales:</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Gestión completa de registros de niños</li>
              <li>• Seguimiento de mediciones antropométricas</li>
              <li>• Generación de reportes nutricionales</li>
              <li>• Análisis con inteligencia artificial</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
