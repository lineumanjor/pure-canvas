import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Package, Search, Eye, EyeOff, Trash2 } from 'lucide-react';
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  available: boolean;
  partner_id: string;
  created_at: string;
  partner?: {
    name: string;
    status: string;
  };
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        partner:partners(name, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar produtos');
      console.error(error);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductAvailability = async (productId: string, currentAvailability: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ available: !currentAvailability })
      .eq('id', productId);

    if (error) {
      toast.error('Erro ao atualizar disponibilidade');
      console.error(error);
    } else {
      toast.success('Disponibilidade atualizada');
      fetchProducts();
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { toast.error('Erro ao apagar produto'); return; }
    toast.success('Produto apagado com sucesso');
    fetchProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.partner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.available).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-primary">A carregar produtos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{availableProducts}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indisponíveis</p>
                <p className="text-2xl font-bold text-muted-foreground">{totalProducts - availableProducts}</p>
              </div>
              <EyeOff className="h-8 w-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Produtos</CardTitle>
          <CardDescription>Visualizar e moderar produtos dos parceiros</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, categoria ou parceiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum produto encontrado' : 'Ainda não há produtos registados'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="hidden md:table-cell">Parceiro</TableHead>
                    <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                     <TableHead>Preço</TableHead>
                    <TableHead>Disponível</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description || 'Sem descrição'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span>{product.partner?.name || 'Desconhecido'}</span>
                          {product.partner?.status === 'approved' && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                              Ativo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.available}
                          onCheckedChange={() => toggleProductAvailability(product.id, product.available)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apagar produto?</AlertDialogTitle>
                              <AlertDialogDescription>Este produto será permanentemente apagado.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
