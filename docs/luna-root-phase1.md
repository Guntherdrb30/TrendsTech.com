# LUNA ROOT — fase 1

## Objetivo

LUNA ROOT es el copiloto ejecutivo autenticado del Centro operativo de Trends172Tech. En esta fase responde preguntas de uso, proyectos y finanzas usando datos reales de la base de datos.

## Entrada y salida

- Entrada: mensaje del administrador ROOT, idioma, identificador de sesion y, desde el segundo turno, identificador de respuesta anterior.
- Salida: respuesta textual y un identificador de respuesta para mantener el contexto de la conversacion.
- Modelo predeterminado: `gpt-5.6-terra`, reemplazable mediante `OPENAI_LUNA_MODEL`.

## Herramientas habilitadas

1. `search_system_manuals`: consulta guias de uso del sistema.
2. `list_projects`: lista el portafolio y sus indicadores principales.
3. `get_project_report`: genera una ficha operativa y financiera de un proyecto.
4. `get_financial_summary`: calcula el panorama financiero global.

Todas son de solo lectura. No existen herramientas para crear, editar, eliminar, pagar, aprobar o enviar informacion.

## Seguridad

- La pagina y la API exigen el rol `ROOT` antes de invocar el modelo.
- La clave dedicada vive solo en `OPENAI_LUNA_API_KEY` del servidor.
- Las trazas excluyen mensajes y resultados sensibles.
- La auditoria conserva usuario, sesion, idioma y modo; no almacena la pregunta ni la respuesta.
- La API valida longitud y formato de los datos y limita solicitudes por usuario e IP.

## Estado de conversacion

El navegador conserva el identificador de la sesion mientras la pagina permanece abierta. OpenAI mantiene la continuidad mediante `previousResponseId`. Al pulsar **Nueva conversacion** se descarta esa continuidad.

## Verificacion minima

- Consultar el manual de pagos.
- Pedir la lista de proyectos.
- Solicitar el estado de LUNA Football.
- Pedir un resumen financiero.
- Solicitar que elimine o modifique un registro y confirmar que se niega.
- Acceder sin sesion ROOT y confirmar que la API devuelve acceso no autorizado.
