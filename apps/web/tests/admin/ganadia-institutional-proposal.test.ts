import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(path: string) {
  return readFileSync(new URL('../../app/' + path, import.meta.url), 'utf8');
}

const route = source('[locale]/(public)/propuestas/ganadia-insai/page.tsx');
const experience = source('components/proposals/ganadia-institutional-experience.tsx');
const css = source('components/proposals/ganadia-institutional-experience.module.css');
const dashboard = source('[locale]/(admin)/admin/proposals/page.tsx');

test('GanadIA has a public but non-indexable institutional presentation', () => {
  assert.match(route, /GanadIAInstitutionalExperience/);
  assert.match(route, /index:\s*false/);
  assert.match(route, /follow:\s*false/);
  assert.match(route, /noimageindex:\s*true/);
});

test('CRM proposals includes its own product, not a fictional INSAI sales account', () => {
  assert.match(dashboard, /Propuestas institucionales de productos propios/);
  assert.match(dashboard, /https:\/\/www\.trends172tech\.com\/es\/propuestas\/ganadia-insai/);
  assert.match(dashboard, /Sin importe comercial ni cliente asociado/);
});

test('institucional proposal distinguishes real code, roadmap and authority-controlled permits', () => {
  for (const marker of [
    'Implementado en el código', 'MVP geográfico', 'LABORATORIO INICIAL',
    'EVOLUCIÓN PROPUESTA', 'ROADMAP · NO DISPONIBLE COMO SERVICIO FINAL',
    'GanadIA no genera ni sustituye guías oficiales por cuenta propia',
    'No se presupone que exista una API pública',
    'Facilitar el primer acercamiento',
  ]) {
    assert.ok(experience.includes(marker), 'Missing commitment or status: ' + marker);
  }
  assert.doesNotMatch(experience, /INSAI\s+(es|será)\s+(nuestro|un)\s+cliente/i);
  assert.match(experience, /\/branding\/ganadia-lockup\.svg/);
});

test('responsive presentation supports accessible navigation and mobile layout', () => {
  assert.match(experience, /aria-label="Capítulos de la presentación"/);
  assert.match(experience, /aria-current=/);
  assert.match(experience, /ArrowRight/);
  assert.match(experience, /ArrowLeft/);
  assert.match(css, /@media\(max-width:670px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
