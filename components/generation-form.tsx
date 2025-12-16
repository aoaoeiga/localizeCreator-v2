"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface GenerationFormProps {
  onGenerate: (text: string) => Promise<void>
  isLoading?: boolean
}

export function GenerationForm({ onGenerate, isLoading = false }: GenerationFormProps) {
  const [text, setText] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to translate",
        variant: "destructive",
      })
      return
    }

    try {
      await onGenerate(text)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      })
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
            <Label htmlFor="original-text">Original Content</Label>
            <Textarea
              id="original-text"
              placeholder="Enter your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              disabled={isLoading}
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

