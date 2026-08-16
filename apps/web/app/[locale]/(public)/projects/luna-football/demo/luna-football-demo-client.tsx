"use client";

import type { CSSProperties, ChangeEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

type DemoConfig = {
  schoolName: string;
  slogan: string;
  city: string;
  country: string;
  institutionType: string;
  primaryColor: string;
  secondaryColor: string;
  playerRange: string;
  categories: string;
  monthlyFee: string;
  whatsapp: string;
  instagram: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  hasPayments: boolean;
  hasStore: boolean;
  hasTournaments: boolean;
  hasTraining: boolean;
};

type Role = 'director' | 'coach' | 'guardian' | 'admin';

type DemoPlayer = {
  id: string;
  name: string;
  guardian: string;
  category: string;
  coach: string;
  status: 'Solvente' | 'Pendiente' | 'Vencido';
  attendance: number;
  performance: number;
  notes: string;
  nextPayment: string;
};

type DemoPayment = {
  id: string;
  player: string;
  guardian: string;
  amount: number;
  status: 'Pagado' | 'Pendiente' | 'Vencido';
  due: string;
};

const initialConfig: DemoConfig = {
  schoolName: 'Academia Nueva Generación FC',
  slogan: 'Formamos jugadores con disciplina, valores y tecnología.',
  city: 'Barinas',
  country: 'Venezuela',
  institutionType: 'Escuela de fútbol menor',
  primaryColor: '#00A6A6',
  secondaryColor: '#F97316',
  playerRange: '180',
  categories: '6',
  monthlyFee: '35',
  whatsapp: '+58 412 000 0000',
  instagram: '@nuevageneracionfc',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
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
  'David Morales',
  'Adrián Salazar',
  'Julián Castro',
  'Tomás Méndez',
  'Bruno Suárez',
  'Ángel Ferrer',
  'Luis Ortega',
  'Mario Cordero',
];

const guardianNames = [
  'María Pérez',
  'José González',
  'Carolina Torres',
  'Andrea Rivas',
  'Luis Hernández',
  'Valentina Ruiz',
  'Miguel Medina',
  'Patricia Vargas',
];

const coaches = ['Carlos Medina', 'Jorge Arias', 'Luis Mendoza', 'Andrés Castillo'];
const categoryNames = ['Sub-6', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Porteros', 'Competitivo'];

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

function implementationRate(playerCount: number) {
  if (playerCount > 500) return 4;
  if (playerCount >= 250) return 5;
  return 6;
}

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

function statusTone(status: string) {
  if (status === 'Solvente' || status === 'Pagado') return 'bg-teal-50 text-teal-700 border-teal-100';
  if (status === 'Pendiente') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-rose-50 text-rose-700 border-rose-100';
}

export function LunaFootballDemoClient() {
  const [config, setConfig] = useState<DemoConfig>(initialConfig);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [demoStarted, setDemoStarted] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>('director');
  const [activeModule, setActiveModule] = useState('resumen');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');

  const playerCount = clampNumber(config.playerRange, 180);
  const categoryCount = Math.max(4, Math.min(8, clampNumber(config.categories, 6)));
  const monthlyFee = clampNumber(config.monthlyFee, 35);
  const selectedCategories = categoryNames.slice(0, categoryCount);
  const rate = implementationRate(playerCount);
  const setupValue = playerCount * rate;
  const recurringValue = playerCount;

  const themeStyle = {
    '--school-primary': config.primaryColor,
    '--school-secondary': config.secondaryColor,
  } as CSSProperties;

  const players = useMemo<DemoPlayer[]>(() => {
    return playerNames.map((name, index) => {
      const status = index % 9 === 0 ? 'Vencido' : index % 4 === 0 ? 'Pendiente' : 'Solvente';
      return {
        id: `LF-${String(index + 1).padStart(4, '0')}`,
        name,
        guardian: guardianNames[index % guardianNames.length],
        category: selectedCategories[index % selectedCategories.length],
        coach: coaches[index % coaches.length],
        status,
        attendance: 96 - (index % 8) * 3,
        performance: 70 + (index % 6) * 4,
        notes: index % 3 === 0 ? 'Debe reforzar salida con balón y puntualidad.' : 'Buen ritmo de entrenamiento y participación constante.',
        nextPayment: index % 4 === 0 ? 'Pendiente de conciliación' : 'Mensualidad al día',
      };
    });
  }, [selectedCategories]);

  const payments = useMemo<DemoPayment[]>(() => {
    return players.slice(0, 14).map((player, index) => ({
      id: `PAY-${String(index + 1).padStart(3, '0')}`,
      player: player.name,
      guardian: player.guardian,
      amount: monthlyFee,
      status: player.status === 'Solvente' ? 'Pagado' : player.status,
      due: index % 4 === 0 ? 'Vence esta semana' : 'Mes actual',
    }));
  }, [players, monthlyFee]);

  const paidPlayers = Math.round(playerCount * 0.78);
  const pendingPlayers = playerCount - paidPlayers;
  const projectedIncome = paidPlayers * monthlyFee;
  const modules = [
    config.hasPayments ? 'Pagos y solvencia' : null,
    config.hasStore ? 'Uniformidad y tienda' : null,
    config.hasTournaments ? 'Torneos y partidos' : null,
    config.hasTraining ? 'Entrenamientos' : null,
  ].filter(Boolean) as string[];

  function update<K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function requestImplementation() {
    if (!config.contactName.trim() || !config.contactPhone.trim()) {
      setLeadStatus('error');
      setLeadMessage('Indica nombre y teléfono de contacto para guardar la solicitud.');
      return;
    }

    setLeadStatus('sending');
    setLeadMessage('Guardando solicitud...');

    try {
      const response = await fetch('/api/luna-football-demo-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: config.schoolName,
          contactName: config.contactName,
          phone: config.contactPhone,
          email: config.contactEmail,
          city: config.city,
          country: config.country,
          institutionType: config.institutionType,
          playerCount,
          categoryCount,
          monthlyFee,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          instagram: config.instagram,
          whatsapp: config.whatsapp,
          modules,
          notes: config.slogan,
          source: 'luna-football-demo'
        })
      });

      if (!response.ok) throw new Error('No se pudo guardar la solicitud.');
      setLeadStatus('sent');
      setLeadMessage('Solicitud guardada. Trends172Tech ya tendrá esta implementación en el panel interno.');
    } catch (error) {
      setLeadStatus('error');
      setLeadMessage(error instanceof Error ? error.message : 'Error guardando la solicitud.');
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950" style={themeStyle}>
      <style>{`.demo-input{width:100%;border-radius:1rem;border:1px solid rgb(226 232 240);background:white;padding:.75rem .9rem;font-size:.875rem;color:rgb(15 23 42);outline:none;transition:border-color .2s,box-shadow .2s}.demo-input:focus{border-color:var(--school-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--school-primary) 18%,transparent)}`}</style>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <a href="../luna-football" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950">← Volver a LUNA Football</a>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Demo white-label temporal</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">Prueba LUNA Football como si ya fuera tu sistema.</h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">Configura nombre, logo, colores, jugadores y módulos. Luego entra como director, entrenador, representante o administrador para explorar una operación ficticia con datos demo.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#configurar" className="rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-30px_rgba(13,148,136,0.9)] transition hover:-translate-y-0.5 hover:bg-teal-700">Crear mi demo</a>
              <a href="#sistema" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700">Ver sistema demo</a>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.45)]">
            <SystemPreview config={config} logoPreview={logoPreview} playerCount={playerCount} paidPlayers={paidPlayers} categoryCount={categoryCount} />
          </div>
        </div>
      </section>

      <section id="configurar" className="px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[430px_1fr]">
          <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)] lg:sticky lg:top-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Configurador</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Datos de la escuela</h2>
              <p className="text-sm leading-relaxed text-slate-500">La primera parte vive solo en el navegador. Al pedir implementación sí se guarda el lead en Trends172Tech.</p>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Nombre de la escuela"><input value={config.schoolName} onChange={(event) => update('schoolName', event.target.value)} className="demo-input" /></Field>
              <Field label="Tipo de institución"><input value={config.institutionType} onChange={(event) => update('institutionType', event.target.value)} className="demo-input" /></Field>
              <Field label="Frase institucional"><textarea value={config.slogan} onChange={(event) => update('slogan', event.target.value)} className="demo-input min-h-20 resize-none" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Ciudad"><input value={config.city} onChange={(event) => update('city', event.target.value)} className="demo-input" /></Field>
                <Field label="País"><input value={config.country} onChange={(event) => update('country', event.target.value)} className="demo-input" /></Field>
              </div>
              <Field label="Logo de la escuela"><input type="file" accept="image/*" onChange={handleLogo} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-teal-700" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Color principal"><input type="color" value={config.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field>
                <Field label="Color secundario"><input type="color" value={config.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Jugadores"><input type="number" min="30" max="5000" value={config.playerRange} onChange={(event) => update('playerRange', event.target.value)} className="demo-input" /></Field>
                <Field label="Categorías"><input type="number" min="4" max="8" value={config.categories} onChange={(event) => update('categories', event.target.value)} className="demo-input" /></Field>
                <Field label="Mensualidad $"><input type="number" min="0" value={config.monthlyFee} onChange={(event) => update('monthlyFee', event.target.value)} className="demo-input" /></Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="WhatsApp público"><input value={config.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} className="demo-input" /></Field>
                <Field label="Instagram"><input value={config.instagram} onChange={(event) => update('instagram', event.target.value)} className="demo-input" /></Field>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">Módulos activos</p>
                <div className="mt-3 grid gap-2">
                  <Toggle label="Pagos y solvencia" checked={config.hasPayments} onChange={(checked) => update('hasPayments', checked)} />
                  <Toggle label="Uniformidad y tienda" checked={config.hasStore} onChange={(checked) => update('hasStore', checked)} />
                  <Toggle label="Torneos y partidos" checked={config.hasTournaments} onChange={(checked) => update('hasTournaments', checked)} />
                  <Toggle label="Entrenamientos" checked={config.hasTraining} onChange={(checked) => update('hasTraining', checked)} />
                </div>
              </div>
              <button type="button" onClick={() => setDemoStarted(true)} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Generar sistema demo</button>
            </div>
          </aside>

          <section id="sistema" className="space-y-5">
            {!demoStarted ? (
              <div className="rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Paso pendiente</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Genera la demo para activar el sistema.</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Al generar la demo se crea una experiencia temporal con 20 jugadores ficticios, pagos, entrenamientos, categorías y navegación por roles.</p>
                <button type="button" onClick={() => setDemoStarted(true)} className="mt-6 rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white">Generar ahora</button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>Demo temporal:</strong> no cierres ni recargues esta página para no perder la sesión de prueba. Los datos son ficticios y se eliminan al cerrar la demo.
                </div>
                <RoleSystem
                  config={config}
                  logoPreview={logoPreview}
                  activeRole={activeRole}
                  setActiveRole={setActiveRole}
                  activeModule={activeModule}
                  setActiveModule={setActiveModule}
                  players={players}
                  payments={payments}
                  selectedCategories={selectedCategories}
                  playerCount={playerCount}
                  paidPlayers={paidPlayers}
                  pendingPlayers={pendingPlayers}
                  projectedIncome={projectedIncome}
                  setupValue={setupValue}
                  recurringValue={recurringValue}
                />
                <ImplementationRequest
                  config={config}
                  update={update}
                  playerCount={playerCount}
                  setupValue={setupValue}
                  recurringValue={recurringValue}
                  rate={rate}
                  leadStatus={leadStatus}
                  leadMessage={leadMessage}
                  onSubmit={requestImplementation}
                />
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-teal-600" /></label>;
}

function BrandMark({ logoPreview, name }: { logoPreview: string; name: string }) {
  return <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--school-primary)] text-sm font-black text-white shadow-sm">{logoPreview ? <img src={logoPreview} alt="Logo cargado" className="h-full w-full object-cover" /> : initials(name)}</div>;
}

function SystemPreview({ config, logoPreview, playerCount, paidPlayers, categoryCount }: { config: DemoConfig; logoPreview: string; playerCount: number; paidPlayers: number; categoryCount: number }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3"><BrandMark logoPreview={logoPreview} name={config.schoolName} /><div><p className="text-sm font-bold">{config.schoolName}</p><p className="text-xs text-slate-500">White-label preview</p></div></div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Demo</span>
      </div>
      <div className="grid gap-4 bg-slate-50 p-5 sm:grid-cols-3"><MiniMetric label="Jugadores" value={playerCount.toString()} /><MiniMetric label="Solventes" value={paidPlayers.toString()} /><MiniMetric label="Categorías" value={categoryCount.toString()} /></div>
      <div className="p-5"><div className="rounded-[26px] bg-[linear-gradient(135deg,var(--school-primary),var(--school-secondary))] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.22em] opacity-80">Sistema demo</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{config.schoolName}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">{config.slogan}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/20 px-3 py-1.5">Director</span><span className="rounded-full bg-white/20 px-3 py-1.5">Entrenador</span><span className="rounded-full bg-white/20 px-3 py-1.5">Representante</span><span className="rounded-full bg-white/20 px-3 py-1.5">Admin</span></div></div></div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>;
}

function RoleSystem({
  config, logoPreview, activeRole, setActiveRole, activeModule, setActiveModule, players, payments, selectedCategories, playerCount, paidPlayers, pendingPlayers, projectedIncome, setupValue, recurringValue
}: {
  config: DemoConfig;
  logoPreview: string;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  players: DemoPlayer[];
  payments: DemoPayment[];
  selectedCategories: string[];
  playerCount: number;
  paidPlayers: number;
  pendingPlayers: number;
  projectedIncome: number;
  setupValue: number;
  recurringValue: number;
}) {
  const roles: Array<{ key: Role; label: string; description: string }> = [
    { key: 'director', label: 'Director', description: 'Indicadores, pagos, operación y decisiones.' },
    { key: 'coach', label: 'Entrenador', description: 'Categorías, jugadores, asistencia y entrenamientos.' },
    { key: 'guardian', label: 'Representante', description: 'Pagos, calendario y jugador asociado.' },
    { key: 'admin', label: 'Administrador', description: 'Usuarios, configuración y control interno.' },
  ];

  return (
    <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_34px_120px_-80px_rgba(15,23,42,0.55)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3"><BrandMark logoPreview={logoPreview} name={config.schoolName} /><div><p className="font-bold">{config.schoolName}</p><p className="text-xs text-slate-400">Sistema demo · datos ficticios</p></div></div>
        <div className="text-xs text-slate-300">{config.city}, {config.country}</div>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Entrar como</p>
          <div className="space-y-2">
            {roles.map((role) => <button key={role.key} type="button" onClick={() => { setActiveRole(role.key); setActiveModule('resumen'); }} className={`w-full rounded-2xl border p-3 text-left transition ${activeRole === role.key ? 'border-teal-200 bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}><span className="block text-sm font-bold text-slate-900">{role.label}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{role.description}</span></button>)}
          </div>
          <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-xs leading-relaxed text-teal-900">La demo separa permisos por rol para mostrar que cada persona ve solo lo necesario.</div>
        </aside>
        <section className="min-w-0 p-5">
          <ModuleTabs activeRole={activeRole} activeModule={activeModule} setActiveModule={setActiveModule} />
          <div className="mt-5">
            {activeRole === 'director' && <DirectorView activeModule={activeModule} playerCount={playerCount} paidPlayers={paidPlayers} pendingPlayers={pendingPlayers} projectedIncome={projectedIncome} setupValue={setupValue} recurringValue={recurringValue} players={players} payments={payments} selectedCategories={selectedCategories} />}
            {activeRole === 'coach' && <CoachView activeModule={activeModule} players={players} selectedCategories={selectedCategories} />}
            {activeRole === 'guardian' && <GuardianView config={config} player={players[1]} payments={payments} />}
            {activeRole === 'admin' && <AdminDemoView config={config} players={players} selectedCategories={selectedCategories} />}
          </div>
        </section>
      </div>
    </div>
  );
}

function ModuleTabs({ activeRole, activeModule, setActiveModule }: { activeRole: Role; activeModule: string; setActiveModule: (module: string) => void }) {
  const tabsByRole: Record<Role, Array<{ key: string; label: string }>> = {
    director: [{ key: 'resumen', label: 'Resumen' }, { key: 'pagos', label: 'Pagos' }, { key: 'jugadores', label: 'Jugadores' }, { key: 'agenda', label: 'Agenda' }],
    coach: [{ key: 'resumen', label: 'Mi equipo' }, { key: 'asistencia', label: 'Asistencia' }, { key: 'entrenamientos', label: 'Entrenamientos' }, { key: 'observaciones', label: 'Observaciones' }],
    guardian: [{ key: 'resumen', label: 'Mi jugador' }, { key: 'pagos', label: 'Pagos' }, { key: 'calendario', label: 'Calendario' }],
    admin: [{ key: 'resumen', label: 'Configuración' }, { key: 'usuarios', label: 'Usuarios' }, { key: 'reportes', label: 'Reportes' }],
  };
  return <div className="flex gap-2 overflow-x-auto rounded-full bg-slate-100 p-1">{tabsByRole[activeRole].map((tab) => <button key={tab.key} type="button" onClick={() => setActiveModule(tab.key)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${activeModule === tab.key ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>{tab.label}</button>)}</div>;
}

function DirectorView({ activeModule, playerCount, paidPlayers, pendingPlayers, projectedIncome, setupValue, recurringValue, players, payments, selectedCategories }: { activeModule: string; playerCount: number; paidPlayers: number; pendingPlayers: number; projectedIncome: number; setupValue: number; recurringValue: number; players: DemoPlayer[]; payments: DemoPayment[]; selectedCategories: string[] }) {
  if (activeModule === 'pagos') return <PaymentsTable payments={payments} />;
  if (activeModule === 'jugadores') return <PlayersTable players={players} />;
  if (activeModule === 'agenda') return <Agenda />;
  return <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Kpi label="Jugadores" value={playerCount.toString()} /><Kpi label="Solventes" value={paidPlayers.toString()} /><Kpi label="Pendientes" value={pendingPlayers.toString()} /><Kpi label="Ingreso demo" value={money(projectedIncome)} /></div><div className="grid gap-4 lg:grid-cols-2"><Panel title="Proyección comercial"><p className="text-sm text-slate-600">Implementación estimada: <strong>{money(setupValue)}</strong>. Mensualidad desde el segundo mes: <strong>{money(recurringValue)}/mes</strong>.</p></Panel><Panel title="Categorías activas"><div className="flex flex-wrap gap-2">{selectedCategories.map((cat) => <span key={cat} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">{cat}</span>)}</div></Panel></div></div>;
}

function CoachView({ activeModule, players, selectedCategories }: { activeModule: string; players: DemoPlayer[]; selectedCategories: string[] }) {
  const coachPlayers = players.filter((player) => player.coach === coaches[0]).slice(0, 8);
  if (activeModule === 'asistencia') return <PlayersTable players={coachPlayers} mode="attendance" />;
  if (activeModule === 'entrenamientos') return <TrainingPlan categories={selectedCategories} />;
  if (activeModule === 'observaciones') return <Observations players={coachPlayers} />;
  return <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3"><Kpi label="Mis jugadores" value={coachPlayers.length.toString()} /><Kpi label="Categoría principal" value={selectedCategories[2] ?? 'Sub-10'} /><Kpi label="Asistencia promedio" value="91%" /></div><PlayersTable players={coachPlayers} mode="coach" /></div>;
}

function GuardianView({ config, player, payments }: { config: DemoConfig; player: DemoPlayer; payments: DemoPayment[] }) {
  return <div className="space-y-5"><div className="rounded-[28px] bg-[linear-gradient(135deg,var(--school-primary),var(--school-secondary))] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Representante</p><h3 className="mt-2 text-3xl font-semibold">{player.name}</h3><p className="mt-2 text-sm opacity-90">{player.category} · {config.schoolName}</p></div><div className="grid gap-4 md:grid-cols-3"><Kpi label="Mensualidad" value={money(clampNumber(config.monthlyFee, 35))} /><Kpi label="Estado" value={player.status} /><Kpi label="Próximo entreno" value="Miércoles 4:00 PM" /></div><PaymentsTable payments={payments.slice(0, 4)} /></div>;
}

function AdminDemoView({ config, players, selectedCategories }: { config: DemoConfig; players: DemoPlayer[]; selectedCategories: string[] }) {
  return <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3"><Kpi label="Usuarios demo" value="28" /><Kpi label="Roles" value="4" /><Kpi label="Módulos" value="8" /></div><Panel title="Configuración white-label"><div className="grid gap-3 sm:grid-cols-2"><Info label="Escuela" value={config.schoolName} /><Info label="Tipo" value={config.institutionType} /><Info label="Color principal" value={config.primaryColor} /><Info label="Categorías" value={selectedCategories.join(', ')} /></div></Panel><PlayersTable players={players.slice(0, 10)} /></div>;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-950">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold tracking-[-0.03em] text-slate-950">{title}</h3><div className="mt-4">{children}</div></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}

function PlayersTable({ players, mode }: { players: DemoPlayer[]; mode?: 'attendance' | 'coach' }) {
  return <Panel title={mode === 'attendance' ? 'Asistencia del día' : 'Jugadores demo'}><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.12em] text-slate-400"><tr><th className="py-3">Jugador</th><th>Categoría</th><th>Entrenador</th><th>Estado</th><th>Asistencia</th><th>Progreso</th></tr></thead><tbody className="divide-y divide-slate-100">{players.map((player) => <tr key={player.id}><td className="py-3"><div className="font-semibold text-slate-900">{player.name}</div><div className="text-xs text-slate-500">{player.id} · {player.guardian}</div></td><td>{player.category}</td><td>{player.coach}</td><td><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(player.status)}`}>{player.status}</span></td><td>{player.attendance}%</td><td>{player.performance}%</td></tr>)}</tbody></table></div></Panel>;
}

function PaymentsTable({ payments }: { payments: DemoPayment[] }) {
  return <Panel title="Pagos y solvencia"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.12em] text-slate-400"><tr><th className="py-3">Jugador</th><th>Representante</th><th>Monto</th><th>Estado</th><th>Referencia</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id}><td className="py-3 font-semibold text-slate-900">{payment.player}</td><td>{payment.guardian}</td><td>{money(payment.amount)}</td><td><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(payment.status)}`}>{payment.status}</span></td><td>{payment.due}</td></tr>)}</tbody></table></div></Panel>;
}

function Agenda() {
  return <div className="grid gap-4 md:grid-cols-3"><Panel title="Hoy"><p className="text-sm text-slate-600">Entrenamiento Sub-10 · 4:00 PM</p></Panel><Panel title="Mañana"><p className="text-sm text-slate-600">Revisión de pagos pendientes · 9:00 AM</p></Panel><Panel title="Fin de semana"><p className="text-sm text-slate-600">Partido amistoso Sub-12 · 8:30 AM</p></Panel></div>;
}

function TrainingPlan({ categories }: { categories: string[] }) {
  return <div className="grid gap-4 md:grid-cols-2">{categories.slice(0, 4).map((category, index) => <Panel key={category} title={`Plan ${category}`}><p className="text-sm text-slate-600">Sesión #{index + 1}: movilidad, rondos, definición y partido condicionado. Objetivo: mejorar toma de decisión y presión tras pérdida.</p></Panel>)}</div>;
}

function Observations({ players }: { players: DemoPlayer[] }) {
  return <div className="space-y-3">{players.map((player) => <div key={player.id} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-900">{player.name}</p><p className="mt-1 text-sm text-slate-600">{player.notes}</p></div>)}</div>;
}

function ImplementationRequest({ config, update, playerCount, setupValue, recurringValue, rate, leadStatus, leadMessage, onSubmit }: { config: DemoConfig; update: <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void; playerCount: number; setupValue: number; recurringValue: number; rate: number; leadStatus: 'idle' | 'sending' | 'sent' | 'error'; leadMessage: string; onSubmit: () => void }) {
  return (
    <section className="rounded-[34px] border border-teal-100 bg-teal-50 p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Implementación</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">¿Deseas implementar esta plataforma?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Al enviar esta solicitud, Trends172Tech guarda los datos en el panel interno de Implementaciones LUNA para contactarte y preparar la propuesta.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Kpi label="Jugadores" value={playerCount.toString()} /><Kpi label={`Implementación $${rate}/jugador`} value={money(setupValue)} /><Kpi label="Mensualidad estimada" value={`${money(recurringValue)}/mes`} /></div>
        </div>
        <div className="rounded-[28px] border border-teal-100 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            <Field label="Nombre del responsable"><input value={config.contactName} onChange={(event) => update('contactName', event.target.value)} className="demo-input" placeholder="Nombre y apellido" /></Field>
            <Field label="Teléfono de contacto"><input value={config.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} className="demo-input" placeholder="+58..." /></Field>
            <Field label="Email opcional"><input value={config.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} className="demo-input" placeholder="correo@escuela.com" /></Field>
            <button type="button" onClick={onSubmit} disabled={leadStatus === 'sending' || leadStatus === 'sent'} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">{leadStatus === 'sending' ? 'Guardando...' : leadStatus === 'sent' ? 'Solicitud enviada' : 'Deseo implementar LUNA Football'}</button>
            {leadMessage ? <p className={`text-sm ${leadStatus === 'error' ? 'text-rose-700' : 'text-teal-700'}`}>{leadMessage}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
