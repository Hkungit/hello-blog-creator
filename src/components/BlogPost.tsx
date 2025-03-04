
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  coverImage: string;
  readingTime: string;
  tags: string[];
  featured?: boolean;
}

interface BlogPostProps {
  post: BlogPost;
  index: number;
}

const BlogPost = ({ post, index }: BlogPostProps) => {
  return (
    <motion.article 
      className="group flex flex-col bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: 0.1 * index,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        }
      }}
    >
      <Link to={`/post/${post.id}`} className="overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
            }}
          />
        </div>
      </Link>
      <div className="flex-1 p-5 md:p-6 flex flex-col">
        <div className="flex space-x-2 mb-3">
          {post.tags.slice(0, 2).map((tag) => (
            <span 
              key={tag} 
              className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <Link to={`/post/${post.id}`} className="mb-2 md:mb-3">
          <h3 className="text-xl md:text-2xl font-medium line-clamp-2 group-hover:underline decoration-1 underline-offset-4 decoration-primary/40 transition-all">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm md:text-base">
          {post.description}
        </p>
        
        <div className="mt-auto flex items-center text-xs md:text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogPost;
