import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';

export const dynamic = 'force-dynamic';

const HOURS = [9, 10, 11];
const TZ = 'America/Caracas';

function caracasDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(date);
  return Object.fromEntries(parts.map(p=>[p.type,p.value]));
}

function makeUtc(y:number,m:number,d:number,h:number) {
  return new Date(Date.UTC(y,m-1,d,h+4,0,0,0));
}

export async function GET() {
  const now = new Date();
  const slots: {key:string;startsAt:string;label:string}[] = [];
  for (let offset=0; offset<21 && slots.length<30; offset++) {
    const probe = new Date(now.getTime()+offset*86400000);
    const p = caracasDateParts(probe);
    if (p.weekday==='Sat'||p.weekday==='Sun') continue;
    for (const hour of HOURS) {
      const start=makeUtc(Number(p.year),Number(p.month),Number(p.day),hour);
      if (start.getTime() < now.getTime()+2*60*60*1000) continue;
      const key=`${p.year}-${p.month}-${p.day}-${String(hour).padStart(2,'0')}00`;
      slots.push({key,startsAt:start.toISOString(),label:`${hour}:00 a. m.`});
    }
  }
  const booked=await prisma.adminBooking.findMany({where:{slotKey:{in:slots.map(s=>s.key)},status:'CONFIRMED'},select:{slotKey:true}});
  const taken=new Set(booked.map(x=>x.slotKey));
  return NextResponse.json({timezone:TZ,slots:slots.filter(s=>!taken.has(s.key))},{headers:{'Cache-Control':'no-store'}});
}
