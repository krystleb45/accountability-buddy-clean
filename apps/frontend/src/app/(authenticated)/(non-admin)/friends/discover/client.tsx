"use client"

import type { Category } from "@ab/shared/categories"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ActivityIcon,
  ArrowLeft,
  GoalIcon,
  Handshake,
  MessageSquareText,
  SearchIcon,
  UserPlus,
  Users2,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import type { UserRecommendation } from "@/api/friends/friend-api"

import {
  fetchFriendSuggestions,
  sendFriendRequest,
} from "@/api/friends/friend-api"
import { CategoryFilterButton } from "@/components/category-filter-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCategoriesWithCount } from "@/lib/categories"

export function DiscoverClient() {
  const { status } = useSession()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<
    UserRecommendation["category"] | "all"
  >("all")
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(
    () => new Set(),
  )

  const {
    data: suggestions,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: fetchFriendSuggestions,
    enabled: status === "authenticated",
  })

  const queryClient = useQueryClient()

  const { mutate: sendRequest } = useMutation({
    mutationFn: (recipientId: string) => sendFriendRequest(recipientId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] })
      toast.success("Friend request sent!")
    },
    onError: (error) => {
      toast.error("Error sending friend request", {
        description: error.message,
      })
    },
    onSettled: (_, _e, recipientId) => {
      setSendingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(recipientId)
        return newSet
      })
    },
  })

  const handleSendRequest = async (recipientId: string) => {
    if (sendingRequests.has(recipientId)) {
      return
    }

    setSendingRequests((prev) => new Set(prev).add(recipientId))
    sendRequest(recipientId)
  }

  if (isLoading) {
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
          <p className="mb-2">There was an error loading friend suggestions.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  const categories = getCategoriesWithCount({
    all: suggestions?.length || 0,
    fitness: suggestions?.filter((s) => s.category === "fitness").length || 0,
    study: suggestions?.filter((s) => s.category === "study").length || 0,
    career: suggestions?.filter((s) => s.category === "career").length || 0,
    lifestyle:
      suggestions?.filter((s) => s.category === "lifestyle").length || 0,
    creative: suggestions?.filter((s) => s.category === "creative").length || 0,
    tech: suggestions?.filter((s) => s.category === "tech").length || 0,
  })

  // Apply filters
  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.interests?.some((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    const matchesCategory =
      selectedCategory === "all" || s.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <main className="flex min-h-screen flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/friends">
          <ArrowLeft /> Back to Friends
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <SearchIcon size={36} className="text-primary" /> Discover New Friends
        </h1>
        <p className="text-muted-foreground">
          Find accountability partners who share your goals and interests
        </p>
      </div>

      {/* Search */}
      <div>
        <div className="relative w-full max-w-md">
          <SearchIcon
            className={`
              absolute top-1/2 left-3 size-4 -translate-y-1/2
              text-muted-foreground
            `}
          />
          <Input
            type="search"
            placeholder="Search for people, interests..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div
        className={`
          flex gap-4 overflow-x-auto
          md:flex-wrap md:overflow-x-hidden
        `}
      >
        {categories.map((category) => (
          <CategoryFilterButton
            key={category.id}
            category={category}
            onClick={(id) => setSelectedCategory(id as Category | "all")}
            isSelected={selectedCategory === category.id}
            label="people"
          />
        ))}
      </div>

      {/* People Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-primary">
          {selectedCategory === "all"
            ? "All Suggestions"
            : `${categories.find((c) => c.id === selectedCategory)?.label} Enthusiasts`}{" "}
          <small className="font-mono">({filteredSuggestions.length})</small>
        </h2>

        {filteredSuggestions.length === 0 ? (
          <div className="py-12 text-center">
            <Users2 className="mx-auto mb-4 size-16 text-muted-foreground" />
            <p className="mb-2 text-xl">
              {suggestions.length === 0
                ? "No suggestions available"
                : "No people match your search"}
            </p>
            <p className="text-muted-foreground">
              {suggestions.length === 0
                ? "Check back later for new suggestions!"
                : "Try a different search term or category"}
            </p>
          </div>
        ) : (
          <div
            className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
              lg:grid-cols-3
            `}
          >
            {filteredSuggestions.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <UserAvatar
                    userId={person.id}
                    src={person.profileImage}
                    alt={person.name}
                    status={person.activeStatus}
                    size="lg"
                    containerClassName="mx-auto"
                  />
                  <CardHeader>
                    <CardTitle>{person.name}</CardTitle>
                    <CardDescription>@{person.username}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Mutual Friends */}
                    {!!person.mutualFriends && person.mutualFriends > 0 && (
                      <p className="mb-3 text-sm font-medium text-primary">
                        {person.mutualFriends} mutual friend
                        {person.mutualFriends !== 1 ? "s" : ""}
                      </p>
                    )}

                    {/* Interest Tags */}
                    {!!person.interests.length && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {person.interests.slice(0, 2).map((interest) => (
                          <Badge
                            key={interest}
                            variant="outline"
                            className="text-sm"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {person.interests.length > 2 && (
                          <Badge variant="secondary" className="text-sm">
                            +{person.interests.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter
                    className={`
                      mt-auto gap-4
                      *:flex-1
                    `}
                  >
                    <Button variant="secondary" asChild>
                      <Link href={`/member/${person.username}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSendRequest(person.id)}
                      disabled={sendingRequests.has(person.id)}
                    >
                      <UserPlus />
                      {sendingRequests.has(person.id)
                        ? "Sending..."
                        : "Add Friend"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <Card className="mt-auto">
        <CardHeader>
          <CardTitle>Tips for Building Your Network</CardTitle>
        </CardHeader>
        <CardContent
          className={`
            grid grid-cols-1 gap-4 text-sm
            *:flex *:items-center *:gap-3
            md:grid-cols-2
            [&_p]:text-pretty [&_p]:text-muted-foreground
          `}
        >
          <div>
            <ActivityIcon className="text-primary" />
            <div>
              <h4 className="font-medium">Be Active</h4>
              <p>
                Regularly update your goals and progress to attract like-minded
                people.
              </p>
            </div>
          </div>
          <div>
            <GoalIcon className="text-primary" />
            <div>
              <h4 className="font-medium">Share Goals</h4>
              <p>
                Make some of your goals public to connect with people who share
                similar interests.
              </p>
            </div>
          </div>
          <div>
            <MessageSquareText className="text-primary" />
            <div>
              <h4 className="font-medium">Engage</h4>
              <p>
                Join group conversations and support others in their journeys.
              </p>
            </div>
          </div>
          <div>
            <Handshake className="text-primary" />
            <div>
              <h4 className="font-medium">Be Supportive</h4>
              <p>Offer encouragement and celebrate others' achievements.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
