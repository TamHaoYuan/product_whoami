export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';

export interface Author {
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  pubDate: string;
  tags: string[];
  category: string;
  views: number;
  replies: number;
}

const STORAGE_KEY = 'xuxiang_posts';
const IDENTITY_KEY = 'xuxiang_identity';

export const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed= Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
];

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; badge: string }> = {
  user: { label: '吧友', color: 'text-slate-500 bg-slate-100', badge: '' },
  moderator: { label: '版主', color: 'text-green-600 bg-green-100', badge: '🛡️' },
  admin: { label: '管理员', color: 'text-orange-600 bg-orange-100', badge: '⚡' },
  owner: { label: '站长', color: 'text-xuxiang-600 bg-xuxiang-100', badge: '👑' },
};

export const CATEGORIES = [
  '故事讨论',
  '小说推荐',
  '剧情分析',
  '角色分析',
  '世界观讨论',
  '创作分享',
  '其他'
];

export const TAGS = [
  '小说',
  '剧情',
  '角色',
  '分析',
  '讨论',
  '推荐',
  '原创',
  '同人',
  '世界观',
  '伏笔',
  '反转',
  '结局'
];

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getPosts(): Post[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePost(post: Post): void {
  const posts = getPosts();
  posts.unshift(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getPostById(id: string): Post | undefined {
  const posts = getPosts();
  return posts.find(p => p.id === id);
}

export function updatePost(id: string, updates: Partial<Post>): void {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
}

export function deletePost(id: string): void {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getIdentity(): Author | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(IDENTITY_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveIdentity(author: Author): void {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(author));
}

export function clearIdentity(): void {
  localStorage.removeItem(IDENTITY_KEY);
}

export function incrementViews(id: string): void {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index].views += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
}
