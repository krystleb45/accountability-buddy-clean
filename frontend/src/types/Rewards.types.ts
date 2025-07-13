export interface Reward {
  _id?: string;       // now optional
  id: string;         // UI-always has this
  title: string;
  pointsRequired: number;
  imageUrl?: string;
  description?: string;
}
