import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import FeaturedPost from '@/components/FeaturedPost';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/components/BlogPost';
import { blogPosts as mockPosts } from '@/lib/blogData';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Database post type from Supabase
interface DatabasePost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  cover_image?: string;
  description?: string;
  tags?: string[];
  reading_time?: string;
  published?: boolean;
  featured?: boolean;
  updated_at?: string;
}

// Combined type that includes all required BlogPost fields
type CombinedBlogPost = {
  id: string;
  title: string;
  content: string;
  date: string;
  readingTime: string;
  coverImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  description: string;
};

const fetchPosts = async (): Promise<CombinedBlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }

  // Transform database posts to match the BlogPost interface
  return data.map((post: DatabasePost) => {
    // Convert created_at to a formatted date
    const createdAt = new Date(post.created_at);
    const formattedDate = `${createdAt.getFullYear()}年${createdAt.getMonth() + 1}月${createdAt.getDate()}日`;
    
    // Ensure tags is always an array
    const tags = post.tags || ['General'];
    
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      date: formattedDate,
      readingTime: post.reading_time || '5分钟',
      coverImage: post.cover_image || 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1266&q=80',
      author: {
        name: '作者',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Author`,
      },
      tags: tags,
      description: post.description || post.content.substring(0, 150) + '...',
    } as CombinedBlogPost;
  });
};

const Index = () => {
  const { user } = useAuth();
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialData: [],
  });

  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (posts.length > 0) {
      // Extract all unique tags from posts
      const tags = posts.flatMap(post => post.tags || []);
      setAllTags(Array.from(new Set(tags)));

      // Set the first post as the featured post
      setFeaturedPost({
        id: posts[0].id,
        title: posts[0].title,
        description: posts[0].description,
        content: posts[0].content,
        date: posts[0].date,
        readingTime: posts[0].readingTime,
        coverImage: posts[0].coverImage,
        author: posts[0].author,
        tags: posts[0].tags,
      });

      // Set the rest of the posts as filtered posts initially
      setFilteredPosts(posts.slice(1).map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        readingTime: post.readingTime,
        coverImage: post.coverImage,
        author: post.author,
        tags: post.tags,
      })));
    } else {
      // If no posts from Supabase, use mock data
      setFeaturedPost(mockPosts[0]);
      setFilteredPosts(mockPosts.slice(1));
      setAllTags(Array.from(new Set(mockPosts.flatMap(post => post.tags))));
    }
  }, [posts]);

  const filterByTag = (tag: string | null) => {
    setActiveTag(tag);
    
    if (!tag) {
      setFilteredPosts(posts.slice(1).map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        readingTime: post.readingTime,
        coverImage: post.coverImage,
        author: post.author,
        tags: post.tags,
      })));
      return;
    }
    
    const filtered = posts.filter(post => post.tags?.includes(tag) && post.id !== featuredPost?.id)
      .map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        readingTime: post.readingTime,
        coverImage: post.coverImage,
        author: post.author,
        tags: post.tags,
      }));
    
    setFilteredPosts(filtered);
  };

  return (
    <Layout>
      <section className="container py-10">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <FeaturedPost post={featuredPost} />
          </div>
        )}

        {/* Tag Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">浏览文章</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => filterByTag(null)}
            >
              全部
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={activeTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => filterByTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link to={`/post/${post.id}`} className="group">
                <div className="h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1266&q=80";
                    }}
                  />
                </div>
                <div className="flex gap-2 mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-muted rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {post.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readingTime}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {user && (
          <div className="mt-16 text-center">
            <Button asChild size="lg">
              <Link to="/create-post">写一篇新文章</Link>
            </Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
