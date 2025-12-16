"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GenerationFormProps {
  onGenerate: (text: string) => Promise<void>
  isLoading?: boolean
}

export function GenerationForm({ onGenerate, isLoading = false }: GenerationFormProps) {
  const [text, setText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      alert("Please enter some text to translate")
      return
    }

    try {
      await onGenerate(text)
    } catch (error: any) {
      alert(error.message || "Failed to generate content")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Localization</CardTitle>
        <CardDescription>
          Enter your content in English to get a Japanese translation with hashtags and optimal posting time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="original-text" className="text-sm font-medium">
              Original Content
            </label>
            <textarea
              id="original-text"
              placeholder="Enter your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              disabled={isLoading}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button type="submit" disabled={isLoading || !text.trim()}>
            {isLoading ? "Generating..." : "Generate Localized Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

