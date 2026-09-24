import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
import { ensureBookingSchema } from '@/lib/bookings/store';

const TZ='America/Caracas';
const input=z.object({source:z.string().min(1).max(120),slotKey:z.string().regex(/^\d{4}-\d{2}-\d{2}-(09|10|11)00$/),name:z.string().min(2).max(120),company:z.string().max(120).optional(),email:z.string().email(),phone:z.string().max(40).optional(),notes:z.string().max(1000).optional()});

function dateFromKey(key:string){const [y,m,d,hm]=key.split('-');return new Date(Date.UTC(Number(y),Number(m)-1,Number(d),Number(hm.slice(0,2))+4));}

export async function POST(request:Request){
  await ensureBookingSchema();
  const parsed=input.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Revisa los datos de la reserva.'},{status:400});
  const start=dateFromKey(parsed.data.slotKey);
  const now=new Date();
  const localWeekday=new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short'}).format(start);
  if(start.getTime()<now.getTime()+2*60*60*1000||localWeekday==='Sat'||localWeekday==='Sun')return NextResponse.json({error:'Ese horario ya no está disponible.'},{status:409});
  const end=new Date(start.getTime()+30*60*1000);
  try{
    const booking=await prisma.adminBooking.create({data:{source:parsed.data.source,slotKey:parsed.data.slotKey,startsAt:start,endsAt:end,timezone:TZ,name:parsed.data.name.trim(),company:parsed.data.company?.trim()||null,email:parsed.data.email.toLowerCase(),phone:parsed.data.phone?.trim()||null,notes:parsed.data.notes?.trim()||null}});
    const when=new Intl.DateTimeFormat('es-VE',{timeZone:TZ,dateStyle:'full',timeStyle:'short'}).format(start);
    await Promise.allSettled([
      sendEmail({to:booking.email,subject:'Reunión confirmada · Trends172Tech',html:`<h2>Reunión confirmada</h2><p>Hola ${booking.name}, tu llamada con Trends172Tech quedó reservada para <strong>${when}</strong> (hora de Venezuela).</p><p>Te contactaremos con los detalles de la llamada.</p>`}),
      sendEmail({to:'trends172tech@gmail.com',subject:`Nueva reserva · ${booking.name}`,html:`<h2>Nueva reserva</h2><p><strong>${booking.name}</strong>${booking.company?` · ${booking.company}`:''}</p><p>${when} (Venezuela)</p><p>${booking.email} · ${booking.phone||'Sin teléfono'}</p><p>${booking.notes||''}</p>`})
    ]);
    return NextResponse.json({ok:true,id:booking.id});
  }catch(error){
    if(typeof error==='object'&&error!==null&&'code' in error&&error.code==='P2002')return NextResponse.json({error:'Ese horario acaba de ser reservado. Elige otro.'},{status:409});
    console.error('[bookings] create failed',error);return NextResponse.json({error:'No pudimos completar la reserva.'},{status:500});
  }
}
