"use client"

import { signIn } from "next-auth/react"
import { Suspense } from "react"

function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419] wave-pattern">
      <div className="max-w-md w-full glass-card rounded-2xl shadow-2xl p-10">
        <div className="text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">Sign In</h1>
            <p className="text-white/70 leading-relaxed">
              Sign in with your GitHub account or Google account to get started
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full px-6 py-4 glass-button rounded-lg text-white font-medium text-base"
            >
              Sign In with GitHub
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full px-6 py-4 glass-button rounded-lg text-white font-medium text-base"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <p className="text-white/60">Loading...</p>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
