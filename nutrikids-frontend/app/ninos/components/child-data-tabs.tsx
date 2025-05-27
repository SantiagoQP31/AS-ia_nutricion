"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Scale, Apple, Heart, Home, Brain, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import AnthropometricForm from "./anthropometric-form"
import BehavioralForm from "./behavioral-form"
import MedicalHistoryForm from "./medical-history-form"
import HouseholdForm from "./household-form"
import ClassificationForm from "./classification-form"
import ChildDetails from "./child-details"
import { toast } from "sonner"

interface ChildDataTabsProps {
  childId: string
  childName: string
}

interface DataStatus {
  anthropometric: boolean
  behavioral: boolean
  medical: boolean
  household: boolean
  classification: boolean
}

export default function ChildDataTabs({ childId, childName }: ChildDataTabsProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [showAnthropometricForm, setShowAnthropometricForm] = useState(false)
  const [showBehavioralForm, setShowBehavioralForm] = useState(false)
  const [showMedicalForm, setShowMedicalForm] = useState(false)
  const [showHouseholdForm, setShowHouseholdForm] = useState(false)
  const [showClassificationForm, setShowClassificationForm] = useState(false)
  const [dataStatus, setDataStatus] = useState<DataStatus>({
    anthropometric: false,
    behavioral: false,
    medical: false,
    household: false,
    classification: false,
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    checkDataStatus()
  }, [childId])

  const checkDataStatus = async () => {
    // Aquí podrías verificar qué datos ya existen para este niño
    // Por ahora, asumimos que no hay datos
    setDataStatus({
      anthropometric: false,
      behavioral: false,
      medical: false,
      household: false,
      classification: false,
    })
  }

  const handleFormSuccess = (dataType: keyof DataStatus) => {
    // Cerrar formularios
    setShowAnthropometricForm(false)
    setShowBehavioralForm(false)
    setShowMedicalForm(false)
    setShowHouseholdForm(false)
    setShowClassificationForm(false)

    // Actualizar estado
    setDataStatus((prev) => ({ ...prev, [dataType]: true }))

    toast.success("Datos registrados exitosamente")
  }

  const getTabIcon = (hasData: boolean) => {
    return hasData ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-gray-400" />
    )
  }

  const getCompletionPercentage = () => {
    const completed = Object.values(dataStatus).filter(Boolean).length
    return Math.round((completed / 5) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Datos de {childName}</h2>
          <p className="text-gray-600">ID: {childId}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Completitud de datos</div>
          <div className="text-2xl font-bold text-indigo-600">{getCompletionPercentage()}%</div>
        </div>
      </div>

      {/* Indicador de progreso */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso de registro:</span>
            <span>{Object.values(dataStatus).filter(Boolean).length} de 5 completados</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="anthropometric" className="flex items-center gap-2">
            {getTabIcon(dataStatus.anthropometric)}
            Antropométrico
          </TabsTrigger>
          <TabsTrigger value="behavioral" className="flex items-center gap-2">
            {getTabIcon(dataStatus.behavioral)}
            Conductual
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            {getTabIcon(dataStatus.medical)}
            Médico
          </TabsTrigger>
          <TabsTrigger value="household" className="flex items-center gap-2">
            {getTabIcon(dataStatus.household)}
            Hogar
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            {getTabIcon(dataStatus.classification)}
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <ChildDetails childId={childId} />
        </TabsContent>

        <TabsContent value="anthropometric" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Datos Antropométricos
                  {dataStatus.anthropometric && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </CardTitle>
                <Dialog open={showAnthropometricForm} onOpenChange={setShowAnthropometricForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {dataStatus.anthropometric ? "Actualizar" : "Agregar"} Medición
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {dataStatus.anthropometric ? "Actualizar" : "Nueva"} Medición Antropométrica
                      </DialogTitle>
                    </DialogHeader>
                    <AnthropometricForm
                      childId={childId}
                      onSuccess={() => handleFormSuccess("anthropometric")}
                      onCancel={() => setShowAnthropometricForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Registra mediciones de peso, talla e IMC para el seguimiento del crecimiento del niño.
              </p>
              {!dataStatus.anthropometric && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Los datos antropométricos son fundamentales para el análisis nutricional.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Datos Conductuales
                  {dataStatus.behavioral && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </CardTitle>
                <Dialog open={showBehavioralForm} onOpenChange={setShowBehavioralForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {dataStatus.behavioral ? "Actualizar" : "Registrar"} Hábitos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {dataStatus.behavioral ? "Actualizar" : "Registro de"} Hábitos Alimentarios y Actividad
                      </DialogTitle>
                    </DialogHeader>
                    <BehavioralForm
                      childId={childId}
                      onSuccess={() => handleFormSuccess("behavioral")}
                      onCancel={() => setShowBehavioralForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Registra información sobre hábitos alimentarios, actividad física y tiempo de pantalla.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Historial Médico
                  {dataStatus.medical && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </CardTitle>
                <Dialog open={showMedicalForm} onOpenChange={setShowMedicalForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {dataStatus.medical ? "Actualizar" : "Agregar"} Historial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{dataStatus.medical ? "Actualizar" : "Registro de"} Historial Médico</DialogTitle>
                    </DialogHeader>
                    <MedicalHistoryForm
                      childId={childId}
                      onSuccess={() => handleFormSuccess("medical")}
                      onCancel={() => setShowMedicalForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Registra enfermedades, medicamentos, alergias y antecedentes familiares.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="household" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Datos del Hogar
                  {dataStatus.household && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </CardTitle>
                <Dialog open={showHouseholdForm} onOpenChange={setShowHouseholdForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {dataStatus.household ? "Actualizar" : "Registrar"} Datos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{dataStatus.household ? "Actualizar" : "Registro de"} Datos del Hogar</DialogTitle>
                    </DialogHeader>
                    <HouseholdForm
                      childId={childId}
                      onSuccess={() => handleFormSuccess("household")}
                      onCancel={() => setShowHouseholdForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Registra información socioeconómica y del entorno familiar del niño.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Resultados de Clasificación IA
                  {dataStatus.classification && <Badge className="bg-green-100 text-green-800">Completado</Badge>}
                </CardTitle>
                <Dialog open={showClassificationForm} onOpenChange={setShowClassificationForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {dataStatus.classification ? "Actualizar" : "Agregar"} Resultado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {dataStatus.classification ? "Actualizar" : "Registro de"} Resultado de Clasificación
                      </DialogTitle>
                    </DialogHeader>
                    <ClassificationForm
                      childId={childId}
                      onSuccess={() => handleFormSuccess("classification")}
                      onCancel={() => setShowClassificationForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Registra resultados de clasificaciones nutricionales realizadas por modelos de IA.
              </p>
              {!dataStatus.classification && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Los resultados de IA requieren que se hayan registrado los datos antropométricos y conductuales.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
