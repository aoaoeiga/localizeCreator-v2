"use client"

import { signIn } from "next-auth/react"
import { Suspense } from "react"

function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
      <div className="max-w-lg w-full glass-card rounded-2xl shadow-2xl p-12">
        <div className="text-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white font-['Noto_Sans_JP']" style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900 }}>
              Sign In
            </h1>
            <p className="text-white/70 leading-relaxed text-lg">
              Sign in with your GitHub account or Google account to get started
            </p>
          </div>
          <div className="space-y-5">
            {/* Google ボタン - メインカラー（紺碧） */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full px-8 py-5 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #0047AB 0%, #003c7a 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 71, 171, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#FFFFFF"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </div>
            </button>
            
            {/* GitHub ボタン - セカンダリ（黒紅） */}
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full px-8 py-5 rounded-xl font-medium text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: 'rgba(44, 24, 33, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.08-.73.08-.73 1.205.085 1.838 1.238 1.838 1.238 1.07 1.835 2.804 1.305 3.49.998.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.33-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.13-3.18 0 0 1.005-.322 3.3.123 1.005-.278 2.07-.417 3.135-.417.005 0 .01 0 .015 0 1.065 0 2.13.14 3.135.417 2.28-.445 3.285-.123 3.285-.123.67 1.657.265 2.877.13 3.18.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .32.21.693.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>Sign In with GitHub</span>
              </div>
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
