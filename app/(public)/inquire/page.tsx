import { Suspense } from 'react'
import InquireForm from '@/components/InquireForm'

export default function InquirePage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-3">
        ✦ Inquire
      </h1>
      <p className="text-sm font-black uppercase tracking-widest text-rose mb-8">
        Interested in a piece? Commission? Just want to say hello?
      </p>
      <Suspense fallback={null}>
        <InquireForm />
      </Suspense>
    </div>
  )
}
