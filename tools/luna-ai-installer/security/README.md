# LUNA AI Security Gateway — piloto Club Español E.F.

Estado: diseño y motor de decisión aislado; NO está conectado a producción.

## Capas de protección
1. Autenticación y autorización del usuario/agente antes de llamar al proveedor.
2. Límites separados por tenant, usuario, agente y clave de servicio, con contador atómico compartido (Redis o equivalente); nunca confiar en memoria del proceso.
3. Cuotas de concurrencia y límites por minuto con respuesta 429 + Retry-After, sin bloquear a otros usuarios.
4. Reserva de presupuesto estimado antes de cada llamada y conciliación del costo real después; topes diarios y mensuales.
5. Circuit breaker por agente y proveedor, con apagado manual ROOT y restauración auditada.
6. Alertas por picos de tráfico, costo y errores; escalamiento progresivo (observación -> reducción -> bloqueo temporal).
7. Telemetría mínima sin prompts, tokens de acceso, datos personales ni respuestas del modelo.
8. Protección de prompt injection: permisos de herramientas en servidor, validación de parámetros, aprobaciones para acciones de escritura y filtrado de salidas.

## Piloto
Agentes existentes: luna, news, training. Ya existe logAiUsage() en ClubEspa-nolE.F; reutilizarlo como fuente local, sin duplicar registros.
Comenzar en modo observación, medir tráfico real, establecer umbrales por agente, habilitar primero límites por usuario y concurrencia, y luego topes de costo.
Los usuarios normales no deben verse afectados por el exceso de consumo de otro usuario.

## Antes de activar
- Implementar contador distribuido y reservas atómicas.
- Conectar el middleware en cada invocación real, no solo en la interfaz.
- Pruebas de concurrencia, abuso, recuperación y falsos positivos.
- Aprobar umbrales por tenant/agente y definir procedimientos de emergencia.
- Validar CI, despliegue de preview y rollback.
