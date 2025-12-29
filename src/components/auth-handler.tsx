"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function AuthHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a token in URL (from OAuth redirect)
    const token = searchParams.get('token')
    
    if (token) {
      console.log('Token received from OAuth:', token.substring(0, 20) + '...')
      
      // Save token to localStorage
      const session = { token }
      localStorage.setItem('session', JSON.stringify(session))
      
      // Remove token from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.toString())
      
      // Reload to update auth state
      window.location.reload()
    }
  }, [searchParams])

  return null
}
