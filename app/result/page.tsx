"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft } from "lucide-react"

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

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<GenerationData | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Get result from URL query parameter
    if (typeof window !== "undefined") {
      const dataParam = searchParams.get("data")
      if (dataParam) {
        try {
          const decodedData = decodeURIComponent(dataParam)
          const parsedData = JSON.parse(decodedData) as GenerationData
          setResult(parsedData)
        } catch (error) {
          console.error("Failed to parse result data:", error)
          router.push("/")
        }
      } else {
        router.push("/")
      }
    }
  }, [searchParams, router])

  const copyToClipboard = async (text: string, index: number) => {
    if (!isMounted) return
    
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1000)
    } catch (error) {
      alert("Failed to copy to clipboard")
    }
  }

  if (!isMounted || !result) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">LocalizeCreator</h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LocalizeCreator</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Generation Result</h1>
          </div>

          {result.transcript && result.transcript.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transcript (English / Japanese)</CardTitle>
                <CardDescription>Bilingual transcript with line-by-line translation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.transcript.map((line, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">EN:</span> {line.en}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900 flex-1">
                            <span className="font-semibold">JA:</span> {line.ja}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(line.ja, index)}
                            className="ml-4 shrink-0"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Japanese Title</CardTitle>
              <CardDescription>Localized title for Japanese audience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{result.translatedTitle}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Japanese Description</CardTitle>
              <CardDescription>Localized description for Japanese audience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg whitespace-pre-wrap">{result.translatedDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
              <CardDescription>Top 10 suggested hashtags for your post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Posting Time</CardTitle>
              <CardDescription>Best time to post for maximum engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{result.optimalPostTime}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cultural Adaptation Advice</CardTitle>
              <CardDescription>Tips for engaging Japanese audiences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.culturalAdvice}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">LocalizeCreator</h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
