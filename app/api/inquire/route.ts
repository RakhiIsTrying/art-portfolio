import { NextRequest, NextResponse } from 'next/server'
import { notifyArtist } from '@/lib/notify'

type InquireBody = {
  name: string
  email: string
  piece?: string
  message: string
  order?: { lines: string[]; total: string; shipping: string; greeting?: string }
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

  const text = [
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    body.piece ? `Piece: ${body.piece}` : '',
    order ? `\nOrder:\n${order.lines.map(l => `  ${String(l).slice(0, 200)}`).join('\n')}\nTotal: ${String(order.total).slice(0, 40)}\n${String(order.shipping).slice(0, 300)}${order.greeting ? `\nGreeting card message: ${String(order.greeting).slice(0, 400)}` : ''}` : '',
    body.message ? `\n${body.message}` : '',
  ].filter(Boolean).join('\n')

  const { saved, emailed } = await notifyArtist({
    kind: order ? 'Print order' : 'Inquiry',
    subject: `${body.name}${body.piece ? `, ${body.piece}` : ''}`,
    text,
    replyTo: body.email,
  })
  if (!saved && !emailed) {
    return NextResponse.json({ error: 'Could not send your message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
