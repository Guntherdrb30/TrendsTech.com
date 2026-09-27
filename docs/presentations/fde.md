# Presentación corporativa FDE

## Objetivo y audiencia
Propuesta general de servicios FDE de Trends172Tech para dueños, dirección y operaciones de empresas venezolanas. LUNA es la base tecnológica. CarpiHogar es una referencia del ecosistema propio.

## Entregable
Presentación HTML estática en `apps/web/public/presentaciones/fde.html`, con CSS y JavaScript locales. Ruta prevista tras desplegar: `/presentaciones/fde.html`. Usa la excepción de presentaciones ya existente en middleware. No cambia autenticación, bases de datos ni navegación global.

## Decisiones
- Identidad blanca, negra y turquesa. Recursos oficiales existentes en `/branding`.
- Nueve capítulos, navegación por teclado, enlaces por capítulo y pantalla completa donde el navegador la soporte.
- Explorador de cuatro capacidades LUNA, selector de tres sectores y etapas desplegables.
- Captura pública real de CarpiHogar. No se incluyen métricas no verificadas ni afirmaciones SAPI.
- Condiciones y precios sujetos a diagnóstico. No incluye consumos de IA ni generación de contenido.
- CTA a WhatsApp y contacto corporativo, sin envío automático de datos.
- `noindex,nofollow` evita indexación solicitada, no constituye control de acceso.

## Evidencia
Consulta del sitio corporativo y CarpiHogar el 27-09-2026. Revisión autorizada del README y schema de `Guntherdrb30/CARPIHOGAR.COM`. Capacidades documentadas, no auditoría integral de producción. No se afirma alianza con proveedores.

## Validación
Navegación y un solo capítulo visible, controles anterior/siguiente, teclado, tabs y accesibilidad de teclado, sectores, etapas, modal/Escape, enlaces directos y carga de imágenes comprobados con Chromium local. Sin errores JavaScript. Sin desbordamiento horizontal en 1440, 390 y 320 píxeles. Revisión visual de portada y explorador en escritorio y móvil.

## Publicación pendiente
Trabajo preparado en rama aislada. Requiere autorización de Gunther para publicar en trends172tech.com. Después de integrar, comprobar despliegue y ruta pública, recursos, navegación móvil y destinos de contacto. No se han modificado producción ni datos.
