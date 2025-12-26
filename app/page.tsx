"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { GenerationForm } from "@/components/generation-form"
import { GenerationResult } from "@/components/generation-result"

interface TranscriptLine {
  en: string
  ja: string
}

interface GenerationData {
  translatedTitle: string
  translatedDescription: string
  hashtags: string[]
  optimalPostTime: string
  culturalAdvice: string
  transcript?: TranscriptLine[]
}

export default function Home() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationData | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // Only run on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle session state separately
  useEffect(() => {
    if (status !== "loading") {
      setSessionReady(true)
    }
  }, [status])

  const handleGenerate = async (formData: {
    platform: string
    videoUrl: string
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
          platform: formData.platform,
          videoUrl: formData.videoUrl,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to generate content")
      }

      setResult({
        translatedTitle: responseData.data.translatedTitle,
        translatedDescription: responseData.data.translatedDescription,
        hashtags: responseData.data.hashtags,
        optimalPostTime: responseData.data.optimalPostTime,
        culturalAdvice: responseData.data.culturalAdvice,
        transcript: responseData.data.transcript,
      })
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

  // Render static content during SSR and initial mount
  if (!isMounted || !sessionReady) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">LocalizeCreator</h1>
            <nav className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">LocalizeCreator</h1>
              <p className="text-xl text-gray-600">
                Automatically translate and adapt your content for the Japanese market
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Now we can safely use session data
  const isAuthenticated = !!session
  const isLoadingSession = status === "loading"

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LocalizeCreator</h1>
          <nav className="flex items-center gap-4">
            {isLoadingSession ? (
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <span className="text-sm">
                  Hello, {session?.user?.name || session?.user?.email || "User"}
                </span>
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
            <h1 className="text-4xl font-bold">LocalizeCreator</h1>
            <p className="text-xl text-gray-600">
              Automatically translate and adapt your content for the Japanese market
            </p>
          </div>

          {isLoadingSession ? (
            <div className="text-center">
              <p className="text-gray-500">Loading session...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center space-y-4">
              <p className="text-lg">Please sign in to get started</p>
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Sign In with GitHub
              </Link>
            </div>
          ) : (
            <>
              <GenerationForm onGenerate={handleGenerate} isLoading={isLoading} />
              {result && (
                <GenerationResult
                  translatedTitle={result.translatedTitle}
                  translatedDescription={result.translatedDescription}
                  hashtags={result.hashtags}
                  optimalPostTime={result.optimalPostTime}
                  culturalAdvice={result.culturalAdvice}
                  transcript={result.transcript}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
