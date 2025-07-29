// src/app/settings/page.client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '@/components/Settings/Settings.module.css'
import {
  fetchSettings,
  saveSettings,
  changePassword,
  deleteAccount,
  UserSettings,
} from '@/api/settings/settingsApi'

export default function SettingsClient() {
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false, // you can keep or drop this
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const fetched = await fetchSettings()
        if (fetched) setSettings(fetched)
      } catch {
        setMsg('Failed to load settings.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSavePrefs = async () => {
    setSaving(true)
    try {
      const updated = await saveSettings(settings)
      if (updated) {
        setSettings(updated)
        setMsg('Preferences saved.')
      } else {
        setMsg('Failed to save preferences.')
      }
    } catch {
      setMsg('Error saving preferences.')
    } finally {
      setSaving(false)
    }
  }

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')

  const handleChangePassword = async () => {
    const ok = await changePassword(currentPw, newPw)
    setMsg(ok ? 'Password changed.' : 'Password change failed.')
    setCurrentPw('')
    setNewPw('')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return
    const ok = await deleteAccount()
    if (ok) {
      alert('Account deleted.')
      window.location.href = '/'
    } else {
      setMsg('Failed to delete account.')
    }
  }

  if (loading) {
    return <p className="p-6 text-center text-gray-300">Loading…</p>
  }

  return (
    <div className={styles.settingsContainer}>
      {/* Back link */}
      <nav className="mb-6">
        <Link href="/dashboard" className="text-kelly-green hover:underline">
          ← Back to Dashboard
        </Link>
      </nav>

      {msg && <div className="mb-4 text-center text-green-400">{msg}</div>}

      {/* Notification Preferences */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Notification Preferences</h2>
        <label className="block mb-2 text-white">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={() =>
              setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
            }
            className="mr-2"
          />
          Email Notifications
        </label>
        <label className="block mb-4 text-white">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={() =>
              setSettings({ ...settings, smsNotifications: !settings.smsNotifications })
            }
            className="mr-2"
          />
          SMS Notifications
        </label>
        <button
          onClick={handleSavePrefs}
          disabled={saving}
          className="px-6 py-2 bg-green-500 text-black rounded"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </section>

      {/* Change Password */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Change Password</h2>
        <input
          type="password"
          placeholder="Current password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className="block w-full mb-2 p-2 bg-gray-800 text-white rounded"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="block w-full mb-4 p-2 bg-gray-800 text-white rounded"
        />
        <button onClick={handleChangePassword} className="px-6 py-2 bg-blue-500 text-white rounded">
          Change Password
        </button>
      </section>

      {/* Danger Zone */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-red-400">Danger Zone</h2>
        <button
          onClick={handleDelete}
          className="px-6 py-2 bg-red-600 text-white rounded"
        >
          Delete My Account
        </button>
      </section>
    </div>
  )
}
