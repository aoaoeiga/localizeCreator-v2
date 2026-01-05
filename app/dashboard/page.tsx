"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1419]">
      <header className="glass border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }}>
            LocalizeCreator
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="px-4 py-2 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 glass-button rounded-lg text-white hover:text-accent-red transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white font-['Noto_Sans_JP'] accent-konpeki" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }}>Dashboard</h1>
            <p className="text-white/70 text-lg font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-white">User Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-white/70">Email:</span>
                <span className="font-medium text-white">{session.user?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-white/70">Name:</span>
                <span className="font-medium text-white">{session.user?.name || "N/A"}</span>
              </div>
              {session.user?.image && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Avatar:</span>
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border-accent-blue/30">
            <h2 className="text-2xl font-semibold mb-3 text-white">Phase 1 Complete</h2>
            <p className="text-white/80 text-lg">
              GitHub OAuth authentication is working successfully!
            </p>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">
              Next steps: Add Supabase integration, OpenAI API, and content generation features.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
