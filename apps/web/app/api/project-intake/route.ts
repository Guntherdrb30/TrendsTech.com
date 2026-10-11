import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { sendEmail } from '@/lib/email/send';
import { enforcePersistentRequestRateLimit } from '@/lib/security/rate-limit';
import { escapeIntakeHtml, projectIntakePayload, validateFinalIntake } from '@/lib/project-intake/schema';
import type { ProjectIntakePayload } from '@/lib/project-intake/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const jsonHeaders = { 'Cache-Control': 'no-store' };

function recordData(input: ProjectIntakePayload) {
  return {
    category: input.category,
    locale: input.locale,
    projectTitle: input.projectTitle.trim() || null,
    details: input.details,
    transcript: input.transcript,
    contactName: input.contact.name.trim() || null,
    contactEmail: input.contact.email.trim().toLowerCase() || null,
    contactPhone: input.contact.phone.trim() || null,
    company: input.contact.company.trim() || null,
    country: input.contact.country.trim() || null
  };
}

async function notifySubmitted(input: ProjectIntakePayload, id: string, reference: string) {
  const safeName = escapeIntakeHtml(input.contact.name);
  const safeTitle = escapeIntakeHtml(input.projectTitle);
  const safeDescription = escapeIntakeHtml(input.details.description.slice(0, 3000));
  const safePhone = escapeIntakeHtml(input.contact.phone);
  const safeEmail = escapeIntakeHtml(input.contact.email);
  const customer = await sendEmail({
    to: input.contact.email.trim().toLowerCase(),
    subject: 'Recibimos tu idea de proyecto | Trends172Tech ' + reference,
    html: '<h2>Hemos recibido tu solicitud</h2><p>Hola ' + safeName +
      ', hemos registrado tu propuesta <strong>' + reference +
      '</strong>.</p><p><strong>' + safeTitle +
      '</strong></p><p>Nuestro equipo revisará la información y te contactará. ' +
      'Este mensaje no implica que el desarrollo haya comenzado.</p><p>Trends172Tech</p>'
  }).catch(() => ({ ok: false }));
  const internal = await sendEmail({
    to: process.env.PROJECT_INTAKE_NOTIFY_TO || 'trends172tech@gmail.com',
    subject: 'Nuevo prospecto ' + reference + ': ' + input.projectTitle.slice(0, 80),
    html: '<h2>Nueva oportunidad: ' + escapeIntakeHtml(reference) + '</h2>' +
      '<p><strong>Contacto:</strong> ' + safeName + ' | ' + safeEmail + ' | ' + safePhone + '</p>' +
      '<p><strong>Empresa:</strong> ' + escapeIntakeHtml(input.contact.company) + '</p>' +
      '<p><strong>Proyecto:</strong> ' + safeTitle + '</p>' +
      '<p><strong>Idea:</strong> ' + safeDescription + '</p>' +
      '<p>Revisar detalles y conversación en el panel de oportunidades.</p>'
  }).catch(() => ({ ok: false }));
  await prisma.adminProjectIntake.update({
    where: { id },
    data: {
      clientEmailStatus: customer.ok ? 'SENT' : 'FAILED',
      internalEmailStatus: internal.ok ? 'SENT' : 'FAILED'
    }
  });
}

export async function POST(request: Request) {
  const limited = await enforcePersistentRequestRateLimit(request, {
    namespace: 'project-intake',
    limit: 18,
    windowMs: 10 * 60 * 1000
  });
  if (limited) return limited;
  if (request.headers.get('content-length') && Number(request.headers.get('content-length')) > 50000) return NextResponse.json({ error: 'Payload demasiado grande.' }, { status: 413 });
  const parsed = projectIntakePayload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos de solicitud inválidos.' }, { status: 400, headers: jsonHeaders });
  }

  const input = parsed.data;
  if (input.finalize) {
    const error = validateFinalIntake(input);
    if (error) return NextResponse.json({ error }, { status: 400, headers: jsonHeaders });
  }

  try {
    const existing = await prisma.adminProjectIntake.findUnique({ where: { sessionId: input.sessionId } });
    if (existing?.status === 'SUBMITTED') {
      return NextResponse.json({ ok: true, submitted: true, reference: existing.reference }, { headers: jsonHeaders });
    }
    if (existing?.status === 'PROCESSING') {
      return NextResponse.json({ error: 'La solicitud se está procesando.' }, { status: 409, headers: jsonHeaders });
    }
    const fields = recordData(input);
    const saved = await prisma.adminProjectIntake.upsert({
      where: { sessionId: input.sessionId },
      create: { sessionId: input.sessionId, consentAt: new Date(), ...fields },
      update: fields
    });
    if (!input.finalize) {
      return NextResponse.json({ ok: true, submitted: false }, { headers: jsonHeaders });
    }

    // Claim the draft exactly once: concurrent submissions cannot create duplicate CRM leads.
    const finalized = await prisma.$transaction(async (tx) => {
      const claimed = await tx.adminProjectIntake.updateMany({
        where: { id: saved.id, status: 'DRAFT' },
        data: { status: 'PROCESSING' }
      });
      if (!claimed.count) return null;
      const email = input.contact.email.trim().toLowerCase();
      let client = await tx.adminClient.findFirst({ where: { email }, orderBy: { createdAt: 'asc' } });
      if (!client) {
        client = await tx.adminClient.create({
          data: {
            name: input.contact.company.trim() || input.contact.name.trim(),
            contactName: input.contact.name.trim(),
            email,
            phone: input.contact.phone.trim(),
            country: input.contact.country.trim() || null,
            notes: 'Prospecto originado por entrevista IA en la web.'
          }
        });
      }
      const lead = await tx.adminLead.create({
        data: {
          clientId: client.id,
          clientName: client.name,
          source: 'project_intake',
          status: 'NEW',
          nextStep: 'Revisar entrevista ' + input.projectTitle.trim() + ' y contactar al prospecto.'
        }
      });
      const reference = 'TR-' + new Date().getUTCFullYear() + '-' + saved.id.slice(-8).toUpperCase();
      await tx.adminProjectIntake.update({
        where: { id: saved.id },
        data: { status: 'SUBMITTED', reference, submittedAt: new Date(), leadId: lead.id }
      });
      return reference;
    });
    if (!finalized) {
      return NextResponse.json({ error: 'Solicitud duplicada. Actualiza la página para consultar el estado.' }, { status: 409, headers: jsonHeaders });
    }
    try {
      await notifySubmitted(input, saved.id, finalized);
    } catch (error) {
      console.error('[project-intake] email status update failed', error);
      // The lead is already committed and should not be discarded due to email failures.
    }
    return NextResponse.json({ ok: true, submitted: true, reference: finalized }, { headers: jsonHeaders });
  } catch (error) {
    console.error('[project-intake] persistence failure', error);
    return NextResponse.json({ error: 'No se pudo guardar. Vuelve a intentarlo.' }, { status: 500, headers: jsonHeaders });
  }
}
