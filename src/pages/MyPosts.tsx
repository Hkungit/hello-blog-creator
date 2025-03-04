
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Edit, Eye, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  description?: string;
  content: string;
  cover_image?: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

const MyPosts = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState('all');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        console.error('Failed to fetch posts:', err);
        toast({
          title: '获取文章失败',
          description: '无法加载您的文章，请稍后再试。',
          variant: 'destructive',
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
  }, [user, authLoading, toast]);

  // 如果未登录，重定向到登录页面
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== postToDelete));
      toast({
        title: '文章已删除',
        description: '您的文章已成功删除。',
      });
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast({
        title: '删除失败',
        description: '无法删除文章，请稍后再试。',
        variant: 'destructive',
      });
    } finally {
      setPostToDelete(null);
      setIsDeleting(false);
    }
  };

  const filteredPosts = activeTabs === 'all' 
    ? posts 
    : activeTabs === 'published' 
      ? posts.filter(post => post.published) 
      : posts.filter(post => !post.published);

  return (
    <Layout className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-display">我的文章</h1>
          <Button className="flex items-center" asChild>
            <Link to="/create-post">
              <Plus className="mr-2 h-4 w-4" />
              写新文章
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">加载文章中...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeTabs} onValueChange={setActiveTabs}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="published">已发布</TabsTrigger>
              <TabsTrigger value="draft">草稿</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTabs} className="mt-0">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 border rounded-lg bg-card">
                  <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
                  <p className="text-muted-foreground mb-6">您还没有创建任何文章，立即开始写作吧！</p>
                  <Button asChild>
                    <Link to="/create-post">
                      <Plus className="mr-2 h-4 w-4" />
                      写新文章
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">标题</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>最后更新</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            {post.published ? (
                              <Badge variant="default">已发布</Badge>
                            ) : (
                              <Badge variant="outline">草稿</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(post.created_at).toLocaleDateString('zh-CN')}</TableCell>
                          <TableCell>{new Date(post.updated_at).toLocaleDateString('zh-CN')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to={`/post/${post.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to={`/edit-post/${post.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setPostToDelete(post.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      您确定要删除这篇文章吗？此操作不可逆，删除后无法恢复。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleDeletePost}
                                      disabled={isDeleting}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {isDeleting ? '删除中...' : '确认删除'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </Layout>
  );
};

export default MyPosts;
