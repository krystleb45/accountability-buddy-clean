export interface Challenge {
  _id: string;
  title: string;
  description: string; // ✅ Make this required to match ChallengeCard
  goal: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'completed' | 'canceled';
  creator: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  participants: { user: string }[];
  rewards: { rewardType: string; rewardValue: string }[];
  visibility: 'public' | 'private';
  progressTracking: 'individual' | 'team' | 'both';
  createdAt: string;
  updatedAt: string;
}
