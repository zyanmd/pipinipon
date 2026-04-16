    import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    username?: string
    avatar?: string
    xp?: number
    rank?: string
    streak?: number
  }
  
  interface Session {
    user: {
      id?: string
      role?: string
      username?: string
      avatar?: string
      email?: string
      name?: string
      xp?: number
      rank?: string
      streak?: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    username?: string
    avatar?: string
    xp?: number
    rank?: string
    streak?: number
  }
}