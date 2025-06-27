import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
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
  const { data: transcription, error } = await supabase.from('transcriptions').select(`
      title,
      content,
      dni,
      first_name,
      last_name,
      created_at,
      tag:tags(name),
      profile:profiles(full_name, first_name, last_name)
    `).eq('id', transcriptionId).single();
  if (error || !transcription) {
    return new Response('Transcripción no encontrada', {
      headers: corsHeaders,
      status: 404
    });
  }
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  const operatorName = transcription.profile?.first_name ? `${transcription.profile.first_name} ${transcription.profile.last_name ?? ''}`.trim() : transcription.profile?.full_name ?? '-';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 16px; background: #f9f9f9; border: 1px solid #ccc;">
      <h2 style="color: #333;">${transcription.title}</h2>
      <p><strong>Contenido:</strong></p>
      <p style="white-space: pre-line;">${transcription.content}</p>

      <hr style="margin: 24px 0;" />

      <h3 style="margin-bottom: 8px;">Información del paciente</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>DNI:</strong> ${transcription.dni ?? '-'}</li>
        <li><strong>Nombre:</strong> ${transcription.first_name ?? '-'}</li>
        <li><strong>Apellido:</strong> ${transcription.last_name ?? '-'}</li>
      </ul>

      <h3 style="margin-top: 24px; margin-bottom: 8px;">Metadatos</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Categoría:</strong> ${transcription.tag?.name ?? '-'}</li>
        <li><strong>Usuario operador:</strong> ${operatorName}</li>
        <li><strong>Fecha de creación:</strong> ${new Date(transcription.created_at).toLocaleString('es-AR')}</li>
      </ul>

      <p style="margin-top: 32px; font-size: 0.9em; color: #888;">
        Este correo fue generado automáticamente por PatientSpeak.
      </p>
    </div>
  `;
  try {
    await resend.emails.send({
      from: '"PatientSpeak" <patientspeak@resend.dev>',
      to: recipientEmail,
      subject: `Transcripción: ${transcription.title}`,
      html: htmlContent
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
