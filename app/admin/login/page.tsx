'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('Invalid email or password')
    else router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1f3d 0%, #1a3a6b 60%, #0f1f3d 100%)',
    }}>
      <div style={{
        background: '#fffff8', borderRadius: 18, padding: '48px 44px', width: 380,
        boxShadow: '0 8px 48px rgba(0,0,0,0.4)', border: '2px solid #c9a84c',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>💼</div>
          <h1 style={{ margin: '8px 0 2px', fontSize: 20, fontWeight: 800, color: '#0f1f3d', letterSpacing: 1 }}>
            SALARY BREAKUP
          </h1>
          <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 700, letterSpacing: 2 }}>
            PATRIKA GROUP — INTERNAL TOOL
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 18,
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: 0.5 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@patrika.com"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #c9a84c'}
              onBlur={e => e.target.style.border = '1.5px solid #d1d5db'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: 0.5 }}>
              PASSWORD
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #c9a84c'}
              onBlur={e => e.target.style.border = '1.5px solid #d1d5db'}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #c9a84c, #e8c96d)',
              color: '#0f1f3d', fontWeight: 800, fontSize: 15, letterSpacing: 1,
              boxShadow: '0 4px 14px rgba(201,168,76,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Signing In...' : '🔐 SIGN IN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#9ca3af' }}>
          Contact admin to get access · Patrika Group HR Tools
        </div>
      </div>
    </div>
  )
}
