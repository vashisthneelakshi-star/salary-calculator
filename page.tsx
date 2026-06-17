'use client'
import { useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Listen for log messages from the iframe (calculator.html) and forward to API
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'SALARY_CALC_LOG') {
        fetch('/api/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(e.data.payload),
        }).catch(() => {})
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const isAdmin = (session?.user as any)?.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: '#0f1f3d' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#0f1f3d', borderBottom: '2px solid #c9a84c',
      }}>
        <div style={{ color: '#e8c96d', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
          PATRIKA GROUP — Salary Breakup Calculator
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#fff', fontSize: 13 }}>
            👤 {session?.user?.name || session?.user?.email}
          </span>
          {isAdmin && (
            <Link href="/admin" style={{
              color: '#0f1f3d', background: '#c9a84c', padding: '6px 14px',
              borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}>
              ⚙ Admin Panel
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c',
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src="/calculator.html"
        style={{ width: '100%', height: 'calc(100vh - 50px)', border: 'none' }}
        title="Salary Breakup Calculator"
      />
    </div>
  )
}
