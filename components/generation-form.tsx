"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface SubtitleLine {
  id: number
  text: string
}

export function GenerationForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [platform, setPlatform] = useState("tiktok")
  const [videoUrl, setVideoUrl] = useState("")
  const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>([{ id: 1, text: "" }])
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nextId, setNextId] = useState(2)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const addSubtitleLine = () => {
    setSubtitleLines([...subtitleLines, { id: nextId, text: "" }])
    setNextId(nextId + 1)
  }

  const removeSubtitleLine = (id: number) => {
    if (subtitleLines.length > 1) {
      setSubtitleLines(subtitleLines.filter((line) => line.id !== id))
    }
  }

  const updateSubtitleLine = (id: number, value: string) => {
    setSubtitleLines(
      subtitleLines.map((line) => (line.id === id ? { ...line, text: value } : line))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      alert("Please sign in to generate content")
      return
    }
    
    const subtitles = subtitleLines.filter(line => line.text.trim()).map(line => line.text).join("\n")
    
    if (!platform || !videoUrl.trim() || !subtitles.trim()) {
      alert("Please fill in all fields")
      return
    }

    // Validate URL format
    try {
      new URL(videoUrl)
    } catch {
      alert("Please enter a valid URL")
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          videoUrl,
          subtitles,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to generate content")
      }

      // Redirect to result page with data in query parameter
      const encodedData = encodeURIComponent(JSON.stringify(responseData.data))
      router.push(`/result?data=${encodedData}`)
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

  const subtitles = subtitleLines.filter(line => line.text.trim()).map(line => line.text).join("\n")
  const isFormValid = platform && videoUrl.trim() && subtitles.trim()

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Localization</CardTitle>
          <CardDescription>
            Enter your video URL and subtitles to get a Japanese translation with hashtags and optimal posting time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-40 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Localization</CardTitle>
        <CardDescription>
          Enter your video URL and subtitles to automatically generate localized content for the Japanese market
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="platform" className="text-sm font-medium">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="video-url" className="text-sm font-medium">
              Video URL
            </label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.tiktok.com/@example/video/1234567890123456789"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Subtitles
            </label>
            <div className="space-y-2">
              {subtitleLines.map((line, index) => (
                <div key={line.id} className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 shrink-0 w-32">
                    Subtitle Line {index + 1}:
                  </label>
                  <Input
                    type="text"
                    placeholder={`Enter subtitle text...`}
                    value={line.text}
                    onChange={(e) => updateSubtitleLine(line.id, e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSubtitleLine(line.id)}
                    disabled={isLoading || subtitleLines.length === 1}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addSubtitleLine}
              disabled={isLoading}
              className="w-full"
            >
              + Add Subtitle Line
            </Button>
          </div>

          <Button type="submit" disabled={isLoading || !isFormValid}>
            {isLoading ? "Generating..." : "Generate Localized Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
