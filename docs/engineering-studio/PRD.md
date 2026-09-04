# Trends Engineering Studio — PRD Maestro

## 1. Resumen

Trends Engineering Studio es un módulo interno y privado de Trends172Tech para diseñar, construir, continuar, recuperar y mantener proyectos de software mediante un equipo multiagente supervisado.

El sistema recibe una idea, conversación, PRD, archivos o repositorio existente; genera un Project Blueprint; estima costos técnicos y comerciales; propone arquitectura y maqueta; y, tras aprobación, coordina agentes especializados para producir demo, MVP, QA, revisión de seguridad y despliegues controlados.

## 2. Objetivo estratégico

Convertir Trends172Tech en su propia fábrica de software asistida por IA, reduciendo trabajo manual repetitivo y permitiendo mantener en paralelo, con aislamiento, productos como Trends172Tech, LUNA, CarpiHogar, LUNA Football, Luna Médical y nuevos desarrollos.

## 3. Usuario y acceso

- Usuario inicial: Admin de Trends172Tech.
- Ruta objetivo inicial: `/admin/programming`.
- No habrá acceso público en el MVP.
- Los costos internos, márgenes, configuraciones financieras, secretos, agentes, logs y decisiones técnicas serán privados.

## 4. Principios operativos

1. Autonomía supervisada.
2. Aislamiento estricto entre proyectos.
3. Ningún cambio directo a producción sin Approval Gate.
4. Ningún merge a `main`, migración de datos reales, eliminación, publicación, consumo extraordinario de servicios pagados ni modificación de secretos sin autorización correspondiente.
5. Todo trabajo debe ser trazable a proyecto, tarea, agente, modelo, costo, commit, prueba y aprobación.
6. No confundir compilación exitosa con producto terminado.
7. Desarrollo incremental: idea → blueprint → maqueta → demo → MVP → iteraciones → producción.
8. Las correcciones de defectos incluidos en alcance no deben clasificarse automáticamente como ampliaciones facturables.

## 5. Modos de entrada

### 5.1 Crear proyecto
Desde una idea, brief, conversación, PRD, archivos o requisitos.

### 5.2 Continuar proyecto
Desde un repositorio existente y documentación previa.

### 5.3 Recuperar proyecto
Auditar un software antiguo, incompleto o abandonado y proponer el camino mínimo a demo/MVP/producción.

## 6. Flujo principal

1. Ingreso de idea/PRD/contexto.
2. Análisis funcional y técnico.
3. Detección de supuestos, dependencias, riesgos y restricciones.
4. Project Blueprint.
5. Arquitectura propuesta.
6. Modelo de datos preliminar.
7. Mapa de pantallas y wireframes/maqueta.
8. Equipo de agentes y modelos propuestos.
9. Estimación integral de costos.
10. Presupuesto comercial recomendado.
11. Approval Gate de Blueprint.
12. Desarrollo de demo.
13. QA y revisión de seguridad.
14. Preview verificable.
15. Approval Gate de MVP.
16. Desarrollo de MVP.
17. Iteraciones y Change Requests.
18. Approval Gate de producción.
19. Despliegue y verificación.

## 7. Orquestación multiagente

### Director / Orquestador
- Astra: Director de Ingeniería / coordinador principal.

### Agentes especialistas
- Product Analyst
- Software Architect
- UX/UI Designer
- Frontend Engineer
- Backend Engineer
- Database Engineer
- AI / Agents Engineer
- Integrations Engineer
- DevOps / Vercel Engineer
- QA Engineer
- Cybersecurity Engineer
- Code Reviewer / Integration Engineer
- NVIDIA Local AI Architect

Los agentes se activan bajo demanda. El orquestador selecciona modelo según complejidad, riesgo, costo y contexto disponible.

## 8. NVIDIA Local AI Architect

Responsable de diseño, dimensionamiento, benchmarking, optimización y análisis económico de infraestructura IA local y empresarial.

Debe poder evaluar, entre otras tecnologías:
- NVIDIA NeMo Agent Toolkit
- NVIDIA Dynamo
- TensorRT-LLM
- vLLM
- SGLang
- NIM
- Nemotron
- NemoClaw / OpenShell cuando aplique
- CUDA y herramientas de profiling

Debe comparar alternativas NVIDIA y no NVIDIA cuando sea técnicamente conveniente.

