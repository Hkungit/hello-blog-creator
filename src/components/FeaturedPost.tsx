
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/components/BlogPost';

interface FeaturedPostProps {
  post: BlogPost;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  return (
    <motion.article 
      className="relative overflow-hidden rounded-2xl min-h-[400px] md:min-h-[500px] lg:min-h-[600px] group"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
      </div>
      
      <Link 
        to={`/post/${post.id}`}
        className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="flex space-x-3 mb-4">
            {post.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-white mb-4 group-hover:underline decoration-1 underline-offset-4">
            {post.title}
          </h2>
          
          <p className="text-white/90 mb-6 max-w-2xl text-sm md:text-base lg:text-lg">
            {post.description}
          </p>
          
          <div className="flex items-center text-xs md:text-sm text-white/80 gap-4">
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
      </Link>
    </motion.article>
  );
};

export default FeaturedPost;
