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
  playerRange: '520',
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
  hasTraining: true
};

const playerNames = [
  'Mateo Rodríguez', 'Santiago Pérez', 'Diego González', 'Samuel Hernández', 'Alejandro Torres',
  'Gabriel Medina', 'Lucas Vargas', 'Daniel Rivas', 'Nicolás Castillo', 'Emiliano Herrera',
  'Sebastián Ruiz', 'Thiago Moreno', 'David Morales', 'Adrián Salazar', 'Julián Castro',
  'Tomás Méndez', 'Bruno Suárez', 'Ángel Ferrer', 'Luis Ortega', 'Mario Cordero'
];

const guardianNames = ['María Pérez', 'María Pérez', 'José González', 'José González', 'Carolina Torres', 'Carolina Torres', 'Andrea Rivas', 'Andrea Rivas', 'Luis Hernández', 'Luis Hernández'];
const coaches = ['Carlos Medina', 'Jorge Arias', 'Luis Mendoza', 'Andrés Castillo'];
const categoryNames = ['Sub-6', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Porteros', 'Competitivo'];
const demoGuardian = 'María Pérez';
const demoCoach = 'Carlos Medina';

const planInfo = [
  { label: 'Más de 500 jugadores', price: '$5', detail: 'Implementación + primer mes incluido' },
  { label: '250 a 500 jugadores', price: '$6', detail: 'Implementación + primer mes incluido' },
  { label: 'Menos de 250 jugadores', price: '$8', detail: 'Implementación + primer mes incluido' }
];

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LF';
}

