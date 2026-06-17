// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsers, createUser, updateUserStatus, deleteUser } from '@/lib/users'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') return false
  return true
}

// GET /api/users — list all users (admin only)
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await getUsers()
  const safe = users.map(({ passwordHash, ...u }) => u)
  return NextResponse.json(safe)
}

// POST /api/users — create user (admin only)
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const user = await createUser({
      email:    body.email,
      name:     body.name,
      role:     body.role || 'user',
      password: body.password,
    })
    const { passwordHash, ...safe } = user
    return NextResponse.json(safe, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// PATCH /api/users — toggle active status
export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, active } = await req.json()
  await updateUserStatus(id, active)
  return NextResponse.json({ ok: true })
}

// DELETE /api/users?id=xxx
export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await deleteUser(id)
  return NextResponse.json({ ok: true })
}
