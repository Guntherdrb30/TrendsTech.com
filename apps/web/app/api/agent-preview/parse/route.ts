import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';

export const config = { api: { bodyParser: false } };

const MAX_CHARS = 12000;

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS) + '\n\n[Contenido truncado — primeros 12.000 caracteres incluidos]';
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'agent-preview-parse',
    limit: 10,
    windowMs: 10 * 60 * 1000
  });
  if (limited) return limited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
  }

  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    let text = '';

    if (ext === 'pdf') {
      const result = await pdfParse(buffer);
      text = cleanText(result.text);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const parts: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
        if (csv.trim()) {
          parts.push(`=== Hoja: ${sheetName} ===\n${csv}`);
        }
      }
      text = cleanText(parts.join('\n\n'));
    } else if (ext === 'txt' || ext === 'md' || ext === 'csv') {
      text = cleanText(buffer.toString('utf-8'));
    } else {
      return NextResponse.json(
        { error: 'Formato no soportado. Usa PDF, XLSX o TXT.' },
        { status: 415 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'El archivo está vacío o no contiene texto legible.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: truncate(text),
      filename,
      type: ext,
      charCount: text.length,
    });
  } catch (err) {
    console.error('[agent-preview/parse]', err);
    return NextResponse.json(
      { error: 'No se pudo leer el archivo. Verifica que no esté dañado.' },
      { status: 500 }
    );
  }
}
