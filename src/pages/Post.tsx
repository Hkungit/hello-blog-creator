
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { marked } from 'marked';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Edit, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { blogPosts } from '@/lib/blogData';

interface PostData {
  id: string;
  title: string;
  content: string;
  description?: string;
  cover_image?: string;
  published: boolean;
  tags: string[];
  reading_time: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('匿名用户');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        // 先尝试从Supabase加载文章
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          // 如果Supabase没有找到，尝试从静态数据加载
          const staticPost = blogPosts.find(post => post.id === id);
          if (staticPost) {
            setPost({
              id: staticPost.id,
              title: staticPost.title,
              content: staticPost.content || '',
              description: staticPost.description,
              cover_image: staticPost.coverImage,
              published: true,
              tags: staticPost.tags,
              reading_time: staticPost.readingTime,
              created_at: staticPost.date,
              updated_at: staticPost.date,
              user_id: '0'
            });
            setAuthorName(staticPost.author?.name || '匿名用户');
            document.title = `${staticPost.title} | 博客空间`;
            return;
          }
          throw error;
        }
        
        // 找到了Supabase文章
        setPost(data);
        document.title = `${data.title} | 博客空间`;
        
        // 如果将来有用户资料，可以在这里获取作者信息
        // 目前使用默认名称
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('文章未找到或无法访问');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">加载文章中...</p>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h1 className="text-2xl font-semibold">文章未找到</h1>
          <p>抱歉，您请求的文章不存在或已被删除。</p>
        </div>
      </Layout>
    );
  }

  const isAuthor = user && user.id === post.user_id;

  return (
    <Layout className="max-w-4xl mx-auto">
      <article className="prose prose-lg lg:prose-xl dark:prose-invert mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {isAuthor && (
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" className="flex items-center" asChild>
                <Link to={`/edit-post/${post.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑文章
                </Link>
              </Button>
            </div>
          )}
          
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{post.reading_time}</span>
            </div>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {post.cover_image && (
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-auto rounded-lg object-cover mb-8"
            />
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: marked(post.content) }}
          className="leading-relaxed"
        />
      </article>
    </Layout>
  );
};

export default Post;
