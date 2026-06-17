// app/api/log-activity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logActivity } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const now  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    await logActivity({
      userEmail:    (session.user as any).email || '',
      userName:     session.user.name || '',
      action:       body.action,
      state:        body.state || '',
      inputType:    body.inputType || '',
      amount:       body.amount || '',
      pli:          body.pli || '',
      gross:        body.gross || '',
      inhand:       body.inhand || '',
      inhandWithPLI: body.inhandWithPLI || '',
      ctc:          body.ctc || '',
      timestamp:    now,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
