import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Package, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";

interface PartnerProductsProps {
  partnerId: string;
  isServiceProvider?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  available: boolean | null;
  stock: number | null;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  available: boolean;
  stock: string;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image_url: "",
  available: true,
  stock: "",
};

const PartnerProducts = ({ partnerId, isServiceProvider = false }: PartnerProductsProps) => {
  const itemLabel = isServiceProvider ? "Serviço" : "Produto";
  const itemLabelPlural = isServiceProvider ? "Serviços" : "Produtos";
  const ItemIcon = isServiceProvider ? Briefcase : Package;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const { data: products, isLoading } = useQuery({
    queryKey: ["partner-products", partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const { error } = await supabase.from("products").insert({
        partner_id: partnerId,
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        category: data.category || null,
        image_url: data.image_url || null,
        available: data.available,
        stock: data.stock ? parseInt(data.stock) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-products", partnerId] });
      toast({ title: `${itemLabel} criado com sucesso!` });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: `Erro ao criar ${itemLabel.toLowerCase()}`, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductForm }) => {
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price),
          category: data.category || null,
          image_url: data.image_url || null,
          available: data.available,
          stock: data.stock ? parseInt(data.stock) : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-products", partnerId] });
      toast({ title: `${itemLabel} atualizado com sucesso!` });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: `Erro ao atualizar ${itemLabel.toLowerCase()}`, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-products", partnerId] });
      toast({ title: `${itemLabel} removido com sucesso!` });
    },
    onError: () => {
      toast({ title: `Erro ao remover ${itemLabel.toLowerCase()}`, variant: "destructive" });
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      image_url: product.image_url || "",
      available: product.available ?? true,
      stock: product.stock !== null ? product.stock.toString() : "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast({ title: `Preencha o nome e o preço${isServiceProvider ? ' base' : ''}`, variant: "destructive" });
      return;
    }
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Os Meus {itemLabelPlural}
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie {isServiceProvider ? 'os serviços da sua empresa' : 'os produtos da sua loja'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo {itemLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProduct ? `Editar ${itemLabel}` : `Novo ${itemLabel}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={`Nome do ${itemLabel.toLowerCase()}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={`Descrição do ${itemLabel.toLowerCase()}`}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{isServiceProvider ? 'Preço Base (Kz) *' : 'Preço (Kz) *'}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex: Bebidas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Imagem {isServiceProvider ? 'do Serviço' : 'do Produto'}</Label>
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  bucket="product-images"
                  folder={partnerId}
                  aspectRatio="square"
                />
              </div>
              {!isServiceProvider && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Quantidade em Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio se não deseja controlar estoque
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Disponível</Label>
                <Switch
                  id="available"
                  checked={form.available}
                  onCheckedChange={(checked) => setForm({ ...form, available: checked })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "A guardar..." : editingProduct ? "Guardar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ItemIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Nenhum {itemLabel.toLowerCase()} ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece a adicionar {itemLabelPlural.toLowerCase()} à sua {isServiceProvider ? 'empresa' : 'loja'}
            </p>
            <Button onClick={handleOpenCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar {itemLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {products?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="aspect-square bg-muted relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ItemIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {!product.available && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Indisponível
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-foreground line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        {Number(product.price).toLocaleString("pt-AO")} Kz
                      </span>
                    </div>
                    {!isServiceProvider && product.stock !== null && (
                      <p className={`text-xs font-medium mb-1 ${product.stock === 0 ? 'text-destructive' : product.stock <= 5 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        {product.stock === 0 ? 'Esgotado' : `${product.stock} em estoque`}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(product)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PartnerProducts;
