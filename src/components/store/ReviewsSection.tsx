import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Quote } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewsSectionProps {
  partnerId: string;
  productId?: string;
}

const ReviewsSection = ({ partnerId, productId }: ReviewsSectionProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", partnerId, productId],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (productId) {
        query = query.eq("product_id", productId);
      } else {
        query = query.eq("partner_id", partnerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch profiles for each review
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        return data.map(review => ({
          ...review,
          profile: profileMap.get(review.user_id) || null
        })) as Review[];
      }
      
      return data as Review[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Ainda não há avaliações
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Seja o primeiro a avaliar!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string | null | undefined, odUser: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "CL";
  };

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary/10">
                  {review.profile?.avatar_url ? (
                    <AvatarImage 
                      src={review.profile.avatar_url} 
                      alt={review.profile.full_name || "Cliente"} 
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(review.profile?.full_name, review.user_id)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {review.profile?.full_name || "Cliente"}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "dd MMM yyyy", { locale: pt })}
                    </span>
                  </div>
                  {review.comment && (
                    <div className="relative mt-2">
                      <Quote className="w-4 h-4 text-primary/20 absolute -left-1 -top-1" />
                      <p className="text-sm text-foreground/80 pl-4 italic">
                        {review.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewsSection;
