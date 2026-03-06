import { motion } from 'framer-motion';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import PostCard from '@/components/blog/PostCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Volume2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogStatus = () => {
  const { posts, loading } = useBlogPosts();
  const navigate = useNavigate();

  const activePosts = posts.filter(p => p.is_active);
  const featuredPosts = activePosts.filter(p => p.featured);

  if (loading) {
    return (
      <section className="py-6 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-14 h-3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activePosts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-b border-border/50">
      {/* Stories-style strip - always shown */}
      <div className="py-5">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/blog')}
            className="w-full group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Avisos & Novidades
                </h2>
              </div>
              <span className="text-xs text-primary flex items-center gap-1 group-hover:underline">
                Ver todas <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto pb-1 scrollbar-hide">
              {activePosts.slice(0, 8).map((post, index) => (
                <motion.div
                  key={post.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60 p-[3px]">
                      <div className="w-full h-full rounded-full bg-background" />
                    </div>
                    <Avatar className="w-16 h-16 border-2 border-background relative z-10">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title || 'Publicação'}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          E
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {post.video_url && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-20">
                        <Play className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {post.audio_url && !post.video_url && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-20">
                        <Volume2 className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {!post.video_url && !post.audio_url && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-20">
                        <span className="text-[8px] text-primary-foreground font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground max-w-[70px] truncate group-hover:text-foreground transition-colors">
                    {post.title || 'ESSENZA'}
                  </span>
                </motion.div>
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Featured posts inline on homepage */}
      {featuredPosts.length > 0 && (
        <div className="pb-6">
          <div className="container mx-auto px-4 max-w-xl space-y-5">
            {featuredPosts.slice(0, 3).map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogStatus;