Entregables mínimos:
- modelo/modelos recomendados;
- precisión/cuantiación;
- motor de inferencia;
- VRAM y RAM necesarias;
- concurrencia y tokens/s objetivo;
- latencia esperada;
- consumo eléctrico;
- CAPEX y OPEX;
- configuración recomendada;
- comparación Local vs API vs Híbrida.

## 9. Workspaces y aislamiento

Cada proyecto tendrá:
- ID único;
- nombre y empresa/cliente;
- Project Constitution;
- PRD versionado;
- decisiones;
- requisitos;
- arquitectura;
- backlog;
- agentes habilitados;
- presupuesto;
- repositorio y ramas;
- referencias a credenciales;
- pruebas;
- logs;
- previews;
- despliegues;
- Change Requests;
- costos;
- historial de aprobaciones.

No se reutilizarán datos, secretos, imágenes, métricas ni código de otro proyecto salvo autorización explícita o componente compartido formalmente registrado.

## 10. Project Constitution

Cada proyecto debe generar una constitución inmutable/versionada con reglas como:
- repositorio autorizado;
- stack;
- entornos;
- restricciones regulatorias;
- reglas de datos;
- política de ramas;
- operaciones prohibidas;
- Approval Gates;
- presupuesto máximo;
- criterios de aceptación;
- requisitos mínimos de pruebas y rollback.

## 11. Git y ejecución segura

- Nunca desarrollar directamente sobre `main`.
- Usar rama de proyecto y ramas/worktrees de agentes cuando corresponda.
- Integración mediante Code Reviewer / Integration Engineer.
- Build, typecheck, lint, tests y security checks antes de preview.
- Pull Request antes de merge.
- Despliegues de preview antes de producción.

## 12. Motor de costos integral

El sistema debe calcular costo interno estimado, costo real acumulado y costo pendiente previsto.

Categorías mínimas:
- tokens y ejecuciones IA;
- proveedores/modelos;
- reintentos y regeneraciones;
- infraestructura cloud;
- APIs;
- almacenamiento;
- bases de datos;
- CI/CD;
- dominios/licencias;
- hardware local;
- electricidad;
- amortización de hardware;
- mantenimiento;
- backups/observabilidad;
- servicios externos;
- horas humanas configurables;
- overhead empresarial;
- contingencia.

## 13. Presupuesto vivo

Cada proyecto conserva simultáneamente:
- Baseline inicial aprobado;
- Forecast actual;
- Costo real acumulado;
- Costo pendiente estimado;
- Valor comercial contratado;
- Cambios aprobados;
- Ideas no aprobadas;
- Forecast potencial si se aprueban cambios pendientes.

El baseline no se sobrescribe.

## 14. Change Requests

Toda ampliación de alcance debe poder registrarse como Change Request con:
- descripción;
- motivo;
- impacto funcional;
- impacto técnico;
- agentes involucrados;
- costo interno adicional;
- precio comercial adicional;
- OPEX adicional;
- impacto de calendario;
- riesgo;
- decisión: aprobar, modificar, posponer o rechazar.

Una idea puede permanecer en backlog sin cambiar el alcance autorizado.

## 15. Rentabilidad y pricing

Configuración global editable:
- margen objetivo;
- margen mínimo;
- markup opcional;
- contingencia;
- overhead;
- costo/hora por rol;
- electricidad ($/kWh);
- amortización;
- soporte;
- moneda base.

Cada proyecto puede sobrescribir estos defaults según empresa, cliente, riesgo, mercado y contexto.

El sistema debe diferenciar correctamente margen de markup.

Debe emitir alertas cuando el forecast de rentabilidad caiga por debajo del objetivo o mínimo configurado.

## 16. Catálogo de infraestructura IA local

### Equipos de referencia
Permite mantener configuraciones de mercado.

### Equipos propios
Permite registrar costo real de adquisición, importación, instalación y operación de activos de Trends172Tech.

Ficha mínima:
- GPU;
- CPU;
- RAM;
- almacenamiento;
- PSU;
- refrigeración;
- UPS;
- red;
- precio compra;
- transporte/importación;
- instalación;
- consumo idle/medio/máximo;
- tarifa eléctrica;
- horas de uso;
- vida útil;
- amortización;
- mantenimiento;
- VRAM;
- modelos recomendados;
- benchmarks;
- concurrencia;
- tokens/s;
- TTFT/latencia;
- fecha y fuente del precio.

