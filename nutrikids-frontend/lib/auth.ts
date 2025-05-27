// Tipos para la autenticación
export interface UserRegister {
  email: string
  password: string
  role_name?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface UserOut {
  id: string
  email: string
  role_name: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
}

export interface PasswordReset {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
}

// Clase para manejar la autenticación
export class AuthService {
  private static instance: AuthService
  private apiBase: string

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Almacenamiento de tokens
  setTokens(tokens: Token) {
    localStorage.setItem("access_token", tokens.access_token)
    if (tokens.refresh_token) {
      localStorage.setItem("refresh_token", tokens.refresh_token)
    }
    // Calcular tiempo de expiración
    const expirationTime = Date.now() + tokens.expires_in * 1000
    localStorage.setItem("token_expiration", expirationTime.toString())
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token")
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token")
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem("token_expiration")
    if (!expiration) return true
    return Date.now() > Number.parseInt(expiration)
  }

  clearTokens() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("token_expiration")
  }

  // Headers con autenticación
  getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Registro de usuario
  async register(userData: UserRegister): Promise<{ message: string; user_id: string }> {
    const response = await fetch(`${this.apiBase}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error en el registro")
    }

    return response.json()
  }

  // Login con JSON
  async login(credentials: UserLogin): Promise<Token> {
    const response = await fetch(`${this.apiBase}/auth/login-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Credenciales incorrectas")
    }

    const tokens = await response.json()
    this.setTokens(tokens)
    return tokens
  }

  // Refrescar token
  async refreshToken(): Promise<Token> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error("No hay refresh token disponible")
    }

    const response = await fetch(`${this.apiBase}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      this.clearTokens()
      throw new Error("Token de refresco inválido")
    }

    const tokens = await response.json()
    this.setTokens(tokens)
    return tokens
  }

  // Obtener información del usuario
  async getCurrentUser(): Promise<UserOut> {
    const response = await fetch(`${this.apiBase}/auth/me`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Intentar refrescar token
        try {
          await this.refreshToken()
          // Reintentar la petición
          const retryResponse = await fetch(`${this.apiBase}/auth/me`, {
            headers: this.getAuthHeaders(),
          })
          if (!retryResponse.ok) throw new Error("Error al obtener usuario")
          return retryResponse.json()
        } catch {
          this.clearTokens()
          throw new Error("Sesión expirada")
        }
      }
      throw new Error("Error al obtener información del usuario")
    }

    return response.json()
  }

  // Verificar token
  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/auth/verify-token`, {
        headers: this.getAuthHeaders(),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Cambiar contraseña
  async changePassword(passwordData: PasswordChange): Promise<{ message: string }> {
    const response = await fetch(`${this.apiBase}/auth/change-password`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al cambiar contraseña")
    }

    return response.json()
  }

  // Solicitar reseteo de contraseña
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.apiBase}/auth/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al solicitar reseteo")
    }

    return response.json()
  }

  // Confirmar reseteo de contraseña
  async confirmPasswordReset(resetData: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await fetch(`${this.apiBase}/auth/password-reset-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resetData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Error al resetear contraseña")
    }

    return response.json()
  }

  // Logout
  logout() {
    this.clearTokens()
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return !!token && !this.isTokenExpired()
  }
}

export const authService = AuthService.getInstance()