function clampNumber(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function implementationRate(playerCount: number) {
  if (playerCount > 500) return 5;
  if (playerCount >= 250) return 6;
  return 8;
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
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');

  const playerCount = clampNumber(config.playerRange, 520);
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
    '--school-secondary': config.secondaryColor
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
        nextPayment: index % 4 === 0 ? 'Pendiente de conciliación' : 'Mensualidad al día'
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
      due: index % 4 === 0 ? 'Vence esta semana' : 'Mes actual'
    }));
  }, [players, monthlyFee]);

  const coachPlayers = players.filter((player) => player.coach === demoCoach);
  const coachCategories = Array.from(new Set(coachPlayers.map((player) => player.category)));
  const guardianPlayers = players.filter((player) => player.guardian === demoGuardian).slice(0, 3);
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
      <style>{`.demo-input{width:100%;border-radius:1rem;border:1px solid rgb(226 232 240);background:white;padding:.75rem .9rem;font-size:.875rem;color:rgb(15 23 42);outline:none}.demo-input:focus{border-color:var(--school-primary);box-shadow:0 0 0 3px rgba(20,184,166,.16)}`}</style>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <a href="../luna-football" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950">← Volver a LUNA Football</a>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Demo white-label temporal</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">Prueba LUNA Football como si ya fuera tu sistema.</h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">Configura nombre, logo, colores, jugadores y módulos. Luego entra como director, entrenador, representante o administrador para explorar una operación ficticia con permisos por rol.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#configurar" className="rounded-full bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-[0_20px_50px_-30px_rgba(13,148,136,0.9)] transition hover:-translate-y-0.5 hover:bg-teal-700">Crear mi demo</a>
              <a href="#planes" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700">Ver planes</a>
            </div>
          </div>
          <SystemPreview config={config} logoPreview={logoPreview} playerCount={playerCount} paidPlayers={paidPlayers} categoryCount={categoryCount} />
        </div>
      </section>

      <section id="planes" className="px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Planes comerciales</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">Implementación por jugador.</h2>
            <p className="text-sm leading-relaxed text-slate-600">La implementación incluye el primer mes de uso. Desde el segundo mes, la mensualidad operativa es de $1 por jugador activo en el sistema.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {planInfo.map((plan) => (
              <article key={plan.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)]">
                <p className="text-sm font-semibold text-slate-600">{plan.label}</p>
                <p className="mt-4 text-5xl font-bold tracking-[-0.06em] text-slate-950">{plan.price}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">por jugador</p>
                <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-800">{plan.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 md:grid-cols-3">
          <InfoCard title="Representante" body="Solo ve sus hijos o representados, sus pagos, calendario y notificaciones. No ve jugadores de otras familias." />
          <InfoCard title="Entrenador" body="Solo ve sus categorías asignadas, sus jugadores, asistencia, entrenamientos y observaciones técnicas." />
          <InfoCard title="Director / Admin" body="Ve operación general, pagos, categorías, staff, reportes y configuración de la escuela demo." />
        </div>
      </section>

      <section id="configurar" className="px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[430px_1fr]">
          <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)] lg:sticky lg:top-6">
            <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Configurador</p><h2 className="text-2xl font-semibold tracking-[-0.04em]">Datos de la escuela</h2><p className="text-sm leading-relaxed text-slate-500">La demo vive en el navegador. Al pedir implementación sí se guarda el lead en Trends172Tech.</p></div>
            <div className="mt-6 space-y-4">
              <Field label="Nombre de la escuela"><input value={config.schoolName} onChange={(event) => update('schoolName', event.target.value)} className="demo-input" /></Field>
              <Field label="Tipo de institución"><input value={config.institutionType} onChange={(event) => update('institutionType', event.target.value)} className="demo-input" /></Field>
              <Field label="Frase institucional"><textarea value={config.slogan} onChange={(event) => update('slogan', event.target.value)} className="demo-input min-h-20 resize-none" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Ciudad"><input value={config.city} onChange={(event) => update('city', event.target.value)} className="demo-input" /></Field><Field label="País"><input value={config.country} onChange={(event) => update('country', event.target.value)} className="demo-input" /></Field></div>
              <Field label="Logo de la escuela"><input type="file" accept="image/*" onChange={handleLogo} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-teal-700" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Color principal"><input type="color" value={config.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field><Field label="Color secundario"><input type="color" value={config.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white p-1" /></Field></div>
              <div className="grid gap-3 sm:grid-cols-3"><Field label="Jugadores"><input type="number" min="30" max="5000" value={config.playerRange} onChange={(event) => update('playerRange', event.target.value)} className="demo-input" /></Field><Field label="Categorías"><input type="number" min="4" max="12" value={config.categories} onChange={(event) => update('categories', event.target.value)} className="demo-input" /></Field><Field label="Mensualidad"><input type="number" min="0" value={config.monthlyFee} onChange={(event) => update('monthlyFee', event.target.value)} className="demo-input" /></Field></div>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="WhatsApp público"><input value={config.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} className="demo-input" /></Field><Field label="Instagram"><input value={config.instagram} onChange={(event) => update('instagram', event.target.value)} className="demo-input" /></Field></div>
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <Toggle checked={config.hasPayments} onChange={(value) => update('hasPayments', value)}>Pagos</Toggle>
                <Toggle checked={config.hasStore} onChange={(value) => update('hasStore', value)}>Tienda</Toggle>
                <Toggle checked={config.hasTournaments} onChange={(value) => update('hasTournaments', value)}>Torneos</Toggle>
                <Toggle checked={config.hasTraining} onChange={(value) => update('hasTraining', value)}>Entrenamientos</Toggle>
              </div>
              <button type="button" onClick={() => setDemoStarted(true)} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Generar demo operativa</button>
            </div>
          </aside>

          <div id="sistema" className="space-y-5">
            {!demoStarted ? (
              <div className="rounded-[34px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Demo lista para generar</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Completa los datos y presiona generar demo.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Se cargarán jugadores, representantes, pagos, entrenadores, categorías y entrenamientos ficticios con permisos por rol.</p></div>
            ) : (
              <DemoSystem
                config={config}
                logoPreview={logoPreview}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
                players={players}
                payments={payments}
                coachPlayers={coachPlayers}
                coachCategories={coachCategories}
                guardianPlayers={guardianPlayers}
                guardianPayments={guardianPayments}
                monthlyFee={monthlyFee}
                playerCount={playerCount}
                paidPlayers={paidPlayers}
                pendingPlayers={pendingPlayers}
                projectedIncome={projectedIncome}
                categoryCount={categoryCount}
                setupValue={setupValue}
                recurringValue={recurringValue}
                rate={rate}
                update={update}
                requestImplementation={requestImplementation}
                leadStatus={leadStatus}
                leadMessage={leadMessage}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SystemPreview({ config, logoPreview, playerCount, paidPlayers, categoryCount }: { config: DemoConfig; logoPreview: string; playerCount: number; paidPlayers: number; categoryCount: number }) {
  return (
    <div className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-[0_40px_100px_-70px_rgba(15,23,42,0.45)]">
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><Logo name={config.schoolName} logoPreview={logoPreview} /><div><p className="text-xs uppercase tracking-[0.22em] text-teal-300">Vista demo</p><p className="font-semibold">{config.schoolName}</p></div></div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">{[['Jugadores', playerCount], ['Pagos al día', paidPlayers], ['Categorías', categoryCount]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/8 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}</div>
      </div>
    </div>
  );
}

function DemoSystem(props: {
  config: DemoConfig;
  logoPreview: string;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  players: DemoPlayer[];
  payments: DemoPayment[];
  coachPlayers: DemoPlayer[];
  coachCategories: string[];
  guardianPlayers: DemoPlayer[];
  guardianPayments: DemoPayment[];
  monthlyFee: number;
  playerCount: number;
  paidPlayers: number;
  pendingPlayers: number;
  projectedIncome: number;
  categoryCount: number;
  setupValue: number;
  recurringValue: number;
  rate: number;
  update: <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void;
  requestImplementation: () => void;
  leadStatus: 'idle' | 'sending' | 'sent' | 'error';
  leadMessage: string;
}) {
  const roles: { key: Role; label: string }[] = [{ key: 'director', label: 'Director' }, { key: 'coach', label: 'Entrenador' }, { key: 'guardian', label: 'Representante' }, { key: 'admin', label: 'Administrador' }];

  return (
    <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_90px_-68px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><Logo name={props.config.schoolName} logoPreview={props.logoPreview} /><div><p className="text-xs uppercase tracking-[0.22em] text-teal-300">Sistema demo temporal</p><h2 className="text-xl font-bold">{props.config.schoolName}</h2><p className="text-sm text-slate-300">No cierres ni recargues la página para no perder esta sesión demo.</p></div></div><div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm"><strong>Implementación:</strong> {money(props.setupValue)} · <strong>Segundo mes:</strong> {money(props.recurringValue)}/mes</div></div>
        <div className="mt-5 flex flex-wrap gap-2">{roles.map((role) => <button key={role.key} type="button" onClick={() => props.setActiveRole(role.key)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${props.activeRole === role.key ? 'bg-white text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>Entrar como {role.label}</button>)}</div>
      </div>
      <div className="p-5 sm:p-7">
        {props.activeRole === 'director' && <DirectorView {...props} />}
        {props.activeRole === 'coach' && <CoachView players={props.coachPlayers} categories={props.coachCategories} />}
        {props.activeRole === 'guardian' && <GuardianView players={props.guardianPlayers} payments={props.guardianPayments} monthlyFee={props.monthlyFee} />}
        {props.activeRole === 'admin' && <AdminView {...props} />}
      </div>
    </div>
  );
}

function DirectorView({ playerCount, paidPlayers, pendingPlayers, projectedIncome, categoryCount, payments }: { playerCount: number; paidPlayers: number; pendingPlayers: number; projectedIncome: number; categoryCount: number; payments: DemoPayment[] }) {
  return <div className="space-y-5"><RoleNote title="Vista Director" body="Resumen general de la operación: jugadores, pagos, categorías, entrenadores y alertas." /><MetricGrid items={[['Jugadores', playerCount], ['Solventes', paidPlayers], ['Pendientes', pendingPlayers], ['Ingreso demo', money(projectedIncome)], ['Categorías', categoryCount], ['Pagos registrados', payments.length]]} /><PaymentTable payments={payments.slice(0, 8)} /></div>;
}

function CoachView({ players, categories }: { players: DemoPlayer[]; categories: string[] }) {
  return <div className="space-y-5"><RoleNote title="Vista Entrenador" body="El entrenador demo solo ve sus categorías asignadas y sus jugadores. No accede a configuración global ni a otros equipos." /><MetricGrid items={[['Mis jugadores', players.length], ['Mis categorías', categories.join(', ') || 'Sin asignar'], ['Asistencia promedio', '88%'], ['Entrenamientos', '3 esta semana']]} /><PlayerTable players={players} /></div>;
}

function GuardianView({ players, payments, monthlyFee }: { players: DemoPlayer[]; payments: DemoPayment[]; monthlyFee: number }) {
  return <div className="space-y-5"><RoleNote title="Vista Representante" body="El representante demo solo ve sus hijos o representados y los pagos vinculados a ellos." /><MetricGrid items={[['Representados', players.length], ['Mensualidad', money(monthlyFee)], ['Pagos visibles', payments.length], ['Próximo entrenamiento', 'Miércoles 4:00 PM']]} /><PlayerTable players={players} /><PaymentTable payments={payments} /></div>;
}

function AdminView(props: { config: DemoConfig; playerCount: number; categoryCount: number; setupValue: number; recurringValue: number; rate: number; update: <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void; requestImplementation: () => void; leadStatus: 'idle' | 'sending' | 'sent' | 'error'; leadMessage: string }) {
  return <div className="space-y-5"><RoleNote title="Vista Administrador" body="Configuración white-label, parámetros comerciales y solicitud de implementación para Trends172Tech." /><MetricGrid items={[['Plan calculado', `$${props.rate}/jugador`], ['Implementación', money(props.setupValue)], ['Primer mes', 'Incluido'], ['Segundo mes', `${money(props.recurringValue)}/mes`]]} /><ImplementationForm {...props} /></div>;
}

function ImplementationForm(props: { config: DemoConfig; update: <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void; requestImplementation: () => void; leadStatus: 'idle' | 'sending' | 'sent' | 'error'; leadMessage: string }) {
  return <div className="rounded-[28px] border border-teal-100 bg-teal-50 p-5"><h3 className="text-xl font-bold tracking-[-0.03em] text-teal-950">Deseo implementar LUNA Football</h3><p className="mt-2 text-sm text-teal-800">Estos datos sí se guardan como solicitud comercial en Implementaciones LUNA.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><Field label="Responsable"><input value={props.config.contactName} onChange={(event) => props.update('contactName', event.target.value)} className="demo-input" /></Field><Field label="Teléfono"><input value={props.config.contactPhone} onChange={(event) => props.update('contactPhone', event.target.value)} className="demo-input" /></Field><Field label="Email"><input type="email" value={props.config.contactEmail} onChange={(event) => props.update('contactEmail', event.target.value)} className="demo-input" /></Field></div><button type="button" disabled={props.leadStatus === 'sending'} onClick={props.requestImplementation} className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60">{props.leadStatus === 'sending' ? 'Guardando...' : 'Deseo implementar LUNA Football'}</button>{props.leadMessage ? <p className={`mt-3 text-sm font-semibold ${props.leadStatus === 'error' ? 'text-rose-700' : 'text-teal-800'}`}>{props.leadMessage}</p> : null}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>{children}</label>;
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) {
  return <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{children}</label>;
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p></article>;
}

function RoleNote({ title, body }: { title: string; body: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{title}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p></div>;
}

function MetricGrid({ items }: { items: [string, ReactNode][] }) {
  return <div className="grid gap-3 md:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-950">{value}</p></div>)}</div>;
}

function PlayerTable({ players }: { players: DemoPlayer[] }) {
  return <div className="overflow-hidden rounded-[24px] border border-slate-200"><div className="bg-slate-50 px-4 py-3 font-bold">Jugadores visibles</div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-white text-left text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-4 py-3">Jugador</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Asistencia</th><th className="px-4 py-3">Observación</th></tr></thead><tbody>{players.map((player) => <tr key={player.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{player.name}<p className="text-xs text-slate-500">{player.id}</p></td><td className="px-4 py-3">{player.category}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone(player.status)}`}>{player.status}</span></td><td className="px-4 py-3">{player.attendance}%</td><td className="px-4 py-3 text-slate-600">{player.notes}</td></tr>)}</tbody></table></div></div>;
}

function PaymentTable({ payments }: { payments: DemoPayment[] }) {
  return <div className="overflow-hidden rounded-[24px] border border-slate-200"><div className="bg-slate-50 px-4 py-3 font-bold">Pagos visibles</div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-white text-left text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-4 py-3">Jugador</th><th className="px-4 py-3">Representante</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Referencia</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{payment.player}</td><td className="px-4 py-3">{payment.guardian}</td><td className="px-4 py-3">{money(payment.amount)}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone(payment.status)}`}>{payment.status}</span></td><td className="px-4 py-3 text-slate-600">{payment.due}</td></tr>)}</tbody></table></div></div>;
}

function Logo({ name, logoPreview }: { name: string; logoPreview: string }) {
  return <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-lg font-bold text-teal-700">{logoPreview ? <img src={logoPreview} alt="Logo demo" className="h-full w-full object-cover" /> : initials(name)}</div>;
}
