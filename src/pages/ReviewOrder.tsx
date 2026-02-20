import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface OrderDetails {
  id: string;
  partner_id: string;
  partner: {
    id: string;
    name: string;
    image_url: string | null;
  };
  items: Array<{
    id: string;
    product_id: string | null;
    product_name: string;
  }>;
}

const ReviewOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [partnerRating, setPartnerRating] = useState(0);
  const [partnerComment, setPartnerComment] = useState("");
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [productComments, setProductComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-for-review", orderId],
    queryFn: async () => {
      if (!orderId || !user) return null;
      
      // Verify the order belongs to the user and is delivered
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, partner_id, status")
        .eq("id", orderId)
        .eq("client_id", user.id)
        .eq("status", "delivered")
        .maybeSingle();
      
      if (orderError || !orderData) return null;
      
      // Get partner info
      const { data: partner } = await supabase
        .from("partners")
        .select("id, name, image_url")
        .eq("id", orderData.partner_id)
        .maybeSingle();
      
      // Get order items with products
      const { data: items } = await supabase
        .from("order_items")
        .select("id, product_id, product_name")
        .eq("order_id", orderId);
      
      // Check existing reviews
      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("partner_id, product_id")
        .eq("order_id", orderId)
        .eq("user_id", user.id);
      
      if (existingReviews && existingReviews.length > 0) {
        setSubmitted(true);
      }
      
      return {
        id: orderData.id,
        partner_id: orderData.partner_id,
        partner: partner || { id: orderData.partner_id, name: "Parceiro", image_url: null },
        items: items || []
      } as OrderDetails;
    },
    enabled: !!orderId && !!user,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user || !order) throw new Error("Dados insuficientes");
      
      const reviews = [];
      
      // Partner review
      if (partnerRating > 0) {
        reviews.push({
          user_id: user.id,
          partner_id: order.partner_id,
          product_id: null,
          order_id: orderId,
          rating: partnerRating,
          comment: partnerComment || null,
        });
      }
      
      // Product reviews
      for (const item of order.items) {
        if (item.product_id && productRatings[item.product_id]) {
          reviews.push({
            user_id: user.id,
            partner_id: null,
            product_id: item.product_id,
            order_id: orderId,
            rating: productRatings[item.product_id],
            comment: productComments[item.product_id] || null,
          });
        }
      }
      
      if (reviews.length === 0) {
        throw new Error("Por favor, adicione pelo menos uma avaliação");
      }
      
      const { error } = await supabase.from("reviews").insert(reviews);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-orders"] });
      setSubmitted(true);
      toast({ title: "Avaliação enviada com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao enviar avaliação", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    submitReviewMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Pedido não encontrado ou não disponível para avaliação.</p>
              <Button onClick={() => navigate("/meus-pedidos")}>
                Ver Meus Pedidos
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Obrigado pela sua avaliação!
                </h2>
                <p className="text-muted-foreground mb-6">
                  A sua opinião ajuda outros clientes e os nossos parceiros a melhorar.
                </p>
                <Button onClick={() => navigate("/meus-pedidos")}>
                  Ver Meus Pedidos
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Avaliar Pedido
            </h1>
            <p className="text-muted-foreground">
              Partilhe a sua experiência
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Partner Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {order.partner.image_url ? (
                      <img 
                        src={order.partner.image_url} 
                        alt={order.partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Star className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{order.partner.name}</CardTitle>
                    <CardDescription>Avalie a loja</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Classificação</Label>
                  <StarRating 
                    rating={partnerRating} 
                    onRatingChange={setPartnerRating} 
                  />
                </div>
                <div>
                  <Label htmlFor="partner-comment">Comentário (opcional)</Label>
                  <Textarea
                    id="partner-comment"
                    value={partnerComment}
                    onChange={(e) => setPartnerComment(e.target.value)}
                    placeholder="Partilhe a sua experiência com esta loja..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Reviews */}
          {order.items.filter(item => item.product_id).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{item.product_name}</CardTitle>
                  <CardDescription>Avalie o produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Classificação</Label>
                    <StarRating 
                      rating={productRatings[item.product_id!] || 0} 
                      onRatingChange={(rating) => 
                        setProductRatings(prev => ({ ...prev, [item.product_id!]: rating }))
                      } 
                    />
                  </div>
                  <div>
                    <Label>Comentário (opcional)</Label>
                    <Textarea
                      value={productComments[item.product_id!] || ""}
                      onChange={(e) => 
                        setProductComments(prev => ({ ...prev, [item.product_id!]: e.target.value }))
                      }
                      placeholder="O que achou deste produto?"
                      rows={2}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Submit Button */}
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={handleSubmit}
            disabled={submitReviewMutation.isPending || partnerRating === 0}
          >
            {submitReviewMutation.isPending ? (
              "A enviar..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRatingChange(star)}
        >
          <Star 
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default ReviewOrder;
