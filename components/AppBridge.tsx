'use client'
import { useEffect } from 'react'
import { appPlugin } from '@/lib/nativeApp'

/** Only does anything inside the iPhone app: tapping a reminder opens the page it points to. */
export default function AppBridge() {
  useEffect(() => {
    const notes = appPlugin('LocalNotifications')
    if (!notes) return
    const listener = notes.addListener('localNotificationActionPerformed', ({ notification }) => {
      const url = notification.extra?.url
      if (url?.startsWith('/') && location.pathname + location.search !== url) location.assign(url)
    })
    return () => { listener.then(l => l.remove()) }
  }, [])
  return null
}
