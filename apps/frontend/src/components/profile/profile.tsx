"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CameraOff, Pencil, X } from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { updateProfile } from "@/api/profile/profile-api"
import { useProfile } from "@/hooks/use-profile"
import { useSubscription } from "@/hooks/useSubscription"

import { LoadingSpinner } from "../loading-spinner"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { AvatarCoverChangeDialog } from "./avatar-cover-change-dialog"
import { EditBioForm } from "./edit-bio-form"
import { EditInterestsForm } from "./edit-interests-form"

const MotionCard = motion.create(Card)

export function Profile() {
  const { isLoading } = useSubscription()

  const [editingBio, setEditingBio] = useState(false)
  const [editingInterests, setEditingInterests] = useState(false)

  const { profile } = useProfile()

  const queryClient = useQueryClient()
  const { mutate: updateInterests, isPending: isUpdatingInterests } =
    useMutation({
      mutationFn: async (interests?: string[]) => {
        return updateProfile({ interests })
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["me"] })
      },
      onError: (error) => {
        toast.error("Error updating interest", { description: error.message })
      },
    })

  const handleRemoveInterest = async (i: string) => {
    const updated = profile?.interests?.filter((interest) => interest !== i)
    updateInterests(updated)
  }

  if (isLoading) {
    return (
      <main className="flex h-64 w-full items-center justify-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <MotionCard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-hidden pt-0"
    >
      {/* Cover */}
      <div className="relative aspect-[5/1] min-h-52 w-full">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt="Cover"
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="size-full object-cover"
            priority
            key={profile.coverImage}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <div
              className={`
                flex flex-col items-center gap-2 text-muted-foreground
              `}
            >
              <CameraOff className="size-8" />
              <p>No Cover Image</p>
            </div>
          </div>
        )}
        <AvatarCoverChangeDialog type="cover">
          <Button
            variant="outline"
            size="sm"
            className="absolute right-6 bottom-6"
          >
            Change Cover
          </Button>
        </AvatarCoverChangeDialog>
      </div>

      {/* Avatar */}
      <CardHeader>
        <div className="flex items-center gap-4">
          <Image
            height={64}
            width={64}
            src={profile.profileImage || "/default-avatar.svg"}
            alt={profile.username || "Avatar"}
            className={`
              size-16 shrink-0 rounded-full border-2 border-background
              object-cover
            `}
            key={profile.profileImage}
          />
          <div>
            <CardTitle>{profile.username}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </div>
        </div>
        <CardAction className="row-span-1">
          <AvatarCoverChangeDialog type="avatar">
            <Button variant="outline">Change Avatar</Button>
          </AvatarCoverChangeDialog>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Bio */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-sm font-bold">Bio</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => setEditingBio((prev) => !prev)}
                  >
                    {editingBio ? (
                      <X className="size-4" />
                    ) : (
                      <Pencil className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {editingBio ? "Cancel" : "Edit Bio"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {editingBio ? (
            <EditBioForm
              currentBio={profile.bio}
              onCancel={() => setEditingBio(false)}
            />
          ) : profile.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="text-muted-foreground">No bio yet.</p>
          )}
        </section>

        {/* Interests */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-sm font-bold">Interests</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => setEditingInterests((prev) => !prev)}
                  >
                    {editingInterests ? (
                      <X className="size-4" />
                    ) : (
                      <Pencil className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {editingInterests ? "Cancel" : "Edit Interests"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {editingInterests ? (
            <EditInterestsForm
              currentInterests={profile.interests}
              onCancel={() => setEditingInterests(false)}
            />
          ) : profile.interests && profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className={`
                    text-sm
                    has-[button[disabled]]:opacity-50
                  `}
                >
                  {interest}{" "}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleRemoveInterest(interest)}
                    disabled={isUpdatingInterests}
                  >
                    <X />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No interests yet.</p>
          )}
        </section>

        {/* Achievements & Badges */}
        <section>
          <h2 className="mb-2 text-sm font-bold">Achievements & Badges</h2>
          {/* <FavoriteBadges /> */}
        </section>
      </CardContent>
    </MotionCard>
  )
}
