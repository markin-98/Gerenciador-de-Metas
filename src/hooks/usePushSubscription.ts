import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getExistingSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from '../lib/push'

export function usePushSubscription() {
  const { user } = useAuth()
  const supported = isPushSupported()
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!supported) {
      setLoading(false)
      return
    }
    setLoading(true)
    const subscription = await getExistingSubscription()
    setSubscribed(!!subscription)
    setLoading(false)
  }, [supported])

  useEffect(() => {
    reload()
  }, [reload])

  async function enable() {
    if (!supported || !user) return
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    await subscribeToPush(user.id)
    setSubscribed(true)
  }

  async function disable() {
    if (!supported) return
    await unsubscribeFromPush()
    setSubscribed(false)
  }

  return { supported, subscribed, loading, enable, disable }
}
