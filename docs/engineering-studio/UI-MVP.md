# Trends Engineering Studio — Diseño funcional de interfaz MVP

## 1. Navegación Admin

Nueva entrada: **Engineering Studio** / **Programación IA**.

Navegación interna:
- Overview
- Proyectos
- Agentes
- Costos
- Hardware IA
- Runs
- Integraciones
- Configuración

## 2. Overview

Objetivo: estado ejecutivo en menos de 30 segundos.

Widgets:
- proyectos activos;
- proyectos bloqueados;
- agentes ejecutándose;
- costo IA del mes;
- costo total del mes;
- forecast de proyectos activos;
- margen previsto;
- approvals pendientes;
- runs fallidos;
- previews pendientes de revisión.

Panel "Atención requerida": presupuesto, seguridad, errores, cambios de alcance y aprobaciones.

## 3. Proyectos

Tabla/tarjetas con:
- proyecto;
- empresa/cliente;
- modo: Crear / Continuar / Recuperar;
- etapa;
- progreso;
- baseline;
- forecast;
- costo real;
- margen previsto;
- estado técnico;
- siguiente gate.

CTA: **Nuevo proyecto**.

## 4. Nuevo proyecto

Paso 1 — Origen
- Idea
- PRD
- Conversación/resumen
- Repositorio existente
- Recuperar proyecto

Paso 2 — Identidad
- nombre;
- cliente/empresa;
- descripción;
- confidencialidad;
- prioridad.

Paso 3 — Contexto
- texto;
- documentos;
- enlaces/repositorio;
- restricciones;
- objetivo MVP.

Paso 4 — Economía
- perfil financiero;
- margen objetivo;
- presupuesto máximo;
- moneda;
- hardware/local AI si aplica.

Paso 5 — Generar Blueprint
No inicia programación.

## 5. Project Workspace

Header persistente:
- nombre;
- etapa;
- health;
- costo real / forecast;
- margen;
- branch;
- preview;
- approvals.

Tabs:
1. Resumen
2. Blueprint
3. Diseño
4. Backlog
5. Agentes
6. Código
7. Tests
8. Seguridad
9. Costos
10. Cambios
11. Deployments
12. Decisiones
13. Archivos
14. Actividad

## 6. Blueprint

Secciones:
- entendimiento;
- alcance MVP;
- fuera de alcance;
- supuestos;
- riesgos;
- arquitectura;
- modelo de datos;
- integraciones;
- pantallas;
- agentes/modelos;
- estimación;
- cronograma orientativo;
- criterios de aceptación.

Footer fijo:
- Aprobar Blueprint
- Solicitar cambios
- Guardar como borrador

## 7. Diseño

Vista de mapa de pantallas y previews/wireframes.

Acciones:
- aprobar diseño;
- solicitar ajuste;
- comparar versiones.

## 8. Backlog

Kanban:
- Ideas
- Por analizar
- Ready
- In Progress
- Review
- Blocked
- Done

Cada tarea muestra agente, modelo, costo estimado/real, rama, tests y dependencias.

## 9. Agentes

Vista de organigrama:
- Astra / Director;
- especialistas disponibles;
- estado;
- modelo actual;
- tareas;
- costo acumulado;
- tasa de éxito.

Permite activar/desactivar roles por proyecto.

## 10. Costos

Bloques:
- Baseline original;
- Forecast actual;
- Costo real;
- Costo pendiente;
- valor contratado;
- margen previsto;
- margen mínimo;
- variación.

Desglose:
- IA;
- cloud;
- APIs;
- electricidad;
- hardware/amortización;
- tiempo humano;
- servicios;
- overhead;
- contingencia.

Gráfica temporal estimado vs real.

## 11. Hardware IA

Tabs:
- Equipos propios
- Equipos de referencia
- Componentes
- Benchmarks
- Comparador Local/API/Híbrido

Ficha de equipo con compra, operación, energía, amortización y rendimiento.

## 12. Change Requests

Cada CR muestra:
- cambio;
- motivo;
- impacto;
- costo adicional;
- precio recomendado;
- OPEX;
- margen después del cambio;
- calendario;
- riesgo.

Acciones:
- Aprobar
- Modificar
- Posponer
- Rechazar

## 13. Runs

Timeline/tabla:
- run;
- proyecto;
- tarea;
- agente;
- modelo;
- estado;
- duración;
- costo;
- commit;
- tests;
- errores.

Detalle con eventos y herramientas utilizadas.

## 14. Integraciones

Cards:
- GitHub
- Vercel
- OpenAI API
- ChatGPT / Trends MCP
- Codex
- NVIDIA Local AI
- Neon / DB

Cada integración muestra estado, alcance y último uso. Nunca mostrar secretos completos.

## 15. Configuración

### Finanzas
- margen objetivo/mínimo;
- contingencia;
- overhead;
- horas humanas;
- electricidad;
- amortización;
- moneda.

### Modelos
- proveedores;
- modelos;
- precios;
- límites;
- routing.

### Seguridad
- approval policies;
- budgets;
- roles;
- scopes.

### Hardware
- defaults de energía y amortización.

## 16. ChatGPT Collaboration

Dentro de cada proyecto habrá una sección **ChatGPT / Work** con:
- estado de conexión MCP;
- última sincronización;
- resúmenes recibidos;
- decisiones importadas;
- artefactos enlazados;
- tareas enviadas/preparadas para Codex.

CTA principales:
- Generar contexto para ChatGPT
- Registrar resumen de sesión
- Importar decisión
- Crear Change Request desde conversación
- Preparar tarea Codex

La plataforma debe dejar claro qué información fue sincronizada y qué información permanece únicamente en ChatGPT.

## 17. Estilo visual

- identidad Trends172Tech;
- fondo claro/blanco;
- premium y técnico;
- densidad de información controlada;
- indicadores financieros y de riesgo muy visibles;
- responsive, priorizando escritorio para programación pero utilizable en móvil para aprobaciones y seguimiento.
