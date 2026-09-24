import { prisma } from '@trends172tech/db';
import { MetricCard } from '@/components/admin/metric-card';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { StatusBadge } from '@/components/admin/status-badge';

export const dynamic='force-dynamic';

export default async function AdminBookingsPage(){
 const bookings=await prisma.adminBooking.findMany({orderBy:{startsAt:'asc'},where:{startsAt:{gte:new Date(Date.now()-7*86400000)}}});
 const upcoming=bookings.filter(b=>b.status==='CONFIRMED'&&b.startsAt>new Date());
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Caracas'}).format(new Date());
 const todayCount=upcoming.filter(b=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Caracas'}).format(b.startsAt)===today).length;
 const fmt=(d:Date)=>new Intl.DateTimeFormat('es-VE',{timeZone:'America/Caracas',dateStyle:'medium',timeStyle:'short'}).format(d);
 return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Área de reservas</h2><p className="mt-1 text-sm text-slate-500">Llamadas y reuniones reservadas desde Trends172Tech.com. Horario base: lunes a viernes, 9:00, 10:00 y 11:00 a. m. (Venezuela).</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Próximas reuniones" value={String(upcoming.length)}/><MetricCard label="Reservas hoy" value={String(todayCount)} accent="cyan"/><MetricCard label="Total visible" value={String(bookings.length)}/></div><AdminDataTable title="Reservas" columns={['Fecha','Contacto','Empresa','Origen','Estado']} rows={bookings} emptyLabel="No hay reservas todavía." renderRow={(b)=><TableRow key={b.id}><TableCell className="font-semibold text-slate-950 dark:text-white">{fmt(b.startsAt)}</TableCell><TableCell><div>{b.name}</div><div className="text-xs text-slate-500">{b.email}{b.phone?` · ${b.phone}`:''}</div></TableCell><TableCell>{b.company||'-'}</TableCell><TableCell>{b.source}</TableCell><TableCell><StatusBadge label={b.status==='CONFIRMED'?'Confirmada':b.status==='COMPLETED'?'Completada':'Cancelada'} tone={b.status==='CONFIRMED'?'success':b.status==='COMPLETED'?'neutral':'danger'}/></TableCell></TableRow>}/></div>;
}
