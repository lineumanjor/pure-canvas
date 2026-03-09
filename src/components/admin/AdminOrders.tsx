import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ShoppingCart, Search, Eye, Clock, CheckCircle, XCircle, Truck, Package, Trash2 } from 'lucide-react';
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

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  total: number;
  commission_amount: number | null;
  status: string;
  delivery_address: string | null;
  delivery_phone: string | null;
  delivery_notes: string | null;
  created_at: string;
  partner?: {
    name: string;
  };
  order_items?: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        partner:partners(name),
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar pedidos');
      console.error(error);
    } else {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar estado do pedido');
      console.error(error);
    } else {
      toast.success('Estado do pedido atualizado');
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) { toast.error('Erro ao apagar pedido'); return; }
    toast.success('Pedido apagado com sucesso');
    setDetailsOpen(false);
    fetchOrders();
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

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
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Confirmado</Badge>;
      case 'preparing':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30"><Package className="h-3 w-3 mr-1" /> Em Preparação</Badge>;
      case 'delivering':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30"><Truck className="h-3 w-3 mr-1" /> Em Entrega</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary">A carregar pedidos...</div>
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
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Pedidos</CardTitle>
          <CardDescription>Acompanhar e gerir todos os pedidos da plataforma</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por ID, parceiro ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum pedido encontrado' : 'Ainda não há pedidos registados'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead className="hidden md:table-cell">Parceiro</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('pt-AO')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.partner?.name || 'Desconhecido'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-primary">
                        {formatPrice(order.commission_amount || 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar pedido?</AlertDialogTitle>
                                <AlertDialogDescription>Este pedido e todos os seus itens serão permanentemente apagados.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
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

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parceiro</p>
                  <p className="font-medium">{selectedOrder.partner?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">{formatPrice(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comissão</p>
                  <p className="font-medium text-primary">
                    {formatPrice(selectedOrder.commission_amount || 0)}
                  </p>
                </div>
              </div>

              {selectedOrder.delivery_address && (
                <div>
                  <p className="text-sm text-muted-foreground">Endereço de Entrega</p>
                  <p className="font-medium">{selectedOrder.delivery_address}</p>
                </div>
              )}

              {selectedOrder.delivery_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedOrder.delivery_phone}</p>
                </div>
              )}

              {selectedOrder.delivery_notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{selectedOrder.delivery_notes}</p>
                </div>
              )}

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Itens do Pedido</p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-medium">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Alterar Estado</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    updateOrderStatus(selectedOrder.id, value);
                    setSelectedOrder({ ...selectedOrder, status: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="preparing">Em Preparação</SelectItem>
                    <SelectItem value="delivering">Em Entrega</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
