'use client';

import { useEffect, useRef, useState } from 'react';
import { BookingWidget } from '@/components/booking/booking-widget';
import data from './proposal-data.json';
import s from './proposal-experience.module.css';

type ProposalId = keyof typeof data;
const chapters = [
  ['vision', 'Visión'], ['oportunidad', 'La oportunidad'], ['plataforma', 'Plataforma'],
  ['demo', 'Experiencia IA'], ['evidencia', 'Caso real'], ['ruta', 'Implementación'],
  ['alcance', 'Alcance'], ['reservar', 'Conversemos'],
];
const scenarios = {
  'city-center-maracay': [
    ['Encontrar un regalo', 'Busco un regalo de tecnología. ¿Cómo puedo comparar opciones?', 'El asistente consultaría catálogos autorizados para orientar al visitante hacia comercios y alternativas. La disponibilidad dependerá de la información conectada.', 'Intención → Catálogo → Comercio → Visita'],
    ['Descubrir promociones', '¿Qué promociones puedo encontrar en el centro comercial?', 'La experiencia reuniría promociones vigentes publicadas por los comercios, con sus condiciones y fechas. City Center definiría las reglas de visibilidad.', 'Consulta → Promociones → Condiciones → Elección'],
    ['Planificar una visita', 'Quiero organizar mi visita y descubrir comercios.', 'Un directorio conectado permitiría explorar categorías y datos publicados por cada comercio. La navegación interior y las integraciones forman parte de la evolución Smart Mall.', 'Interés → Directorio → Comercio → Visita'],
  ],
  'big-home': [
    ['Asistir una venta', 'Un cliente busca un producto. ¿Cómo conectamos la atención con la operación?', 'El flujo propuesto conecta catálogo, disponibilidad y seguimiento comercial. Precios, existencias y permisos deben validarse con los sistemas y responsables de Big Home.', 'Consulta → Disponibilidad → Cotización → Seguimiento'],
    ['Crear una campaña', 'Quiero preparar una campaña a partir del catálogo.', 'La información autorizada de productos puede alimentar borradores de contenido y variantes creativas. El equipo comercial revisa las piezas antes de aprobar su publicación.', 'Catálogo → Brief → Borrador → Aprobación'],
    ['Consultar la operación', '¿Cómo podría la dirección explorar ventas e inventario?', 'La analítica conversacional se diseñaría sobre indicadores acordados y datos conectados. Las respuestas deben conservar trazabilidad y respetar los permisos de cada usuario.', 'Pregunta → Datos → Indicador → Decisión'],
  ],
};

