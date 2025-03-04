
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlogPost from '@/components/BlogPost';
import FeaturedPost from '@/components/FeaturedPost';
import { motion } from 'framer-motion';
import { blogPosts as staticBlogPosts } from '@/lib/blogData';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description?: string;
  content: string;
  cover_image?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  reading_time: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: {
    name: string;
  };
}

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');
  const categories = ['全部', '设计', '技术', '职场'];
  
  useEffect(() => {
    setMounted(true);
    document.title = '博客空间 | 首页';
    
    const fetchPosts = async () => {
      try {
        // 获取已发布的文章
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 将数据转换为需要的格式
        const formattedPosts: BlogPost[] = (data || []).map(post => ({
          ...post,
          author: { name: '博客作者' }, // 默认作者名，将来可以改进
          tags: post.tags || []
        }));
        
        // 合并静态博客文章和Supabase文章
        // 注意：如果有ID冲突，Supabase数据将覆盖静态数据
        const combinedPosts = [
          ...staticBlogPosts.map(post => ({
            id: post.id,
            title: post.title,
            description: post.description,
            content: post.content || '',
            cover_image: post.coverImage,
            tags: post.tags,
            published: true,
            featured: post.featured || false,
            reading_time: post.readingTime,
            created_at: post.date,
            updated_at: post.date,
            user_id: '0',
            author: post.author
          })),
          ...formattedPosts
        ];
        
        // 去重（基于ID）
        const uniquePosts = Array.from(
          new Map(combinedPosts.map(post => [post.id, post])).values()
        );
        
        setBlogPosts(uniquePosts);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        // 如果API失败，至少显示静态数据
        const staticPosts = staticBlogPosts.map(post => ({
          id: post.id,
          title: post.title,
          description: post.description,
          content: post.content || '',
          cover_image: post.coverImage,
          tags: post.tags,
          published: true,
          featured: post.featured || false,
          reading_time: post.readingTime,
          created_at: post.date,
          updated_at: post.date,
          user_id: '0',
          author: post.author
        }));
        setBlogPosts(staticPosts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  // 过滤文章
  const filteredPosts = activeCategory === '全部'
    ? blogPosts
    : blogPosts.filter(post => post.tags.includes(activeCategory));
  
  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <Layout>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">加载博客文章中...</p>
        </div>
      ) : (
        <>
          <section className="mb-16">
            {mounted && featuredPosts.length > 0 && (
              <FeaturedPost post={featuredPosts[0]} />
            )}
          </section>
          
          <section>
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 md:mb-12">
              <motion.h2 
                className="text-2xl md:text-3xl font-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                最新文章
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="h-10 flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2">
                  {categories.map((category, index) => (
                    <button 
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
                        category === activeCategory
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {regularPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">暂无文章</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {regularPosts.map((post, index) => (
                  <BlogPost key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Layout>
  );
};

export default Index;
