
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, Image as ImageIcon, Loader2, Tag as TagIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    description?: string;
    cover_image?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
  };
  isEditing?: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ 
  initialData = {
    title: '',
    content: '',
    description: '',
    cover_image: '',
    tags: [],
    published: false,
    featured: false
  }, 
  isEditing = false 
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [coverImage, setCoverImage] = useState(initialData.cover_image || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [published, setPublished] = useState(initialData.published || false);
  const [featured, setFeatured] = useState(initialData.featured || false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录才能发布文章",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !content) {
      toast({
        title: "无法保存",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title,
        content,
        description: description || title.substring(0, 100) + '...',
        cover_image: coverImage,
        tags,
        published,
        featured,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      let response;

      if (isEditing && initialData.id) {
        // 更新现有文章
        response = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialData.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // 创建新文章
        response = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "文章已更新" : "文章已创建",
        description: published ? "您的文章已发布并可见" : "您的文章已保存为草稿",
      });

      // 导航到新创建/编辑的文章
      navigate(`/post/${response.data.id}`);
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="text-2xl font-bold py-4"
            required
          />
        </div>
        
        <div className="flex items-center">
          <ImageIcon className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="封面图片 URL"
            type="url"
          />
        </div>
        
        <div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="文章简介（可选）"
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="使用 Markdown 格式编写您的文章内容..."
            className="min-h-[400px] font-mono"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center flex-1">
              <TagIcon className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="添加标签"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
            </div>
            <Button 
              type="button" 
              onClick={handleTagAdd}
              variant="secondary"
              size="sm"
            >
              添加
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                    onClick={() => handleTagRemove(tag)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="sr-only"
            />
            <div className={`h-5 w-5 border rounded flex items-center justify-center ${published ? 'bg-primary border-primary' : 'bg-background border-input'}`}>
              {published && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span>发布</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="sr-only"
            />
            <div className={`h-5 w-5 border rounded flex items-center justify-center ${featured ? 'bg-primary border-primary' : 'bg-background border-input'}`}>
              {featured && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span>精选</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/')}
        >
          取消
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            isEditing ? '更新' : '创建'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PostEditor;
