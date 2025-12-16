"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { GenerationForm } from "@/components/generation-form"
import { GenerationResult } from "@/components/generation-result"

interface GenerationData {
  translatedTitle: string
  translatedDescription: string
  hashtags: string[]
  optimalPostTime: string
  culturalAdvice: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationData | null>(null)

  const handleGenerate = async (formData: {
    platform: string
    contentDescription: string
    niche: string
  }) => {
    if (!session) {
      alert("Please sign in to generate content")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalText: formData.contentDescription,
          platform: formData.platform,
          niche: formData.niche,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to generate content")
      }

      setResult({
        translatedTitle: responseData.data.translatedTitle,
        translatedDescription: responseData.data.translatedDescription,
        hashtags: responseData.data.hashtags,
        optimalPostTime: responseData.data.optimalPostTime,
        culturalAdvice: responseData.data.culturalAdvice,
      })
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

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
            <>
              <GenerationForm onGenerate={handleGenerate} isLoading={isLoading} />
              {result && (
                <GenerationResult
                  translatedTitle={result.translatedTitle}
                  translatedDescription={result.translatedDescription}
                  hashtags={result.hashtags}
                  optimalPostTime={result.optimalPostTime}
                  culturalAdvice={result.culturalAdvice}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
