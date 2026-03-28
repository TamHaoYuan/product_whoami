import { useState, useEffect } from 'react';
import { getPosts, deletePost, updatePost, ROLE_CONFIG, getIdentity, type Post, type UserRole, type Author } from '@utils/postStorage';
import { AdminPanel, EditPostModal } from './AdminPanel';

interface PostListProps {
  limit?: number;
  showCategory?: boolean;
  onPostClick?: (id: string) => void;
}

function RoleBadge({ role }: { role: UserRole }) {
  const config = ROLE_CONFIG[role];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.badge} {config.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function PostList({ limit, showCategory = true, onPostClick }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<Author | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const loadPosts = () => {
    const allPosts = getPosts();
    setPosts(limit ? allPosts.slice(0, limit) : allPosts);
    setLoading(false);
  };

  useEffect(() => {
    const id = getIdentity();
    setIdentity(id);
    setIsAdmin(id?.role === 'admin' || id?.role === 'owner');
    loadPosts();
    
    const handleStorage = () => {
      loadPosts();
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('postUpdated', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('postUpdated', handleStorage);
    };
  }, [limit]);

  const handleDelete = (id: string) => {
    deletePost(id);
    loadPosts();
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleSaveEdit = (updates: Partial<Post>) => {
    if (editingPost) {
      updatePost(editingPost.id, updates);
      setEditingPost(null);
      loadPosts();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-slate-500 dark:text-slate-400">还没有议论呢，快来说点什么吧！</p>
        <a
          href="/create"
          className="inline-block mt-4 px-6 py-2 bg-xuxiang-600 hover:bg-xuxiang-700 text-white rounded-lg transition-colors"
        >
          分享故事
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <article
          key={post.id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {post.author.name}
                </span>
                <RoleBadge role={post.author.role} />
                {showCategory && post.category && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
                    {post.category}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 hover:text-xuxiang-600 dark:hover:text-xuxiang-400">
                <a href={`/post?id=${post.id}`}>{post.title}</a>
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                {post.content.substring(0, 150)}...
              </p>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-xuxiang-50 dark:bg-xuxiang-900/30 text-xuxiang-600 dark:text-xuxiang-400 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatDate(post.pubDate)}</span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.replies}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <AdminPanel post={post} onDelete={handleDelete} onEdit={handleEdit} />
              )}
            </div>
          </div>
        </article>
      ))}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
