(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const stage = document.getElementById('stage');
  let current = 0;
  function show(index, focus = false) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    links.forEach((link, i) => i === current ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.getElementById('counter').textContent = `${current + 1} / ${slides.length}`;
    document.getElementById('current-name').textContent = links[current].textContent.trim().replace(/\s+/, ' — ');
    document.getElementById('progress').style.width = `${(current + 1) / slides.length * 100}%`;
    document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', String(current + 1));
    document.title = `${links[current].textContent.trim().replace(/^\d+\s*/, '')} · FDE · Trends172Tech`;
    const nav = document.querySelector('.chapter-nav');
    if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = links[current].offsetLeft - nav.offsetLeft - 16;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (focus) stage.focus({ preventScroll: true });
  }
  function navigate(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    if (target === current) return;
    history.pushState(null, '', `#${slides[target].id}`);
    show(target, true);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', event => {
    const index = slides.findIndex(s => `#${s.id}` === a.getAttribute('href'));
    if (index >= 0) { event.preventDefault(); navigate(index); }
  }));
  prev.addEventListener('click', () => navigate(current - 1));
  next.addEventListener('click', () => navigate(current + 1));
  function restore() { const index = slides.findIndex(s => `#${s.id}` === location.hash); show(index < 0 ? 0 : index); }
  window.addEventListener('popstate', restore);
  window.addEventListener('hashchange', restore);
  document.addEventListener('keydown', event => {
    if (document.getElementById('sources').open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,select,textarea,[contenteditable=true],[role=tablist],summary')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(current - 1); }
  });
  const modules = {
    operacion: ['CONTROL DEL NEGOCIO','Inventario, compras y despacho conectados.','Movimientos, proveedores y responsables dentro de un mismo flujo operativo.',['Compra','Recepción','Inventario','Despacho'],'Objetivo: trazabilidad de cada movimiento.'],
    comercio: ['CANALES CONECTADOS','El catálogo y la venta comparten información.','Productos, cotizaciones y pedidos vinculados con la operación comercial de la empresa.',['Catálogo','Cotización','Pedido','Seguimiento'],'Objetivo: continuidad entre la consulta y la venta.'],
    clientes: ['ATENCIÓN CON CONTEXTO','Cada conversación forma parte de la relación.','Mensajería e historial comercial para acompañar las solicitudes y asignar su seguimiento.',['Consulta','Contexto','Atención','Seguimiento'],'Objetivo: atención con responsables y registro.'],
    inteligencia: ['IA APLICADA','Asistencia dentro del proceso de negocio.','Asistentes, reportes y contenido de marketing con información autorizada y límites de acción.',['Datos','Consulta','Evaluación','Acción autorizada'],'Objetivo: respuestas útiles con supervisión y control.']
  };
  const tabs = [...document.querySelectorAll('[data-module]')];
  function selectModule(tab) {
    tabs.forEach(t => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    const [tag,title,description,flow,result] = modules[tab.dataset.module];
    document.getElementById('module-panel').setAttribute('aria-labelledby', tab.id);
    document.getElementById('module-tag').textContent = tag;
    document.getElementById('module-title').textContent = title;
    document.getElementById('module-description').textContent = description;
    document.getElementById('module-result').textContent = result;
    const target = document.getElementById('module-flow'); target.replaceChildren();
    flow.forEach((label,i) => { if (i) { const arrow = document.createElement('b'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden','true'); target.append(arrow); } const item = document.createElement('span'); item.textContent = label; target.append(item); });
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectModule(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); event.stopPropagation(); selectModule(tabs[target]); tabs[target].focus(); }
    });
  });
  const cases = {
    comercio: ['Cotizaciones conectadas con la disponibilidad real.','Un vendedor prepara la cotización con los productos y reglas comerciales de la empresa. El equipo continúa el seguimiento hasta el pedido.','Productos, precios, permisos y aprobación comercial.','Tiempo por cotización y solicitudes que llegan a pedido.'],
    servicios: ['Solicitudes con responsables y seguimiento.','Cada solicitud reúne su documentación, tareas y estado. El equipo conoce el siguiente paso y la dirección puede revisar el avance.','Tipos de solicitud, expedientes, estados y responsables.','Tiempo de resolución y solicitudes pendientes.'],
    sedes: ['Inventario visible entre sedes.','El equipo consulta existencias y coordina movimientos con permisos y responsables por sede. El flujo se valida antes de ampliar la operación.','Sedes, almacenes, permisos y reglas de movimiento.','Diferencias de inventario y tiempo de transferencia.']
  };
  document.getElementById('sector').addEventListener('change', event => {
    const fields = ['sector-title','sector-description','sector-scope','sector-metric'];
    fields.forEach((id,i) => { document.getElementById(id).textContent = cases[event.target.value][i]; });
  });
  const phases = [...document.querySelectorAll('.phases details')];
  phases.forEach(detail => detail.addEventListener('toggle', () => { if (detail.open) phases.forEach(other => { if (other !== detail) other.open = false; }); }));
  const fsButton = document.getElementById('fullscreen');
  if (!document.documentElement.requestFullscreen) fsButton.hidden = true;
  fsButton.addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { document.getElementById('status').textContent = 'La pantalla completa no está disponible en este navegador.'; }
  });
  document.addEventListener('fullscreenchange', () => { const label = document.fullscreenElement ? 'Salir de pantalla completa' : 'Abrir en pantalla completa'; fsButton.setAttribute('aria-label',label); fsButton.title = label; });
  const dialog = document.getElementById('sources');
  document.getElementById('open-sources').addEventListener('click', () => dialog.showModal());
  document.getElementById('close-sources').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  restore();
})();
