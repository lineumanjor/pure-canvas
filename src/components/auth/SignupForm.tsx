import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";
import AvatarUpload from "./AvatarUpload";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Nome muito curto")
      .max(100, "Nome muito longo"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (email: string, password: string, fullName: string, avatarFile?: File) => Promise<void>;
  isLoading: boolean;
}

const SignupForm = ({ onSubmit, isLoading }: SignupFormProps) => {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleFormSubmit = async (data: SignupFormData) => {
    await onSubmit(
      data.email.trim().toLowerCase(),
      data.password,
      data.fullName.trim(),
      avatarFile || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Avatar Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.4 }}
        className="flex justify-center pb-2"
      >
        <AvatarUpload value={avatarPreview} onChange={setAvatarPreview} onFileSelect={setAvatarFile} size="md" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <AuthInput
          label="Nome completo"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Seu nome"
          icon={User}
          error={errors.fullName?.message}
          {...register("fullName")}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <AuthInput
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <AuthInput
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <AuthInput
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <AuthButton type="submit" isLoading={isLoading}>
          Criar conta
        </AuthButton>
      </motion.div>
    </form>
  );
};

export default SignupForm;
