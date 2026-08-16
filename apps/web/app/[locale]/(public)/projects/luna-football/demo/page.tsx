"use client";

import type { CSSProperties, ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

type DemoConfig = {
  schoolName: string;
  slogan: string;
  city: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  playerRange: string;
  categories: string;
  monthlyFee: string;
  contactName: string;
  whatsapp: string;
  instagram: string;
  hasPayments: boolean;
  hasStore: boolean;
  hasTournaments: boolean;
  hasTraining: boolean;
};

const initialConfig: DemoConfig = {
  schoolName: 'Academia Nueva Generación FC',
  slogan: 'Formamos jugadores con disciplina, valores y tecnología.',
  city: 'Barinas',
  country: 'Venezuela',
  primaryColor: '#00A6A6',
  secondaryColor: '#F97316',
  playerRange: '150',
  categories: '8',
  monthlyFee: '35',
  contactName: 'Coordinación Deportiva',
  whatsapp: '+58 412 000 0000',
  instagram: '@nuevageneracionfc',
  hasPayments: true,
  hasStore: true,
  hasTournaments: true,
  hasTraining: true,
};

const playerNames = [
  'Mateo Rodríguez',
  'Santiago Pérez',
  'Diego González',
  'Samuel Hernández',
  'Alejandro Torres',
  'Gabriel Medina',
  'Lucas Vargas',
  'Daniel Rivas',
  'Nicolás Castillo',
  'Emiliano Herrera',
  'Sebastián Ruiz',
  'Thiago Moreno',
];

const coaches = ['Carlos Medina', 'Jorge Arias', 'Luis Mendoza', 'Andrés Castillo', 'Miguel Rojas'];
const categories = ['Sub-6', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Porteros'];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LF';
}

function clampNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function LunaFootballDemoPage() {
  const [config, setConfig] = useState<DemoConfig>(initialConfig);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeView, setActiveView] = useState<'public' | 'dashboard'>('public');

  const playerCount = clampNumber(config.playerRange, 150);
  const categoryCount = Math.max(4, Math.min(8, clampNumber(config.categories, 8)));
  const selectedCategories = categories.slice(0, categoryCount);
  const paidPlayers = Math.round(playerCount * 0.78);
  const pendingPlayers = playerCount - paidPlayers;
  const monthlyFee = clampNumber(config.monthlyFee, 35);
  const projectedIncome = paidPlayers * monthlyFee;

  const themeStyle = {
    '--school-primary': config.primaryColor,
    '--school-secondary': config.secondaryColor,
  } as CSSProperties;

  const demoPlayers = useMemo(
    () =>
      playerNames.slice(0, 8).map((name, index) => ({
        name,
        category: selectedCategories[index % selectedCategories.length],
        status: index % 4 === 0 ? 'Pendiente' : 'Solvente',
        attendance: `${88 - index}%`,
        code: `LF-${String(index + 1).padStart(4, '0')}`,
      })),
    [selectedCategories],
  );

  function update<K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950" style={themeStyle}>
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <a href="../luna-football" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950">
              ← Volver a LUNA Football
            </a>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Demo personalizada</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Mira cómo se vería tu escuela dentro de LUNA Football
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Configura nombre, logo, colores, jugadores y módulos. La demo genera una plataforma ficticia para mostrar la experiencia pública y el panel operativo sin usar datos reales de menores, pagos ni representantes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#configurar" className="rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-30px_rgba(13,148,136,0.9)] transition hover:-translate-y-0.5 hover:bg-teal-700">
                Crear mi demo
              </a>
              <a href="#resultado" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700">
                Ver resultado
              </a>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.45)]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <BrandMark logoPreview={logoPreview} name={config.schoolName} />
                  <div>
                    <p className="text-sm font-bold">{config.schoolName}</p>
                    <p className="text-xs text-slate-500">Demo generada por LUNA Football</p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Preview</span>
              </div>
              <div className="grid gap-4 bg-slate-50 p-5 sm:grid-cols-3">
                <MetricCard label="Jugadores" value={playerCount.toString()} />
                <MetricCard label="Solventes" value={paidPlayers.toString()} />
                <MetricCard label="Categorías" value={categoryCount.toString()} />
              </div>
              <div className="p-5">
                <div className="rounded-[26px] bg-[linear-gradient(135deg,var(--school-primary),var(--school-secondary))] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-80">Portal público</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{config.schoolName}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">{config.slogan}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white/20 px-3 py-1.5">Inscripciones</span>
                    <span className="rounded-full bg-white/20 px-3 py-1.5">Pagos</span>
                    <span className="rounded-full bg-white/20 px-3 py-1.5">Torneos</span>
                    <span className="rounded-full bg-white/20 px-3 py-1.5">Entrenamientos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="configurar" className="px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[430px_1fr]">
          <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)] lg:sticky lg:top-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Configurador</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Datos de la escuela</h2>
              <p className="text-sm leading-relaxed text-slate-500">Todo lo que ingreses aquí se usa solo para pintar esta demo en tu navegador.</p>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Nombre de la escuela">
                <input value={config.schoolName} onChange={(event) => update('schoolName', event.target.value)} className="demo-input" />
              </Field>
              <Field label="Frase institucional">
                <textarea value={config.slogan} onChange={(event) => update('slogan', event.target.value)} className="demo-input min-h-20 resize-none" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Ciudad">
                  <input value={config.city} onChange={(event) => update('city', event.target.value)} className="demo-input" />
                </Field>
                <Field label="País">
                  <input value={config.country} onChange={(event) => update('country', event.target.value)} className="demo-input" />
                </Field>
              </div>
              <Field label="Logo de la escuela">
                <input type="file" accept="image/*" onChange={handleLogo} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-teal-700" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Color principal">
                  <input type="color" value={config.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" />
                </Field>
                <Field label="Color secundario">
                  <input type="color" value={config.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Jugadores">
                  <input type="number" min="30" max="800" value={config.playerRange} onChange={(event) => update('playerRange', event.target.value)} className="demo-input" />
                </Field>
                <Field label="Categorías">
                  <input type="number" min="4" max="8" value={config.categories} onChange={(event) => update('categories', event.target.value)} className="demo-input" />
                </Field>
                <Field label="Mensualidad $">
                  <input type="number" min="0" value={config.monthlyFee} onChange={(event) => update('monthlyFee', event.target.value)} className="demo-input" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="WhatsApp">
                  <input value={config.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} className="demo-input" />
                </Field>
                <Field label="Instagram">
                  <input value={config.instagram} onChange={(event) => update('instagram', event.target.value)} className="demo-input" />
                </Field>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">Módulos para mostrar</p>
                <div className="mt-3 grid gap-2">
                  <Toggle label="Pagos y solvencia" checked={config.hasPayments} onChange={(checked) => update('hasPayments', checked)} />
                  <Toggle label="Uniformidad y tienda" checked={config.hasStore} onChange={(checked) => update('hasStore', checked)} />
                  <Toggle label="Torneos y partidos" checked={config.hasTournaments} onChange={(checked) => update('hasTournaments', checked)} />
                  <Toggle label="Entrenamientos" checked={config.hasTraining} onChange={(checked) => update('hasTraining', checked)} />
                </div>
              </div>
            </div>
          </aside>

          <section id="resultado" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex rounded-full bg-slate-100 p-1">
                <button type="button" onClick={() => setActiveView('public')} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeView === 'public' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
                  Portal público
                </button>
                <button type="button" onClick={() => setActiveView('dashboard')} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeView === 'dashboard' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
                  Panel operativo
                </button>
              </div>
              <a href="https://wa.me/584122640371" target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
                Quiero esta plataforma
              </a>
            </div>

            {activeView === 'public' ? (
              <PublicDemo
                config={config}
                logoPreview={logoPreview}
                selectedCategories={selectedCategories}
                playerCount={playerCount}
                paidPlayers={paidPlayers}
              />
            ) : (
              <DashboardDemo
                config={config}
                logoPreview={logoPreview}
                selectedCategories={selectedCategories}
                playerCount={playerCount}
                paidPlayers={paidPlayers}
                pendingPlayers={pendingPlayers}
                projectedIncome={projectedIncome}
                demoPlayers={demoPlayers}
              />
            )}
          </section>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-teal-50 px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 rounded-[32px] border border-teal-100 bg-white p-7 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Siguiente paso</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Convierte esta demo en una implementación real</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Trends172Tech puede adaptar LUNA Football con identidad visual, módulos, roles y flujos reales de tu escuela o club.
            </p>
          </div>
          <a href="https://wa.me/584122640371" target="_blank" rel="noreferrer" className="w-fit rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-700">
            Solicitar implementación
          </a>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-teal-600" />
    </label>
  );
}

