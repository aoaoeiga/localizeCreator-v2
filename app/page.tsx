"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { GenerationForm } from "@/components/generation-form"
import { GenerationResult } from "@/components/generation-result"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface GenerationData {
  translatedText: string
  hashtags: string[]
  optimalPostTime: string
}

export default function Home() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationData | null>(null)
  const { toast } = useToast()

  const handleGenerate = async (text: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate content",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalText: text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      setResult({
        translatedText: data.data.translatedText,
        hashtags: data.data.hashtags,
        optimalPostTime: data.data.optimalPostTime,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">LocalizeCreator</h1>
            <p className="text-xl text-muted-foreground">
              Automatically translate and adapt your content for the Japanese market
            </p>
          </div>

          {!session && (
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Sign in with GitHub to start localizing your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/auth/signin">
                  <Button className="w-full">Sign In with GitHub</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {session && (
            <>
              <GenerationForm onGenerate={handleGenerate} isLoading={isLoading} />
              {result && (
                <GenerationResult
                  translatedText={result.translatedText}
                  hashtags={result.hashtags}
                  optimalPostTime={result.optimalPostTime}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

