import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Briefcase, 
  Clock, 
  Phone, 
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PartnerServiceRequestsProps {
  partnerId: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contactado",
  quoted: "Orçamento Enviado",
  accepted: "Aceite",
  in_progress: "Em Progresso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  contacted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const PartnerServiceRequests = ({ partnerId }: PartnerServiceRequestsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["partner-service-requests", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { error } = await supabase
        .from("service_requests")
        .update({ status })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-service-requests", partnerId] });
      toast({ title: "Estado atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar estado", variant: "destructive" });
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhuma solicitação ainda</h3>
          <p className="text-sm text-muted-foreground">
            As solicitações de serviço dos clientes aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Solicitações de Serviço
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie os pedidos de orçamento dos clientes
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {request.service_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Solicitação #{request.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusColors[request.status]} border`}>
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Description */}
                  {request.service_description && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-foreground">
                          {request.service_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {request.client_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`tel:${request.client_phone}`}
                        className="text-primary hover:underline"
                      >
                        {request.client_phone}
                      </a>
                    </div>
                    {request.client_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${request.client_email}`}
                          className="text-primary hover:underline"
                        >
                          {request.client_email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(request.created_at)}
                    </div>
                  </div>

                  {/* Preferred Date/Time */}
                  {(request.preferred_date || request.preferred_time) && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">
                        Data/Hora Preferida
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        {request.preferred_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            {format(new Date(request.preferred_date), "PPP", { locale: pt })}
                          </div>
                        )}
                        {request.preferred_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            {request.preferred_time}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {request.notes && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                      <MessageSquare className="w-4 h-4 mt-0.5" />
                      <p>{request.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Atualizar estado:
                      </span>
                      <Select
                        value={request.status}
                        onValueChange={(value) => 
                          updateStatusMutation.mutate({ requestId: request.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="contacted">Contactado</SelectItem>
                          <SelectItem value="quoted">Orçamento Enviado</SelectItem>
                          <SelectItem value="accepted">Aceite</SelectItem>
                          <SelectItem value="in_progress">Em Progresso</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Quick Contact */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${request.client_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                      {request.client_email && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`mailto:${request.client_email}`}>
                            <Mail className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerServiceRequests;
