
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, Edit, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        // Fetch the post
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setPost(data);
        
        if (data) {
          document.title = `${data.title} | 博客空间`;
          
          // Fetch author data - in a real app this would be a join
          try {
            const { data: userData } = await supabase
              .auth.admin.getUserById(data.user_id);
            
            if (userData) {
              setAuthor({
                id: userData.user.id,
                name: userData.user.email?.split('@')[0] || '用户',
                email: userData.user.email
              });
            }
          } catch (authorError) {
            console.error('Error fetching author:', authorError);
            // Set a default author if we can't fetch the real one
            setAuthor({
              id: data.user_id,
              name: '用户',
              email: null
            });
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : '无法加载文章');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Layout className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <p className="text-muted-foreground mb-6">{error || '请求的文章不存在或已被删除'}</p>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if the current user is the author of the post
  const isAuthor = user && post.user_id === user.id;

  return (
    <Layout className="max-w-4xl mx-auto">
      <article className="py-8">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </div>
        
        {/* Post header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-4 mb-8">
            <Avatar>
              <AvatarImage src={author?.image} />
              <AvatarFallback>{author?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{author?.name || '匿名用户'}</div>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span className="flex items-center">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  {formattedDate}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {post.reading_time || '5 分钟'}阅读
                </span>
              </div>
            </div>
          </div>
          
          {/* Edit button for author */}
          {isAuthor && (
            <div className="mb-8">
              <Button asChild variant="outline" size="sm">
                <Link to={`/edit-post/${post.id}`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  编辑文章
                </Link>
              </Button>
            </div>
          )}
          
          {/* Featured image */}
          {post.cover_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={post.cover_image} 
                alt={post.title} 
                className="w-full h-auto object-cover max-h-[500px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1266&q=80";
                }}
              />
            </div>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Post content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>
      </article>
    </Layout>
  );
};

export default Post;
