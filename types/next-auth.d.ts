import "next-auth"

declare module "next-auth" {
  interface User {
    backendToken?: string
    backendRefreshToken?: string
    role?: string
    username?: string
    avatar?: string
  }
  
  interface Session {
    backendToken?: string
    backendRefreshToken?: string
    user: {
      id?: string
      role?: string
      username?: string
      avatar?: string
      email?: string
      name?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string
    backendRefreshToken?: string
    role?: string
    username?: string
    avatar?: string
  }
}