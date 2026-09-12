import { Prisma } from '@prisma/client';
import { PostData, PostStatus, PostType, UserRecord, MediaRecord } from './types';
import { seedPosts } from './seed-data';
import { Fixture } from '../football/types';
import { prisma } from './prisma';

const persistent = /^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '');
const iso = (value: Date | null | undefined) => value?.toISOString();

function postData(post: any): PostData {
  const translations: any = {};
  for (const translation of post.translations || []) translations[translation.language] = translation;
  return { ...post, translations, galleryImages: post.galleryImages || undefined,
    featuredImage: post.featuredImage || undefined, authorName: post.authorName || undefined,
    authorTitle: post.authorTitle || undefined, scheduledPublishAt: iso(post.scheduledPublishAt),
    publishedAt: iso(post.publishedAt), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() };
}

function userData(user: any): UserRecord {
  return { ...user, displayTitle: user.displayTitle || undefined, avatarUrl: user.avatarUrl || undefined,
    verificationCodeHash: user.verificationCodeHash || undefined, verificationExpiresAt: iso(user.verificationExpiresAt),
    createdAt: iso(user.createdAt), updatedAt: iso(user.updatedAt) };
}

class DataRepository {
  private posts = new Map(seedPosts.map((p) => [p.id, p]));
  private users = new Map<string, UserRecord>();
  private media: MediaRecord[] = [];
  private overrides = new Map<string, any>();

  private memoryPosts(options: any = {}) {
    let list = [...this.posts.values()].filter((p) => p.status === (options.status || 'PUBLISHED'));
    if (options.type) list = list.filter((p) => p.type === options.type);
    if (options.category && options.category !== 'ALL') list = list.filter((p) => p.category.toLowerCase() === options.category.toLowerCase());
    if (options.leagueTag && options.leagueTag !== 'ALL') list = list.filter((p) => p.leagueTag.toLowerCase() === options.leagueTag.toLowerCase());
    if (options.search) { const q=options.search.toLowerCase(); list=list.filter((p)=>Object.values(p.translations).some((t)=>`${t.title} ${t.tags.join(' ')}`.toLowerCase().includes(q))); }
    list.sort((a,b)=>+new Date(b.publishedAt||b.createdAt)-+new Date(a.publishedAt||a.createdAt));
    const total=list.length, offset=options.offset||0; return {posts:list.slice(offset,offset+(options.limit||50)),total};
  }

  async getPosts(options: {type?:PostType;status?:PostStatus;category?:string;leagueTag?:string;language?:'bn'|'en';search?:string;limit?:number;offset?:number}={}) {
    if (!persistent) return this.memoryPosts(options);
    const where: Prisma.PostWhereInput = { status: options.status || 'PUBLISHED' };
    if(options.type) where.type=options.type;
    if(options.category&&options.category!=='ALL') where.category={equals:options.category,mode:'insensitive'};
    if(options.leagueTag&&options.leagueTag!=='ALL') where.leagueTag={equals:options.leagueTag,mode:'insensitive'};
    if(options.search) where.translations={some:{title:{contains:options.search,mode:'insensitive'}}};
    const [rows,total]=await prisma.$transaction([prisma.post.findMany({where,include:{translations:true},orderBy:[{publishedAt:'desc'},{createdAt:'desc'}],skip:options.offset||0,take:options.limit||50}),prisma.post.count({where})]);
    if(!total&&!options.search&&(options.status||'PUBLISHED')==='PUBLISHED') return this.memoryPosts(options);
    return {posts:rows.map(postData),total};
  }
  async getAllPostsAdmin(){if(!persistent)return [...this.posts.values()].sort((a,b)=>+new Date(b.updatedAt)-+new Date(a.updatedAt));return (await prisma.post.findMany({include:{translations:true},orderBy:{updatedAt:'desc'}})).map(postData)}
  async getPostBySlug(slug:string){if(!persistent)return [...this.posts.values()].find(p=>p.slug===slug)||null;const row=await prisma.post.findUnique({where:{slug},include:{translations:true}});return row?postData(row):null}
  async getPostById(id:string){if(!persistent)return this.posts.get(id)||null;const row=await prisma.post.findUnique({where:{id},include:{translations:true}});return row?postData(row):null}
  async createPost(data:Omit<PostData,'id'|'createdAt'|'updatedAt'|'viewCount'>){
    if(!persistent){const now=new Date().toISOString(),row={...data,id:`post-${Date.now()}`,viewCount:0,createdAt:now,updatedAt:now} as PostData;this.posts.set(row.id,row);return row}
    const row=await prisma.post.create({data:{slug:data.slug,type:data.type,status:data.status,category:data.category,leagueTag:data.leagueTag,featuredImage:data.featuredImage,videoUrl:data.videoUrl,videoTranscript:data.videoTranscript,audioUrl:data.audioUrl,audioShowNotes:data.audioShowNotes,galleryImages:data.galleryImages as any,authorId:data.authorId,authorName:data.authorName,authorTitle:data.authorTitle,scheduledPublishAt:data.scheduledPublishAt?new Date(data.scheduledPublishAt):null,publishedAt:data.publishedAt?new Date(data.publishedAt):null,translations:{create:Object.values(data.translations).map(t=>({language:t.language,title:t.title,excerpt:t.excerpt,content:t.content,seoTitle:t.seoTitle,seoDescription:t.seoDescription,tags:t.tags||[]}))}},include:{translations:true}});return postData(row)
  }
  async updatePost(id:string,updates:Partial<PostData>){
    if(!persistent){const old=this.posts.get(id);if(!old)return null;const row={...old,...updates,updatedAt:new Date().toISOString()};this.posts.set(id,row);return row}
    const {translations,id:_id,createdAt,updatedAt,viewCount,...data}:any=updates;
    for(const k of ['scheduledPublishAt','publishedAt'])if(k in data)data[k]=data[k]?new Date(data[k]):null;
    if('galleryImages'in data&&data.galleryImages===undefined)data.galleryImages=Prisma.JsonNull;
    if(translations)data.translations={upsert:Object.values(translations).map((t:any)=>({where:{postId_language:{postId:id,language:t.language}},create:{language:t.language,title:t.title,excerpt:t.excerpt,content:t.content,seoTitle:t.seoTitle,seoDescription:t.seoDescription,tags:t.tags||[]},update:{title:t.title,excerpt:t.excerpt,content:t.content,seoTitle:t.seoTitle,seoDescription:t.seoDescription,tags:t.tags||[]}}))};
    const row=await prisma.post.update({where:{id},data,include:{translations:true}});return postData(row)
  }
  async deletePost(id:string){if(!persistent)return this.posts.delete(id);try{await prisma.post.delete({where:{id}});return true}catch{return false}}
  async incrementViewCount(slug:string){if(!persistent){const p=await this.getPostBySlug(slug);if(p)p.viewCount++}else await prisma.post.update({where:{slug},data:{viewCount:{increment:1}}}).catch(()=>{})}

