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
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">LocalizeCreator</h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
              >
                Back
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white/60">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">LocalizeCreator</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              Back
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 glass-button text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Generation Result</h1>
          </div>

          {result.transcript && result.transcript.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Transcript (English / Japanese)</CardTitle>
                <CardDescription className="text-white/60">Bilingual transcript with line-by-line translation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.transcript.map((line, index) => (
                    <div key={index} className="border-b border-white/10 pb-6 last:border-0">
                      <div className="space-y-3">
                        <p className="text-sm text-white/70">
                          <span className="font-semibold text-white">EN:</span> {line.en}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-white flex-1 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            <span className="font-semibold accent-shu">JA:</span> {line.ja}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(line.ja, index)}
                            className="shrink-0 glass-button text-white border-white/20 hover:border-white/40"
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

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>Japanese Title</CardTitle>
              <CardDescription className="text-white/60 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>Localized title for Japanese audience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{result.translatedTitle}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>Japanese Description</CardTitle>
              <CardDescription className="text-white/60 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>Localized description for Japanese audience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg whitespace-pre-wrap text-white/90 leading-relaxed font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{result.translatedDescription}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>Hashtags</CardTitle>
              <CardDescription className="text-white/60 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>Top 10 suggested hashtags for your post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {result.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 glass-button rounded-lg text-white text-sm font-medium font-['Noto_Sans_JP']"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>Optimal Posting Time</CardTitle>
              <CardDescription className="text-white/60 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>Best time to post for maximum engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-white font-['Noto_Sans_JP'] accent-konpeki" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{result.optimalPostTime}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>Cultural Adaptation Advice</CardTitle>
              <CardDescription className="text-white/60 font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>Tips for engaging Japanese audiences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-white/80 leading-relaxed font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{result.culturalAdvice}</p>
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
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">LocalizeCreator</h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
              >
                Back
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-white/60">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
