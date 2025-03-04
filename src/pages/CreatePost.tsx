
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PostEditor from '@/components/PostEditor';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const CreatePost = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = '创建新文章 | 博客空间';
  }, []);

  // 如果未登录，重定向到登录页面
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display mb-6">创建新文章</h1>
        <p className="text-muted-foreground mb-8">
          在下面编写您的文章内容，支持 Markdown 格式。完成后可以选择立即发布或保存为草稿。
        </p>
        <PostEditor />
      </motion.div>
    </Layout>
  );
};

export default CreatePost;
