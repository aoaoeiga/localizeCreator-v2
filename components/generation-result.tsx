"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface GenerationResultProps {
  translatedTitle: string
  translatedDescription: string
  hashtags: string[]
  optimalPostTime: string
  culturalAdvice: string
}

export function GenerationResult({
  translatedTitle,
  translatedDescription,
  hashtags,
  optimalPostTime,
  culturalAdvice,
}: GenerationResultProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      alert("Failed to copy to clipboard")
    }
  }

  return (
    <div className="space-y-4">
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

