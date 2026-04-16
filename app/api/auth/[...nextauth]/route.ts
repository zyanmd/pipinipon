import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("SignIn callback - User:", user.email)
      
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: account.id_token })
          })
          
          const data = await res.json()
          console.log("Backend response:", data)
          
          if (res.ok && data.success) {
            // Simpan token ke user object
            user.backendToken = data.access_token
            user.backendRefreshToken = data.refresh_token
            user.role = data.user.role
            user.username = data.user.username
            user.avatar = data.user.avatar
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
      if (user) {
        token.backendToken = user.backendToken
        token.backendRefreshToken = user.backendRefreshToken
        token.role = user.role
        token.username = user.username
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken
      session.backendRefreshToken = token.backendRefreshToken
      if (session.user) {
        session.user.role = token.role
        session.user.username = token.username
        session.user.avatar = token.avatar
      }
      return session
    }
  },
})

export { handler as GET, handler as POST }