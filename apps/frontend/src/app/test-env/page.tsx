// pages/test-env.tsx or app/test-env/page.tsx
// Temporary page to test your environment setup
// Remove after confirming everything works

'use client'

import { useState } from 'react'

export default function TestEnvPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    // Test 1: Environment variables
    results.envVars = {
      'API URL': process.env.NEXT_PUBLIC_API_URL,
      'Base URL': process.env.NEXT_PUBLIC_BASE_URL,
      'Stripe Key': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set ✅' : 'Not set ❌',
      'NextAuth URL': process.env.NEXTAUTH_URL,
    }

    // Test 2: Direct backend connection
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/plans`)
      results.directBackend = {
        status: backendResponse.status,
        ok: backendResponse.ok,
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/plans`
      }
    } catch (error: any) {
      results.directBackend = { error: error.message }
    }

    // Test 3: Next.js API proxy
    try {
      const proxyResponse = await fetch('/api/subscription/plans')
      results.nextjsProxy = {
        status: proxyResponse.status,
        ok: proxyResponse.ok,
        url: '/api/subscription/plans'
      }
    } catch (error: any) {
      results.nextjsProxy = { error: error.message }
    }

    // Test 4: Subscription hook
    try {
      // This tests if your useSubscription hook can make API calls
      const hookTestResponse = await fetch('/api/subscription/status')
      results.subscriptionHook = {
        status: hookTestResponse.status,
        ok: hookTestResponse.ok,
        needsAuth: hookTestResponse.status === 401
      }
    } catch (error: any) {
      results.subscriptionHook = { error: error.message }
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Development Environment Test</h1>

        <button
          onClick={runTests}
          disabled={loading}
          className="bg-kelly-green text-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-80 disabled:opacity-50 mb-6"
        >
          {loading ? 'Running Tests...' : 'Run Environment Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {/* Environment Variables */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">📋 Environment Variables</h2>
              <div className="space-y-2">
                {Object.entries(testResults.envVars || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="text-green-400">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Backend Test */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">🔗 Direct Backend Connection</h2>
              <div className="text-sm">
                <p><strong>URL:</strong> {testResults.directBackend?.url}</p>
                <p><strong>Status:</strong>
                  <span className={testResults.directBackend?.ok ? 'text-green-400' : 'text-red-400'}>
                    {testResults.directBackend?.status || testResults.directBackend?.error}
                  </span>
                </p>
              </div>
            </div>

            {/* Next.js API Proxy Test */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">⚡ Next.js API Proxy</h2>
              <div className="text-sm">
                <p><strong>URL:</strong> {testResults.nextjsProxy?.url}</p>
                <p><strong>Status:</strong>
                  <span className={testResults.nextjsProxy?.ok ? 'text-green-400' : 'text-red-400'}>
                    {testResults.nextjsProxy?.status || testResults.nextjsProxy?.error}
                  </span>
                </p>
              </div>
            </div>

            {/* Subscription Hook Test */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">🎯 Subscription API</h2>
              <div className="text-sm">
                <p><strong>Status:</strong>
                  <span className={testResults.subscriptionHook?.needsAuth ? 'text-yellow-400' :
                              testResults.subscriptionHook?.ok ? 'text-green-400' : 'text-red-400'}>
                    {testResults.subscriptionHook?.needsAuth ? '401 (Needs Auth - Normal)' :
                     testResults.subscriptionHook?.status || testResults.subscriptionHook?.error}
                  </span>
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-kelly-green text-black rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">📊 Test Summary</h2>
              <div className="text-sm">
                {testResults.directBackend?.ok && testResults.nextjsProxy?.ok ? (
                  <p>✅ Your environment is configured correctly! Ready to test subscriptions.</p>
                ) : (
                  <p>❌ Some tests failed. Check your backend server and environment variables.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>🗑️ Delete this test page before production deployment</p>
          <p>📍 Access at: /test-env</p>
        </div>
      </div>
    </div>
  )
}
