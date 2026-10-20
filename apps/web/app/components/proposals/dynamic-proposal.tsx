'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookingWidget } from '@/components/booking/booking-widget';
import type { StoredProposal } from '@/lib/proposals/document';
import s from './proposal-experience.module.css';

const chapters = [
  ['vision', 'Vision'], ['oportunidad', 'La oportunidad'], ['plataforma', 'Plataforma'],
  ['demo', 'Experiencia IA'], ['evidencia', 'Caso real'], ['ruta', 'Implementacion'],
  ['alcance', 'Alcance'], ['reservar', 'Conversemos'],
] as const;

type Props = { document: StoredProposal; preview?: boolean };

export function DynamicProposal({ document: doc, preview = false }: Props) {
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState(0);
  const [scenario, setScenario] = useState(0);
  const [full, setFull] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const whatsapp = `https://wa.me/584222640371?text=${encodeURIComponent(`Hola, deseo consultar la propuesta LUNA para ${doc.clientName}.`)}`;

  function go(index: number) {
    if (index < 0 || index >= chapters.length) return;
    setActive(index);
    window.location.hash = chapters[index][0];
    stage.current?.scrollTo({ top: 0 });
  }

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const sync = () => {
      const i = chapters.findIndex(c => c[0] === window.location.hash.slice(1));
      setActive(i < 0 ? 0 : i);
      stage.current?.scrollTo({ top: 0 });
    };
    const fullscreen = () => setFull(document.fullscreenElement === root.current);
    sync();
    window.addEventListener('hashchange', sync);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('fullscreenchange', fullscreen);
    };
  }, []);

  const selectedScenario = doc.scenarios[scenario];
  return <div ref={root} className={s.deck} data-proposal={doc.slug}>
    <header className={s.header}>
      <Link className={s.brand} href="/es"><img src="/branding/ttech-logo.svg" width={32} height={32} alt="" />Trends172Tech</Link>
      <div className={s.headerLabel}><span>{preview ? 'VISTA PREVIA PRIVADA' : 'PROPUESTA CORPORATIVA'}</span><strong>{doc.clientName}</strong></div>
      <button className={s.fullscreen} type="button" onClick={async () => {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await root.current?.requestFullscreen?.();
      }} aria-label={full ? 'Salir de pantalla completa' : 'Pantalla completa'}>{full ? '\u2199' : '&nearr;'}</button>
    </header>
    <nav className={s.nav} aria-label="Capitulos de la propuesta">
      <p>EXPLORAR LA PROPUESTA</p>
      {chapters.map(([id, label], i) => <a key={id} href={`#${id}`} aria-current={active === i ? 'step' : undefined} onClick={e => { e.preventDefault(); go(i); }}><span>{String(i+1).padStart(2,'0')}</span>{label}</a>)}
      <div className={s.navSignature}>Ingenieria aplicada.<br/>Impacto medible.<img src="/branding/luna-logo.png" alt="LUNA" /></div>
    </nav>
    <main ref={stage} className={s.stage} role="region" tabIndex={-1} aria-label={`Capitulo ${active+1}`}>
      <section className={s.slide} hidden={active !== 0}>
        <div className={s.eyebrow}><span>LUNA &times; {doc.clientName.toUpperCase()}</span><span>01 / 08</span></div>
        <div className={s.heroGrid}><div><p className={s.overline}>UNA SOLUCION DISENADA PARA SU OPERACION</p><h1>{doc.headline}</h1><p className={s.lead}>{doc.introduction}</p><button className={s.primary} onClick={()=>go(1)}>Explorar propuesta <span>&nearr;</span></button></div>
        <div className={s.heroVisual}><div className={s.visualTop}>VISION PROPUESTA</div><div className={s.clientName}>{doc.clientName}</div><div className={s.connection}><span/>Conectado por LUNA<span/></div><div className={s.orbitItems}>{['Personas','Procesos','Inteligencia'].map((n,i)=><div key={n}><span>0{i+1}</span>{n}</div>)}</div><div className={s.visualBottom}>Software + datos + IA aplicada</div></div></div>
      </section>
      <section className={s.slide} hidden={active !== 1}>
        <div className={s.eyebrow}><span>LA OPORTUNIDAD</span><span>02 / 08</span></div><h2>Una oportunidad.<br/><em>Un sistema conectado.</em></h2><p className={s.lead}>{doc.opportunity}</p>
        <div className={s.editorialRows}>{doc.capabilities.slice(0,3).map((c,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><h3>{c.title}</h3><p>{c.text}</p></div>)}</div>
      </section>
      <section className={s.slide} hidden={active !== 2}>
        <div className={s.eyebrow}><span>PLATAFORMA LUNA</span><span>03 / 08</span></div><h2>Capacidades para<br/><em>conectar la operacion.</em></h2><div className={s.moduleGrid}>
          <div className={s.tabs} role="tablist" aria-label="Capacidades">{doc.capabilities.map((c,i)=><button key={i} type="button" role="tab" aria-selected={tab===i} onClick={()=>setTab(i)}><span>{String(i+1).padStart(2,'0')}</span>{c.title} <span>&rarr;</span></button>)}</div>
          <div className={s.modulePanel} role="tabpanel"><div className={s.moduleNumber}>{String(tab+1).padStart(2,'0')}</div><img src="/branding/luna-logo.png" alt="LUNA"/><h3>{doc.capabilities[tab].title}</h3><p>{doc.capabilities[tab].text}</p><div className={s.panelFoot}>Capacidad propuesta; alcance sujeto a diagnostico.</div></div>
        </div>
      </section>
      <section className={`${s.slide} ${s.dark}`} hidden={active !== 3}>
        <div className={s.eyebrow}><span>DEMOSTRACION CONCEPTUAL</span><span>04 / 08</span></div><div className={s.demoGrid}><div><h2>Inteligencia que<br/><em>acompana cada decision.</em></h2><p className={s.lead}>Escenarios ilustrativos. Las integraciones y los datos del cliente se validan durante el proyecto.</p><div className={s.scenarios}>{doc.scenarios.map((c,i)=><button key={i} aria-pressed={scenario===i} onClick={()=>setScenario(i)}>{c.title}<span>&nearr;</span></button>)}</div></div>
        <div className={s.conversation}><div className={s.chatBrand}>LUNA AI <small>Ejemplo conceptual, no una conexion al cliente</small></div><div className={s.question}>{selectedScenario.question}</div><div className={s.answer}>{selectedScenario.answer}</div><div className={s.chatFlow}>{selectedScenario.flow}</div></div></div>
      </section>
      <section className={s.slide} hidden={active !== 4}>
        <div className={s.eyebrow}><span>TRAYECTORIA</span><span>05 / 08</span></div><h2>Experiencia aplicada.<br/><em>Adaptacion especializada.</em></h2><p className={s.lead}>CarpiHogar es un caso real del ecosistema de Trends172Tech. Su experiencia no constituye evidencia de que las funcionalidades propuestas esten instaladas en {doc.clientName}.</p><p className={s.bodyText}>El alcance de esta propuesta se define para el cliente y debe validarse durante la fase de descubrimiento.</p>
      </section>
      <section className={s.slide} hidden={active !== 5}>
        <div className={s.eyebrow}><span>RUTA DE IMPLEMENTACION</span><span>06 / 08</span></div><h2>Una ruta clara.<br/><em>Por fases.</em></h2><div className={s.phases}>{doc.phases.map((p,i)=><details key={i} open={i===0 ? true:undefined}><summary><span>{String(i+1).padStart(2,'0')}</span><h3>{p.title}</h3><b>+</b></summary><p>{p.text}</p></details>)}</div>
      </section>
      <section className={s.slide} hidden={active !== 6}>
        <div className={s.eyebrow}><span>DEFINIR JUNTOS</span><span>07 / 08</span></div><h2>Alcance, datos<br/><em>y prioridades.</em></h2><div className={s.scopeGrid}><div><h3>Puntos por confirmar</h3><ul>{doc.scopeNotes.map((note,i)=><li key={i}>{note}</li>)}</ul></div><div className={s.scopeAccent}><h3>Condiciones comerciales</h3><ul><li>Precio, calendario y etapas sujetos a diagnostico.</li><li>Funciones en desarrollo no son funcionalidades contratadas.</li><li>Esta propuesta no es un compromiso contractual.</li></ul></div></div>
      </section>
      <section className={s.slide} hidden={active !== 7}>
        <div className={s.eyebrow}><span>CONVERSEMOS</span><span>08 / 08</span></div><div className={s.meetingGrid}><div><h2>Disenemos la proxima etapa<br/><em>para {doc.clientName}.</em></h2><p className={s.lead}>Una reunion para entender la operacion y definir prioridades.</p><a className={s.primary} href={whatsapp} target="_blank" rel="noreferrer">Hablar por WhatsApp <span>&nearr;</span></a></div><div className={s.booking}>{preview ? <p className={s.note}>Borrador privado. Publica con autorizacion ROOT para habilitar la agenda.</p> : <BookingWidget source={doc.slug}/>}</div></div>
      </section>
    </main>
    <footer className={s.footer}><div className={s.progress}><span style={{width:`${((active+1)/8)*100}%`}}/></div><span className={s.current}>{String(active+1).padStart(2,'0')} / 08 &middot; {chapters[active][1]}</span><div><button onClick={()=>go(active-1)} disabled={active===0} aria-label="Anterior">&larr;</button><button onClick={()=>go(active+1)} disabled={active===7} aria-label="Siguiente">&rarr;</button></div></footer>
  </div>;
}
