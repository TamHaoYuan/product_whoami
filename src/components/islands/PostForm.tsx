import { useState, useEffect } from 'react';
import { 
  generateId, 
  getIdentity, 
  saveIdentity, 
  savePost, 
  DEFAULT_AVATARS, 
  ROLE_CONFIG, 
  CATEGORIES, 
  TAGS,
  type UserRole,
  type Author,
  type Post 
} from '@utils/postStorage';

interface PostFormProps {
  onSuccess?: () => void;
}

const ADMIN_PASSWORD = 'admin2026';
const OWNER_PASSWORD = 'owner2026';

export default function PostForm({ onSuccess }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedIdentity, setSavedIdentity] = useState<Author | null>(null);

  useEffect(() => {
    const identity = getIdentity();
    if (identity) {
      setSavedIdentity(identity);
      setAuthorName(identity.name);
      setAvatar(identity.avatar);
      setRole(identity.role);
    }
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    if ((newRole === 'admin' || newRole === 'owner') && !savedIdentity) {
      setPendingRole(newRole);
      setShowPasswordModal(true);
      return;
    }
    setRole(newRole);
  };

  const handlePasswordSubmit = () => {
    const expectedPassword = pendingRole === 'owner' ? OWNER_PASSWORD : ADMIN_PASSWORD;
    if (password === expectedPassword) {
      const newIdentity: Author = {
        name: authorName || (pendingRole === 'owner' ? '站长' : '管理员'),
        avatar,
        role: pendingRole as UserRole
      };
      saveIdentity(newIdentity);
      setSavedIdentity(newIdentity);
      setRole(newIdentity.role);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      setPendingRole(null);
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName.trim()) return;

    if ((role === 'admin' || role === 'owner') && !savedIdentity) {
      setShowPasswordModal(true);
      return;
    }

    setIsSubmitting(true);

    const finalAvatar = useCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl.trim() : avatar;
    
    const newPost: Post = {
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      author: {
        name: authorName.trim(),
        avatar: finalAvatar,
        role: savedIdentity?.role || role
      },
      pubDate: new Date().toISOString(),
      tags: selectedTags,
      category,
      views: 0,
      replies: 0
    };

    if (authorName.trim() && !savedIdentity) {
      saveIdentity(newPost.author);
    }

    savePost(newPost);
    setIsSubmitting(false);
    
    setTitle('');
    setContent('');
    setSelectedTags([]);
    
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.href = '/';
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          议论标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
          placeholder="请输入议论标题"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          你的看法
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
          placeholder="写下你的看法..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          话题分类
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          标签（最多选择5个）
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-xuxiang-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">作者信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              身份
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
            >
              <option value="user">吧友</option>
              <option value="moderator">版主</option>
              <option value="admin">管理员</option>
              <option value="owner">站长</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            头像
          </label>
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={useCustomAvatar}
                onChange={(e) => setUseCustomAvatar(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-xuxiang-600 focus:ring-xuxiang-500"
              />
              使用自定义头像URL
            </label>
          </div>
          
          {useCustomAvatar ? (
            <div className="mb-3">
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500"
                placeholder="请输入头像图片URL"
              />
              {customAvatarUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={customAvatarUrl} alt="预览" className="w-12 h-12 rounded-full border-2 border-xuxiang-600" onError={() => setCustomAvatarUrl('')} />
                  <span className="text-xs text-slate-500">预览</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {DEFAULT_AVATARS.map((avt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatar(avt)}
                  className={`w-12 h-12 rounded-full border-2 transition-colors ${
                    avatar === avt
                      ? 'border-xuxiang-600 ring-2 ring-xuxiang-300'
                      : 'border-slate-300 dark:border-slate-600 hover:border-xuxiang-400'
                  }`}
                >
                  <img src={avt} alt={`头像 ${index + 1}`} className="w-full h-full rounded-full" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <a
          href="/"
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          取消
        </a>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim() || !authorName.trim()}
          className="px-6 py-2 bg-xuxiang-600 hover:bg-xuxiang-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '分享中...' : '分享出去'}
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              身份验证
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {pendingRole === 'owner' ? '请输入站长密码以验证身份' : '请输入管理员密码以验证身份'}
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-xuxiang-500 focus:border-xuxiang-500 mb-4"
              placeholder="请输入密码"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setRole('user');
                  setPassword('');
                  setPasswordError('');
                  setPendingRole(null);
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-xuxiang-600 hover:bg-xuxiang-700 text-white rounded-lg transition-colors"
              >
                验证
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
