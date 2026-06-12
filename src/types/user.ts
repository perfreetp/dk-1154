export interface User {
  id: string;
  name: string;
  avatar: string;
  college: string;
  major: string;
  grade: string;
  skills: string[];
  bio: string;
  availableHours: number;
  works: Work[];
  rating: number;
  reviewCount: number;
  isFollowing: boolean;
}

export interface Work {
  id: string;
  title: string;
  url: string;
  description: string;
  coverImage: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  projectId: string;
  projectName: string;
  rating: number;
  content: string;
  createdAt: string;
}
