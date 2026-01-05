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
    <div className="min-h-screen flex flex-col bg-[#0f1419]">
      <header className="glass border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }} suppressHydrationWarning>LocalizeCreator</h1>
          <nav className="flex items-center gap-6">
            {!isMounted || status === "loading" ? (
              <div className="h-10 w-24 glass animate-pulse rounded-lg"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-white/80">
                  Hello, {session?.user?.name || session?.user?.email || "User"}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white font-['Noto_Sans_JP'] gold-glow-subtle" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }} suppressHydrationWarning>
                LocalizeCreator
              </h1>
              <p className="text-xl text-white/80 leading-relaxed font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                Automatically translate and adapt your content for the Japanese market
              </p>
            </div>
          </div>

          {!isMounted || status === "loading" ? (
            <div className="text-center">
              <p className="text-white/60">Loading...</p>
            </div>
          ) : !session ? (
            <div className="text-center space-y-6">
              <p className="text-lg text-white/80">Please sign in to get started</p>
              <Link
                href="/auth/signin"
                className="inline-block px-8 py-3 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
              >
                Sign In with GitHub
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
