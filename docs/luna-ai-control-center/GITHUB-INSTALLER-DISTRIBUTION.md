# LUNA AI Auto Installer — distribución desde GitHub

El instalador se distribuirá desde el repositorio oficial de Trends172Tech mediante una versión etiquetada (GitHub Releases), no mediante scripts ejecutados directamente desde una URL sin verificar.

## Instalación para clientes

**Opción A — GitHub App (recomendada).** Desde el panel de Trends172Tech, el usuario autoriza la GitHub App únicamente para los repositorios que elija. El agente lee el código, presenta hallazgos y crea un pull request después de una confirmación explícita.

**Opción B — CLI descargable.** El cliente descarga desde GitHub Releases un paquete versionado con suma SHA-256 y verifica su integridad. La CLI escanea localmente el proyecto y genera un informe. Solo con autorización explícita crea los cambios. Nunca requiere subir el código completo al servicio.

## Flujo CLI previsto
```bash
luna-ai-installer scan --project .
luna-ai-installer plan --project .
luna-ai-installer apply --project . --confirm
luna-ai-installer verify --project .
```
Estos comandos describen la interfaz prevista; **no existe todavía un binario publicado ni deben mostrarse como comandos listos para instalar**.

## Página de descarga
- Enlace a la página oficial de GitHub Releases una vez exista una primera versión firmada o con checksums publicados.
- Enlace a documentación, requisitos, compatibilidad, permisos y changelog.
- Estado de disponibilidad: "Próximamente" hasta publicar el release real.
- Enlaces a las fuentes de código para auditoría.
- Advertencia de no compartir tokens, claves de proveedor, secretos ni variables de entorno.

## Seguridad y soporte
- Instalación con permisos mínimos, sin acceso a producción por defecto.
- Sin ejecución de `curl | bash` ni comandos remotos opacos.
- No se publican credenciales en logs, diffs o artefactos.
- Cada release se somete a CI, pruebas de compatibilidad y verificación de integridad.
- Telemetría desactivada por defecto hasta consentimiento y configuración de instalación.
- Reinstalación idempotente y rollback documentado.

## Entregables antes del primer release
1. Implementación de la CLI ejecutable con escáner estático.
2. Pruebas automáticas con repositorios de ejemplo.
3. Pipeline de empaquetado y checksums.
4. GitHub Release y enlace de descarga estable.
5. Integración con la pantalla LUNA AI Control Center y el flujo de aprobación ROOT.
