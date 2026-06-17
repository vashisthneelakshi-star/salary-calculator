// lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyUser } from '@/lib/users'
import { logActivity } from '@/lib/sheets'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await verifyUser(credentials.email, credentials.password)
        if (!user) return null

        const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        logActivity({
          userEmail: user.email, userName: user.name,
          action: 'LOGIN', inputType: '-', amount: '-', pli: '-',
          state: '-', gross: '-', inhand: '-', inhandWithPLI: '-', ctc: '-',
          timestamp: now,
        }).catch(() => {})

        return { id: user.id, email: user.email, name: user.name, role: user.role } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }: any) {
      if (session.user) (session.user as any).role = token.role
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' as const, maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
