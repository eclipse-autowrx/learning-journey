'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/frontend/auth'

const DEFAULT_SERVER_BASE_URL = 'https://backend-core-dev.digital.auto/v2'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading, refreshAuth } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [authLoading, isAuthenticated, router])

  const getServerBaseUrl = () => {
    // Prefer USER_BASE_URL for external service; fallback to docs default
    const envUrl = process.env.USER_BASE_URL
    return (envUrl && envUrl.trim()) ? envUrl.replace(/\/$/, '') : DEFAULT_SERVER_BASE_URL
  }

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // 1) POST to our proxy API to avoid CORS and hide external service
      const loginRes = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!loginRes.ok) {
        const err = await safeJson(loginRes)
        throw new Error(err?.error || err?.message || `Login failed (${loginRes.status})`)
      }
      const loginData = await loginRes.json() as any
      const token: string | undefined = extractAccessToken(loginData)
      if (!token) throw new Error('No access token returned from server')
      const id = loginData?.user?.id
      if (!id) throw new Error('Could not determine user id from profile')

      // 3) POST to our API to establish app cookies
      const appAuthRes = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id, token })
      })
      if (!appAuthRes.ok) {
        const err = await safeJson(appAuthRes)
        throw new Error(err?.error || err?.message || `Failed to establish session (${appAuthRes.status})`)
      }

      // Refresh authentication state to reflect the new login
      await refreshAuth()
      
      const dest = getSafeReturnTo(searchParams?.get('returnTo'))
      router.replace(dest)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const baseUrl = getServerBaseUrl()

      // 1) POST /auth/register -> get access token
      const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: fullName, email, password, provider: 'Email' })
      })
      if (!registerRes.ok) {
        const err = await safeJson(registerRes)
        throw new Error(err?.error || err?.message || `Register failed (${registerRes.status})`)
      }
      const regData = await registerRes.json() as any
      const token: string | undefined = extractAccessToken(regData)
      if (!token) throw new Error('No access token returned from server')

      // 2) GET /users/self to get user id
      const selfRes = await fetch(`${baseUrl}/users/self`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
      if (!selfRes.ok) {
        const err = await safeJson(selfRes)
        throw new Error(err?.error || err?.message || `Failed to fetch profile (${selfRes.status})`)
      }
      const selfData = await selfRes.json() as any
      const id = selfData?.id || selfData?.user?.id || selfData?.data?.id
      if (!id) throw new Error('Could not determine user id from profile')

      // 3) POST to our API to establish app cookies
      const appAuthRes = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id, token })
      })
      if (!appAuthRes.ok) {
        const err = await safeJson(appAuthRes)
        throw new Error(err?.error || err?.message || `Failed to establish session (${appAuthRes.status})`)
      }

      // Refresh authentication state to reflect the new registration
      await refreshAuth()
      
      const dest = getSafeReturnTo(searchParams?.get('returnTo'))
      router.replace(dest)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Register failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>Checking authentication...</div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-xl shadow rounded-lg p-6 space-y-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {mode === 'login' ? 'Use your credentials to access the Playground.' : 'Register to start your learning journey.'}
            </p>
          </div>
          {mode === 'register' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null) }}
              className="text-sm hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Back
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="rounded border px-3 py-2 text-sm" style={{ 
            borderColor: 'var(--color-error)', 
            backgroundColor: 'var(--color-error)', 
            color: 'var(--text-inverse)'
          }}>
            {errorMessage}
          </div>
        )}

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLoginWithEmail} className="space-y-3">
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email and password</div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Email</label>
                <input
                  type="email"
                  className="w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Password</label>
                <input
                  type="password"
                  className="w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded py-2 text-sm font-medium disabled:opacity-60"
                style={{ 
                  backgroundColor: 'var(--color-primary-500)', 
                  color: 'var(--text-inverse)'
                }}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null) }}
                className="w-full rounded py-2 text-sm font-medium"
                style={{ 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                Create an account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Register with email</div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Full name</label>
              <input
                type="text"
                className="w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Email</label>
              <input
                type="email"
                className="w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Password</label>
              <input
                type="password"
                className="w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded py-2 text-sm font-medium disabled:opacity-60"
              style={{ 
                backgroundColor: 'var(--color-secondary-500)', 
                color: 'var(--text-inverse)'
              }}
            >
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>Loading…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}

async function safeJson(res: Response) {
  try { return await res.json() } catch { return null }
}

function extractAccessToken(data: any): string | undefined {
  if (!data) return undefined
  // Common shapes
  if (data.access?.token) return data.access.token
  if (data.tokens?.access?.token) return data.tokens.access.token
  if (data.accessToken) return data.accessToken
  if (data.access_token) return data.access_token
  if (data.token) return data.token
  // Nested under data
  const nested = data.data
  if (nested?.access?.token) return nested.access.token
  if (nested?.tokens?.access?.token) return nested.tokens.access.token
  if (nested?.accessToken) return nested.accessToken
  if (nested?.access_token) return nested.access_token
  return undefined
}

function getSafeReturnTo(returnTo: string | null | undefined): string {
  if (!returnTo) return '/'
  try {
    const url = new URL(returnTo, 'http://localhost')
    const path = url.pathname + (url.search || '') + (url.hash || '')
    if (path.startsWith('/')) return path
  } catch {
    // ignore
  }
  if (returnTo.startsWith('/')) return returnTo
  return '/'
}
