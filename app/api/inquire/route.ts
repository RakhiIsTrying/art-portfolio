import { NextRequest, NextResponse } from 'next/server'
import { getResendClient } from '@/lib/resend'

type InquireBody = {
  name: string
  email: string
  piece?: string
  message: string
}

export async function POST(req: NextRequest) {
  let body: InquireBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resend = getResendClient()
  const { error } = await resend.emails.send({
    from:    'noreply@resend.dev',
    to:      process.env.INQUIRE_TO_EMAIL!,
    subject: `Inquiry from ${body.name}${body.piece ? ` — "${body.piece}"` : ''}`,
    text:    `Name: ${body.name}\nEmail: ${body.email}\n\n${body.message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
