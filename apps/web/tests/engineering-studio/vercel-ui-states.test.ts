import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../../app/[locale]/(admin)/admin/programming/integrations/page.tsx', import.meta.url);
const loadingPath = new URL('../../app/[locale]/(admin)/admin/programming/integrations/loading.tsx', import.meta.url);
const syncButtonPath = new URL('../../app/[locale]/(admin)/admin/programming/integrations/sync-button.tsx', import.meta.url);

test('la interfaz declara estados de vacío y error', async () => {
  const source = await readFile(pagePath, 'utf8');
  assert.match(source, /No hay proyectos sincronizados/);
  assert.match(source, /syncError/);
  assert.match(source, /Acceso perdido/);
  assert.match(source, /Desconectado de Studio/);
});

test('el botón representa el estado sincronizando', async () => {
  const source = await readFile(syncButtonPath, 'utf8');
  assert.match(source, /Sincronizando…/);
  assert.match(source, /useFormStatus/);
});

test('la ruta incluye un estado de carga accesible', async () => {
  const source = await readFile(loadingPath, 'utf8');
  assert.match(source, /Cargando proyectos de Vercel/);
  assert.match(source, /animate-pulse/);
});
