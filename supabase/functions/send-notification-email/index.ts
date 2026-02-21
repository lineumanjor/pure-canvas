import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: "partner_approved" | "product_created";
  record: {
    name: string;
    description?: string;
    category?: string;
    image_url?: string;
    location?: string;
    price?: number;
    partner_id?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload: NotificationPayload = await req.json();
    const { type, record } = payload;

    // Get all registered users' emails
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw new Error(`Erro ao buscar utilizadores: ${usersError.message}`);

    const emails = usersData.users
      .map((u) => u.email)
      .filter((e): e is string => !!e);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ message: "Sem destinatários" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject: string;
    let htmlContent: string;

    if (type === "partner_approved") {
      subject = `🎉 Nova loja na Essenza E.J: ${record.name}!`;
      htmlContent = buildPartnerEmail(record);
    } else if (type === "product_created") {
      // Get partner name
      let partnerName = "uma das nossas lojas";
      if (record.partner_id) {
        const { data: partner } = await supabase
          .from("partners")
          .select("name")
          .eq("id", record.partner_id)
          .single();
        if (partner) partnerName = partner.name;
      }
      subject = `✨ Novo produto na Essenza E.J: ${record.name}!`;
      htmlContent = buildProductEmail(record, partnerName);
    } else {
      throw new Error(`Tipo de notificação desconhecido: ${type}`);
    }

    // Send emails in batches of 50
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Essenza E.J <onboarding@resend.dev>",
          to: batch,
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Erro Resend (batch ${i}): ${res.status} - ${errorBody}`);
      }
    }

    console.log(`Emails enviados para ${emails.length} utilizadores (tipo: ${type})`);

    return new Response(
      JSON.stringify({ success: true, recipients: emails.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildPartnerEmail(record: NotificationPayload["record"]): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Essenza E.J</h1>
        <p style="color: #8b7355; font-size: 14px; letter-spacing: 2px; margin-top: 5px;">NOVIDADES</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1a1a1a; font-size: 22px; margin-top: 0;">🎉 Nova loja disponível!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Temos o prazer de lhe apresentar a <strong>${record.name}</strong>, 
          uma nova loja que acaba de se juntar à família Essenza E.J!
        </p>
        ${record.description ? `<p style="color: #666; font-size: 15px; line-height: 1.6; font-style: italic;">"${record.description}"</p>` : ""}
        ${record.category ? `<p style="color: #8b7355; font-size: 14px;">📂 Categoria: <strong>${record.category}</strong></p>` : ""}
        ${record.location ? `<p style="color: #8b7355; font-size: 14px;">📍 Localização: <strong>${record.location}</strong></p>` : ""}
        <div style="text-align: center; margin-top: 25px;">
          <a href="https://essenzacomercial.lovable.app/parceiros" 
             style="background-color: #8b7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 15px;">
            Conhecer a Loja
          </a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>Com carinho, Eunice Joaquim — Essenza E.J</p>
      </div>
    </div>
  `;
}

function buildProductEmail(record: NotificationPayload["record"], partnerName: string): string {
  const formattedPrice = record.price
    ? new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(record.price) + " Kz"
    : null;

  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Essenza E.J</h1>
        <p style="color: #8b7355; font-size: 14px; letter-spacing: 2px; margin-top: 5px;">NOVIDADES</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1a1a1a; font-size: 22px; margin-top: 0;">✨ Novo produto disponível!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          A loja <strong>${partnerName}</strong> acaba de adicionar um novo produto: 
          <strong>${record.name}</strong>!
        </p>
        ${record.description ? `<p style="color: #666; font-size: 15px; line-height: 1.6;">${record.description}</p>` : ""}
        ${formattedPrice ? `<p style="color: #8b7355; font-size: 18px; font-weight: bold;">💰 ${formattedPrice}</p>` : ""}
        ${record.category ? `<p style="color: #8b7355; font-size: 14px;">📂 Categoria: <strong>${record.category}</strong></p>` : ""}
        <div style="text-align: center; margin-top: 25px;">
          <a href="https://essenzacomercial.lovable.app/parceiros" 
             style="background-color: #8b7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 15px;">
            Ver Produto
          </a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>Com carinho, Eunice Joaquim — Essenza E.J</p>
      </div>
    </div>
  `;
}
