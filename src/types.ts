export type Category = 
  | 'World'
  | 'Business'
  | 'Markets'
  | 'Technology'
  | 'Politics'
  | 'Culture'
  | 'Lifestyle'
  | 'Analysis'
  | 'Opinion';

export type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'unpublished' | 'archived';

export type ArticlePlacement = 'hero' | 'featured' | 'breaking' | 'section' | 'normal';

export type WatermarkPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'center' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export type WatermarkSize = 'small' | 'medium' | 'large';

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  size: WatermarkSize;
  opacity: number;
  margin: number;
}

export interface ArticleImage {
  id: string;
  articleId?: string;
  originalFilename?: string;
  publicFilename?: string;
  filePath?: string;
  publicFilePath?: string;
  watermarkedFilePath?: string;
  thumbnailPath?: string;
  url: string;
  thumbnailUrl?: string;
  originalUploadTimestamp?: string;
  originalPublicationDate?: string;
  creator?: string;
  copyrightOwner?: string;
  copyrightStatus?: string;
  copyrightNotice?: string;
  copyright?: string;
  watermarkEnabled?: boolean;
  watermarkText?: string;
  watermarkPosition?: WatermarkPosition;
  watermarkOpacity?: number;
  caption: string;
  description: string;
  credit: string;
  altText: string;
  isFeatured: boolean;
  order: number;
  adminUploaderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleVideo {
  id: string;
  articleId?: string;
  videoUrl: string;
  videoTitle?: string;
  videoDescription?: string;
  videoCaption?: string;
  posterUrl?: string;
  creator?: string;
  copyrightOwner?: string;
  copyrightNotice?: string;
  isFeatured?: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId?: string;
  authorName: string;
  content: string;
  commentType?: 'real_user' | 'demo_seed' | 'seed';
  createdAt: string;
  likes: number;
  isSeed: boolean;
  isHidden: boolean;
  parentId?: string;
  replies?: Comment[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  author: string;
  authorId?: string;
  category: Category;
  categoryId?: string;
  tags: string[];
  status: ArticleStatus;
  placement: ArticlePlacement;
  images: ArticleImage[];
  videos?: ArticleVideo[];
  publishedAtDate: string; // YYYY-MM-DD
  publishedAtTime: string; // HH:MM
  scheduledAt?: string;
  timezone: string; // e.g. "EST", "UTC", "PST"
  displayDateTime: string; // Custom formatted label
  views: number;
  likes: number;
  commentCount: number;
  shares: number;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  comments?: Comment[];
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  username?: string;
  message?: string;
}

export type LegalDocType = 
  | 'copyright' 
  | 'terms' 
  | 'privacy' 
  | 'content-usage' 
  | 'image-usage' 
  | 'dmca' 
  | 'rights' 
  | 'contact';

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface SlugRedirect {
  id: string;
  oldSlug: string;
  newSlug: string;
  articleId: string;
  createdAt: string;
}

