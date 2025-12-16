"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface GenerationResultProps {
  translatedText: string
  hashtags: string[]
  optimalPostTime: string
}

export function GenerationResult({
  translatedText,
  hashtags,
  optimalPostTime,
}: GenerationResultProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Japanese Translation</CardTitle>
          <CardDescription>Localized content for Japanese audience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4 whitespace-pre-wrap">{translatedText}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(translatedText, "Translation")}
          >
            {copied === "Translation" ? (
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
          <CardDescription>Suggested hashtags for your post</CardDescription>
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
            onClick={() => copyToClipboard(hashtags.map(t => `#${t}`).join(" "), "Hashtags")}
          >
            {copied === "Hashtags" ? (
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
    </div>
  )
}

