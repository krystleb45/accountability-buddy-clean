// components/debug/EnvTest.tsx
// Temporary component to verify your environment variables
// Remove this after confirming everything works

'use client'

export default function EnvTest() {
  const envVars = {
    'Base URL': process.env.NEXT_PUBLIC_BASE_URL,
    'API URL': process.env.NEXT_PUBLIC_API_URL,
    'Stripe Key (first 20 chars)': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
    'Alternative Stripe Key': process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.substring(0, 20) + '...',
    'NextAuth URL': process.env.NEXTAUTH_URL,
    'App Name': process.env.NEXT_PUBLIC_APP_NAME,
  }

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/plans`)
      const status = response.ok ? '✅ Connected' : `❌ Error: ${response.status}`
      alert(`API Connection Test: ${status}`)
    } catch (error) {
      alert(`❌ API Connection Failed: ${error}`)
    }
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Environment Variables Test</h2>

      <div className="space-y-2 mb-6">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key}:</span>
            <span className={value ? 'text-green-400' : 'text-red-400'}>
              {value || 'Not set'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={testApiConnection}
        className="bg-kelly-green text-black px-4 py-2 rounded hover:bg-opacity-80"
      >
        Test API Connection
      </button>

      <div className="mt-4 text-sm text-gray-400">
        <p>🔧 Remove this component before production deployment</p>
        <p>📍 Add to any page temporarily: {`<EnvTest />`}</p>
      </div>
    </div>
  )
}
