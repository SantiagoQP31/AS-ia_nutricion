"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Activity, FileText, Brain, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthHeader from "./auth-header"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Niños", href: "/ninos", icon: Users },
  { name: "Mediciones", href: "/mediciones", icon: Activity },
  { name: "Reportes", href: "/reportes", icon: FileText },
  { name: "Análisis IA", href: "/analisis-ia", icon: Brain },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={`bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 flex flex-col ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header con logo y toggle */}
      <div className="p-4 border-b border-indigo-500/30">
        <div className="flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold">NutriKids</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-indigo-500/30"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-white/20 text-white" : "text-indigo-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Auth Header en la parte inferior */}
      <div className="p-4 border-t border-indigo-500/30">
        <AuthHeader collapsed={collapsed} />
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-indigo-500/30">
          <p className="text-xs text-indigo-200">Monitoreo nutricional infantil</p>
        </div>
      )}
    </div>
  )
}
