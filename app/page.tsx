"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { GenerationForm } from "@/components/generation-form"

export default function Home() {
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white" suppressHydrationWarning>LocalizeCreator</h1>
          <nav className="flex items-center gap-4">
            {!isMounted || status === "loading" ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-white/60">
                  {session?.user?.name || session?.user?.email || "User"}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded text-white text-sm transition-colors"
                style={{ backgroundColor: '#0047AB' }}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-white">LocalizeCreator</h1>
            <p className="text-lg text-white/70">
              Automatically translate and adapt your content for the Japanese market
            </p>
          </div>

          {!isMounted || status === "loading" ? (
            <div className="text-center">
              <p className="text-white/60">Loading...</p>
            </div>
          ) : !session ? (
            <div className="text-center space-y-6">
              <p className="text-base text-white/80">Please sign in to get started</p>
              <Link
                href="/auth/signin"
                className="inline-block px-8 py-3 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#0047AB' }}
              >
                Sign In with Google
              </Link>
            </div>
          ) : (
            <GenerationForm />
          )}
        </div>
      </main>
    </div>
  )
}