Las actualizaciones de precio no modifican presupuestos históricos aprobados.

## 17. Comparador Local / API / Híbrido

Por proyecto debe poder calcular:
- CAPEX local;
- OPEX local;
- costo API mensual/por carga;
- costo híbrido;
- punto de equilibrio;
- requisitos de privacidad;
- disponibilidad offline;
- rendimiento esperado;
- recomendación técnica y económica.

## 18. Observabilidad y auditoría

Todo run debe registrar:
- agente;
- modelo;
- herramienta;
- tarea;
- timestamps;
- tokens/costo;
- archivos modificados;
- commit;
- resultado de tests;
- errores/reintentos;
- aprobación asociada.

Debe existir replay/auditoría del razonamiento operativo visible en forma de decisiones y eventos, sin depender de logs opacos del proveedor.

## 19. Gestión de secretos

Los agentes nunca reciben secretos indiscriminadamente.

Se implementará un Secrets Broker con:
- referencias por proyecto;
- mínimo privilegio;
- scopes;
- expiración cuando aplique;
- auditoría de uso;
- separación entre preview y producción.

## 20. Registro de modelos y proveedores

Engineering Studio debe mantener un catálogo configurable de:
- proveedor;
- modelo;
- capacidades;
- costo input/output;
- context window;
- herramientas soportadas;
- región/privacidad;
- latencia histórica;
- calidad/evaluaciones;
- estado activo/inactivo.

El routing no debe quedar hardcodeado a un único proveedor.

## 21. Evaluaciones y calidad

Antes de confiar tareas críticas a un agente/modelo se deben registrar evaluaciones repetibles.

Métricas sugeridas:
- success rate;
- tests aprobados;
- defectos introducidos;
- costo por tarea exitosa;
- tiempo de ejecución;
- reintentos;
- regresiones;
- seguridad.

El orquestador debe aprender de resultados históricos para recomendar el modelo más eficiente por tipo de tarea.

## 22. MVP — Alcance inicial

El MVP debe demostrar una cadena completa con un proyecto de prueba no crítico:

PRD → Blueprint → arquitectura → backlog → costo → aprobación → agentes → código en rama → tests → revisión de seguridad → preview → aprobación.

Incluye inicialmente:
- acceso Admin;
- creación de proyecto;
- importación de PRD/contexto;
- Project Blueprint;
- backlog;
- registro de agentes/modelos;
- cálculo de costos IA e infraestructura básica;
- baseline/forecast/costo real;
- Change Requests;
- GitHub branch/commits/PR;
- pruebas automáticas;
- preview Vercel controlado;
- Approval Gates;
- auditoría de runs.

No incluye inicialmente:
- despliegue autónomo a producción;
- cambios autónomos de secretos;
- migraciones destructivas;
- ejecución sobre proyectos críticos sin fase piloto;
- compra automática de hardware o servicios.

## 23. Fases posteriores

### Fase 2
- recuperación de proyectos existentes;
- catálogo de hardware completo;
- benchmarks reales RTX/DGX;
- comparador Local/API/Híbrido;
- motor financiero avanzado;
- plantillas comerciales.

### Fase 3
- ejecución multi-worktree;
- sandbox avanzado;
- auto-routing por evaluaciones;
- mayor integración NVIDIA;
- gestión paralela de múltiples proyectos.

### Fase 4
- mantenimiento autónomo supervisado de productos existentes;
- observación continua de CI, dependencias y seguridad;
- optimización automática de costos y capacidad.

## 24. Criterios de éxito del MVP

El MVP se considera exitoso si:
1. un Admin crea un proyecto desde un PRD;
2. obtiene Blueprint, arquitectura, backlog y presupuesto;
3. aprueba el alcance;
4. el sistema crea/usa una rama aislada;
5. agentes implementan una tarea real;
6. se ejecutan tests y revisión de seguridad;
7. se genera preview verificable;
8. el costo real queda contabilizado;
9. los cambios posteriores generan Change Requests;
10. ninguna acción sensible evade los Approval Gates.

## 25. Estado

- Prioridad del portafolio: #1.
- Estado actual: descubrimiento / diseño.
- Rama de implementación inicial: `feature/trends-engineering-studio-mvp`.
- Siguiente entregable: arquitectura técnica del MVP y diseño de pantallas antes de escribir lógica operativa crítica.
