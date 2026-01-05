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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Content Localization</CardTitle>
          <CardDescription className="text-white/60">
            Enter your video URL and subtitles to get a Japanese translation with hashtags and optimal posting time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 glass animate-pulse rounded-lg"></div>
            <div className="h-10 glass animate-pulse rounded-lg"></div>
            <div className="h-40 glass animate-pulse rounded-lg"></div>
            <div className="h-10 glass animate-pulse rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Content Localization</CardTitle>
        <CardDescription className="text-white/70 leading-relaxed">
          Enter your video URL and subtitles to automatically generate localized content for the Japanese market
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="platform" className="text-sm font-medium text-white">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isLoading}
              className="flex h-12 w-full rounded-lg glass-input px-4 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="youtube" className="bg-[#0f1419]">YouTube</option>
              <option value="tiktok" className="bg-[#0f1419]">TikTok</option>
              <option value="instagram" className="bg-[#0f1419]">Instagram</option>
            </select>
          </div>

          <div className="space-y-3">
            <label htmlFor="video-url" className="text-sm font-medium text-white">
              Video URL
            </label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.tiktok.com/@example/video/1234567890123456789"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading}
              className="glass-input text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-white">
              Subtitles
            </label>
            <div className="space-y-3">
              {subtitleLines.map((line, index) => (
                <div key={line.id} className="flex items-center gap-3">
                  <label className="text-sm text-white/70 shrink-0 w-36">
                    Subtitle Line {index + 1}:
                  </label>
                  <Input
                    type="text"
                    placeholder={`Enter subtitle text...`}
                    value={line.text}
                    onChange={(e) => updateSubtitleLine(line.id, e.target.value)}
                    disabled={isLoading}
                    className="flex-1 glass-input text-white placeholder:text-white/40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSubtitleLine(line.id)}
                    disabled={isLoading || subtitleLines.length === 1}
                    className="shrink-0 glass-button text-white border-white/20 hover:border-white/40"
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
              className="w-full glass-button text-white border-white/20 hover:border-white/40"
            >
              + Add Subtitle Line
            </Button>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className="w-full glass-button text-white border-white/20 hover:border-white/40 hover:bg-accent-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-base py-6"
          >
            {isLoading ? "Generating..." : "Generate Localized Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
