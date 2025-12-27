"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { handleCallback } from "@/lib/auth-client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're on the main page with token (new flow)
    const token = searchParams.get('token')

    if (token) {
      console.log('Token received:', token.substring(0, 20) + '...')
      
      // Save session with token
      // We'll fetch user data when needed using the token
      const session = {
        token: token
      }
      localStorage.setItem('session', JSON.stringify(session))
      console.log('Session saved')
      
      // Redirect to home
      window.location.href = '/'
      return
    }

    // Old flow fallback (shouldn't happen anymore)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setError('Missing authentication parameters')
      return
    }

    handleCallback(code, state)
      .then(() => {
        window.location.href = '/'
      })
      .catch((err) => {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
      })
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate you</p>
      </div>
    </div>
  )
}
