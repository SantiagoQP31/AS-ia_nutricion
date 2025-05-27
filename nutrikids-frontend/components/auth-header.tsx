"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User, Settings, Key } from "lucide-react"
import ChangePasswordForm from "./change-password-form"
import { toast } from "sonner"

interface AuthHeaderProps {
  collapsed?: boolean
}

export default function AuthHeader({ collapsed = false }: AuthHeaderProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const [showChangePassword, setShowChangePassword] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/auth/login">Iniciar Sesión</a>
        </Button>
      </div>
    )
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: "Administrador",
      doctor: "Doctor",
      enfermero: "Enfermero",
      investigador: "Investigador",
      usuario: "Usuario",
    }
    return roleNames[role] || role
  }

  const handleLogout = () => {
    try {
      logout()
      toast.success("Sesión cerrada exitosamente")
      // Pequeño delay para que se vea el toast antes de redirigir
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 500)
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  // Vista colapsada (solo avatar)
  if (collapsed) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-indigo-500/30">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-indigo-600 text-xs">{getInitials(user.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{getRoleDisplayName(user.role_name)}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setShowChangePassword(true)}>
              <Key className="mr-2 h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
            </DialogHeader>
            <ChangePasswordForm onSuccess={() => setShowChangePassword(false)} />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Vista expandida
  return (
    <>
      <div className="flex items-center gap-3 w-full">
        {/* Información del usuario */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.email}</p>
          <p className="text-xs text-indigo-200 truncate">{getRoleDisplayName(user.role_name)}</p>
        </div>

        {/* Dropdown con avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-indigo-500/30">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-indigo-600 text-xs">{getInitials(user.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{getRoleDisplayName(user.role_name)}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setShowChangePassword(true)}>
              <Key className="mr-2 h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Botón adicional de logout visible */}
      <div className="mt-2 pt-2 border-t border-indigo-500/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full text-indigo-200 hover:text-white hover:bg-indigo-500/30 justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onSuccess={() => setShowChangePassword(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
