
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { blogPosts } from '@/lib/blogData';
import { marked } from 'marked';
import { motion } from 'framer-motion';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const post = blogPosts.find(post => post.id === id);

  useEffect(() => {
    const fetchContent = async () => {
      if (post && post.content) {
        try {
          setContent(post.content);
        } catch (error) {
          console.error('Failed to fetch content:', error);
          setContent('内容加载失败');
        }
      }
    };

    fetchContent();
  }, [post]);

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h1 className="text-2xl font-semibold">文章未找到</h1>
          <p>抱歉，您请求的文章不存在。</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="max-w-4xl mx-auto">
      <article className="prose prose-lg lg:prose-xl dark:prose-invert mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">{post.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <span>{new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="mx-2">·</span>
            <span>{post.readingTime} 分钟阅读</span>
          </div>
          {post.coverImage && (
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-auto rounded-lg object-cover mb-8"
            />
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: marked(content) }}
          className="leading-relaxed"
        />
      </article>
    </Layout>
  );
};

export default Post;
