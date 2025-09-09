import { useAuth } from "@/context/auth/auth-context"

export function useProfile() {
  const { user, loading } = useAuth()

  return {
    profile: user
      ? {
          username: user.username,
          email: user.email,
          bio: user.bio,
          interests: user.interests,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
        }
      : undefined,
    isLoading: loading,
  }
}
