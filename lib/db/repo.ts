import { PostData, PostStatus, PostType, UserRecord, MediaRecord } from './types';
import { seedPosts, seedUsers } from './seed-data';
import { Fixture } from '../football/types';

class DataRepository {
  private posts: Map<string, PostData>;
  private users: Map<string, UserRecord>;
  private media: MediaRecord[];
  private standingsOverrides: Map<string, any>;

  constructor() {
    this.posts = new Map();
    this.users = new Map();
    this.media = [];
    this.standingsOverrides = new Map();

    // Initialize with seed data
    for (const post of seedPosts) {
      this.posts.set(post.id, post);
    }
    for (const user of seedUsers) {
      this.users.set(user.email.toLowerCase(), user);
    }

    // Default media items
    this.media = [
      {
        id: 'med-1',
        filename: 'kings-arena-stadium.jpg',
        url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 420000,
        uploadedById: 'user-admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'med-2',
        filename: 'etihad-matchday.jpg',
        url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 512000,
        uploadedById: 'user-editor',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'med-3',
        filename: 'bernabeu-lights.jpg',
        url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 630000,
        uploadedById: 'user-admin',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Posts Methods
  async getPosts(options: {
    type?: PostType;
    status?: PostStatus;
    category?: string;
    leagueTag?: string;
    language?: 'bn' | 'en';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: PostData[]; total: number }> {
    let list = Array.from(this.posts.values());

    if (options.status) {
      list = list.filter((p) => p.status === options.status);
    } else {
      // By default for public feed, show PUBLISHED
      list = list.filter((p) => p.status === 'PUBLISHED');
    }

    if (options.type) {
      list = list.filter((p) => p.type === options.type);
    }

    if (options.category && options.category !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options.leagueTag && options.leagueTag !== 'ALL') {
      list = list.filter((p) => p.leagueTag.toLowerCase() === options.leagueTag?.toLowerCase());
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter((p) => {
        const bnTitle = p.translations.bn?.title?.toLowerCase() || '';
        const enTitle = p.translations.en?.title?.toLowerCase() || '';
        const bnTags = (p.translations.bn?.tags || []).join(' ').toLowerCase();
        const enTags = (p.translations.en?.tags || []).join(' ').toLowerCase();
        return bnTitle.includes(q) || enTitle.includes(q) || bnTags.includes(q) || enTags.includes(q);
      });
    }

    // Sort by publishedAt desc, fallback to createdAt
    list.sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    const total = list.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { posts: paginated, total };
  }

  async getAllPostsAdmin(): Promise<PostData[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getPostBySlug(slug: string): Promise<PostData | null> {
    for (const post of Array.from(this.posts.values())) {
      if (post.slug === slug) return post;
    }
    return null;
  }

  async getPostById(id: string): Promise<PostData | null> {
    return this.posts.get(id) || null;
  }

  async createPost(data: Omit<PostData, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<PostData> {
    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newPost: PostData = {
      ...data,
      id,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async updatePost(id: string, updates: Partial<PostData>): Promise<PostData | null> {
    const existing = this.posts.get(id);
    if (!existing) return null;

    const updated: PostData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementViewCount(slug: string): Promise<void> {
    const post = await this.getPostBySlug(slug);
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
    }
  }

  // Auth & User Methods
  async getUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async getAllUsers(): Promise<UserRecord[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.email.toLowerCase(), user);
    return user;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    for (const [key, user] of this.users.entries()) {
      if (user.id === id) {
        const updated: UserRecord = { ...user, ...updates };
        this.users.set(key, updated);
        return updated;
      }
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    for (const [key, user] of this.users.entries()) {
      if (user.id === id) {
        return this.users.delete(key);
      }
    }
    return false;
  }

  // Media Methods
  async getMedia(): Promise<MediaRecord[]> {
    return this.media;
  }

  async addMedia(item: Omit<MediaRecord, 'id' | 'createdAt'>): Promise<MediaRecord> {
    const newMedia: MediaRecord = {
      ...item,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.media.unshift(newMedia);
    return newMedia;
  }

  // Standings Override Methods
  async getStandingsOverrides(leagueId: string): Promise<any | null> {
    return this.standingsOverrides.get(leagueId.toLowerCase()) || null;
  }

  async saveStandingsOverride(leagueId: string, data: any): Promise<void> {
    this.standingsOverrides.set(leagueId.toLowerCase(), data);
  }

  // Auto-Match-Report Draft Generator Workflow
  async generateMatchReportDraft(match: Fixture, authorId: string = 'user-editor'): Promise<PostData> {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const competition = match.competition;

    const slug = `match-report-${home.toLowerCase().replace(/\s+/g, '-')}-vs-${away.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const eventsTextBn = (match.events || [])
      .map((e) => `* ${e.minute}': ${e.type === 'GOAL' ? '⚽ গোল' : e.type} — ${e.player} (${e.team === 'home' ? home : away})`)
      .join('\n');

    const eventsTextEn = (match.events || [])
      .map((e) => `* ${e.minute}': ${e.type === 'GOAL' ? '⚽ GOAL' : e.type} — ${e.player} (${e.team === 'home' ? home : away})`)
      .join('\n');

    const draft: Omit<PostData, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'> = {
      slug,
      type: 'ARTICLE',
      status: 'DRAFT', // Must be reviewed by editor before publishing
      category: 'MATCH_REPORTS',
      leagueTag: match.leagueId.toUpperCase(),
      featuredImage: match.homeTeam.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      authorId,
      authorName: 'অটো রিপোর্টার (AI Match Bot)',
      translations: {
        bn: {
          language: 'bn',
          title: `ম্যাচ রিপোর্ট: ${home} ${homeScore} - ${awayScore} ${away}`,
          excerpt: `${competition}-এ শেষ হলো টানটান উত্তেজনার ম্যাচ। ${home} ও ${away}-এর লড়াইয়ে ফলাফল ${homeScore}-${awayScore}।`,
          content: `
## মাঠের উত্তেজনা ও ফলাফল

${competition}-এর হাইভোল্টেজ ম্যাচে মুখোমুখি হয়েছিল ${home} এবং ${away}। নির্ধারিত ৯০ মিনিটের রোমাঞ্চকর লড়াই শেষে ম্যাচটির ফলাফল দাঁড়ায় **${homeScore} - ${awayScore}**।

### মূল ঘটনাবলী
${eventsTextBn || 'ম্যাচে কোনো উল্লেখযোগ্য কার্ড বা গোল নথিভুক্ত হয়নি।'}

### পরিসংখ্যান
* **বল দখল:** ${home} ${match.stats?.possession[0] || 50}% — ${away} ${match.stats?.possession[1] || 50}%
* **মোট শট:** ${match.stats?.shots[0] || 0} — ${match.stats?.shots[1] || 0}
* **টার্গেটে শট:** ${match.stats?.shotsOnTarget[0] || 0} — ${match.stats?.shotsOnTarget[1] || 0}

*(এই ড্রাফটটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে। অনুগ্রহ করে সম্পাদনা ও অনুমোদন করুন)*
          `,
          seoTitle: `${home} ${homeScore}-${awayScore} ${away}: ম্যাচ রিপোর্ট | গোলবাংলা`,
          seoDescription: `${home} বনাম ${away} ম্যাচের পূর্ণাঙ্গ স্কোর ও পরিসংখ্যান।`,
          tags: [home, away, competition, 'ম্যাচ রিপোর্ট'],
        },
        en: {
          language: 'en',
          title: `Match Report: ${home} ${homeScore} - ${awayScore} ${away}`,
          excerpt: `Full-time whistle blows in ${competition} as ${home} and ${away} finish ${homeScore}-${awayScore}.`,
          content: `
## Match Summary & Tactical Overview

A competitive encounter in the ${competition} saw ${home} take on ${away}. Following an eventful ninety minutes, the scoreline ended **${homeScore} - ${awayScore}**.

### Match Key Timeline
${eventsTextEn || 'No key events recorded.'}

### Statistics
* **Possession:** ${home} ${match.stats?.possession[0] || 50}% — ${away} ${match.stats?.possession[1] || 50}%
* **Total Shots:** ${match.stats?.shots[0] || 0} — ${match.stats?.shots[1] || 0}
* **Shots on Target:** ${match.stats?.shotsOnTarget[0] || 0} — ${match.stats?.shotsOnTarget[1] || 0}

*(Auto-drafted by GoalBangla Match Bot. Please review and approve before publishing)*
          `,
          seoTitle: `${home} ${homeScore}-${awayScore} ${away}: Full-Time Report | GoalBangla`,
          seoDescription: `Full match report and key numbers from ${home} vs ${away}.`,
          tags: [home, away, competition, 'Match Report'],
        },
      },
    };

    return await this.createPost(draft);
  }
}

// Global repository singleton
export const repo = new DataRepository();