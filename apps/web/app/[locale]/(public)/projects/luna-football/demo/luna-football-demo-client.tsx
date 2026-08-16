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
  'Mateo Rodríguez', 'Santiago Pérez', 'Diego González', 'Samuel Hernández', 'Alejandro Torres',
  'Gabriel Medina', 'Lucas Vargas', 'Daniel Rivas', 'Nicolás Castillo', 'Emiliano Herrera',
  'Sebastián Ruiz', 'Thiago Moreno', 'David Morales', 'Adrián Salazar', 'Julián Castro',
  'Tomás Méndez', 'Bruno Suárez', 'Ángel Ferrer', 'Luis Ortega', 'Mario Cordero'
];

const guardianNames = [
  'María Pérez', 'María Pérez', 'José González', 'Carolina Torres', 'Andrea Rivas', 'Luis Hernández',
  'Valentina Ruiz', 'Miguel Medina', 'Patricia Vargas', 'José González', 'Carolina Torres', 'Andrea Rivas'
];

const coaches = ['Carlos Medina', 'Carlos Medina', 'Jorge Arias', 'Jorge Arias', 'Luis Mendoza', 'Andrés Castillo'];
const categoryNames = ['Sub-6', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Porteros', 'Competitivo'];
const selectedCoach = 'Carlos Medina';
const selectedGuardian = 'María Pérez';

const plans = [
  { name: 'Academia Pro', range: 'Más de 500 jugadores', setup: 4, monthly: 1, note: 'Para escuelas grandes con operación multi-categoría.' },
  { name: 'Escuela Growth', range: '250 a 500 jugadores', setup: 5, monthly: 1, note: 'Para academias en crecimiento que necesitan ordenar pagos y jugadores.' },
  { name: 'Club Starter', range: 'Menos de 250 jugadores', setup: 6, monthly: 1, note: 'Para escuelas pequeñas que quieren iniciar la digitalización.' },
];

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LF';
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
  const [logoPreview, setLogoPreview] = useState('');
  const [demoStarted, setDemoStarted] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>('director');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');

  const playerCount = clampNumber(config.playerRange, 180);
  const categoryCount = Math.max(4, Math.min(8, clampNumber(config.categories, 6)));
  const monthlyFee = clampNumber(config.monthlyFee, 35);
  const selectedCategories = categoryNames.slice(0, categoryCount);
  const rate = implementationRate(playerCount);
  const setupValue = playerCount * rate;
  const recurringValue = playerCount;
  const paidPlayers = Math.round(playerCount * 0.78);
  const pendingPlayers = playerCount - paidPlayers;
  const projectedIncome = paidPlayers * monthlyFee;

  const themeStyle = {
    '--school-primary': config.primaryColor,
    '--school-secondary': config.secondaryColor,
  } as CSSProperties;

  const players = useMemo<DemoPlayer[]>(() => {
    return playerNames.map((name, index) => {
      const status = index % 9 === 0 ? 'Vencido' : index % 4 === 0 ? 'Pendiente' : 'Solvente';
      const category = selectedCategories[index % selectedCategories.length];
      return {
        id: `LF-${String(index + 1).padStart(4, '0')}`,
        name,
        guardian: guardianNames[index % guardianNames.length],
        category,
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

  const coachPlayers = players.filter((player) => player.coach === selectedCoach);
  const coachCategories = Array.from(new Set(coachPlayers.map((player) => player.category)));
  const guardianPlayers = players.filter((player) => player.guardian === selectedGuardian).slice(0, 3);
  const guardianPayments = payments.filter((payment) => guardianPlayers.some((player) => player.name === payment.player));
  const modules = [config.hasPayments ? 'Pagos y solvencia' : null, config.hasStore ? 'Uniformidad y tienda' : null, config.hasTournaments ? 'Torneos y partidos' : null, config.hasTraining ? 'Entrenamientos' : null].filter(Boolean) as string[];

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
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">Configura nombre, logo, colores, jugadores y módulos. Luego entra como director, entrenador, representante o administrador para explorar una operación ficticia respetando permisos reales por rol.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#configurar" className="rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-30px_rgba(13,148,136,0.9)] transition hover:-translate-y-0.5 hover:bg-teal-700">Crear mi demo</a>
              <a href="#planes" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700">Ver planes</a>
            </div>
          </div>
          <div className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.45)]">
            <SystemPreview config={config} logoPreview={logoPreview} playerCount={playerCount} paidPlayers={paidPlayers} categoryCount={categoryCount} />
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 lg:grid-cols-3">
          <InfoCard title="Permisos reales por rol" body="El representante ve solo sus hijos o representados. El entrenador ve solo sus categorías y jugadores asignados. Dirección y administración tienen vistas más amplias." />
          <InfoCard title="Datos ficticios seguros" body="La demo genera jugadores, pagos, entrenamientos y observaciones simuladas para vender el flujo sin exponer información real de CDE ni de menores." />
          <InfoCard title="Solicitud comercial capturada" body="Cuando el prospecto desea implementar, se guarda teléfono, contacto, colores, cantidad de jugadores y módulos en Implementaciones LUNA." />
        </div>
      </section>

      <section id="planes" className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Planes de LUNA Football</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">Implementación por jugador + mensualidad operativa.</h2>
            <p className="text-sm leading-relaxed text-slate-600">La escuela puede cubrir la implementación con una cuota especial por jugador. Desde el segundo mes, la mensualidad operativa es de $1 por jugador activo en el sistema.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-teal-700">{plan.range}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{plan.name}</h3>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Implementación</p><p className="mt-2 text-4xl font-semibold">${plan.setup}<span className="text-sm font-medium text-slate-300"> / jugador</span></p></div>
                  <div className="rounded-3xl bg-teal-50 p-5 text-teal-950"><p className="text-xs uppercase tracking-[0.18em] text-teal-700">Mensualidad</p><p className="mt-2 text-3xl font-semibold">${plan.monthly}<span className="text-sm font-medium text-teal-700"> / jugador / mes</span></p></div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{plan.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="configurar" className="px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[430px_1fr]">
          <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)] lg:sticky lg:top-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Configurador</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Datos de la escuela</h2>
              <p className="text-sm leading-relaxed text-slate-500">La prueba vive en el navegador. Solo se guarda información cuando pides implementación.</p>
            </div>
            <div className="mt-6 space-y-4">
              <Field label="Nombre de la escuela"><input value={config.schoolName} onChange={(event) => update('schoolName', event.target.value)} className="demo-input" /></Field>
              <Field label="Tipo de institución"><input value={config.institutionType} onChange={(event) => update('institutionType', event.target.value)} className="demo-input" /></Field>
              <Field label="Frase institucional"><textarea value={config.slogan} onChange={(event) => update('slogan', event.target.value)} className="demo-input min-h-20 resize-none" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Ciudad"><input value={config.city} onChange={(event) => update('city', event.target.value)} className="demo-input" /></Field><Field label="País"><input value={config.country} onChange={(event) => update('country', event.target.value)} className="demo-input" /></Field></div>
              <Field label="Logo de la escuela"><input type="file" accept="image/*" onChange={handleLogo} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-teal-700" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Color principal"><input type="color" value={config.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field><Field label="Color secundario"><input type="color" value={config.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field></div>
              <div className="grid gap-3 sm:grid-cols-3"><Field label="Jugadores"><input type="number" min="30" max="5000" value={config.playerRange} onChange={(event) => update('playerRange', event.target.value)} className="demo-input" /></Field><Field label="Categorías"><input type="number" min="4" max="12" value={config.categories} onChange={(event) => update('categories', event.target.value)} className="demo-input" /></Field><Field label="Mensualidad"><input type="number" min="0" value={config.monthlyFee} onChange={(event) => update('monthlyFee', event.target.value)} className="demo-input" /></Field></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="WhatsApp público"><input value={config.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} className="demo-input" /></Field><Field label="Instagram"><input value={config.instagram} onChange={(event) => update('instagram', event.target.value)} className="demo-input" /></Field></div>
              <div className="grid gap-2 text-sm text-slate-600"><Toggle checked={config.hasPayments} onChange={(value) => update('hasPayments', value)}>Pagos</Toggle><Toggle checked={config.hasTraining} onChange={(value) => update('hasTraining', value)}>Entrenamientos</Toggle><Toggle checked={config.hasTournaments} onChange={(value) => update('hasTournaments', value)}>Torneos</Toggle><Toggle checked={config.hasStore} onChange={(value) => update('hasStore', value)}>Tienda / uniformidad</Toggle></div>
              <button onClick={() => setDemoStarted(true)} className="w-full rounded-full bg-[var(--school-primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5">Generar demo operativa</button>
            </div>
          </aside>

          <div id="sistema" className="space-y-5">
            {!demoStarted ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><h3 className="text-2xl font-semibold tracking-[-0.04em]">Configura la escuela y genera la demo.</h3><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Al generar la demo aparecerá un sistema temporal con datos ficticios, roles y permisos diferenciados.</p></div>
            ) : (
              <DemoSystem config={config} logoPreview={logoPreview} players={players} payments={payments} coachPlayers={coachPlayers} coachCategories={coachCategories} guardianPlayers={guardianPlayers} guardianPayments={guardianPayments} activeRole={activeRole} setActiveRole={setActiveRole} playerCount={playerCount} paidPlayers={paidPlayers} pendingPlayers={pendingPlayers} projectedIncome={projectedIncome} setupValue={setupValue} recurringValue={recurringValue} rate={rate} requestImplementation={requestImplementation} leadStatus={leadStatus} leadMessage={leadMessage} update={update} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function DemoSystem({ config, logoPreview, players, payments, coachPlayers, coachCategories, guardianPlayers, guardianPayments, activeRole, setActiveRole, playerCount, paidPlayers, pendingPlayers, projectedIncome, setupValue, recurringValue, rate, requestImplementation, leadStatus, leadMessage, update }: { config: DemoConfig; logoPreview: string; players: DemoPlayer[]; payments: DemoPayment[]; coachPlayers: DemoPlayer[]; coachCategories: string[]; guardianPlayers: DemoPlayer[]; guardianPayments: DemoPayment[]; activeRole: Role; setActiveRole: (role: Role) => void; playerCount: number; paidPlayers: number; pendingPlayers: number; projectedIncome: number; setupValue: number; recurringValue: number; rate: number; requestImplementation: () => void; leadStatus: string; leadMessage: string; update: <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void; }) {
  return (
    <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_100px_-70px_rgba(15,23,42,0.55)]">
      <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">Esta demo es temporal. No cierres ni recargues la página para no perder la sesión. Los datos son ficticios.</div>
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-950 px-5 py-5 text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4"><Logo config={config} logoPreview={logoPreview} /><div><p className="text-xs uppercase tracking-[0.2em] text-teal-300">Sistema demo</p><h2 className="text-2xl font-semibold tracking-[-0.04em]">{config.schoolName}</h2><p className="text-sm text-slate-300">{config.city}, {config.country}</p></div></div>
        <div className="flex flex-wrap gap-2">{(['director', 'coach', 'guardian', 'admin'] as Role[]).map((role) => <button key={role} onClick={() => setActiveRole(role)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeRole === role ? 'bg-white text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>{roleLabel(role)}</button>)}</div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {activeRole === 'director' && <DirectorView playerCount={playerCount} paidPlayers={paidPlayers} pendingPlayers={pendingPlayers} projectedIncome={projectedIncome} players={players} payments={payments} />}
          {activeRole === 'coach' && <CoachView players={coachPlayers} categories={coachCategories} />}
          {activeRole === 'guardian' && <GuardianView players={guardianPlayers} payments={guardianPayments} />}
          {activeRole === 'admin' && <AdminView config={config} players={players} payments={payments} />}
        </div>
        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Plan estimado</p><p className="mt-2 text-3xl font-semibold">{money(setupValue)}</p><p className="mt-1 text-sm text-slate-600">Implementación estimada: ${rate} por jugador.</p><p className="mt-3 text-sm font-semibold text-teal-700">Mensualidad: {money(recurringValue)} / mes desde el segundo mes.</p></div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5"><h3 className="text-lg font-semibold">Deseo implementar LUNA Football</h3><p className="mt-2 text-sm text-slate-500">Guarda esta escuela como prospecto en Implementaciones LUNA.</p><div className="mt-4 space-y-3"><input placeholder="Responsable" value={config.contactName} onChange={(event) => update('contactName', event.target.value)} className="demo-input" /><input placeholder="Teléfono / WhatsApp" value={config.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} className="demo-input" /><input placeholder="Email opcional" value={config.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} className="demo-input" /><button onClick={requestImplementation} disabled={leadStatus === 'sending'} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60">{leadStatus === 'sending' ? 'Guardando...' : 'Deseo implementar esta plataforma'}</button>{leadMessage ? <p className={`text-sm ${leadStatus === 'error' ? 'text-rose-600' : 'text-teal-700'}`}>{leadMessage}</p> : null}</div></div>
        </aside>
      </div>
    </div>
  );
}

function DirectorView({ playerCount, paidPlayers, pendingPlayers, projectedIncome, players, payments }: { playerCount: number; paidPlayers: number; pendingPlayers: number; projectedIncome: number; players: DemoPlayer[]; payments: DemoPayment[] }) {
  return <div className="space-y-5"><RoleHeader title="Vista Director" body="Panel ejecutivo con operación general, pagos, categorías y alertas." /><div className="grid gap-3 md:grid-cols-4"><Metric label="Jugadores" value={String(playerCount)} /><Metric label="Solventes" value={String(paidPlayers)} /><Metric label="Pendientes" value={String(pendingPlayers)} /><Metric label="Ingreso demo" value={money(projectedIncome)} /></div><DataTable title="Jugadores recientes" players={players.slice(0, 8)} /><PaymentsTable title="Pagos recientes" payments={payments.slice(0, 8)} /></div>;
}

function CoachView({ players, categories }: { players: DemoPlayer[]; categories: string[] }) {
  return <div className="space-y-5"><RoleHeader title={`Vista Entrenador: ${selectedCoach}`} body="El entrenador solo ve sus categorías, sus jugadores, asistencia, entrenamientos y observaciones técnicas. No ve configuración global ni jugadores de otros entrenadores." /><div className="grid gap-3 md:grid-cols-3"><Metric label="Mis categorías" value={categories.join(', ')} /><Metric label="Mis jugadores" value={String(players.length)} /><Metric label="Asistencia promedio" value={`${Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length)}%`} /></div><div className="grid gap-4 lg:grid-cols-2"><Panel title="Entrenamientos próximos"><List items={[`Martes 4:00 PM · ${categories[0] ?? 'Sub-8'} · Técnica individual`, `Jueves 4:30 PM · ${categories[1] ?? 'Sub-10'} · Presión tras pérdida`, 'Sábado 8:00 AM · Partido interno controlado']} /></Panel><Panel title="Observaciones del entrenador"><List items={players.slice(0, 4).map((player) => `${player.name}: ${player.notes}`)} /></Panel></div><DataTable title="Mis jugadores asignados" players={players} /></div>;
}

function GuardianView({ players, payments }: { players: DemoPlayer[]; payments: DemoPayment[] }) {
  return <div className="space-y-5"><RoleHeader title={`Vista Representante: ${selectedGuardian}`} body="El representante solo ve sus hijos o representados. No accede a datos de otros representantes, pagos de otros niños ni panel administrativo." /><div className="grid gap-3 md:grid-cols-3"><Metric label="Representados" value={String(players.length)} /><Metric label="Pagos visibles" value={String(payments.length)} /><Metric label="Próximo entrenamiento" value="Martes 4:00 PM" /></div><DataTable title="Mis representados" players={players} /><PaymentsTable title="Pagos de mis representados" payments={payments} /><Panel title="Notificaciones familiares"><List items={['Uniforme oficial requerido para partido interno.', 'Recordatorio de hidratación y puntualidad.', 'Pago visible solo para tus representados.']} /></Panel></div>;
}

function AdminView({ config, players, payments }: { config: DemoConfig; players: DemoPlayer[]; payments: DemoPayment[] }) {
  return <div className="space-y-5"><RoleHeader title="Vista Administrador" body="Operación administrativa: configuración white-label, usuarios, categorías, pagos, staff y reportes demo." /><div className="grid gap-3 md:grid-cols-4"><Metric label="Usuarios demo" value="28" /><Metric label="Jugadores cargados" value={String(players.length)} /><Metric label="Pagos demo" value={String(payments.length)} /><Metric label="Módulos" value="6" /></div><Panel title="Configuración white-label"><List items={[`Nombre: ${config.schoolName}`, `Colores: ${config.primaryColor} / ${config.secondaryColor}`, `Portal público: inscripciones, pagos, torneos y noticias`, `Contacto: ${config.whatsapp}`]} /></Panel><PaymentsTable title="Control administrativo de pagos" payments={payments} /></div>;
}

function DataTable({ title, players }: { title: string; players: DemoPlayer[] }) {
  return <Panel title={title}><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.15em] text-slate-400"><tr><th className="py-2">Jugador</th><th>Categoría</th><th>Entrenador</th><th>Asistencia</th><th>Estado</th></tr></thead><tbody>{players.map((player) => <tr key={player.id} className="border-t border-slate-100"><td className="py-3 font-semibold text-slate-900">{player.name}<div className="text-xs font-normal text-slate-500">{player.id}</div></td><td>{player.category}</td><td>{player.coach}</td><td>{player.attendance}%</td><td><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(player.status)}`}>{player.status}</span></td></tr>)}</tbody></table></div></Panel>;
}

function PaymentsTable({ title, payments }: { title: string; payments: DemoPayment[] }) {
  return <Panel title={title}><div className="space-y-2">{payments.map((payment) => <div key={payment.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{payment.player}</p><p className="text-xs text-slate-500">{payment.guardian} · {payment.due}</p></div><div className="flex items-center gap-3"><span className="font-bold">{money(payment.amount)}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(payment.status)}`}>{payment.status}</span></div></div>)}</div></Panel>;
}

function SystemPreview({ config, logoPreview, playerCount, paidPlayers, categoryCount }: { config: DemoConfig; logoPreview: string; playerCount: number; paidPlayers: number; categoryCount: number }) {
  return <div className="overflow-hidden rounded-[28px] bg-slate-950 text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><Logo config={config} logoPreview={logoPreview} /><div><p className="text-xs uppercase tracking-[0.2em] text-teal-300">Preview</p><p className="font-semibold">{config.schoolName}</p></div></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Demo</span></div><div className="grid gap-3 p-5 sm:grid-cols-2"><PreviewMetric label="Jugadores" value={String(playerCount)} /><PreviewMetric label="Solventes" value={String(paidPlayers)} /><PreviewMetric label="Categorías" value={String(categoryCount)} /><PreviewMetric label="Mensualidad" value={money(clampNumber(config.monthlyFee, 35))} /></div></div>;
}

function Logo({ config, logoPreview }: { config: DemoConfig; logoPreview: string }) {
  return <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-lg font-black text-slate-950">{logoPreview ? <img src={logoPreview} alt="Logo demo" className="h-full w-full object-cover" /> : initials(config.schoolName)}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>{children}</label>; }
function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) { return <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"><span>{children}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>; }
function InfoCard({ title, body }: { title: string; body: string }) { return <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p></article>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p></div>; }
function PreviewMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/8 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>; }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-lg font-semibold tracking-[-0.03em]">{title}</h3>{children}</section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-2 text-sm text-slate-600">{items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>)}</ul>; }
function RoleHeader({ title, body }: { title: string; body: string }) { return <div className="rounded-[28px] border border-teal-100 bg-teal-50 p-5"><h3 className="text-2xl font-semibold tracking-[-0.04em] text-teal-950">{title}</h3><p className="mt-2 text-sm leading-relaxed text-teal-800">{body}</p></div>; }
function roleLabel(role: Role) { return role === 'director' ? 'Director' : role === 'coach' ? 'Entrenador' : role === 'guardian' ? 'Representante' : 'Administrador'; }
