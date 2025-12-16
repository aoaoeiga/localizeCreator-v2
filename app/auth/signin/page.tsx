"use client"

import { signIn } from "next-auth/react"
import { Suspense } from "react"

function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-600">
            Sign in with your GitHub account to get started
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-md font-medium"
          >
            Sign In with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
