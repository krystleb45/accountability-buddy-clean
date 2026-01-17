"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, SettingsIcon, XCircle } from "lucide-react"
import Link from "next/link"

import { fetchSettings } from "@/api/settings/settings-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DeleteAccountCard } from "@/components/settings/delete-account-card"
import { NotificationPrefsForm } from "@/components/settings/notification-prefs-form"
import { PasswordChangeForm } from "@/components/settings/password-change-form"
import { ProfileVisibilityForm } from "@/components/settings/profile-visibility-form"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth/auth-context"
import { BlockedUsersCard } from "@/components/settings/blocked-users-card"
import { NewsletterSettingsCard } from "@/components/settings/newsletter-settings-card"

export default function SettingsClient() {
  const { loading } = useAuth()

  const {
    data: settingsData,
    isPending: isLoadingSettings,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    enabled: !loading,
  })

  if (loading || isLoadingSettings) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading your settings.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!settingsData) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-muted-foreground">No settings found.</p>
      </div>
    )
  }

  const { settings, phoneNumber } = settingsData

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/dashboard">
          <ArrowLeft /> Back to Dashboard
        </Link>
      </Button>

      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <SettingsIcon size={36} className="text-primary" /> Your Settings
      </h1>

      <NotificationPrefsForm 
        currentPrefs={settings.notifications} 
        phoneNumber={phoneNumber}
      />

      <ProfileVisibilityForm
        currentPrefs={settings.privacy?.profileVisibility}
      />

      <BlockedUsersCard />
      
      <NewsletterSettingsCard />

      <PasswordChangeForm />

      {/* Danger Zone */}
      <DeleteAccountCard />
    </main>
  )
}
