"use client"

// Custom session provider for our Cloudflare Worker auth
// No longer using NextAuth
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
