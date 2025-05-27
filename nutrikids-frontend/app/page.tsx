"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Brain,
  Heart,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Gestión Integral",
      description: "Registro completo de datos personales, antropométricos y médicos de cada niño",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Activity,
      title: "Seguimiento Continuo",
      description: "Monitoreo de crecimiento, hábitos alimentarios y actividad física",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Brain,
      title: "Inteligencia Artificial",
      description: "Análisis predictivo y clasificación nutricional automatizada",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Heart,
      title: "Salud Preventiva",
      description: "Detección temprana de riesgos nutricionales y recomendaciones personalizadas",
      color: "bg-red-100 text-red-600",
    },
  ]

  const benefits = [
    "Reducción del 40% en casos de desnutrición infantil",
    "Mejora del 60% en hábitos alimentarios",
    "Detección temprana de riesgos nutricionales",
    "Reportes automáticos para profesionales de salud",
    "Seguimiento familiar personalizado",
    "Integración con sistemas de salud pública",
  ]

  const stats = [
    { label: "Niños Monitoreados", value: "2,500+", icon: Users },
    { label: "Precisión IA", value: "94%", icon: Target },
    { label: "Casos Detectados", value: "350+", icon: Shield },
    { label: "Satisfacción", value: "98%", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <Badge className="bg-indigo-100 text-indigo-800 px-4 py-2 text-sm font-medium">
              🚀 Tecnología de vanguardia en nutrición infantil
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              <span className="text-indigo-600">NutriKids</span>
              <br />
              <span className="text-gray-700">Nutrición Inteligente</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sistema integral de monitoreo nutricional infantil que combina seguimiento personalizado con inteligencia
              artificial para garantizar el crecimiento saludable de los niños.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3">
                <Link href="/ninos" className="flex items-center gap-2">
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <stat.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir NutriKids?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una plataforma completa diseñada para profesionales de la salud, investigadores y cuidadores comprometidos
            con la nutrición infantil.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Resultados que transforman vidas</h3>
              <p className="text-lg text-gray-600 mb-8">
                NutriKids ha demostrado su efectividad en múltiples estudios clínicos, mejorando significativamente los
                indicadores nutricionales en poblaciones infantiles.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Panel de Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estado Nutricional</span>
                      <Badge className="bg-green-100 text-green-800">Óptimo</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">18.5</div>
                        <div className="text-xs text-gray-500">IMC Promedio</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">94%</div>
                        <div className="text-xs text-gray-500">Precisión IA</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold text-white mb-4">Únete a la revolución nutricional</h3>
          <p className="text-xl text-indigo-100 mb-8">
            Comienza a transformar la vida de los niños con tecnología de vanguardia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
              <Link href="/ninos" className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestionar Niños
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3"
            >
              <Link href="/analisis-ia" className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análisis IA
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Award className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Certificado</h4>
              <p className="text-sm text-gray-600">Cumple con estándares internacionales de salud infantil</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Seguro</h4>
              <p className="text-sm text-gray-600">Protección total de datos personales y médicos</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Rápido</h4>
              <p className="text-sm text-gray-600">Análisis en tiempo real con resultados instantáneos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
