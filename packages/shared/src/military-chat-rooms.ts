export const VALID_ROOMS = [
  "veterans-support",
  "active-duty",
  "family-members",
] as const

export const ROOM_DETAILS: Record<
  (typeof VALID_ROOMS)[number],
  { name: string; description: string; icon: string }
> = {
  "veterans-support": {
    name: "Veterans Support",
    description:
      "Connect with fellow veterans for peer support and shared experiences",
    icon: "🎖️",
  },
  "active-duty": {
    name: "Active Duty",
    description: "Support for currently serving military personnel",
    icon: "⚡",
  },
  "family-members": {
    name: "Family Members",
    description: "Support for military families and loved ones",
    icon: "👥",
  },
}