export function ProposalExperience({ proposal }: { proposal: ProposalId }) {
  const city = proposal === 'city-center-maracay';
  const client = city ? 'City Center Maracay' : 'Big Home';
  const { capabilities, phases } = data[proposal];
  const [active, setActive] = useState(0);
  const [module, setModule] = useState(0);
  const [scenario, setScenario] = useState(0);
  const [full, setFull] = useState(false);
  const [notice, setNotice] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const whatsapp = `https://wa.me/584222640371?text=${encodeURIComponent(`Hola, estoy interesado en la propuesta LUNA para ${client}. Me gustaría coordinar una reunión.`)}`;

  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      const legacy: Record<string, string> = { reunion: 'reservar' };
      const index = chapters.findIndex(([id]) => id === (legacy[hash] || hash));
      setActive(index < 0 ? 0 : index);
      stage.current?.scrollTo({ top: 0 });
    };
    sync();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Hide only the site's duplicate navigation from keyboard users.
    // Security, consent and other platform overlays retain their behavior.
    const siblings: Array<[HTMLElement, boolean, boolean]> = [];
    document.querySelectorAll<HTMLElement>('header, footer').forEach(element => {
      if (!root.current?.contains(element)) {
        siblings.push([element, element.inert, element.hidden]);
        element.hidden = true;
        element.inert = true;
      }
    });
    const fullscreen = () => setFull(document.fullscreenElement === root.current);
    window.addEventListener('hashchange', sync);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => {
      document.body.style.overflow = old;
      siblings.forEach(([element, inert, hidden]) => { element.inert = inert; element.hidden = hidden; });
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('fullscreenchange', fullscreen);
    };
  }, []);

  function go(index: number) {
    if (index < 0 || index >= chapters.length) return;
    location.hash = chapters[index][0];
    setActive(index);
    stage.current?.scrollTo({ top: 0 });
    stage.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    function key(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || target.closest('input,textarea,select,button,a,summary,[role="tablist"],[contenteditable="true"]')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(active + (event.key === 'ArrowRight' ? 1 : -1));
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active]);

  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
      else setNotice('Usa el modo horizontal del dispositivo para ampliar la presentación.');
    } catch { setNotice('La pantalla completa no está disponible en este navegador.'); }
  }

  function tabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (['ArrowDown','ArrowRight'].includes(event.key)) next = (index + 1) % capabilities.length;
    else if (['ArrowUp','ArrowLeft'].includes(event.key)) next = (index + capabilities.length - 1) % capabilities.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = capabilities.length - 1;
    else return;
    event.preventDefault(); setModule(next);
    document.getElementById(`cap-${next}`)?.focus();
  }

  const scenarioData = scenarios[proposal][scenario];
  return <div ref={root} className={s.deck} data-proposal={proposal}>
    <header className={s.header}>
      <a className={s.brand} href="/es" aria-label="Trends172Tech, inicio"><img src="/branding/ttech-logo.svg" alt="" width="32" height="32" />Trends172Tech</a>
      <div className={s.headerLabel}><span>PROPUESTA CORPORATIVA</span><strong>{client}</strong></div>
      <button type="button" className={s.fullscreen} onClick={toggleFull} aria-label={full ? 'Salir de pantalla completa' : 'Abrir en pantalla completa'}>{full ? '↙' : '↗'}</button>
    </header>
    <nav className={s.nav} aria-label="Capítulos de la propuesta">
      <p>EXPLORAR LA PROPUESTA</p>
      {chapters.map(([id, title], i) => <a key={id} href={`#${id}`} aria-current={active === i ? 'step' : undefined} onClick={e => { e.preventDefault(); go(i); }}><span>{String(i + 1).padStart(2, '0')}</span>{title}</a>)}
      <div className={s.navSignature}>Una plataforma.<br />Distintas formas<br />de operar.<img src="/branding/luna-logo.png" alt="LUNA ERP inteligente" /></div>
    </nav>
    <div className={s.stage} ref={stage} tabIndex={-1} role="region" aria-label={`Capítulo ${active + 1}: ${chapters[active][1]}`}>
      <section className={`${s.slide} ${s.hero}`} hidden={active !== 0} id="vision">
        <div className={s.eyebrow}><span>LUNA × {city ? 'CITY CENTER' : 'BIG HOME'}</span><span>01 / 08</span></div>
        <div className={s.heroGrid}>
          <div><p className={s.overline}>{city ? 'EL SIGUIENTE ESPACIO COMERCIAL' : 'EL SIGUIENTE NIVEL OPERATIVO'}</p><h1>{city ? <>El centro comercial.<br /><em>Ahora, conectado.</em></> : <>Toda la operación.<br /><em>Una misma visión.</em></>}</h1><p className={s.lead}>{city ? 'Una extensión digital de City Center que conecta visitantes, comercios e inteligencia artificial.' : 'LUNA para conectar ventas, inventario, sucursales y clientes alrededor de Big Home.'}</p><button className={s.primary} onClick={() => go(1)}>Explorar la propuesta <span>↗</span></button><p className={s.caption}>Ingeniería aplicada por Trends172Tech</p></div>
          <div className={s.heroVisual} aria-label="Arquitectura conceptual de la propuesta"><div className={s.visualTop}><span>VISIÓN PROPUESTA</span><span className={s.dot} /></div><div className={s.clientName}>{city ? <>CITY<br />CENTER.</> : <>BIG<br />HOME.</>}</div><div className={s.connection}><span />Conectado por LUNA<span /></div><div className={s.orbitItems}>{(city ? ['Visitantes','Comercios','Administración'] : ['Sucursales','Comercio','Dirección']).map((x,i) => <div key={x}><span>0{i+1}</span>{x}</div>)}</div><div className={s.visualBottom}>Procesos + datos + IA aplicada</div></div>
        </div>
        <div className={s.heroFoot}><span>Propuesta conceptual · Implementación especializada</span><button onClick={() => go(4)}>Explorar la base real <span>↗</span></button></div>
      </section>

      <section className={s.slide} hidden={active !== 1} id="oportunidad">
        <div className={s.eyebrow}><span>LA OPORTUNIDAD</span><span>02 / 08</span></div>
        <h2>{city ? <>Cada local, una puerta.<br /><em>También en digital.</em></> : <>Conectar el negocio.<br /><em>Conservar su identidad.</em></>}</h2>
        <p className={s.lead}>{city ? 'La relación con cada comercio puede evolucionar hacia local físico + presencia digital, bajo una plataforma gobernada por City Center.' : 'Big Home aporta su marca y operación. LUNA puede convertirse en el núcleo tecnológico que conecta procesos, canales y datos.'}</p>
        <div className={s.editorialRows}>{(city ? [
          ['Visitantes','Descubrir comercios, productos y promociones desde una experiencia propia del centro comercial.'],
          ['Comercios','Acceder a una vitrina digital con capacidades comerciales según el alcance contratado.'],
          ['City Center','Gobernar altas, visibilidad, campañas y métricas dentro de un mismo ecosistema.'],
        ] : [
          ['Operación','Conectar ventas, cajas, compras y existencias con responsables y trazabilidad.'],
          ['Clientes','Dar continuidad a la relación entre tienda, comercio digital y atención.'],
          ['Dirección','Explorar indicadores y decidir con una visión compartida de la operación.'],
        ]).map(([title,text], i) => <div key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
        <p className={s.note}>{city ? 'El modelo comercial y la participación de los comercios se definirán junto a City Center.' : 'La integración, adaptación o sustitución progresiva de sistemas se define después de conocer la infraestructura actual.'}</p>
      </section>

      <section className={s.slide} hidden={active !== 2} id="plataforma">
        <div className={s.eyebrow}><span>CAPACIDADES PROPUESTAS</span><span>03 / 08</span></div>
        <h2>{city ? <>Una plataforma.<br /><em>Múltiples comercios.</em></> : <>Del producto a la venta.<br /><em>De la caja a la dirección.</em></>}</h2>
        <p className={s.intro}>Explora cada área para conocer su papel dentro de la implementación.</p>
        <div className={s.moduleGrid}><div className={s.tabs} role="tablist" aria-label="Áreas de la plataforma" aria-orientation="vertical">{capabilities.map((cap,i) => <button key={cap.title} id={`cap-${i}`} role="tab" aria-selected={module === i} aria-controls="cap-panel" tabIndex={module === i ? 0 : -1} onKeyDown={e => tabKey(e,i)} onClick={() => setModule(i)}><span>{String(i+1).padStart(2,'0')}</span>{cap.title}<span>↗</span></button>)}</div><div id="cap-panel" className={s.modulePanel} role="tabpanel" aria-labelledby={`cap-${module}`} tabIndex={0}><img src="/branding/luna-logo.png" alt="LUNA ERP inteligente" /><div className={s.moduleNumber}>{String(module+1).padStart(2,'0')}</div><h3>{capabilities[module].title}</h3><p>{capabilities[module].text}</p><div className={s.panelFoot}>Configuración + adaptación + validación operativa</div></div></div>
        <p className={s.note}>El alcance y las integraciones se validan durante el diagnóstico. Esta propuesta no implica que las capacidades ya estén desplegadas en {client}.</p>
      </section>

      <section className={`${s.slide} ${s.dark}`} hidden={active !== 3} id="demo">
        <div className={s.eyebrow}><span>{city ? 'LUNA AI COMMERCE' : 'LUNA MARKETING + INTELIGENCIA'}</span><span>04 / 08</span></div>
        <div className={s.demoGrid}><div><h2>{city ? <>El centro comercial<br /><em>también puede conversar.</em></> : <>Del dato a la acción.<br /><em>Con IA aplicada.</em></>}</h2><p className={s.lead}>{city ? 'Orientar al visitante y conectar su intención con la oferta disponible.' : 'Asistir al equipo comercial, desarrollar contenido y explorar la operación con datos autorizados.'}</p><div className={s.scenarios} role="group" aria-label="Escenarios de demostración">{scenarios[proposal].map(([label],i) => <button key={label} aria-pressed={scenario === i} onClick={() => setScenario(i)}>{label}<span>↗</span></button>)}</div><p className={s.darkNote}>Demostración conceptual con respuestas predefinidas. No consulta datos reales ni ejecuta acciones.</p></div><div className={s.conversation} aria-live="polite"><div className={s.chatBrand}><img src="/branding/ttech-logo.svg" alt="" /><div>LUNA · {city ? 'City Center' : 'Big Home'}<small>Experiencia propuesta</small></div></div><div className={s.question}>{scenarioData[1]}</div><div className={s.answer}>{scenarioData[2]}</div><div className={s.chatFlow}>{scenarioData[3]}</div></div></div>
        {!city && <div className={s.advanced}><strong>EVOLUCIÓN PROPUESTA</strong><span>Marketing IA</span><span>Video Marketing AI</span><span>Omnicanalidad</span><span>IA visual</span><p>Video y experiencias de productos en ambientes se incorporan cuando estén listas para el alcance contratado.</p></div>}
      </section>

      <section className={s.slide} hidden={active !== 4} id="evidencia">
        <div className={s.eyebrow}><span>EXPERIENCIA OPERATIVA REAL</span><span>05 / 08</span></div>
        <div className={s.evidenceGrid}><div><h2>Una base construida<br /><em>en el negocio real.</em></h2><p className={s.lead}>CarpiHogar es una implementación comercial de referencia del ecosistema Trends172Tech.</p><p className={s.bodyText}>Su experiencia conecta catálogo, comercio y gestión empresarial. Ese conocimiento orienta una implementación de LUNA ajustada a los procesos y necesidades de {client}.</p><div className={s.proofRows}><span>01 <strong>Arquitectura modular</strong></span><span>02 <strong>Comercio y operación conectados</strong></span><span>03 <strong>Adaptación por contexto</strong></span></div><a className={s.textLink} href="https://carpihogar.com" target="_blank" rel="noreferrer">Visitar CarpiHogar ↗</a><p className={s.note}>Referencia de CarpiHogar. La imagen no representa una implementación para {client} ni acredita resultados futuros.</p></div><figure className={s.productImage}><img src="/screenshots/luna/carpihogar-real-mobile.jpg" alt="Captura real de la experiencia comercial de CarpiHogar" loading="lazy" /><figcaption>CARPIHOGAR · REFERENCIA DE PRODUCTO</figcaption></figure></div>
      </section>

      <section className={s.slide} hidden={active !== 5} id="ruta">
        <div className={s.eyebrow}><span>RUTA DE IMPLEMENTACIÓN</span><span>06 / 08</span></div>
        <h2>Construir por fases.<br /><em>Validar antes de escalar.</em></h2><p className={s.intro}>Explora la secuencia propuesta. El diagnóstico define prioridades, dependencias y calendario.</p>
        <div className={s.phases}>{phases.map((phase,i) => <details key={phase.title} name={`${proposal}-phases`} open={i === 0 ? true : undefined}><summary><span>{String(i+1).padStart(2,'0')}</span><h3>{phase.title}</h3><b>+</b></summary><p>{phase.text}</p></details>)}</div>
        <p className={s.note}>{city ? 'El modelo transaccional, las integraciones y el alcance de Smart Mall se acuerdan antes de su implementación.' : 'Migración, sucursales, usuarios y capacidades avanzadas se dimensionan después del diagnóstico inicial.'}</p>
      </section>

      <section className={s.slide} hidden={active !== 6} id="alcance">
        <div className={s.eyebrow}><span>MARCO DE LA PROPUESTA</span><span>07 / 08</span></div>
        <h2>Una visión compartida.<br /><em>Un alcance por acordar.</em></h2><p className={s.lead}>La siguiente conversación convierte esta visión en una propuesta de implementación concreta.</p>
        <div className={s.scopeGrid}><div><p className={s.overline}>DEFINIR JUNTOS</p><h3>El punto de partida</h3><ul>{(city ? ['Comercios participantes y catálogo inicial.','Gobierno de la plataforma y responsables.','Modelo comercial y transaccional.','Integraciones, datos y primera fase.'] : ['Procesos, sucursales, cajas y almacenes.','Sistemas actuales y estrategia de migración.','Usuarios, permisos y datos autorizados.','Integraciones y alcance del primer piloto.']).map(x=><li key={x}>{x}</li>)}</ul></div><div className={s.scopeAccent}><p className={s.overline}>FORMALIZAR DESPUÉS DEL DIAGNÓSTICO</p><h3>La implementación</h3><ul><li>Entregables y criterios de aceptación.</li><li>Cronograma y responsabilidades.</li><li>Inversión y condiciones comerciales.</li><li>Acompañamiento y evolución acordados.</li></ul></div></div>
        <p className={s.note}>{city ? 'La documentación legal y los datos registrales de LUNA se incorporarán a la versión comercial final una vez validados para presentación externa.' : 'Las funciones en desarrollo se incorporan únicamente cuando estén listas para el alcance contratado.'} Esta presentación no fija precios ni plazos de ejecución.</p>
      </section>

      <section className={s.slide} hidden={active !== 7} id="reservar">
        <div className={s.eyebrow}><span>EL SIGUIENTE PASO</span><span>08 / 08</span></div>
        <div className={s.meetingGrid}><div><h2>{city ? <>Diseñemos el próximo<br /><em>City Center.</em></> : <>Diseñemos la próxima<br /><em>etapa de Big Home.</em></>}</h2><p className={s.lead}>Una conversación para conocer la operación, validar prioridades y definir la primera fase.</p><div className={s.agenda}><p>EN NUESTRA REUNIÓN</p><span>01 · Entender el contexto</span><span>02 · Priorizar oportunidades</span><span>03 · Acordar el siguiente paso</span></div><a className={s.primary} href={whatsapp} target="_blank" rel="noreferrer">Hablar por WhatsApp <span>↗</span></a><p className={s.caption}>O selecciona un horario en el formulario.</p></div><div className={s.booking}>{active === 7 ? <BookingWidget source={city ? 'city-center-maracay' : 'big-home-luna'} /> : null}</div></div>
      </section>
    </div>
    <footer className={s.footer}><div className={s.progress} role="progressbar" aria-label="Avance de la propuesta" aria-valuemin={1} aria-valuemax={8} aria-valuenow={active+1}><span style={{ width: `${(active+1)/8*100}%` }} /></div><span className={s.current}>{String(active+1).padStart(2,'0')} — {chapters[active][1]}</span><span className={s.keyHint}>Navega con las flechas del teclado</span><div><button aria-label="Capítulo anterior" disabled={active === 0} onClick={() => go(active-1)}>←</button><span>{active+1} / 8</span><button aria-label="Capítulo siguiente" disabled={active === 7} onClick={() => go(active+1)}>→</button></div></footer>
    <div className={s.srOnly} role="status">{notice || `Capítulo ${active+1} de 8: ${chapters[active][1]}`}</div>
  </div>;
}
