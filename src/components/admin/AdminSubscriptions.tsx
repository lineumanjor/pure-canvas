import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Snowflake,
  CreditCard,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  partner_id: string;
  plan_type: string;
  status: string;
  payment_method: string;
  amount: number;
  receipt_url: string | null;
  receipt_verified: boolean;
  starts_at: string | null;
  expires_at: string | null;
  approved_at: string | null;
  created_at: string;
  partner?: {
    name: string;
    is_frozen: boolean;
    status: string;
  };
}

const AdminSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('partner_subscriptions')
      .select(`
        *,
        partner:partners(name, is_frozen, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar subscrições');
      console.error(error);
    } else {
      setSubscriptions(data as Subscription[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const getPlanDays = (planType: string) => {
    switch (planType) {
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      default: return 30;
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      default: return planType;
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expirado';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const approveSubscription = async (sub: Subscription) => {
    const now = new Date();
    const days = getPlanDays(sub.plan_type);
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('partner_subscriptions')
      .update({
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        approved_at: now.toISOString(),
        approved_by: user?.id,
        receipt_verified: true,
      })
      .eq('id', sub.id);

    if (error) {
      toast.error('Erro ao aprovar subscrição');
      return;
    }

    // Unfreeze the partner store
    await supabase
      .from('partners')
      .update({ is_frozen: false })
      .eq('id', sub.partner_id);

    toast.success('Subscrição aprovada e loja ativada!');
    setDetailsOpen(false);
    fetchSubscriptions();
  };

  const rejectSubscription = async (sub: Subscription) => {
    const { error } = await supabase
      .from('partner_subscriptions')
      .update({ status: 'rejected' })
      .eq('id', sub.id);

    if (error) {
      toast.error('Erro ao rejeitar subscrição');
      return;
    }

    toast.success('Subscrição rejeitada');
    setDetailsOpen(false);
    fetchSubscriptions();
  };

  const toggleFreezeStore = async (partnerId: string, currentlyFrozen: boolean) => {
    const { error } = await supabase
      .from('partners')
      .update({ is_frozen: !currentlyFrozen })
      .eq('id', partnerId);

    if (error) {
      toast.error('Erro ao alterar estado da loja');
      return;
    }

    toast.success(!currentlyFrozen ? 'Loja congelada' : 'Loja descongelada');
    fetchSubscriptions();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Ativo</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Expirado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan_type === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const frozenCount = subscriptions.filter(s => s.partner?.is_frozen).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary">A carregar subscrições...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Congelados</p>
                <p className="text-2xl font-bold text-blue-600">{frozenCount}</p>
              </div>
              <Snowflake className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestão de Subscrições
          </CardTitle>
          <CardDescription>Monitorizar planos, aprovar pagamentos e congelar lojas</CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome do parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma subscrição encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Tempo Restante</TableHead>
                    <TableHead className="text-center">Congelado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => {
                    const timeRemaining = getTimeRemaining(sub.expires_at);
                    const isUrgent = sub.expires_at && new Date(sub.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000 && sub.status === 'active';

                    return (
                      <TableRow key={sub.id} className={isUrgent ? 'bg-yellow-500/5' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.partner?.name || 'Desconhecido'}</p>
                            <p className="text-xs text-muted-foreground">
                              {sub.payment_method === 'upload' ? 'Comprovativo' : 'Multicaixa Express'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getPlanLabel(sub.plan_type)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(sub.amount)}</TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {sub.status === 'active' && timeRemaining ? (
                            <span className={`text-sm ${isUrgent ? 'text-yellow-600 font-semibold' : 'text-muted-foreground'}`}>
                              {isUrgent && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                              {timeRemaining}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={sub.partner?.is_frozen || false}
                            onCheckedChange={() => toggleFreezeStore(sub.partner_id, sub.partner?.is_frozen || false)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSub(sub);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Subscrição</DialogTitle>
            <DialogDescription>
              {selectedSub?.partner?.name} — {getPlanLabel(selectedSub?.plan_type || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p className="font-medium">{getPlanLabel(selectedSub.plan_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">{formatPrice(selectedSub.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método</p>
                  <p className="font-medium">
                    {selectedSub.payment_method === 'upload' ? 'Upload de Comprovativo' : 'Multicaixa Express'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getStatusBadge(selectedSub.status)}
                </div>
                {selectedSub.starts_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Início</p>
                    <p className="font-medium">{new Date(selectedSub.starts_at).toLocaleDateString('pt-AO')}</p>
                  </div>
                )}
                {selectedSub.expires_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expira</p>
                    <p className="font-medium">{new Date(selectedSub.expires_at).toLocaleDateString('pt-AO')}</p>
                  </div>
                )}
              </div>

              {/* Receipt preview */}
              {selectedSub.receipt_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Comprovativo de Pagamento</p>
                  <a href={selectedSub.receipt_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedSub.receipt_url}
                      alt="Comprovativo"
                      className="max-h-64 rounded-lg border border-border object-contain w-full bg-muted"
                    />
                  </a>
                </div>
              )}

              {/* Action buttons */}
              {selectedSub.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveSubscription(selectedSub)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => rejectSubscription(selectedSub)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
