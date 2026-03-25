export interface FeedResponse {
  feed: FeedItem[];
}

export interface FeedItem {
  name: string;
  postId: string;
  category: string | null;
  publisher: string;
  publisherId: string;
  publishedAt: string;
  expireAt: string;
  campaignType: string;
  truncateText: boolean;
  data: FeedData;
}

export interface FeedData {
  cta: CTA[];
  title: string;
  body: string;
  media: Media[];
  reactions: Reaction[];
}

export interface CTA {
  type: string;
  ctaText: string;
  ctaUrl: string;
  logoUrl?: string;
  meta: CTAMeta;
}

export interface CTAMeta {
  bseScriptCode?: string;
  nseScriptCode?: string;
}

export interface Media {
  type: string;
  url: string;
}

export interface Reaction {
  type: string;
  count: number;
  active: boolean;
}
