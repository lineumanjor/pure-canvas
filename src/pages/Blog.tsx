import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Clock, 
  ArrowLeft,
  Bookmark,
  ThumbsUp,
  Play
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, index }: { post: BlogPost; index: number }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const { incrementViews } = useBlogPosts();

  const handleView = () => {
    incrementViews(post.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onViewportEnter={handleView}
      viewport={{ once: true }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Post Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="relative">
          <Avatar className="w-11 h-11 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
              EJ
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center">
            <span className="text-[6px] text-primary-foreground">✓</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">ESSENZA E.J</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(post.published_at), { 
              addSuffix: true, 
              locale: pt 
            })}
          </p>
        </div>
      </div>

      {/* Post Content - Text */}
      {post.content && (
        <div className="px-4 pb-3">
          {post.title && (
            <h3 className="font-bold text-base text-foreground mb-1.5 leading-tight">
              {post.title}
            </h3>
          )}
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* Post Image/Media */}
      {post.image_url && (
        <motion.div 
          className="relative w-full bg-muted cursor-pointer group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <img 
            src={post.image_url} 
            alt={post.title || 'Publicação ESSENZA'} 
            className="w-full object-cover max-h-[500px]"
            loading="lazy"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        </motion.div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-primary-foreground" />
              </span>
              <span className="w-[18px] h-[18px] rounded-full bg-destructive flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-destructive-foreground fill-current" />
              </span>
            </div>
            <span>{post.views_count} pessoas</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views_count} visualizações</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border/50" />

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLiked(!liked)}
          className={`flex-1 gap-2 text-xs font-medium rounded-lg transition-all duration-200 ${
            liked 
              ? 'text-primary hover:text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <motion.div
            animate={liked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </motion.div>
          Gostei
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
        >
          <MessageCircle className="w-4 h-4" />
          Comentar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: post.title || 'ESSENZA E.J',
                text: post.content,
                url: window.location.href,
              });
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          Partilhar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSaved(!saved)}
          className={`gap-2 text-xs font-medium rounded-lg px-3 transition-all duration-200 ${
            saved 
              ? 'text-accent hover:text-accent' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <motion.div
            animate={saved ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </motion.div>
        </Button>
      </div>
    </motion.article>
  );
};

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
