/* eslint-disable no-alert */
// components/debug/EnvTest.tsx
// Temporary component to verify your environment variables
// Remove this after confirming everything works

"use client"

export default function EnvTest() {
  const envVars = {
    "Base URL": process.env.NEXT_PUBLIC_BASE_URL,
    "API URL": process.env.NEXT_PUBLIC_API_URL,
    "NextAuth URL": process.env.NEXTAUTH_URL,
    "App Name": process.env.NEXT_PUBLIC_APP_NAME,
  }

  const testApiConnection = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/plans`,
      )
      const status = response.ok
        ? "✅ Connected"
        : `❌ Error: ${response.status}`
      alert(`API Connection Test: ${status}`)
    } catch (error) {
      alert(`❌ API Connection Failed: ${error}`)
    }
  }

  return (
    <div className="max-w-2xl rounded-lg bg-gray-900 p-6 text-white">
      <h2 className="mb-4 text-xl font-bold">Environment Variables Test</h2>

      <div className="mb-6 space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key}:</span>
            <span className={value ? "text-green-400" : "text-red-400"}>
              {value || "Not set"}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={testApiConnection}
        className={`
          rounded bg-primary px-4 py-2 text-black
          hover:bg-primary/80
        `}
        type="button"
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
