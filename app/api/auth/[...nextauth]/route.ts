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
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: account.id_token })
          })
          
          const data = await res.json()
          
          if (res.ok && data.success) {
            user.role = data.user.role
            user.username = data.user.username
            user.avatar = data.user.avatar
            user.xp = data.user.xp
            user.rank = data.user.rank
            user.streak = data.user.streak
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
        token.role = user.role
        token.username = user.username
        token.avatar = user.avatar
        token.xp = user.xp
        token.rank = user.rank
        token.streak = user.streak
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.avatar = token.avatar as string
        session.user.xp = token.xp as number
        session.user.rank = token.rank as string
        session.user.streak = token.streak as number
      }
      return session
    }
  },
})

export { handler as GET, handler as POST }