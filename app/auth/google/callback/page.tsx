// app/auth/google/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Memproses login...")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      setStatus("error")
      setMessage(`Login gagal: ${error}`)
      // Kirim pesan ke parent window
      if (window.opener) {
        window.opener.postMessage({ type: "google_auth_error", error }, window.location.origin)
      }
      setTimeout(() => window.close(), 2000)
      return
    }

    if (code) {
      setStatus("success")
      setMessage("Login berhasil! Menutup jendela...")
      
      // Kirim code ke parent window
      if (window.opener) {
        window.opener.postMessage({ type: "google_auth_code", code }, window.location.origin)
      }
      
      setTimeout(() => window.close(), 1000)
    } else {
      setStatus("error")
      setMessage("Tidak ada kode otorisasi diterima")
      setTimeout(() => window.close(), 2000)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="text-center p-8">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 dark:text-green-400">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}