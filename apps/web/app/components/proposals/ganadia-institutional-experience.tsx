'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './ganadia-institutional-experience.module.css';

const chapters = [
  ['vision', 'La visión'],
  ['reto', 'El reto ganadero'],
  ['producto', 'GanadIA hoy'],
  ['trazabilidad', 'Del campo al dato'],
  ['territorio', 'Gestión del territorio'],
  ['evolucion', 'Hoja de ruta'],
  ['oportunidad', 'Oportunidad institucional'],
  ['interoperabilidad', 'Integración propuesta'],
  ['acercamiento', 'Qué proponemos'],
  ['cierre', 'Próximo paso'],
] as const;

const available = [
  { number: '01', title: 'Fincas y usuarios', detail: 'Registro de fincas, superficie, ubicación, fotografías, perfiles y permisos por empresa.', status: 'Implementado en el código' },
  { number: '02', title: 'Identidad animal', detail: 'Ficha individual con especie, raza, identificación visual, código interno o chip, sexo y procedencia.', status: 'Implementado en el código' },
  { number: '03', title: 'Salud y reproducción', detail: 'Pesajes, vacunaciones, tratamientos y eventos reproductivos; genealogía con vínculo entre madre, padre y cría.', status: 'Implementado en el código' },
  { number: '04', title: 'Operación de campo', detail: 'Jornadas de trabajo, planillas privadas, resultados e historial de intervenciones por animal.', status: 'Implementado en el código' },
  { number: '05', title: 'Geografía de la finca', detail: 'Ubicación GPS, mapa a solicitud del usuario y delimitación digital de áreas y potreros.', status: 'MVP geográfico' },
  { number: '06', title: 'Simulación productiva', detail: 'Escenarios ilustrativos de inversión y engorde con parámetros editables; no constituyen proyecciones garantizadas.', status: 'Laboratorio inicial' },
];

const roadmap = [
  { stage: '01', title: 'Administración integral', note: 'Costos por finca, inventarios, maquinaria, personal, compras, ventas y reportes económicos.' },
  { stage: '02', title: 'Asistencia agropecuaria con IA', note: 'Consulta de registros, recomendaciones supervisadas y planificación de potreros, agua y carga animal.' },
  { stage: '03', title: 'IoT y monitoreo animal', note: 'Evaluación de microchips, collares y sensores GPS/salud sujetos a cobertura, hardware y pruebas.' },
  { stage: '04', title: 'Movilización y expedientes', note: 'Preparación documental, trazabilidad de movimientos y eventual conexión oficial con INSAI, si se autoriza.' },
];

const workflow = [
  { step: '01', state: 'BASE EXISTENTE', title: 'Identificar el origen', note: 'Empresa, finca y animales con registros de identidad y antecedentes disponibles.' },
  { step: '02', state: 'A DESARROLLAR', title: 'Preparar el expediente', note: 'Destino, motivo, transportista, animales, constancias y campos requeridos por la autoridad.' },
  { step: '03', state: 'SUJETO A CONVENIO', title: 'Enviar a la vía oficial', note: 'Intercambio técnico seguro únicamente mediante mecanismo autorizado y documentado por INSAI.' },
  { step: '04', state: 'DECISIÓN DEL INSAI', title: 'Revisar y resolver', note: 'Validación, observaciones, aprobación o rechazo bajo reglas y competencias institucionales.' },
  { step: '05', state: 'SUJETO A INTEGRACIÓN', title: 'Recibir y conciliar', note: 'Registrar estado, número, documento verificable y movimientos efectivos, con auditoría.' },
];

const request = [
  { id: '01', title: 'Facilitar el primer acercamiento', content: 'Presentar GanadIA ante los responsables institucionales apropiados del INSAI y acordar una reunión introductoria.' },
  { id: '02', title: 'Celebrar una mesa técnica', content: 'Conocer el funcionamiento, los procedimientos vigentes y las condiciones institucionales del sistema SIGESAI.' },
  { id: '03', title: 'Evaluar la interoperabilidad', content: 'Determinar si existe API oficial para terceros o qué mecanismo autorizado de integración podría habilitarse.' },
  { id: '04', title: 'Definir un piloto controlado', content: 'Acordar requisitos, autorización, seguridad, homologación, pruebas y responsabilidades antes de cualquier operación real.' },
];

