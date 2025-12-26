"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getYouTubeTranscript } from "@/lib/youtube"

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
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch YouTube transcript when URL changes and platform is YouTube
  const fetchTranscript = useCallback(async (url: string) => {
    if (!url.trim() || platform !== "youtube") {
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return
    }

    setIsLoadingTranscript(true)
    setTranscriptError(null)

    try {
      const transcript = await getYouTubeTranscript(url)
      setSubtitles(transcript)
    } catch (error: any) {
      console.error("Error fetching transcript:", error)
      setTranscriptError(error.message || "Failed to fetch transcript")
      // Don't clear subtitles if there's an error - user might have entered them manually
    } finally {
      setIsLoadingTranscript(false)
    }
  }, [platform])

  // Handle URL change with debounce
  useEffect(() => {
    if (!isMounted || !videoUrl.trim() || platform !== "youtube") {
      return
    }

    const timer = setTimeout(() => {
      fetchTranscript(videoUrl)
    }, 1000) // 1 second debounce

    return () => clearTimeout(timer)
  }, [videoUrl, platform, isMounted, fetchTranscript])

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
          {platform === "youtube" 
            ? "Enter a YouTube URL to automatically fetch subtitles, or paste them manually"
            : "Enter your video URL and subtitles to get a Japanese translation with hashtags and optimal posting time"
          }
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
              onChange={(e) => {
                setPlatform(e.target.value)
                // Clear subtitles when platform changes
                if (e.target.value !== "youtube") {
                  setSubtitles("")
                  setTranscriptError(null)
                }
              }}
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
            {platform === "youtube" && isLoadingTranscript && (
              <p className="text-sm text-blue-600">Loading transcript...</p>
            )}
            {transcriptError && (
              <p className="text-sm text-red-600">{transcriptError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="subtitles" className="text-sm font-medium">
              Subtitles
              {platform === "youtube" && (
                <span className="text-xs text-gray-500 ml-2">
                  (Auto-filled for YouTube videos)
                </span>
              )}
            </label>
            <textarea
              id="subtitles"
              placeholder={
                platform === "youtube"
                  ? "Subtitles will be automatically filled when you enter a YouTube URL..."
                  : "Paste your video subtitles here..."
              }
              value={subtitles}
              onChange={(e) => {
                setSubtitles(e.target.value)
                setTranscriptError(null) // Clear error when user manually edits
              }}
              rows={8}
              disabled={isLoading || isLoadingTranscript}
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button type="submit" disabled={isLoading || isLoadingTranscript || !isFormValid}>
            {isLoading ? "Generating..." : "Generate Localized Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
