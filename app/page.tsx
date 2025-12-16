"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LocalizeCreator</h1>
          <nav className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <span className="text-sm">Hello, {session.user?.name || session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">LocalizeCreator</h2>
            <p className="text-xl text-gray-600">
              Automatically translate and adapt your content for the Japanese market
            </p>
          </div>

          {status === "loading" && (
            <div className="text-center">
              <p>Loading...</p>
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="text-center space-y-4">
              <p className="text-lg">Please sign in to get started</p>
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Sign In with GitHub
              </Link>
            </div>
          )}

          {session && (
            <div className="text-center space-y-4">
              <p className="text-lg">Welcome! You are signed in.</p>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Email: {session.user?.email}</p>
                <p className="text-sm text-gray-600">Name: {session.user?.name || "N/A"}</p>
              </div>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
