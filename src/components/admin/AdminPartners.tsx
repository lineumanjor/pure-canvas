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
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Eye, Search, Users, Clock, CheckCircle, XCircle, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  category: string;
  location: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string | null;
  is_top: boolean;
  top_marked_at: string | null;
  top_marked_by: string | null;
}

const AdminPartners = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [legacyTopBackfillDone, setLegacyTopBackfillDone] = useState(false);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar parceiros');
      console.error(error);
    } else {
      setPartners(data as Partner[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Legacy fix: assume already-approved partners were "crachados" before the TOP system existed.
  // When an admin opens this screen, automatically mark approved partners as TOP once.
  useEffect(() => {
    if (!user) return;
    if (legacyTopBackfillDone) return;

    const legacyApprovedIds = partners
      .filter((p) => p.status === 'approved' && !p.is_top)
      .map((p) => p.id);

    if (legacyApprovedIds.length === 0) return;

    setLegacyTopBackfillDone(true);

    (async () => {
      const { error } = await supabase
        .from('partners')
        .update({
          is_top: true,
          top_marked_at: new Date().toISOString(),
          top_marked_by: user.id,
        })
        .in('id', legacyApprovedIds);

      if (error) {
        console.error(error);
        toast.error('Erro ao marcar lojas antigas como TOP');
        setLegacyTopBackfillDone(false);
        return;
      }

      toast.success(`${legacyApprovedIds.length} loja(s) antigas marcadas como TOP`);
      fetchPartners();
    })();
  }, [partners, user, legacyTopBackfillDone]);

  const updatePartnerStatus = async (partnerId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('partners')
      .update({ 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: status === 'approved' ? user?.id : null
      })
      .eq('id', partnerId);

    if (error) {
      toast.error('Erro ao atualizar estado do parceiro');
      console.error(error);
    } else {
      toast.success(status === 'approved' ? 'Parceiro aprovado!' : 'Parceiro rejeitado');
      
      // If approved, add partner role to user
      if (status === 'approved') {
        const partner = partners.find(p => p.id === partnerId);
        if (partner?.user_id) {
          await supabase
            .from('user_roles')
            .upsert({ user_id: partner.user_id, role: 'partner' }, { onConflict: 'user_id,role' });
        }
      }
      
      fetchPartners();
      setDetailsOpen(false);
    }
  };

  const toggleTopStatus = async (partnerId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('partners')
      .update({ 
        is_top: !currentStatus,
        top_marked_at: !currentStatus ? new Date().toISOString() : null,
        top_marked_by: !currentStatus ? user?.id : null
      })
      .eq('id', partnerId);

    if (error) {
      toast.error('Erro ao atualizar destaque do parceiro');
      console.error(error);
    } else {
      toast.success(!currentStatus ? 'Parceiro marcado como TOP!' : 'Destaque TOP removido');
      fetchPartners();
      if (selectedPartner?.id === partnerId) {
        setSelectedPartner(prev => prev ? { ...prev, is_top: !currentStatus } : null);
      }
    }
  };

  const deletePartner = async (partnerId: string) => {
    const { error } = await supabase.from('partners').delete().eq('id', partnerId);
    if (error) { toast.error('Erro ao apagar parceiro'); return; }
    toast.success('Parceiro apagado com sucesso');
    setDetailsOpen(false);
    fetchPartners();
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = partners.filter(p => p.status === 'pending').length;
  const approvedCount = partners.filter(p => p.status === 'approved').length;
  const rejectedCount = partners.filter(p => p.status === 'rejected').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary">A carregar parceiros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{partners.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Parceiros</CardTitle>
          <CardDescription>Aprovar, rejeitar e gerir parceiros da plataforma</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, email ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum parceiro encontrado' : 'Ainda não há parceiros registados'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead className="hidden lg:table-cell">Localização</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">TOP</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {partner.name}
                            {partner.is_top && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                          </p>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{partner.category}</TableCell>
                      <TableCell className="hidden lg:table-cell">{partner.location}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell className="text-center">
                        <Switch 
                          checked={partner.is_top}
                          onCheckedChange={() => toggleTopStatus(partner.id, partner.is_top)}
                          disabled={partner.status !== 'approved'}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {partner.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updatePartnerStatus(partner.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar parceiro?</AlertDialogTitle>
                                <AlertDialogDescription>Este parceiro e todos os dados associados serão permanentemente apagados.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePartner(partner.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Parceiro
              {selectedPartner?.is_top && <Badge className="bg-primary/20 text-primary border-0"><Sparkles className="w-3 h-3 mr-1" /> TOP</Badge>}
            </DialogTitle>
            <DialogDescription>Informações completas do parceiro</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedPartner.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getStatusBadge(selectedPartner.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPartner.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedPartner.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedPartner.whatsapp || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  <p className="font-medium">{selectedPartner.instagram || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">{selectedPartner.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">{selectedPartner.location}</p>
                </div>
              </div>
              {selectedPartner.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedPartner.description}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Destaque TOP</p>
                    <p className="text-xs text-muted-foreground mt-1">Aparecer na secção de lojas verificadas</p>
                  </div>
                  <Switch 
                    checked={selectedPartner.is_top}
                    onCheckedChange={() => toggleTopStatus(selectedPartner.id, selectedPartner.is_top)}
                    disabled={selectedPartner.status !== 'approved'}
                  />
                </div>
                {selectedPartner.is_top && selectedPartner.top_marked_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Marcado como TOP em {new Date(selectedPartner.top_marked_at).toLocaleDateString('pt-AO')}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Data de Registo</p>
                <p className="font-medium">
                  {new Date(selectedPartner.created_at).toLocaleDateString('pt-AO')}
                </p>
              </div>
              
              {selectedPartner.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updatePartnerStatus(selectedPartner.id, 'approved')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updatePartnerStatus(selectedPartner.id, 'rejected')}
                  >
                    <X className="h-4 w-4 mr-2" />
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

export default AdminPartners;