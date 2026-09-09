export type Role = 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR';
export type PostType = 'ARTICLE' | 'VIDEO' | 'AUDIO' | 'GALLERY';
export type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED';

export interface PostTranslationData {
  id?: string;
  postId?: string;
  language: 'bn' | 'en';
  title: string;
  excerpt?: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
}

export interface GalleryImage {
  url: string;
  captionBn?: string;
  captionEn?: string;
}

export interface PostData {
  id: string;
  slug: string;
  type: PostType;
  status: PostStatus;
  category: string;
  leagueTag: string;
  featuredImage?: string;
  videoUrl?: string;
  videoTranscript?: string;
  audioUrl?: string;
  audioShowNotes?: string;
  galleryImages?: GalleryImage[];
  authorId: string;
  authorName?: string;
  scheduledPublishAt?: string;
  publishedAt?: string;
  viewCount: number;
  translations: Record<'bn' | 'en', PostTranslationData>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface MediaRecord {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  createdAt: string;
}