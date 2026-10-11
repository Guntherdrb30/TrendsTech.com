# LUNA AI Auto Installer — CLI experimental v0.1

**Estado:** prototipo en rama de desarrollo; no existe todavía un release descargable ni un botón de instalación activo.

Requiere Node.js 20 o superior. Ejecutar desde una copia local del repositorio de Trends172Tech:

```bash
node tools/luna-ai-installer/bin/luna-ai-installer.mjs scan --project /ruta/a/mi-aplicacion --output /ruta/segura/reporte.json
```

El comando inspecciona archivos JS/TS/Python de forma local, sin red, sin cambiar el proyecto ni publicar secretos. El reporte incluye ruta, línea y proveedor detectado, pero no copia líneas de código. La salida JSON es un inventario preliminar, no confirma que una llamada se ejecute realmente.

**Limitaciones:** no detecta llamadas dinámicas, llamadas externas ni todas las APIs; puede producir falsos positivos. No implementa aún `plan`, `apply`, `verify`, conexión OAuth, publicación GitHub Releases ni instrumentación automática. Los resultados requieren revisión humana.

Pruebas: `node --test tools/luna-ai-installer/tests/*.test.mjs`.
