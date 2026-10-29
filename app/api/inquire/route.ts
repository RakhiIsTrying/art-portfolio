import { NextRequest, NextResponse } from 'next/server'
import { getResendClient } from '@/lib/resend'

type InquireBody = {
  name: string
  email: string
  piece?: string
  message: string
  order?: { lines: string[]; total: string; shipping: string }
}

export async function POST(req: NextRequest) {
  let body: InquireBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const order = body.order && Array.isArray(body.order.lines) && body.order.lines.length ? body.order : null
  if (!body.name || !body.email || (!body.message && !order)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resend = getResendClient()
  const { error } = await resend.emails.send({
    from:    'noreply@resend.dev',
    to:      process.env.INQUIRE_TO_EMAIL!,
    subject: `Inquiry from ${body.name}${body.piece ? ` — "${body.piece}"` : ''}`,
    text: [
      `Name: ${body.name}`,
      `Email: ${body.email}`,
      body.piece ? `Piece: ${body.piece}` : '',
      order ? `\nOrder:\n${order.lines.map(l => `  ${String(l).slice(0, 200)}`).join('\n')}\nTotal: ${String(order.total).slice(0, 40)}\n${String(order.shipping).slice(0, 300)}` : '',
      body.message ? `\n${body.message}` : '',
    ].filter(Boolean).join('\n'),
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
