import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { PostData, PostStatus, PostType, UserRecord, MediaRecord } from './types';
import { seedPosts } from './seed-data';
import { Fixture } from '../football/types';
import { prisma } from './prisma';

const persistent = /^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '');
const iso = (value: Date | null | undefined) => value?.toISOString();

const DEFAULT_SUPER_ADMIN: UserRecord = {
  id: 'habibur-super-admin',
  name: 'Md Habibur Rahman Khan',
  username: 'habibur',
  email: 'habibur@goalbangla.com',
  passwordHash: '$2a$10$GreUKaxU6lwDKtvt4AI93O56DZeoAX5lMvFGIGbmYWy9sjoVHT81C', // Admin@123456
  role: 'ADMIN',
  displayTitle: 'Chief Editor & Super Admin',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function postData(post: any): PostData {
  const translations: any = {};
  for (const translation of post.translations || []) {
    translations[translation.language] = translation;
  }
  return {
    ...post,
    translations,
    galleryImages: post.galleryImages || undefined,
    featuredImage: post.featuredImage || undefined,
    authorName: post.authorName || undefined,
    authorTitle: post.authorTitle || undefined,
    scheduledPublishAt: iso(post.scheduledPublishAt),
    publishedAt: iso(post.publishedAt),
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function userData(user: any): UserRecord {
  return {
    ...user,
    username: user.username || undefined,
    displayTitle: user.displayTitle || undefined,
    avatarUrl: user.avatarUrl || undefined,
    verificationCodeHash: user.verificationCodeHash || undefined,
    verificationExpiresAt: iso(user.verificationExpiresAt),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
  };
}

interface LocalStoreData {
  posts: Record<string, PostData>;
  users: Record<string, UserRecord>;
  media: MediaRecord[];
  overrides: Record<string, any>;
}

class DataRepository {
  private storeFile: string;
  private posts = new Map<string, PostData>();
  private users = new Map<string, UserRecord>();
  private media: MediaRecord[] = [];
  private overrides = new Map<string, any>();
  private pgAvailable = true;

  constructor() {
    this.storeFile = path.join(process.cwd(), 'data', 'content-store.json');
    this.initStore();
  }

  private initStore() {
    try {
      const dataDir = path.dirname(this.storeFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.storeFile)) {
        const raw = fs.readFileSync(this.storeFile, 'utf8');
        const data: LocalStoreData = JSON.parse(raw);
        if (data.posts) {
          for (const [k, v] of Object.entries(data.posts)) this.posts.set(k, v);
        }
        if (data.users) {
          for (const [k, v] of Object.entries(data.users)) this.users.set(k, v);
        }
        if (data.media) this.media = data.media;
        if (data.overrides) {
          for (const [k, v] of Object.entries(data.overrides)) this.overrides.set(k, v);
        }
      }
    } catch (e) {
      console.warn('Could not read local content store, initializing defaults:', e);
    }

    // Ensure default Super Admin exists
    const hasAdmin = [...this.users.values()].some(
      (u) => u.role === 'ADMIN' || u.username === 'habibur' || u.email === 'habibur@goalbangla.com'
    );
    if (!hasAdmin) {
      this.users.set(DEFAULT_SUPER_ADMIN.id, DEFAULT_SUPER_ADMIN);
      this.saveStore();
    }

    // Ensure seed posts exist if no posts
    if (this.posts.size === 0) {
      for (const p of seedPosts) {
        this.posts.set(p.id, p);
      }
      this.saveStore();
    }
  }

  private saveStore() {
    try {
      const dataDir = path.dirname(this.storeFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const payload: LocalStoreData = {
        posts: Object.fromEntries(this.posts.entries()),
        users: Object.fromEntries(this.users.entries()),
        media: this.media,
        overrides: Object.fromEntries(this.overrides.entries()),
      };
      fs.writeFileSync(this.storeFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.warn('Could not save to local store file:', e);
    }
  }

  private memoryPosts(options: any = {}) {
    let list = [...this.posts.values()].filter(
      (p) => p.status === (options.status || 'PUBLISHED')
    );
    if (options.type) list = list.filter((p) => p.type === options.type);
    if (options.category && options.category !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase() === options.category.toLowerCase());
    }
    if (options.leagueTag && options.leagueTag !== 'ALL') {
      list = list.filter((p) => p.leagueTag.toLowerCase() === options.leagueTag.toLowerCase());
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter((p) =>
        Object.values(p.translations).some((t) =>
          `${t.title} ${t.excerpt || ''} ${(t.tags || []).join(' ')}`.toLowerCase().includes(q)
        )
      );
    }
    list.sort(
      (a, b) =>
        +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt)
    );
    const total = list.length;
    const offset = options.offset || 0;
    return { posts: list.slice(offset, offset + (options.limit || 50)), total };
  }

  async getPosts(
    options: {
      type?: PostType;
      status?: PostStatus;
      category?: string;
      leagueTag?: string;
      language?: 'bn' | 'en';
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    if (!persistent || !this.pgAvailable) return this.memoryPosts(options);

    try {
      const where: Prisma.PostWhereInput = { status: options.status || 'PUBLISHED' };
      if (options.type) where.type = options.type;
      if (options.category && options.category !== 'ALL') {
        where.category = { equals: options.category, mode: 'insensitive' };
      }
      if (options.leagueTag && options.leagueTag !== 'ALL') {
        where.leagueTag = { equals: options.leagueTag, mode: 'insensitive' };
      }
      if (options.search) {
        where.translations = { some: { title: { contains: options.search, mode: 'insensitive' } } };
      }

      const [rows, total] = await prisma.$transaction([
        prisma.post.findMany({
          where,
          include: { translations: true },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          skip: options.offset || 0,
          take: options.limit || 50,
        }),
        prisma.post.count({ where }),
      ]);

      if (!total && !options.search && (options.status || 'PUBLISHED') === 'PUBLISHED') {
        return this.memoryPosts(options);
      }
      return { posts: rows.map(postData), total };
    } catch (err: any) {
      console.warn('PostgreSQL query failed, falling back to persistent store:', err.message);
      return this.memoryPosts(options);
    }
  }

  async getAllPostsAdmin() {
    if (!persistent || !this.pgAvailable) {
      return [...this.posts.values()].sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
      );
    }
    try {
      const rows = await prisma.post.findMany({
        include: { translations: true },
        orderBy: { updatedAt: 'desc' },
      });
      if (rows.length === 0 && this.posts.size > 0) {
        return [...this.posts.values()].sort(
          (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
        );
      }
      return rows.map(postData);
    } catch (err: any) {
      console.warn('PostgreSQL getAllPostsAdmin failed, using local store:', err.message);
      return [...this.posts.values()].sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
      );
    }
  }

  async getPostBySlug(slug: string) {
    if (!persistent || !this.pgAvailable) {
      return [...this.posts.values()].find((p) => p.slug === slug) || null;
    }
    try {
      const row = await prisma.post.findUnique({
        where: { slug },
        include: { translations: true },
      });
      if (!row) {
        return [...this.posts.values()].find((p) => p.slug === slug) || null;
      }
      return postData(row);
    } catch (err: any) {
      return [...this.posts.values()].find((p) => p.slug === slug) || null;
    }
  }

  async getPostById(id: string) {
    if (!persistent || !this.pgAvailable) {
      return this.posts.get(id) || null;
    }
    try {
      const row = await prisma.post.findUnique({
        where: { id },
        include: { translations: true },
      });
      if (!row) return this.posts.get(id) || null;
      return postData(row);
    } catch (err: any) {
      return this.posts.get(id) || null;
    }
  }

  async createPost(data: Omit<PostData, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>) {
    const now = new Date().toISOString();
    const rowId = `post-${Date.now()}`;
    const localPost: PostData = {
      ...data,
      id: rowId,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Save locally first
    this.posts.set(rowId, localPost);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        const row = await prisma.post.create({
          data: {
            slug: data.slug,
            type: data.type,
            status: data.status,
            category: data.category,
            leagueTag: data.leagueTag,
            featuredImage: data.featuredImage,
            videoUrl: data.videoUrl,
            videoTranscript: data.videoTranscript,
            audioUrl: data.audioUrl,
            audioShowNotes: data.audioShowNotes,
            galleryImages: (data.galleryImages as any) || undefined,
            authorId: data.authorId,
            authorName: data.authorName,
            authorTitle: data.authorTitle,
            scheduledPublishAt: data.scheduledPublishAt ? new Date(data.scheduledPublishAt) : null,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            translations: {
              create: Object.values(data.translations).map((t) => ({
                language: t.language,
                title: t.title,
                excerpt: t.excerpt,
                content: t.content,
                seoTitle: t.seoTitle,
                seoDescription: t.seoDescription,
                tags: t.tags || [],
              })),
            },
          },
          include: { translations: true },
        });
        const converted = postData(row);
        this.posts.set(converted.id, converted);
        this.saveStore();
        return converted;
      } catch (err: any) {
        console.warn('Prisma createPost failed, stored in persistent local store:', err.message);
      }
    }

    return localPost;
  }

  async updatePost(id: string, updates: Partial<PostData>) {
    const old = this.posts.get(id);
    if (old) {
      const updatedLocal = { ...old, ...updates, updatedAt: new Date().toISOString() };
      this.posts.set(id, updatedLocal);
      this.saveStore();
    }

    if (persistent && this.pgAvailable) {
      try {
        const { translations, id: _id, createdAt, updatedAt, viewCount, ...data }: any = updates;
        for (const k of ['scheduledPublishAt', 'publishedAt']) {
          if (k in data) data[k] = data[k] ? new Date(data[k]) : null;
        }
        if ('galleryImages' in data && data.galleryImages === undefined) {
          data.galleryImages = Prisma.JsonNull;
        }
        if (translations) {
          data.translations = {
            upsert: Object.values(translations).map((t: any) => ({
              where: { postId_language: { postId: id, language: t.language } },
              create: {
                language: t.language,
                title: t.title,
                excerpt: t.excerpt,
                content: t.content,
                seoTitle: t.seoTitle,
                seoDescription: t.seoDescription,
                tags: t.tags || [],
              },
              update: {
                title: t.title,
                excerpt: t.excerpt,
                content: t.content,
                seoTitle: t.seoTitle,
                seoDescription: t.seoDescription,
                tags: t.tags || [],
              },
            })),
          };
        }
        const row = await prisma.post.update({
          where: { id },
          data,
          include: { translations: true },
        });
        const converted = postData(row);
        this.posts.set(converted.id, converted);
        this.saveStore();
        return converted;
      } catch (err: any) {
        console.warn('Prisma updatePost failed, stored in local store:', err.message);
      }
    }

    return this.posts.get(id) || null;
  }

  async deletePost(id: string) {
    const deletedLocal = this.posts.delete(id);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        await prisma.post.delete({ where: { id } });
      } catch (e) {
        // ignore
      }
    }
    return deletedLocal;
  }

  async incrementViewCount(slug: string) {
    const p = [...this.posts.values()].find((item) => item.slug === slug);
    if (p) {
      p.viewCount = (p.viewCount || 0) + 1;
      this.saveStore();
    }
    if (persistent && this.pgAvailable) {
      try {
        await prisma.post.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
      } catch (e) {
        // ignore
      }
    }
  }

  async hasUsers() {
    return (await this.getUserCount()) > 0;
  }

  async getUserCount() {
    if (persistent && this.pgAvailable) {
      try {
        const count = await prisma.user.count();
        if (count > 0) return count;
      } catch (e) {
        // fallback
      }
    }
    return this.users.size;
  }

  async getUserById(id: string) {
    if (persistent && this.pgAvailable) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) return userData(u);
      } catch (e) {
        // fallback
      }
    }
    return [...this.users.values()].find((u) => u.id === id) || null;
  }

  async getUserByEmail(email: string) {
    const norm = email.trim().toLowerCase();
    if (persistent && this.pgAvailable) {
      try {
        const u = await prisma.user.findUnique({ where: { email: norm } });
        if (u) return userData(u);
      } catch (e) {
        // fallback
      }
    }
    return [...this.users.values()].find((u) => u.email.toLowerCase() === norm) || null;
  }

  async getUserByUsername(username: string) {
    const norm = username.trim().toLowerCase();
    return [...this.users.values()].find((u) => (u.username || '').toLowerCase() === norm) || null;
  }

  async getUserByUsernameOrEmail(identifier: string) {
    const norm = identifier.trim().toLowerCase();
    // 1. Try match by email
    const byEmail = await this.getUserByEmail(norm);
    if (byEmail) return byEmail;

    // 2. Try match by username
    const byUsername = await this.getUserByUsername(norm);
    if (byUsername) return byUsername;

    // 3. Fallback match by id
    const byId = await this.getUserById(identifier.trim());
    if (byId) return byId;

    return null;
  }

  async getAllUsers() {
    if (persistent && this.pgAvailable) {
      try {
        const rows = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
        if (rows.length > 0) return rows.map(userData);
      } catch (e) {
        // fallback
      }
    }
    return [...this.users.values()];
  }

  async createUser(user: UserRecord) {
    const rowId = user.id || `user-${Date.now()}`;
    const prepared: UserRecord = {
      ...user,
      id: rowId,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    };

    this.users.set(rowId, prepared);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        const u = await prisma.user.create({
          data: {
            id: prepared.id,
            email: prepared.email.toLowerCase(),
            username: prepared.username ? prepared.username.toLowerCase() : null,
            name: prepared.name,
            passwordHash: prepared.passwordHash,
            role: prepared.role as any,
            displayTitle: prepared.displayTitle,
            status: prepared.status as any,
            avatarUrl: prepared.avatarUrl,
            mustChangePassword: Boolean(prepared.mustChangePassword),
            verificationExpiresAt: prepared.verificationExpiresAt
              ? new Date(prepared.verificationExpiresAt)
              : null,
            createdAt: prepared.createdAt ? new Date(prepared.createdAt) : undefined,
            updatedAt: prepared.updatedAt ? new Date(prepared.updatedAt) : undefined,
          } as any,
        });
        const converted = userData(u);
        this.users.set(converted.id, converted);
        this.saveStore();
        return converted;
      } catch (err: any) {
        console.warn('Prisma createUser failed, saved to local store:', err.message);
      }
    }

    return prepared;
  }

  async updateUser(id: string, updates: Partial<UserRecord>) {
    const existing = await this.getUserById(id);
    if (existing) {
      const merged: UserRecord = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.users.set(id, merged);
      this.saveStore();
    }

    if (persistent && this.pgAvailable) {
      try {
        const data: any = { ...updates };
        if ('verificationExpiresAt' in data) {
          data.verificationExpiresAt = data.verificationExpiresAt
            ? new Date(data.verificationExpiresAt)
            : null;
        }
        if ('username' in data && data.username) {
          data.username = data.username.toLowerCase();
        }
        const u = await prisma.user.update({ where: { id }, data });
        const converted = userData(u);
        this.users.set(id, converted);
        this.saveStore();
        return converted;
      } catch (err: any) {
        console.warn('Prisma updateUser failed, updated in local store:', err.message);
      }
    }

    return this.users.get(id) || null;
  }

  async deleteUser(id: string) {
    const deleted = this.users.delete(id);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        await prisma.user.delete({ where: { id } });
      } catch (e) {
        // ignore
      }
    }
    return deleted;
  }

  async getMedia() {
    if (persistent && this.pgAvailable) {
      try {
        const rows = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
        if (rows.length > 0) {
          return rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
        }
      } catch (e) {
        // fallback
      }
    }
    return this.media;
  }

  async addMedia(item: Omit<MediaRecord, 'id' | 'createdAt'>) {
    const row: MediaRecord = {
      ...item,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.media.unshift(row);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        const m = await prisma.media.create({ data: item });
        return { ...m, createdAt: m.createdAt.toISOString() };
      } catch (e) {
        // ignore
      }
    }
    return row;
  }

  async getStandingsOverrides(leagueId: string) {
    if (persistent && this.pgAvailable) {
      try {
        const row = await prisma.siteSetting.findUnique({
          where: { key: `standings:${leagueId.toLowerCase()}` },
        });
        if (row) return row.value;
      } catch (e) {
        // fallback
      }
    }
    return this.overrides.get(leagueId.toLowerCase()) || null;
  }

  async saveStandingsOverride(leagueId: string, data: any) {
    this.overrides.set(leagueId.toLowerCase(), data);
    this.saveStore();

    if (persistent && this.pgAvailable) {
      try {
        await prisma.siteSetting.upsert({
          where: { key: `standings:${leagueId.toLowerCase()}` },
          create: { key: `standings:${leagueId.toLowerCase()}`, value: data },
          update: { value: data },
        });
      } catch (e) {
        // ignore
      }
    }
  }

  async generateMatchReportDraft(match: Fixture, authorId: string) {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const hs = match.homeScore ?? 0;
    const as = match.awayScore ?? 0;
    const user = await this.getUserById(authorId);

    return this.createPost({
      slug: `match-report-${home}-${away}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: 'ARTICLE',
      status: 'DRAFT',
      category: 'MATCH_REPORTS',
      leagueTag: match.leagueId.toUpperCase(),
      featuredImage: match.homeTeam.logo,
      authorId,
      authorName: user?.name || 'GoalBangla Desk',
      authorTitle: user?.displayTitle || 'Editor',
      translations: {
        bn: {
          language: 'bn',
          title: `ম্যাচ রিপোর্ট: ${home} ${hs}-${as} ${away}`,
          excerpt: `${match.competition}-এ ফল ${hs}-${as}।`,
          content: `## ম্যাচ রিপোর্ট\n\n${home} ও ${away}-এর ম্যাচটি ${hs}-${as} গোলে শেষ হয়েছে। প্রকাশের আগে তথ্য যাচাই করুন।`,
          tags: [home, away, 'ম্যাচ রিপোর্ট'],
        },
        en: {
          language: 'en',
          title: `Match report: ${home} ${hs}-${as} ${away}`,
          excerpt: `${home} and ${away} finished ${hs}-${as}.`,
          content: `## Match report\n\n${home} and ${away} finished ${hs}-${as}. Verify details before publishing.`,
          tags: [home, away, 'Match report'],
        },
      },
    });
  }
}

export const repo = new DataRepository();
