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
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            LocalizeCreator
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">User Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{session.user?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{session.user?.name || "N/A"}</span>
              </div>
              {session.user?.image && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avatar:</span>
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Phase 1 Complete</h2>
            <p className="text-gray-700">
              GitHub OAuth authentication is working successfully!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Next steps: Add Supabase integration, OpenAI API, and content generation features.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
