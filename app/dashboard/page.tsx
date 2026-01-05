"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            LocalizeCreator
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/60">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Email:</span>
                  <span className="text-white">{session.user?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Name:</span>
                  <span className="text-white">{session.user?.name || "N/A"}</span>
                </div>
                {session.user?.image && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Avatar:</span>
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
