import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface VideoConference {
  id: string;
  partner_id: string;
  created_by: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  room_name: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateVideoConference {
  partner_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
}

export const useVideoConferences = (partnerId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conferences = [], isLoading } = useQuery({
    queryKey: ["video-conferences", partnerId],
    queryFn: async () => {
      let query = supabase
        .from("video_conferences")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (partnerId) {
        query = query.eq("partner_id", partnerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as VideoConference[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateVideoConference) => {
      if (!user) throw new Error("Not authenticated");
      const roomName = `essenza-${input.partner_id.slice(0, 8)}-${Date.now()}`;
      const { error } = await supabase.from("video_conferences").insert({
        partner_id: input.partner_id,
        created_by: user.id,
        title: input.title,
        description: input.description || null,
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes,
        room_name: roomName,
      });
      if (error) throw error;

      // Send notification email to partner
      try {
        const { data: partner } = await supabase
          .from("partners")
          .select("email, name, user_id")
          .eq("id", input.partner_id)
          .single();

        if (partner) {
          // Get partner user email from auth if partner email not set
          let partnerEmail = partner.email;
          if (!partnerEmail && partner.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("user_id")
              .eq("user_id", partner.user_id)
              .single();
            // We can't get auth email from client, so use the edge function
          }

          await supabase.functions.invoke("send-notification-email", {
            body: {
              type: "video_conference_scheduled",
              record: {
                title: input.title,
                description: input.description,
                scheduled_at: input.scheduled_at,
                duration_minutes: input.duration_minutes,
                partner_id: input.partner_id,
                partner_name: partner.name,
                room_name: roomName,
              },
            },
          });
        }
      } catch (err) {
        console.error("Failed to send video conference email:", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-conferences"] });
      toast.success("Videoconferência agendada com sucesso!");
    },
    onError: () => toast.error("Erro ao agendar videoconferência"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      if (status === "completed") updates.ended_at = new Date().toISOString();

      const { error } = await supabase
        .from("video_conferences")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-conferences"] });
    },
  });

  const upcomingConferences = conferences.filter(
    c => c.status === "scheduled" && new Date(c.scheduled_at) > new Date()
  );

  return {
    conferences,
    isLoading,
    upcomingConferences,
    createConference: createMutation.mutate,
    creating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
  };
};
