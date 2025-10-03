import { useAuth } from "@/context/auth/auth-context"

export function useProfile() {
  const { user, loading } = useAuth()

  return {
    profile: user
      ? {
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          interests: user.interests,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          location: user.location,
          timezone: user.timezone,
        }
      : undefined,
    isLoading: loading,
  }
}
