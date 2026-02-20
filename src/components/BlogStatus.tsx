import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const BlogStatus = () => {
  const { posts, loading, incrementViews } = useBlogPosts();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-advance progress bar
  useEffect(() => {
    if (!selectedPost) {
      setProgress(0);
      return;
    }

    const duration = selectedPost.image_url ? 8000 : 5000; // 8s for images, 5s for text
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Auto-advance to next
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [selectedPost, currentIndex]);

  const handleOpenPost = (post: BlogPost, index: number) => {
    setCurrentIndex(index);
    setSelectedPost(post);
    setProgress(0);
    incrementViews(post.id);
  };

  const handleClose = () => {
    setSelectedPost(null);
    setProgress(0);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedPost(posts[newIndex]);
      setProgress(0);
      incrementViews(posts[newIndex].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedPost(posts[newIndex]);
      setProgress(0);
      incrementViews(posts[newIndex].id);
    } else {
      handleClose();
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
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

  if (posts.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-6 bg-gradient-to-r from-secondary/50 to-secondary/30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Avisos & Novidades
            </h2>
          </div>
          
          <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {posts.map((post, index) => (
              <motion.button
                key={post.id}
                onClick={() => handleOpenPost(post, index)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  {/* Ring gradient */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60 p-[3px]">
                    <div className="w-full h-full rounded-full bg-background" />
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="w-16 h-16 border-2 border-background relative z-10">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title || 'Status'} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        E
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* New indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-20">
                    <span className="text-[8px] text-primary-foreground font-bold">!</span>
                  </div>
                </div>
                
                <span className="text-xs text-muted-foreground max-w-[70px] truncate group-hover:text-foreground transition-colors">
                  {post.title || 'ESSENZA'}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Full-screen Status Viewer */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-lg w-full h-[90vh] max-h-[700px] p-0 bg-black border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedPost && (
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full flex flex-col"
              >
                {/* Progress bars */}
                <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-2">
                  {posts.map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-75"
                        style={{ 
                          width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' 
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white/50">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        E
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm">ESSENZA E.J</p>
                      <p className="text-white/70 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(selectedPost.published_at), { 
                          addSuffix: true, 
                          locale: pt 
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-16">
                  {selectedPost.image_url ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedPost.image_url} 
                        alt={selectedPost.title || 'Status'} 
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      {/* Text overlay */}
                      {selectedPost.content && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                          {selectedPost.title && (
                            <h3 className="text-white font-bold text-lg mb-2">
                              {selectedPost.title}
                            </h3>
                          )}
                          <p className="text-white/90 text-sm leading-relaxed">
                            {selectedPost.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-6">
                      {selectedPost.title && (
                        <motion.h3 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-white font-bold text-2xl mb-4"
                        >
                          {selectedPost.title}
                        </motion.h3>
                      )}
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/90 text-lg leading-relaxed"
                      >
                        {selectedPost.content}
                      </motion.p>
                    </div>
                  )}
                </div>

                {/* Navigation areas */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-20 bottom-16 w-1/3 z-10"
                  disabled={currentIndex === 0}
                />
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-20 bottom-16 w-1/3 z-10"
                />

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <Eye className="w-4 h-4" />
                    <span>{selectedPost.views_count} visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="text-white hover:bg-white/20 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-white/70 text-xs">
                      {currentIndex + 1} / {posts.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={currentIndex === posts.length - 1}
                      className="text-white hover:bg-white/20 disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogStatus;