  async hasUsers(){return(await this.getUserCount())>0}
  async getUserCount(){return persistent?prisma.user.count():this.users.size}
  async getUserById(id:string){if(!persistent)return [...this.users.values()].find(u=>u.id===id)||null;const u=await prisma.user.findUnique({where:{id}});return u?userData(u):null}
  async getUserByEmail(email:string){if(!persistent)return this.users.get(email.toLowerCase())||null;const u=await prisma.user.findUnique({where:{email:email.toLowerCase()}});return u?userData(u):null}
  async getAllUsers(){if(!persistent)return [...this.users.values()];return(await prisma.user.findMany({orderBy:{createdAt:'asc'}})).map(userData)}
  async createUser(user:UserRecord){if(!persistent){this.users.set(user.email.toLowerCase(),user);return user}const u=await prisma.user.create({data:{...user,verificationExpiresAt:user.verificationExpiresAt?new Date(user.verificationExpiresAt):null,createdAt:user.createdAt?new Date(user.createdAt):undefined,updatedAt:user.updatedAt?new Date(user.updatedAt):undefined} as any});return userData(u)}
  async updateUser(id:string,updates:Partial<UserRecord>){if(!persistent){const u=await this.getUserById(id);if(!u)return null;this.users.delete(u.email.toLowerCase());const v={...u,...updates,updatedAt:new Date().toISOString()};this.users.set(v.email.toLowerCase(),v);return v}const data:any={...updates};if('verificationExpiresAt'in data)data.verificationExpiresAt=data.verificationExpiresAt?new Date(data.verificationExpiresAt):null;const u=await prisma.user.update({where:{id},data});return userData(u)}
  async deleteUser(id:string){if(!persistent){const u=await this.getUserById(id);return u?this.users.delete(u.email.toLowerCase()):false}try{await prisma.user.delete({where:{id}});return true}catch{return false}}

  async getMedia(){if(!persistent)return this.media;return(await prisma.media.findMany({orderBy:{createdAt:'desc'}})).map(m=>({...m,createdAt:m.createdAt.toISOString()}))}
  async addMedia(item:Omit<MediaRecord,'id'|'createdAt'>){if(!persistent){const row={...item,id:`med-${Date.now()}`,createdAt:new Date().toISOString()};this.media.unshift(row);return row}const m=await prisma.media.create({data:item});return{...m,createdAt:m.createdAt.toISOString()}}
  async getStandingsOverrides(leagueId:string){if(!persistent)return this.overrides.get(leagueId.toLowerCase())||null;const row=await prisma.siteSetting.findUnique({where:{key:`standings:${leagueId.toLowerCase()}`}});return row?.value||null}
  async saveStandingsOverride(leagueId:string,data:any){if(!persistent){this.overrides.set(leagueId.toLowerCase(),data);return}await prisma.siteSetting.upsert({where:{key:`standings:${leagueId.toLowerCase()}`},create:{key:`standings:${leagueId.toLowerCase()}`,value:data},update:{value:data}})}
  async generateMatchReportDraft(match:Fixture,authorId:string){const home=match.homeTeam.name,away=match.awayTeam.name,hs=match.homeScore??0,as=match.awayScore??0,user=await this.getUserById(authorId);return this.createPost({slug:`match-report-${home}-${away}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g,'-'),type:'ARTICLE',status:'DRAFT',category:'MATCH_REPORTS',leagueTag:match.leagueId.toUpperCase(),featuredImage:match.homeTeam.logo,authorId,authorName:user?.name||'GoalBangla Desk',authorTitle:user?.displayTitle||'Editor',translations:{bn:{language:'bn',title:`ম্যাচ রিপোর্ট: ${home} ${hs}-${as} ${away}`,excerpt:`${match.competition}-এ ফল ${hs}-${as}।`,content:`## ম্যাচ রিপোর্ট\n\n${home} ও ${away}-এর ম্যাচটি ${hs}-${as} গোলে শেষ হয়েছে। প্রকাশের আগে তথ্য যাচাই করুন।`,tags:[home,away,'ম্যাচ রিপোর্ট']},en:{language:'en',title:`Match report: ${home} ${hs}-${as} ${away}`,excerpt:`${home} and ${away} finished ${hs}-${as}.`,content:`## Match report\n\n${home} and ${away} finished ${hs}-${as}. Verify details before publishing.`,tags:[home,away,'Match report']}}})}
}

export const repo = new DataRepository();
