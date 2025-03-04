
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlogPost from '@/components/BlogPost';
import FeaturedPost from '@/components/FeaturedPost';
import { blogPosts } from '@/lib/blogData';
import { motion } from 'framer-motion';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <Layout>
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
            <div className="h-10 flex space-x-2 mt-4 md:mt-0">
              {['全部', '设计', '技术', '职场'].map((category, index) => (
                <button 
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    index === 0 
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {regularPosts.map((post, index) => (
            <BlogPost key={post.id} post={post} index={index} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
