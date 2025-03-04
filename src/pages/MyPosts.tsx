
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Edit, Eye, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const MyPosts = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = '我的文章 | 博客空间';
    
    const fetchPosts = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        toast({
          title: "加载失败",
          description: "无法加载您的文章",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPosts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return;
    
    setDeleting(id);
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: "文章已删除",
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      toast({
        title: "删除失败",
        description: "无法删除文章",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  // 如果未登录，重定向到登录页面
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-3xl md:text-4xl font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            我的文章
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button as={Link} to="/create-post">
              <Plus className="mr-2 h-4 w-4" />
              写新文章
            </Button>
          </motion.div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">加载您的文章中...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-muted/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-medium mb-2">您还没有创建任何文章</h2>
            <p className="text-muted-foreground mb-6">开始创建您的第一篇文章吧！</p>
            <Button as={Link} to="/create-post">
              <Plus className="mr-2 h-4 w-4" />
              写新文章
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div 
                key={post.id}
                className="bg-card border border-border rounded-lg overflow-hidden flex flex-col md:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.1 * index,
                    duration: 0.5,
                  }
                }}
              >
                {post.cover_image ? (
                  <div className="md:w-1/4">
                    <img 
                      src={post.cover_image} 
                      alt={post.title}
                      className="h-full w-full object-cover aspect-video md:aspect-square"
                    />
                  </div>
                ) : (
                  <div className="md:w-1/4 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">无封面图片</span>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-medium line-clamp-1">{post.title}</h2>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                      }`}>
                        {post.published ? '已发布' : '草稿'}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                          精选
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
                    {post.description || post.title}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mt-auto pt-2">
                    <p>创建于: {new Date(post.created_at).toLocaleDateString('zh-CN')}</p>
                    <p>最后更新: {new Date(post.updated_at).toLocaleDateString('zh-CN')}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" as={Link} to={`/post/${post.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                    <Button variant="outline" size="sm" as={Link} to={`/edit-post/${post.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10"
                    >
                      {deleting === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPosts;
