import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req)=>{

  if (req.method === 'OPTIONS') {    return new Response('ok', { headers: corsHeaders })  }  
  if (req.method !== 'POST') {
    return new Response('Método no permitido', {
      headers: corsHeaders,
      status: 405
    });
  }
  const body = await req.json();
  const { transcriptionId, recipientEmail } = body;
  if (!transcriptionId || !recipientEmail) {
    return new Response('Parámetros faltantes', {
      headers: corsHeaders,
      status: 400
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const { data: transcription, error } = await supabase.from('transcriptions').select('title, content').eq('id', transcriptionId).single();
  if (error || !transcription) {
    return new Response('Transcripción no encontrada', {
      headers: corsHeaders,
      status: 404
    });
  }
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  try {
    await resend.emails.send({
      from: 'patientspeak@resend.dev',
      to: recipientEmail,
      subject: `Transcripción: ${transcription.title}`,
      html: `<h1>${transcription.title}</h1><p>${transcription.content}</p>`
    });
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    console.error('Error enviando correo:', err);
    return new Response('Error al enviar el correo', {
      headers: corsHeaders,
      status: 500
    });
  }
});
