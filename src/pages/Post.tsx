
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { blogPosts } from '@/lib/blogData';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { marked } from 'marked';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  
  const post = blogPosts.find(post => post.id === id);
  const postIndex = blogPosts.findIndex(post => post.id === id);
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  
  useEffect(() => {
    if (!post) {
      navigate('/');
      return;
    }
    
    // Parse markdown content
    setContent(marked.parse(post.content));
  }, [post, navigate]);
  
  if (!post) {
    return null;
  }

  return (
    <Layout className="py-16 md:py-24">
      <article className="max-w-4xl mx-auto">
        <div className="mb-8 md:mb-12">
          <motion.div 
            className="flex space-x-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {post.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {post.title}
          </motion.h1>
          
          <motion.div 
            className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{post.readingTime}</span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mb-10 overflow-hidden rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </motion.div>
        
        <motion.div 
          className="prose prose-lg lg:prose-xl max-w-none blog-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        <motion.div 
          className="mt-16 pt-8 border-t border-border flex justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {prevPost ? (
            <a 
              href={`/post/${prevPost.id}`}
              className="flex items-center text-muted-foreground hover:text-foreground group"
            >
              <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
              <span>上一篇</span>
            </a>
          ) : (
            <div></div>
          )}
          
          {nextPost ? (
            <a 
              href={`/post/${nextPost.id}`}
              className="flex items-center text-muted-foreground hover:text-foreground group"
            >
              <span>下一篇</span>
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          ) : (
            <div></div>
          )}
        </motion.div>
      </article>
    </Layout>
  );
};

export default Post;
