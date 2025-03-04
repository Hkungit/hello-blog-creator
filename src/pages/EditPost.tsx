
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PostEditor from '@/components/PostEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '编辑文章 | 博客空间';
    
    const fetchPost = async () => {
      if (!user || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (data) setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : '无法加载文章');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPost();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [id, user, authLoading]);

  // 如果未登录，重定向到登录页面
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // 如果正在加载
  if (loading) {
    return (
      <Layout className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">加载文章中...</p>
        </div>
      </Layout>
    );
  }

  // 如果有错误或找不到文章
  if (error || !post) {
    return (
      <Layout className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-semibold mb-2">无法加载文章</h1>
        <p className="text-muted-foreground">{error || '您要编辑的文章不存在或您无权编辑'}</p>
      </Layout>
    );
  }

  return (
    <Layout className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display mb-6">编辑文章</h1>
        <p className="text-muted-foreground mb-8">
          在下面编辑您的文章内容，支持 Markdown 格式。您可以更新文章状态或内容。
        </p>
        <PostEditor 
          initialData={post} 
          isEditing={true} 
        />
      </motion.div>
    </Layout>
  );
};

export default EditPost;
