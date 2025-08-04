export interface Friend {
  _id: string
  name: string
  email: string // ✅ Add this line
  profilePicture?: string
  online?: boolean

  // Optional raw API fields
  id?: string
  avatar?: string
}

export interface FriendRequest {
  _id: string
  sender: {
    _id: string
    name: string
    email: string // ✅ Add this line
    profilePicture?: string
  }
}
