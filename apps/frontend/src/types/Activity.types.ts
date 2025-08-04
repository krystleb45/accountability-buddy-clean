// src/types/Activity.types.ts
export interface RecentActivity {
  _id: string
  activityType: string
  details: string
  createdAt: string
}
// src/types/Activity.types.ts
export interface RelatedActivity {
  _id: string
  title: string
  link: string
}