function BrandMark({ logoPreview, name }: { logoPreview: string; name: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--school-primary)] text-sm font-black text-white shadow-sm">
      {logoPreview ? <img src={logoPreview} alt="Logo cargado" className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function PublicDemo({
  config,
  logoPreview,
  selectedCategories,
  playerCount,
  paidPlayers,
}: {
  config: DemoConfig;
  logoPreview: string;
  selectedCategories: string[];
  playerCount: number;
  paidPlayers: number;
}) {
  return (
    <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_100px_-70px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <BrandMark logoPreview={logoPreview} name={config.schoolName} />
          <div>
            <p className="font-bold text-slate-950">{config.schoolName}</p>
            <p className="text-xs text-slate-500">{config.city}, {config.country}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1.5">Inicio</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">Inscripción</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">Pagos</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">Torneos</span>
        </nav>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[linear-gradient(135deg,var(--school-primary),var(--school-secondary))] p-8 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-80">Escuela de fútbol</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{config.schoolName}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed opacity-90">{config.slogan}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950">Postular jugador</button>
            <button className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white">Consultar pagos</button>
          </div>
        </div>
        <div className="grid gap-4 bg-slate-50 p-6">
          <MetricCard label="Jugadores activos" value={playerCount.toString()} />
          <MetricCard label="Pagos al día" value={paidPlayers.toString()} />
          <MetricCard label="Categorías" value={selectedCategories.length.toString()} />
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-3">
        <PublicModule title="Inscripción guiada" body="Formulario para que representantes postulen jugadores y la administración valide el ingreso." />
        {config.hasPayments && <PublicModule title="Consulta de pagos" body="Representantes consultan solvencia con documento, código de carnet o datos internos." />}
        {config.hasTournaments && <PublicModule title="Torneos y partidos" body="Calendario, resultados, posiciones y goleadores generados desde la operación." />}
        {config.hasStore && <PublicModule title="Uniformidad" body="Catálogo de uniformes, tallas, disponibilidad y solicitudes organizadas." />}
        {config.hasTraining && <PublicModule title="Entrenamientos" body="Planificación deportiva por categorías, sesiones y asistencia." />}
        <PublicModule title="Noticias oficiales" body="Comunicaciones del club, convocatorias, anuncios y contenido institucional." />
      </div>
    </div>
  );
}

function PublicModule({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-teal-700">✓</span>
      <h3 className="mt-4 text-lg font-bold tracking-[-0.03em]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </article>
  );
}

function DashboardDemo({
  config,
  logoPreview,
  selectedCategories,
  playerCount,
  paidPlayers,
  pendingPlayers,
  projectedIncome,
  demoPlayers,
}: {
  config: DemoConfig;
  logoPreview: string;
  selectedCategories: string[];
  playerCount: number;
  paidPlayers: number;
  pendingPlayers: number;
  projectedIncome: number;
  demoPlayers: Array<{ name: string; category: string; status: string; attendance: string; code: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_100px_-70px_rgba(15,23,42,0.45)]">
      <div className="grid min-h-[760px] lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <BrandMark logoPreview={logoPreview} name={config.schoolName} />
            <div>
              <p className="text-sm font-bold">{config.schoolName}</p>
              <p className="text-xs text-slate-500">Panel demo</p>
            </div>
          </div>
          <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
            {['Dashboard', 'Jugadores', 'Pagos', 'Categorías', 'Entrenamientos', 'Uniformidad', 'Reportes'].map((item, index) => (
              <span key={item} className={`block rounded-2xl px-4 py-3 ${index === 0 ? 'bg-white text-teal-700 shadow-sm' : 'hover:bg-white'}`}>{item}</span>
            ))}
          </nav>
        </aside>

        <section className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Operación en tiempo real</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Dashboard general</h2>
              <p className="mt-1 text-sm text-slate-500">Datos ficticios generados para visualizar el alcance de LUNA Football.</p>
            </div>
            <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700">Demo segura sin datos reales</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Jugadores" value={playerCount.toString()} />
            <MetricCard label="Solventes" value={paidPlayers.toString()} />
            <MetricCard label="Pendientes" value={pendingPlayers.toString()} />
            <MetricCard label="Proyección mensual" value={`$${projectedIncome.toLocaleString('en-US')}`} />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold tracking-[-0.03em]">Jugadores demo</h3>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">8 registros</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                {demoPlayers.map((player) => (
                  <div key={player.code} className="grid gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_90px_90px_70px] sm:items-center">
                    <div>
                      <p className="font-bold text-slate-900">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.code}</p>
                    </div>
                    <span className="text-slate-600">{player.category}</span>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${player.status === 'Solvente' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'}`}>{player.status}</span>
                    <span className="text-slate-500">{player.attendance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold tracking-[-0.03em]">Categorías activas</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategories.map((category, index) => (
                    <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                      {category} · {coaches[index % coaches.length]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,var(--school-primary),var(--school-secondary))] p-5 text-white shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-80">Recomendación IA</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Módulos sugeridos</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  Para una escuela con {playerCount} jugadores, LUNA Football debería iniciar con inscripciones, pagos, categorías, entrenamientos y comunicación oficial con representantes.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold tracking-[-0.03em]">Actividad reciente</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>• 12 representantes consultaron solvencia.</li>
                  <li>• 4 jugadores fueron postulados a prueba.</li>
                  <li>• 3 sesiones de entrenamiento fueron planificadas.</li>
                  <li>• 18 uniformes quedaron reservados.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
