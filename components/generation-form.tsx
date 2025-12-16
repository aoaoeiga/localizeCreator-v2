"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface GenerationFormProps {
  onGenerate: (data: {
    platform: string
    contentDescription: string
    niche: string
  }) => Promise<void>
  isLoading?: boolean
}

export function GenerationForm({ onGenerate, isLoading = false }: GenerationFormProps) {
  const [platform, setPlatform] = useState("")
  const [contentDescription, setContentDescription] = useState("")
  const [niche, setNiche] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!platform || !contentDescription.trim() || !niche.trim()) {
      alert("Please fill in all fields")
      return
    }

    try {
      await onGenerate({
        platform,
        contentDescription,
        niche,
      })
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    }
  }

  const isFormValid = platform && contentDescription.trim() && niche.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Localization</CardTitle>
        <CardDescription>
          Enter your content details to get a Japanese translation with hashtags and optimal posting time
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
            <label htmlFor="content-description" className="text-sm font-medium">
              Content Description
            </label>
            <textarea
              id="content-description"
              placeholder="Enter your content description here..."
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              rows={6}
              disabled={isLoading}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="niche" className="text-sm font-medium">
              Niche/Category
            </label>
            <Input
              id="niche"
              type="text"
              placeholder="e.g., Technology, Fashion, Food, Travel..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={isLoading}
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