const constraints = [
  'INSAI conserva íntegra la competencia de validar, aprobar, rechazar y emitir el permiso oficial.',
  'GanadIA no genera ni sustituye guías oficiales por cuenta propia.',
  'No se presupone que exista una API pública o que el acceso esté autorizado.',
  'Toda integración requeriría autorización, reglas de intercambio de datos, seguridad y pruebas formales.',
];

function Eyebrow({ step, tag }: { step: string; tag: string }) {
  return <div className={styles.eyebrow}><span>{tag}</span><span>{step} / 10</span></div>;
}

export function GanadIAInstitutionalExperience() {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  function navigate(index: number) {
    setActive(Math.max(0, Math.min(chapters.length - 1, index)));
    stageRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      const node = event.target;
      if (node instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        setActive(previous => Math.min(chapters.length - 1, previous + 1));
        stageRef.current?.scrollTo({ top: 0 });
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setActive(previous => Math.max(0, previous - 1));
        stageRef.current?.scrollTo({ top: 0 });
      }
    };
    const onFullscreen = () => setFullscreen(document.fullscreenElement === shellRef.current);
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, []);

  return (
    <div ref={shellRef} className={styles.shell} data-ganadia-proposal="institutional-insai">
      <header className={styles.header}>
        <Link href="/es" className={styles.company} aria-label="Ir a Trends172Tech">
          <span className={styles.brandAccent}>T</span><span>Trends<span className={styles.brandNumber}>172</span>Tech</span>
        </Link>
        <div className={styles.documentStatus}>
          <span className={styles.statusDot} />
          <span>PRODUCTO PROPIO</span>
          <span className={styles.headerDivider}>/</span>
          <strong>PRESENTACIÓN INSTITUCIONAL</strong>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.fullscreen} type="button" aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver pantalla completa'} onClick={async () => {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await shellRef.current?.requestFullscreen?.();
          }}>{fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <nav className={styles.navigation} aria-label="Capítulos de la presentación">
        <div className={styles.navIntro}>
          <span>UNA VISIÓN PARA VENEZUELA</span>
          <strong>Presentación GanadIA</strong>
          <p>Conozca el producto y la oportunidad de colaboración institucional.</p>
        </div>
        <div className={styles.navList}>
          {chapters.map((chapter, index) => <button
            key={chapter[0]} type="button"
            className={active === index ? styles.navSelected : styles.navItem}
            aria-current={active === index ? 'step' : undefined}
            onClick={() => navigate(index)}
          ><span>{String(index + 1).padStart(2, '0')}</span><strong>{chapter[1]}</strong></button>)}
        </div>
        <div className={styles.navFoot}><span>TRAZABILIDAD · CAMPO · INTELIGENCIA</span><p>Desarrollado por Trends172Tech</p></div>
      </nav>

      <main ref={stageRef} className={styles.stage} role="region" aria-label={'Capítulo ' + (active + 1) + ': ' + chapters[active][1]}>
        {active === 0 && <section className={styles.chapter}>
          <Eyebrow step="01" tag="PLATAFORMA AGROPECUARIA CON INTELIGENCIA ARTIFICIAL" />
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.productTag}>TECNOLOGÍA VENEZOLANA PARA EL CAMPO</div>
              <h1>El futuro de la<br /><em>gestión ganadera</em><br />se construye hoy.</h1>
              <p>GanadIA es una plataforma en desarrollo activo para organizar la finca, conocer cada animal y transformar registros operativos en decisiones mejor informadas.</p>
              <div className={styles.heroPills}><span>Gestión de fincas</span><span>Trazabilidad animal</span><span>Inteligencia aplicada</span></div>
              <button type="button" className={styles.primaryButton} onClick={() => navigate(1)}>Conocer GanadIA <span aria-hidden="true">→</span></button>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}><span>PLATAFORMA DE PRODUCTO</span><span>VENEZUELA · 2026</span></div>
              <img className={styles.ganadiaLogo} src="/branding/ganadia-lockup.svg" alt="GanadIA — Tu finca, gestión inteligente" />
              <div className={styles.visualLine} />
              <div className={styles.visualGrid}><span>FINCAS</span><span>ANIMALES</span><span>OPERACIONES</span><span>DATOS</span></div>
              <div className={styles.visualFooter}><span>Una misma visión</span><strong>Del registro a la trazabilidad.</strong></div>
            </div>
          </div>
          <p className={styles.footnote}>Presentación informativa de producto propio. La interoperabilidad con el INSAI se plantea como una posibilidad futura, no como una integración existente.</p>
        </section>}

        {active === 1 && <section className={styles.chapter}>
          <Eyebrow step="02" tag="CONTEXTO · GANADERÍA VENEZOLANA" />
          <h2>Una finca genera información<br /><em>todos los días.</em></h2>
          <p className={styles.lead}>Cuando los registros viven separados, resulta más difícil seguir al animal, gestionar las jornadas y preparar información verificable para decisiones operativas y trámites.</p>
          <div className={styles.problemGrid}>
            <div><span className={styles.problemNumber}>01</span><h3>Registros dispersos</h3><p>Pesajes, vacunas, lotes, reproducción y movimientos se llevan en archivos y procesos distintos.</p></div>
            <div><span className={styles.problemNumber}>02</span><h3>Visibilidad limitada</h3><p>La información de distintas fincas o unidades productivas puede quedar fragmentada.</p></div>
            <div><span className={styles.problemNumber}>03</span><h3>Trabajo documental</h3><p>Preparar expedientes exige recopilar identidad del productor, animales, origen y destino.</p></div>
          </div>
          <div className={styles.statement}><strong>La oportunidad:</strong> convertir datos de campo en un registro ordenado, con responsabilidad humana y trazabilidad desde su origen.</div>
        </section>}

        {active === 2 && <section className={styles.chapter}>
          <Eyebrow step="03" tag="PRODUCTO ACTUAL · COMPONENTES EN CÓDIGO" />
          <h2>GanadIA ya cuenta con<br /><em>una base tecnológica real.</em></h2>
          <p className={styles.lead}>Estas capacidades aparecen implementadas en el repositorio AgroLink/GanadIA. Su presencia en el código no equivale a una certificación de operación productiva completa.</p>
          <div className={styles.featuresGrid}>
            {available.map(feature => <div className={styles.feature} key={feature.number}>
              <span className={styles.featureTop}><b>{feature.number}</b><small>{feature.status}</small></span>
              <h3>{feature.title}</h3><p>{feature.detail}</p>
            </div>)}
          </div>
          <p className={styles.footnote}>Base revisada: fichas de animales, eventos, jornadas, registros sanitarios, cartografía, potreros y simulaciones. Algunas experiencias permanecen en validación de MVP.</p>
        </section>}

        {active === 3 && <section className={styles.chapter}>
          <Eyebrow step="04" tag="EJEMPLO DE OPERACIÓN · TRAZABILIDAD" />
          <h2>La historia de cada animal,<br /><em>en un solo registro.</em></h2>
          <p className={styles.lead}>Un ejemplo de cómo las funciones ya modeladas se conectan para dar contexto al trabajo diario del productor.</p>
          <div className={styles.timeline}>
            <div><span>01 / IDENTIFICAR</span><h3>Ficha y origen</h3><p>Código interno, finca, sexo, especie, raza e identificación electrónica cuando exista.</p></div>
            <div><span>02 / OBSERVAR</span><h3>Peso y condición</h3><p>Registros fechados de pesaje y evolución del animal, con datos trazables.</p></div>
            <div><span>03 / CUIDAR</span><h3>Sanidad</h3><p>Vacunación, tratamientos, eventos e historial de atención documentada.</p></div>
            <div><span>04 / REPRODUCIR</span><h3>Genealogía</h3><p>Madre, padre y nueva cría vinculados a los eventos de nacimiento registrados.</p></div>
          </div>
          <div className={styles.statement}><strong>Valor para una futura integración:</strong> un expediente de movilización podría reutilizar datos identificados y confirmados, evitando recapturas innecesarias.</div>
        </section>}

        {active === 4 && <section className={styles.chapter}>
          <Eyebrow step="05" tag="OPERACIÓN POR FINCA · GPS Y SIMULACIÓN" />
          <h2>Del animal individual<br /><em>al territorio productivo.</em></h2>
          <div className={styles.territoryLayout}>
            <div className={styles.territoryMap} aria-label="Esquema ilustrativo de una finca con potreros, no cartografía real">
              <span className={styles.mapLabel}>ESQUEMA CONCEPTUAL · NO ES MAPA REAL</span>
              <div className={styles.paddockA}>POTRERO A</div><div className={styles.paddockB}>POTRERO B</div>
              <div className={styles.paddockC}>POTRERO C</div><div className={styles.mapCorral}>CORRAL</div>
              <div className={styles.mapScale}>Límites y divisiones orientativos</div>
            </div>
            <div className={styles.territoryInfo}>
              <div><span>YA EN EL MVP</span><h3>Ubicación y delimitación</h3><p>GPS consentido, geografía de la finca, polígonos y potreros almacenados con validaciones.</p></div>
              <div><span>LABORATORIO INICIAL</span><h3>Simulaciones</h3><p>Evaluación ilustrativa de escenarios de engorde e inversión, sin prometer rentabilidad.</p></div>
              <div><span>EVOLUCIÓN PROPUESTA</span><h3>IA para planificación</h3><p>Distribución de potreros, fundaciones y carga animal, con criterios locales y validación agronómica.</p></div>
            </div>
          </div>
        </section>}

        {active === 5 && <section className={styles.chapter}>
          <Eyebrow step="06" tag="VISIÓN DE PRODUCTO · MÓDULOS FUTUROS" />
          <h2>Una plataforma integral.<br /><em>Una evolución por etapas.</em></h2>
          <p className={styles.lead}>No todas estas funciones están terminadas. Esta es la dirección del producto, sujeta a desarrollo, pruebas y validación con productores venezolanos.</p>
          <div className={styles.roadmapGrid}>
            {roadmap.map(item => <div key={item.stage}><span className={styles.roadmapIndex}>{item.stage}</span><h3>{item.title}</h3><p>{item.note}</p><small>ROADMAP · NO DISPONIBLE COMO SERVICIO FINAL</small></div>)}
          </div>
          <p className={styles.footnote}>También se contempla la evolución del marketplace de fincas. Publicaciones comerciales y registro ganadero privado deben mantenerse separados.</p>
        </section>}

        {active === 6 && <section className={styles.chapter}>
          <Eyebrow step="07" tag="OPORTUNIDAD · INTEROPERABILIDAD INSTITUCIONAL" />
          <h2>La próxima conversación:<br /><em>GanadIA y el INSAI.</em></h2>
          <div className={styles.opportunityLayout}>
            <div className={styles.bigQuote}>
              <p>Queremos explorar una vía autorizada para que el productor pueda preparar y tramitar información de movilización desde GanadIA, y recibir el resultado que emita el organismo competente.</p>
              <span>PROPÓSITO DEL ACERCAMIENTO</span>
            </div>
            <div className={styles.opportunityNotes}>
              <h3>¿Por qué ahora?</h3>
              <p>El registro digital de animales, sanidad y fincas crea una base útil para ordenar información que también resulta relevante en trámites de movilización.</p>
              <p>El sistema SIGESAI dispone de procesos de permisos y verificación documental. El mecanismo para integraciones de terceros, si existe, debe ser confirmado con el INSAI.</p>
              <a href="https://insai.site/" target="_blank" rel="noreferrer">Consultar portal SIGESAI <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <p className={styles.footnote}>No existe, en esta propuesta, convenio, acceso API concedido ni autorización para emitir permisos en nombre del INSAI.</p>
        </section>}

        {active === 7 && <section className={styles.chapter}>
          <Eyebrow step="08" tag="ARQUITECTURA CONCEPTUAL · SUJETA A AUTORIZACIÓN" />
          <h2>El trámite podría integrarse.<br /><em>La autoridad no se delega.</em></h2>
          <p className={styles.lead}>El objetivo no es reemplazar SIGESAI: se propone estudiar un intercambio seguro para solicitudes, consultas de estado y recepción de documentos oficiales, únicamente si el INSAI lo permite.</p>
          <div className={styles.workflow}>
            {workflow.map((item, index) => <div key={item.step} className={styles.workflowItem}>
              <span className={styles.workflowStep}>{item.step}</span>
              <div><small>{item.state}</small><h3>{item.title}</h3><p>{item.note}</p></div>
              {index < workflow.length - 1 && <span className={styles.workflowArrow} aria-hidden="true">→</span>}
            </div>)}
          </div>
          <div className={styles.ruleBar}>Seguridad requerida: autenticación autorizada, datos mínimos necesarios, trazas de auditoría, control de duplicados, documentos verificables y manejo de errores.</div>
        </section>}

        {active === 8 && <section className={styles.chapter}>
          <Eyebrow step="09" tag="SOLICITUD AL INTERLOCUTOR · NO ES UNA CONTRATACIÓN" />
          <h2>No pedimos una aprobación hoy.<br /><em>Solicitamos abrir la puerta.</em></h2>
          <p className={styles.lead}>Buscamos una persona que pueda facilitar el acercamiento institucional apropiado para presentar GanadIA, mostrar su funcionamiento y evaluar un trabajo conjunto.</p>
          <div className={styles.requestGrid}>
            {request.map(item => <div key={item.id}><span>{item.id}</span><h3>{item.title}</h3><p>{item.content}</p></div>)}
          </div>
          <p className={styles.footnote}>Una eventual prueba piloto solo podría iniciarse después de definir responsables, alcance, intercambio permitido, autorizaciones y criterios de aceptación.</p>
        </section>}

        {active === 9 && <section className={styles.chapter}>
          <Eyebrow step="10" tag="TRENDS172TECH · PRÓXIMO PASO" />
          <div className={styles.closingLayout}>
            <div>
              <span className={styles.closingLabel}>UN ACERCAMIENTO CON PROPÓSITO</span>
              <h2>Conozcamos juntos<br /><em>lo que podemos conectar.</em></h2>
              <p className={styles.lead}>Proponemos una reunión para demostrar GanadIA, escuchar las prioridades de quienes gestionan la movilización y determinar si existe una ruta técnica e institucional viable.</p>
              <a className={styles.primaryButton} href="mailto:gunther@trends172tech.com?subject=GanadIA%20-%20Acercamiento%20institucional%20INSAI">Solicitar una reunión <span aria-hidden="true">↗</span></a>
              <div className={styles.contact}>Trends172Tech · Tecnología que impulsa el futuro.<br/>gunther@trends172tech.com</div>
            </div>
            <div className={styles.closingPanel}>
              <img src="/branding/ganadia-lockup.svg" alt="GanadIA — Tu finca, gestión inteligente" />
              <h3>Principios de la propuesta</h3>
              <ul>{constraints.map(item => <li key={item}>{item}</li>)}</ul>
              <small>Venezuela · Octubre 2026 · Presentación exploratoria, no vinculante.</small>
            </div>
          </div>
        </section>}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerName}><span>GANADIA</span> <small>PRODUCTO DE TRENDS172TECH</small></div>
        <div className={styles.progressTrack} aria-label={'Progreso: ' + (active + 1) + ' de ' + chapters.length}><span style={{ width: ((active + 1) / chapters.length * 100) + '%' }} /></div>
        <div className={styles.controls}><span>{String(active + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => navigate(active - 1)} disabled={active === 0} aria-label="Capítulo anterior">←</button>
          <button type="button" onClick={() => navigate(active + 1)} disabled={active === chapters.length - 1} aria-label="Capítulo siguiente">→</button>
        </div>
      </footer>
    </div>
  );
}
