import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, MessageSquare,
  Calendar, Image as ImageIcon, FileText, Video, Mic, Star, StarOff, Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminBlog = () => {
  const { user } = useAuth();
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } = useBlogPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    video_url: '',
    audio_url: '',
    is_active: true,
    featured: false,
    expires_at: '',
  });

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || '',
        content: editingPost.content,
        image_url: editingPost.image_url || '',
        video_url: editingPost.video_url || '',
        audio_url: editingPost.audio_url || '',
        is_active: editingPost.is_active,
        featured: editingPost.featured,
        expires_at: editingPost.expires_at ? editingPost.expires_at.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '', content: '', image_url: '', video_url: '', audio_url: '',
        is_active: true, featured: false, expires_at: '',
      });
    }
  }, [editingPost]);

  const uploadMedia = async (file: File, type: 'video' | 'audio') => {
    const setter = type === 'video' ? setUploadingVideo : setUploadingAudio;
    setter(true);
    
    const ext = file.name.split('.').pop();
    const path = `${type}/${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('blog-media')
      .upload(path, file);

    if (error) {
      toast.error(`Erro ao carregar ${type}`);
      setter(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('blog-media').getPublicUrl(path);
    setFormData(prev => ({
      ...prev,
      [`${type}_url`]: urlData.publicUrl,
    }));
    setter(false);
    toast.success(`${type === 'video' ? 'Vídeo' : 'Áudio'} carregado!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('O conteúdo é obrigatório');
      return;
    }

    const postData = {
      title: formData.title || null,
      content: formData.content,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      audio_url: formData.audio_url || null,
      is_active: formData.is_active,
      featured: formData.featured,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      published_at: new Date().toISOString(),
      created_by: user?.id || null,
    };

    if (editingPost) {
      await updatePost(editingPost.id, postData);
    } else {
      await createPost(postData);
    }

    setIsDialogOpen(false);
    setEditingPost(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta publicação?')) {
      await deletePost(id);
    }
  };

  const handleToggleActive = async (post: BlogPost) => {
    await updatePost(post.id, { is_active: !post.is_active } as any);
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    await updatePost(post.id, { featured: !post.featured } as any);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Blog & Avisos
          </h2>
          <p className="text-muted-foreground text-sm">
            Publique avisos com texto, imagem, vídeo ou áudio. Marque como destaque para aparecer na página principal.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Publicação
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Editar Publicação' : 'Nova Publicação'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Promoção de Natal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva o aviso ou novidade..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Imagem (opcional)</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="product-images"
                  folder="blog"
                />
              </div>

              {/* Video upload */}
              <div className="space-y-2">
                <Label>Vídeo (opcional)</Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMedia(file, 'video');
                  }}
                />
                {formData.video_url ? (
                  <div className="space-y-2">
                    <video src={formData.video_url} controls className="w-full rounded-lg max-h-48" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, video_url: '' })}>
                      Remover vídeo
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                  >
                    {uploadingVideo ? 'Carregando...' : <><Video className="h-4 w-4 mr-2" /> Carregar Vídeo</>}
                  </Button>
                )}
              </div>

              {/* Audio upload */}
              <div className="space-y-2">
                <Label>Áudio (opcional)</Label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMedia(file, 'audio');
                  }}
                />
                {formData.audio_url ? (
                  <div className="space-y-2">
                    <audio src={formData.audio_url} controls className="w-full" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, audio_url: '' })}>
                      Remover áudio
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={uploadingAudio}
                  >
                    {uploadingAudio ? 'Carregando...' : <><Mic className="h-4 w-4 mr-2" /> Carregar Áudio</>}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expires_at">Data de Expiração (opcional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="cursor-pointer">Publicar imediatamente</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Mostrar na página principal
                </Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPost ? 'Guardar Alterações' : 'Publicar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Total de Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.featured).length}</p>
                <p className="text-xs text-muted-foreground">Destaques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{posts.reduce((acc, p) => acc + p.views_count, 0)}</p>
                <p className="text-xs text-muted-foreground">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Publicações</CardTitle>
          <CardDescription>
            Gerencie os avisos e novidades da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma publicação</h3>
              <p className="text-muted-foreground mb-4">
                Crie a primeira publicação
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Publicação
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publicação</TableHead>
                    <TableHead className="hidden md:table-cell">Media</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="hidden sm:table-cell">Views</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {post.image_url ? (
                            <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">{post.title || 'Sem título'}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1">
                          {post.image_url && <Badge variant="outline" className="text-[10px]"><ImageIcon className="w-3 h-3 mr-1" />Img</Badge>}
                          {post.video_url && <Badge variant="outline" className="text-[10px]"><Video className="w-3 h-3 mr-1" />Vídeo</Badge>}
                          {post.audio_url && <Badge variant="outline" className="text-[10px]"><Mic className="w-3 h-3 mr-1" />Áudio</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.published_at), 'dd MMM yyyy', { locale: pt })}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {post.views_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={post.is_active ? 'default' : 'secondary'}>
                            {post.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {post.featured && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <Star className="w-3 h-3 mr-1" /> Destaque
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(post)}
                            title={post.featured ? 'Remover destaque' : 'Destacar na página principal'}
                          >
                            {post.featured ? (
                              <StarOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(post)} title={post.is_active ? 'Desactivar' : 'Activar'}>
                            {post.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};

export default AdminBlog;
