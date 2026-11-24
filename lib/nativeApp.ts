// The iPhone app (ios-app/) shows this site inside a native shell built with Capacitor.
// Inside the app, window.Capacitor is there and its plugins can be called directly;
// in a normal browser it is missing, so everything here falls back to the web.

type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'
type Listener = { remove: () => Promise<void> }

type LocalNotificationsPlugin = {
  requestPermissions: () => Promise<{ display: PermissionState }>
  schedule: (o: { notifications: Record<string, unknown>[] }) => Promise<unknown>
  cancel: (o: { notifications: { id: number }[] }) => Promise<void>
  addListener: (event: 'localNotificationActionPerformed', fn: (a: { notification: { extra?: { url?: string } } }) => void) => Promise<Listener>
}
type SharePlugin = { share: (o: { title?: string; text?: string; url?: string; dialogTitle?: string }) => Promise<unknown> }
type Plugins = { LocalNotifications?: LocalNotificationsPlugin; Share?: SharePlugin }

declare global {
  interface Window { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Plugins } }
}

/** True inside the iPhone app. Only call it in the browser (an effect or an event handler). */
export const inApp = () => typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()

export const appPlugin = <K extends keyof Plugins>(name: K): Plugins[K] => (inApp() ? window.Capacitor?.Plugins?.[name] : undefined)

/**
 * Shares a link: the iPhone share sheet in the app, the browser's own share menu where there is one,
 * otherwise copies the link. Returns 'copied' when it fell back to copying.
 */
export async function shareLink(o: { title: string; text: string; url: string }): Promise<'shared' | 'copied' | 'cancelled'> {
  try {
    const share = appPlugin('Share')
    if (share) { await share.share({ ...o, dialogTitle: 'Share this piece' }); return 'shared' }
    if (navigator.share) { await navigator.share(o); return 'shared' }
    await navigator.clipboard.writeText(o.url)
    return 'copied'
  } catch {
    // Closing the share sheet counts as an error in both iOS and browsers
    return 'cancelled'
  }
}
