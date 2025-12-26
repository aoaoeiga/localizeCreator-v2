"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"

interface TranscriptLine {
  en: string
  ja: string
}

interface GenerationResultProps {
  translatedTitle: string
  translatedDescription: string
  hashtags: string[]
  optimalPostTime: string
  culturalAdvice: string
  transcript?: TranscriptLine[]
}

export function GenerationResult({
  translatedTitle,
  translatedDescription,
  hashtags,
  optimalPostTime,
  culturalAdvice,
  transcript,
}: GenerationResultProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    if (!isMounted) return
    
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      alert("Failed to copy to clipboard")
    }
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transcript && transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript (English / Japanese)</CardTitle>
            <CardDescription>Bilingual transcript with line-by-line translation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {transcript.map((line, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">EN:</span> {line.en}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">JA:</span> {line.ja}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const transcriptText = transcript
                  .map((line) => `EN: ${line.en}\nJA: ${line.ja}`)
                  .join("\n\n")
                copyToClipboard(transcriptText, "transcript")
              }}
            >
              {copied === "transcript" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Transcript
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Japanese Title</CardTitle>
          <CardDescription>Localized title for Japanese audience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4 font-semibold">{translatedTitle}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(translatedTitle, "title")}
          >
            {copied === "title" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Japanese Description</CardTitle>
          <CardDescription>Localized description for Japanese audience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4 whitespace-pre-wrap">{translatedDescription}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(translatedDescription, "description")}
          >
            {copied === "description" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hashtags</CardTitle>
          <CardDescription>Top 10 suggested hashtags for your post</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(hashtags.map(t => `#${t}`).join(" "), "hashtags")}
          >
            {copied === "hashtags" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimal Posting Time</CardTitle>
          <CardDescription>Best time to post for maximum engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{optimalPostTime}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultural Adaptation Advice</CardTitle>
          <CardDescription>Tips for engaging Japanese audiences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{culturalAdvice}</p>
        </CardContent>
      </Card>
    </div>
  )
}
