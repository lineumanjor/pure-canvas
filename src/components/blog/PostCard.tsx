import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPost, useBlogComments, useBlogReactions } from '@/hooks/useBlogPosts';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  ThumbsUp,
  Laugh,
  Flame,
  Send,
  Trash2,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const REACTIONS = [
  { key: 'like', icon: ThumbsUp, label: '👍', color: 'text-primary' },
  { key: 'love', icon: Heart, label: '❤️', color: 'text-destructive' },
  { key: 'haha', icon: Laugh, label: '😂', color: 'text-amber-500' },
  { key: 'fire', icon: Flame, label: '🔥', color: 'text-orange-500' },
];

const PostCard = ({ post, index }: { post: BlogPost; index: number }) => {
  const { user } = useAuth();
  const { incrementViews } = useBlogPosts();
  const { comments, loading: commentsLoading, addComment, deleteComment } = useBlogComments(post.id);
  const { reactions, toggleReaction, getReactionCount, hasReacted } = useBlogReactions(post.id);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleView = () => {
    incrementViews(post.id);
  };

  const handleReaction = (reaction: string) => {
    if (!user) return;
    toggleReaction(user.id, reaction);
    setShowReactions(false);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    await addComment(user.id, newComment.trim());
    setNewComment('');
  };

  const totalReactions = REACTIONS.reduce((sum, r) => sum + getReactionCount(r.key), 0);
  const userMainReaction = user ? REACTIONS.find(r => hasReacted(user.id, r.key)) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onViewportEnter={handleView}
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
              locale: pt,
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

      {/* Post Image */}
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
        </motion.div>
      )}

      {/* Video Player */}
      {post.video_url && (
        <div className="relative w-full bg-black">
          <video
            src={post.video_url}
            controls
            className="w-full max-h-[500px]"
            poster={post.image_url || undefined}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Seu navegador não suporta vídeo.
          </video>
        </div>
      )}

      {/* Audio Player */}
      {post.audio_url && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <audio
              src={post.audio_url}
              controls
              className="flex-1 h-8"
              preload="metadata"
            />
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {totalReactions > 0 && (
              <>
                <div className="flex -space-x-1">
                  {REACTIONS.filter(r => getReactionCount(r.key) > 0)
                    .slice(0, 3)
                    .map(r => (
                      <span key={r.key} className="text-sm">{r.label}</span>
                    ))}
                </div>
                <span>{totalReactions}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {comments.length > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {comments.length} comentário{comments.length !== 1 ? 's' : ''}
              </button>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.views_count}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border/50" />

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-2 py-1.5 relative">
        {/* Reaction picker */}
        <div className="relative flex-1">
          <Button
            variant="ghost"
            size="sm"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onClick={() => user && handleReaction('like')}
            className={`w-full gap-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              userMainReaction ? userMainReaction.color : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {userMainReaction ? (
              <span className="text-base">{userMainReaction.label}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            {userMainReaction ? 'Reagido' : 'Gostei'}
          </Button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                className="absolute -top-12 left-0 flex gap-1 bg-card shadow-lg rounded-full px-2 py-1.5 border border-border z-50"
              >
                {REACTIONS.map(r => (
                  <motion.button
                    key={r.key}
                    whileHover={{ scale: 1.3, y: -5 }}
                    onClick={() => handleReaction(r.key)}
                    className="text-xl hover:bg-muted rounded-full p-1 transition-colors"
                    title={r.key}
                  >
                    {r.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
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
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Comment input */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="text-sm h-9 rounded-full bg-muted/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleComment}
                      disabled={!newComment.trim()}
                      className="h-9 w-9 flex-shrink-0"
                    >
                      <Send className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Inicie sessão para comentar
                </p>
              )}

              {/* Comments list */}
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 group"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {comment.profile?.avatar_url ? (
                      <img src={comment.profile.avatar_url} className="object-cover w-full h-full" />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {comment.profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">
                        {comment.profile?.full_name || 'Utilizador'}
                      </p>
                      <p className="text-sm text-foreground/85">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: pt,
                        })}
                      </span>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-[10px] text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default PostCard;
