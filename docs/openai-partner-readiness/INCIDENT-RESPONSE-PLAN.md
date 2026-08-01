# Plan de respuesta a incidentes

**Propietario:** Trends172Tech LLC  
**Canal de reporte:** trends172tech@gmail.com  
**Alcance:** Trends172Tech.com, Trends Projects, LUNA, autenticación, integraciones, bases de datos y proveedores relacionados.

## Objetivo

Detectar, contener, investigar y recuperar los servicios ante incidentes de seguridad o privacidad, preservando evidencia y comunicando de forma clara a las personas afectadas.

## Clasificación

| Nivel | Descripción | Ejemplos | Inicio de respuesta |
|---|---|---|---|
| SEV-1 | Impacto crítico confirmado o riesgo inmediato amplio | Acceso no autorizado a producción, extracción de datos, claves comprometidas | Inmediato |
| SEV-2 | Impacto alto y limitado | Cuenta administrativa comprometida, abuso sostenido de API | Menos de 2 horas |
| SEV-3 | Impacto moderado sin evidencia de acceso sensible | Vulnerabilidad explotable contenida, degradación por abuso | Mismo día |
| SEV-4 | Evento menor o preventivo | Alerta no confirmada, intento bloqueado | Próximo día hábil |

## Responsabilidades

- **Responsable del incidente:** coordina decisiones, tiempos y registro.
- **Responsable técnico:** contiene, preserva registros, corrige y valida la recuperación.
- **Responsable de comunicación:** prepara avisos a clientes, proveedores y autoridades cuando corresponda.
- **Asesor legal o de privacidad:** determina obligaciones aplicables y plazos de notificación.

Una misma persona puede cubrir varias funciones durante la etapa inicial, pero cada decisión debe quedar registrada.

## Procedimiento

1. **Registrar:** fecha, fuente, sistemas, cuentas, datos posiblemente afectados y evidencia inicial.
2. **Clasificar:** asignar severidad y nombrar al responsable del incidente.
3. **Contener:** revocar sesiones y tokens, rotar secretos, bloquear rutas o clientes y aislar componentes afectados.
4. **Preservar evidencia:** guardar registros relevantes con acceso restringido; no publicar tokens, contraseñas ni datos personales.
5. **Investigar:** establecer causa, alcance, periodo afectado y acciones realizadas por el atacante o error operativo.
6. **Erradicar:** corregir la causa, actualizar dependencias o configuración y eliminar persistencia no autorizada.
7. **Recuperar:** restaurar gradualmente, ejecutar pruebas de autenticación, permisos y aislamiento multiempresa, y vigilar reincidencias.
8. **Comunicar:** notificar conforme a contratos y requisitos legales aplicables, usando hechos confirmados y sin especulación.
9. **Cerrar:** documentar cronología, impacto, decisiones, evidencias y tareas pendientes.
10. **Aprender:** realizar una revisión posterior y asignar responsables y fechas a cada mejora.

## Contención específica para LUNA y MCP

- Desactivar el cliente OAuth afectado o revocar su consentimiento y tokens.
- Rotar `BETTER_AUTH_SECRET`, claves de OpenAI o secretos MCP solo cuando su exposición sea posible o confirmada.
- Suspender temporalmente herramientas de escritura antes que detener las consultas seguras, si el alcance lo permite.
- Confirmar que los tokens conservan audiencia, alcance, usuario y empresa correctos.
- Revisar auditoría de herramientas ejecutadas y acciones administrativas.

## Comunicación mínima

Toda notificación debe indicar: qué ocurrió, cuándo ocurrió, qué información o servicio se afectó, qué hizo Trends172Tech LLC, qué debe hacer el destinatario y cómo contactar a la empresa. Los plazos se definirán según la jurisdicción y obligación aplicable.

## Preparación continua

- Revisar contactos y accesos trimestralmente.
- Ejecutar un ejercicio de mesa al menos una vez al año.
- Probar restauración y revocación de credenciales.
- Incorporar aprendizajes de incidentes y simulacros a pruebas automatizadas.

