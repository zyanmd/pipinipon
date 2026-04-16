    import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Credentials Provider untuk login email/password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password
            })
          })
          
          const data = await res.json()
          
          if (res.ok && data.success) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.username,
              backendToken: data.access_token,
              backendRefreshToken: data.refresh_token,
              role: data.user.role,
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      console.log("SignIn callback - Provider:", account?.provider)
      
      if (account?.provider === "google") {
        try {
          // Panggil backend Flask untuk verifikasi Google token
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: account.id_token })
          })
          
          const data = await res.json()
          console.log("Backend response:", data)
          
          if (res.ok && data.success) {
            // Simpan token backend ke user object
            user.backendToken = data.access_token
            user.backendRefreshToken = data.refresh_token
            user.id = data.user.id.toString()
            user.role = data.user.role
            return true
          }
          return false
        } catch (error) {
          console.error("Google signIn error:", error)
          return false
        }
      }
      
      return true
    },
    
    async jwt({ token, user }) {
      // Pindahkan data dari user ke token
      if (user) {
        token.backendToken = user.backendToken
        token.backendRefreshToken = user.backendRefreshToken
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    
    async session({ session, token }) {
      // Kirim data ke frontend
      session.backendToken = token.backendToken
      session.backendRefreshToken = token.backendRefreshToken
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      return session
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }