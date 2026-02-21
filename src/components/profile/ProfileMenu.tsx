import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ClipboardList, Camera, Loader2, MapPin, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isPartner } = useAuth();
  const { profile, uploadAvatar, updateProfileAsync, isUpdating } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    gender: "",
    delivery_address: "",
  });

  const openProfileDialog = () => {
    setProfileForm({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      gender: (profile as any)?.gender || "",
      delivery_address: (profile as any)?.delivery_address || "",
    });
    setIsProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileAsync({
        full_name: profileForm.full_name || null,
        phone: profileForm.phone || null,
        gender: profileForm.gender || null,
        delivery_address: profileForm.delivery_address || null,
      } as any);
      toast.success("Perfil atualizado!");
      setIsProfileOpen(false);
    } catch {
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Foto de perfil atualizada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Utilizador";

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openProfileDialog}>
            <Settings className="w-4 h-4 mr-2" />
            Editar Perfil
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate("/eunice-admin")}>
              Painel Admin
            </DropdownMenuItem>
          )}
          {isPartner && (
            <DropdownMenuItem onClick={() => navigate("/painel-parceiro")}>
              Painel Parceiro
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate("/meus-pedidos")}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Meus Pedidos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome completo</Label>
              <Input
                id="profile-name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+244 9XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Género</Label>
              <RadioGroup
                value={profileForm.gender}
                onValueChange={(v) => setProfileForm({ ...profileForm, gender: v })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="profile-masc" />
                  <Label htmlFor="profile-masc" className="cursor-pointer">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feminino" id="profile-fem" />
                  <Label htmlFor="profile-fem" className="cursor-pointer">Feminino</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-address">
                <MapPin className="w-4 h-4 inline mr-1" />
                Endereço de entrega preferido
              </Label>
              <Textarea
                id="profile-address"
                value={profileForm.delivery_address}
                onChange={(e) => setProfileForm({ ...profileForm, delivery_address: e.target.value })}
                placeholder="Rua, bairro, ponto de referência..."
                rows={3}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? "A guardar..." : "Guardar alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;
