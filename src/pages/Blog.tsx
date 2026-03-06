import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/blog/PostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="w-24 h-3.5" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
    </div>
    <Skeleton className="w-full h-64 rounded-lg" />
    <div className="flex gap-4">
      <Skeleton className="w-20 h-8 rounded-lg" />
      <Skeleton className="w-20 h-8 rounded-lg" />
      <Skeleton className="w-20 h-8 rounded-lg" />
    </div>
  </div>
);

const Blog = () => {
  const { posts, loading } = useBlogPosts();
  const navigate = useNavigate();

  const activePosts = posts.filter(p => p.is_active);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 text-secondary-foreground"
        >
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-bold font-display"
                >
                  Publicações
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-secondary-foreground/70 text-sm"
                >
                  Novidades, avisos e actualizações da ESSENZA E.J
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feed */}
        <div className="container mx-auto px-4 py-6 max-w-xl">
          {loading ? (
            <div className="space-y-5">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : activePosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma publicação ainda
              </h3>
              <p className="text-muted-foreground text-sm">
                As novidades e avisos da ESSENZA aparecerão aqui.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-5">
                {activePosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
