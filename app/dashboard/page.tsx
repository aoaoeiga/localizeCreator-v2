"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GenerationForm } from "@/components/generation-form"
import { GenerationResult } from "@/components/generation-result"
import { useToast } from "@/hooks/use-toast"

interface GenerationData {
  translatedText: string
  hashtags: string[]
  optimalPostTime: string
}

interface UsageData {
  current: number
  limit: number
  remaining: number
  plan: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerationData | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUsage()
    }
  }, [session])

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/usage")
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error)
    }
  }

  const handleGenerate = async (text: string) => {
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

      // Refresh usage after generation
      await fetchUsage()
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          {usage && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Your current usage for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Plan:</span>
                    <span className="font-semibold capitalize">{usage.plan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Used:</span>
                    <span className="font-semibold">
                      {usage.current} / {usage.limit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Remaining:</span>
                    <span className="font-semibold">{usage.remaining}</span>
                  </div>
                  {usage.plan === "free" && (
                    <div className="pt-4">
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <GenerationForm onGenerate={handleGenerate} isLoading={isLoading} />

          {result && (
            <GenerationResult
              translatedText={result.translatedText}
              hashtags={result.hashtags}
              optimalPostTime={result.optimalPostTime}
            />
          )}
        </div>
      </main>
    </div>
  )
}

