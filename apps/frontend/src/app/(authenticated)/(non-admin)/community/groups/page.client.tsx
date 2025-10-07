"use client"

import type { Category } from "@ab/shared/categories"

import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Hexagon,
  PlusIcon,
  SearchIcon,
  Users2,
  XCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

import {
  fetchGroups,
  fetchMyGroups,
  fetchUserGroupInvitations,
} from "@/api/groups/group-api"
import { CategoryFilterButton } from "@/components/category-filter-button"
import { GroupCard } from "@/components/group/group-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getCategoriesWithCount } from "@/lib/categories"

function GroupsClient() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id as string

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all",
  )

  const {
    data: groups,
    isPending: isLoadingGroups,
    error: groupsError,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
  })

  const {
    data: myGroups,
    isPending: isLoadingMyGroups,
    error: myGroupsError,
  } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => fetchMyGroups(),
    enabled: !!userId,
  })

  const {
    data: userGroupInvitations,
    isPending: isLoadingUserGroupInvitations,
    error: userGroupInvitationsError,
  } = useQuery({
    queryKey: ["userGroupInvitations", userId],
    queryFn: () => fetchUserGroupInvitations(),
    enabled: !!userId,
  })

  const isLoading =
    status === "loading" ||
    isLoadingGroups ||
    isLoadingMyGroups ||
    isLoadingUserGroupInvitations
  const error = groupsError || myGroupsError || userGroupInvitationsError

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
          <p className="mb-2">There was an error loading the groups.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!groups || !myGroups) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-muted-foreground">No groups available.</p>
      </div>
    )
  }

  const categories = getCategoriesWithCount({
    all: groups.length,
    fitness: groups.filter((g) => g.category === "fitness").length,
    study: groups.filter((g) => g.category === "study").length,
    career: groups.filter((g) => g.category === "career").length,
    lifestyle: groups.filter((g) => g.category === "lifestyle").length,
    creative: groups.filter((g) => g.category === "creative").length,
    tech: groups.filter((g) => g.category === "tech").length,
  })

  // Apply filters
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesCategory =
      selectedCategory === "all" || group.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/community">
          <ArrowLeft /> Back to Community
        </Link>
      </Button>

      {/* Header */}
      <div
        className={`
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Hexagon size={36} className="text-primary" /> Groups
          </h1>
          <p className="text-muted-foreground">
            Join groups and connect with like-minded people
          </p>
        </div>
        <Button asChild>
          <Link href="/community/groups/create">
            <PlusIcon />
            Create Group
          </Link>
        </Button>
      </div>

      {/* My Groups Section */}
      {myGroups.length > 0 && (
        <>
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-primary">
              My Groups{" "}
              <small className="font-mono">({filteredGroups.length})</small>
            </h2>
            <div
              className={`
                grid grid-cols-1 gap-4
                md:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {myGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  isJoined={true}
                  smallVersion
                />
              ))}
            </div>
          </div>

          <Separator />
        </>
      )}

      <h2 className="text-2xl font-semibold text-primary">
        {selectedCategory === "all"
          ? "All Groups"
          : `${categories.find((c) => c.id === selectedCategory)?.label} Groups`}{" "}
        <small className="font-mono">({filteredGroups.length})</small>
      </h2>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <SearchIcon
          className={`
            absolute top-1/2 left-3 size-4 -translate-y-1/2
            text-muted-foreground
          `}
        />
        <Input
          type="search"
          placeholder="Search groups..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
            onClick={(categoryId) =>
              setSelectedCategory(categoryId as Category | "all")
            }
            isSelected={selectedCategory === category.id}
            label="groups"
          />
        ))}
      </div>

      {/* Groups Grid */}
      <div>
        {filteredGroups.length === 0 ? (
          <div className="py-12 text-center">
            <Users2 className="mx-auto mb-4 size-16 text-muted-foreground" />
            <p className="mb-2 text-xl">
              {filteredGroups.length === 0
                ? "No groups available"
                : "No groups match your search"}
            </p>
            <p className="text-muted-foreground">
              {filteredGroups.length === 0
                ? "Be the first to create one!"
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
            {filteredGroups.map((group, index) => {
              const isJoined = myGroups.some((g) => g._id === group._id)
              const isRequested = userGroupInvitations.some(
                (inv) =>
                  inv.groupId._id === group._id && inv.status === "pending",
              )
              const isRejected = userGroupInvitations.some(
                (inv) =>
                  inv.groupId._id === group._id && inv.status === "rejected",
              )

              return (
                <GroupCard
                  key={group._id}
                  group={group}
                  index={index}
                  isJoined={isJoined}
                  isRequested={isRequested}
                  isRejected={isRejected}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default GroupsClient
