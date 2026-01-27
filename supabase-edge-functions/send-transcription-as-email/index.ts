import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getDocumentTypeName(id: number): string {
  switch (id) {
    case 1: return 'DNI';
    case 2: return 'Libreta Civica';
    case 3: return 'Libreta de Enrolamiento';
    case 4: return 'Pasaporte';
    default: return 'Desconocido';
  }
}

function getRoleDisplayName(roleName: string | undefined): string {
  switch (roleName) {
    case 'admin': return 'Administrador';
    case 'transcription_basic_operator': return 'Operador';
    default: return 'Sin rol';
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Builds the full HTML email content with inline styles that mirror the
 * transcription-detail component layout: header, transcription content,
 * metadata row, patient card, and professional card.
 */
function buildEmailHtml(
  transcription: Record<string, any>,
  patient: Record<string, any> | null,
  professional: Record<string, any> | null
): string {
  const consultationReason = transcription['consultation_reason'] || 'Sin motivo';
  const content = transcription['content'] || '-';
  const createdAt = formatDate(transcription['created_at']);
  const tag = transcription['tag'] as Record<string, string> | null;
  const tagName = tag?.['name'] || '-';

  const patientName = patient
    ? `${patient['last_name']}, ${patient['first_name']}`
    : null;
  const documentDisplay = patient
    ? `${getDocumentTypeName(patient['document_type_id'])} ${patient['document_number'] || 'Sin documento'}`
    : null;
  const consentLabel = patient?.['consent_given'] ? 'Otorgado' : 'Pendiente';
  const consentColor = patient?.['consent_given'] ? '#10b981' : '#f59e0b';

  const professionalName = professional?.['full_name'] || null;
  const role = professional?.['role'] as Record<string, string> | null;
  const roleName = getRoleDisplayName(role?.['name']);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff; border-bottom:2px solid #e2e8f0; padding:32px; border-radius:12px 12px 0 0;">
              <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#3b82f6; text-transform:uppercase; letter-spacing:2px;">
                Detalle de registro
              </p>
              <h1 style="margin:0; font-size:22px; font-weight:700; color:#0f172a;">
                Motivo de consulta: ${consultationReason}
              </h1>
            </td>
          </tr>

          <!-- Transcription content -->
          <tr>
            <td style="background-color:#ffffff; padding:32px;">
              <p style="margin:0 0 12px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                Contenido de la Transcripcion
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#f8fafc; padding:24px; border-radius:12px; border:1px solid #f1f5f9;">
                    <p style="margin:0; font-size:16px; font-weight:500; color:#334155; line-height:1.7; white-space:pre-wrap;">${content}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata row -->
          <tr>
            <td style="background-color:#ffffff; padding:0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9; padding-top:24px;">
                <tr>
                  <td width="50%" valign="top" style="padding-top:24px;">
                    <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:2px;">
                      Fecha y Hora de Creacion
                    </p>
                    <p style="margin:0; font-size:14px; font-weight:600; color:#1e293b;">
                      ${createdAt}
                    </p>
                  </td>
                  <td width="50%" valign="top" style="padding-top:24px;">
                    <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:2px;">
                      Categoria Medica
                    </p>
                    <span style="display:inline-block; padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:700; background-color:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); text-transform:uppercase; letter-spacing:0.5px;">
                      ${tagName}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:16px;"></td></tr>

          <!-- Info cards row -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Patient card -->
                  <td width="50%" valign="top" style="padding-right:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 20px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:2px;">
                            Informacion del Paciente
                          </p>
                          ${patient ? `
                          <p style="margin:0 0 4px 0; font-size:12px; font-weight:500; color:#64748b;">Nombre completo</p>
                          <p style="margin:0 0 16px 0; font-size:16px; font-weight:800; color:#0f172a;">${patientName}</p>

                          <p style="margin:0 0 4px 0; font-size:12px; font-weight:500; color:#64748b;">Documento</p>
                          <p style="margin:0 0 16px 0; font-size:14px; font-weight:600; color:#334155;">${documentDisplay}</p>

                          <p style="margin:0 0 6px 0; font-size:12px; font-weight:500; color:#64748b;">Consentimiento</p>
                          <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:9999px; border:1px solid ${consentColor}30; background-color:${consentColor}10;">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${consentColor};"></span>
                            <span style="font-size:10px; font-weight:700; color:${consentColor}; text-transform:uppercase; letter-spacing:0.5px;">${consentLabel}</span>
                          </span>
                          ` : `
                          <p style="margin:0; font-size:14px; color:#94a3b8; text-align:center; padding:16px 0;">Sin datos de paciente</p>
                          `}
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Professional card -->
                  <td width="50%" valign="top" style="padding-left:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 20px 0; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:2px;">
                            Informacion del Profesional
                          </p>
                          ${professional ? `
                          <p style="margin:0 0 4px 0; font-size:12px; font-weight:500; color:#64748b;">Nombre completo</p>
                          <p style="margin:0 0 16px 0; font-size:16px; font-weight:800; color:#0f172a;">${professionalName}</p>

                          <p style="margin:0 0 6px 0; font-size:12px; font-weight:500; color:#64748b;">Rol</p>
                          <span style="display:inline-block; padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:700; background-color:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); text-transform:uppercase; letter-spacing:0.5px;">
                            ${roleName}
                          </span>
                          ` : `
                          <p style="margin:0; font-size:14px; color:#94a3b8; text-align:center; padding:16px 0;">Sin datos del profesional</p>
                          `}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0; text-align:center;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">
                Este correo fue enviado desde PatientSpeak.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Metodo no permitido', {
      headers: corsHeaders,
      status: 405,
    });
  }

  const body = await req.json();
  const { transcriptionId, recipientEmail } = body;

  if (!transcriptionId || !recipientEmail) {
    return new Response('Parametros faltantes', {
      headers: corsHeaders,
      status: 400,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch transcription with tag
  const { data: transcription, error: txError } = await supabase
    .from('transcriptions')
    .select(`
      consultation_reason,
      content,
      created_at,
      patient_id,
      user_id,
      tag:tag_id ( id, name )
    `)
    .eq('id', transcriptionId)
    .single();

  if (txError || !transcription) {
    return new Response('Transcripcion no encontrada', {
      headers: corsHeaders,
      status: 404,
    });
  }

  // Fetch patient and professional in parallel
  const [patientResult, professionalResult] = await Promise.all([
    supabase
      .from('patients')
      .select('first_name, last_name, document_type_id, document_number, consent_given')
      .eq('id', transcription.patient_id)
      .single(),
    supabase
      .from('profiles')
      .select(`
        full_name,
        role:role_id ( id, name )
      `)
      .eq('id', transcription.user_id)
      .single(),
  ]);

  const patient = patientResult.data || null;
  const professional = professionalResult.data || null;

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  try {
    const consultationReason = transcription.consultation_reason || 'Sin motivo';
    const htmlContent = buildEmailHtml(transcription, patient, professional);

    await resend.emails.send({
      from: 'patientspeak@resend.dev',
      to: recipientEmail,
      subject: `Transcripcion: ${consultationReason}`,
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error enviando correo:', err);
    return new Response('Error al enviar el correo', {
      headers: corsHeaders,
      status: 500,
    });
  }
});
