import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, Image as ImageIcon, Loader2, Tag as TagIcon, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Editor } from '@tinymce/tinymce-react';

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
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      
      if (!file.type.match('image.*')) {
        toast({
          title: "不支持的文件类型",
          description: "请上传图片文件（JPEG, PNG, GIF等）",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过5MB",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const data = await response.json();
      setCoverImage(data.url);
      
      toast({
        title: "上传成功",
        description: "封面图片已上传",
      });
    } catch (error) {
      console.error('图片上传错误:', error);
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "上传过程中发生错误",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setCoverImage('');
  };

  const handleEditorChange = (content: string) => {
    setContent(content);
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
      const currentContent = editorRef.current ? editorRef.current.getContent() : content;

      const postData = {
        title,
        content: currentContent,
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
        response = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialData.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
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
        
        <div className="space-y-2">
          <div className="flex flex-col space-y-2">
            <label className="flex items-center text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4 mr-2" />
              封面图片
            </label>
            
            {coverImage ? (
              <div className="relative">
                <img 
                  src={coverImage} 
                  alt="封面图片预览" 
                  className="w-full h-64 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1266&q=80";
                  }}
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/20 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/40 transition-colors"
                onClick={handleImageClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                {imageUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">上传中...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">点击上传封面图片</p>
                    <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF (最大 5MB)</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center mt-1">
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="或输入图片 URL"
                type="url"
                disabled={imageUploading}
              />
            </div>
          </div>
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
          <div className="border rounded-md">
            <Editor
              tinymceScriptSrc={`https://cdn.tiny.cloud/1/ppjchppmbhcwrvendb3x19cn00quv3n5ilc8kai7fpq2yq49/tinymce/6/tinymce.min.js`}
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={content}
              onEditorChange={handleEditorChange}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | link image media | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                language: 'zh_CN',
                language_url: 'https://cdn.jsdelivr.net/npm/tinymce-lang@1.0.1/langs/zh_CN.js',
                branding: false,
                promotion: false,
                placeholder: '使用富文本编辑器编写您的文章内容...',
              }}
            />
          </div>
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
          disabled={loading || imageUploading}
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
