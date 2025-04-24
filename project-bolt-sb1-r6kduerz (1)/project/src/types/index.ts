export type PoliticalLeaning = 'conservative' | 'liberal' | 'moderate' | 'libertarian' | 'green' | 'unspecified';

export type WordCount = 50 | 100 | 250 | 500;

export type Topic = 
  | 'Economy' 
  | 'Foreign Policy' 
  | 'Environment' 
  | 'Healthcare' 
  | 'Education' 
  | 'Immigration' 
  | 'Civil Rights'
  | 'Technology'
  | 'Defense'
  | 'Infrastructure';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  politicalLeaning: PoliticalLeaning;
  savedArticles: string[];
  likedArticles: string[];
  surveyCompleted: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  publishedDate: Date;
  topics: Topic[];
  wordCount: WordCount;
  imageUrl?: string;
  likes: number;
  shares: number;
  politicalLeaning: PoliticalLeaning;
}