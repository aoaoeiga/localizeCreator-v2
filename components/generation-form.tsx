"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface GenerationFormProps {
  onGenerate: (data: {
    platform: string
    videoUrl: string
    subtitles: string
  }) => Promise<void>
  isLoading?: boolean
}

export function GenerationForm({ onGenerate, isLoading = false }: GenerationFormProps) {
  const [platform, setPlatform] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [subtitles, setSubtitles] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      await onGenerate({
        platform,
        videoUrl,
        subtitles,
      })
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    }
  }

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
          Enter your video URL and subtitles to get a Japanese translation with hashtags and optimal posting time
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
              <option value="">Select a platform</option>
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
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subtitles" className="text-sm font-medium">
              Subtitles
            </label>
            <textarea
              id="subtitles"
              placeholder="Paste your video subtitles here..."
              value={subtitles}
              onChange={(e) => setSubtitles(e.target.value)}
              rows={8}
              disabled={isLoading}
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button type="submit" disabled={isLoading || !isFormValid}>
            {isLoading ? "Generating..." : "Generate Localized Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
