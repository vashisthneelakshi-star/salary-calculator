// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    /*
     * Protect everything except:
     * - /login
     * - /api/auth/* (NextAuth routes)
     * - static files
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
