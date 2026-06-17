'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
  active: boolean
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' as 'admin'|'user' })
  const [creating, setCreating] = useState(false)

  const isAdmin = (session?.user as any)?.role === 'admin'

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) router.push('/')
  }, [status, isAdmin, router])

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (isAdmin) loadUsers() }, [isAdmin])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setCreating(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setCreating(false)
    if (res.ok) {
      setForm({ name: '', email: '', password: '', role: 'user' })
      loadUsers()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to create user')
    }
  }

  async function toggleActive(u: User) {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, active: !u.active }),
    })
    loadUsers()
  }

  async function handleDelete(u: User) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return
    await fetch(`/api/users?id=${u.id}`, { method: 'DELETE' })
    loadUsers()
  }

  if (status === 'loading' || !isAdmin) {
    return <div style={{ padding: 40, color: '#fff', background: '#0f1f3d', minHeight: '100vh' }}>Loading…</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f1e8', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: '#0f1f3d', borderBottom: '2px solid #c9a84c',
      }}>
        <div style={{ color: '#e8c96d', fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>
          ⚙ ADMIN PANEL — User Management
        </div>
        <Link href="/" style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          ← Back to Calculator
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: '30px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #d9c98a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 17, color: '#0f1f3d' }}>➕ Create New User</h2>
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              ⚠ {error}
            </div>
          )}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              placeholder="Full Name" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              placeholder="Email" type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              placeholder="Password" type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as 'admin'|'user' })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit" disabled={creating}
              style={{
                gridColumn: '1 / -1', padding: 12, borderRadius: 8, border: 'none',
                background: '#c9a84c', color: '#0f1f3d', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {creating ? 'Creating…' : 'Create User'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #d9c98a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 17, color: '#0f1f3d' }}>👥 All Users ({users.length})</h2>
          {loading ? <p>Loading…</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Role</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>Created</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                    <td style={{ padding: 8 }}>{u.name}</td>
                    <td style={{ padding: 8 }}>{u.email}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: u.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                        color: u.role === 'admin' ? '#92400e' : '#075985',
                      }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span style={{ color: u.active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {u.active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: 8, color: '#666' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: 8, display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => toggleActive(u)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', background: '#fff' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
