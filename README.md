# ![icon of an drone](mozilla-firefox/icons/icon-48.png) ENAIRE Drones Extension

## Descripcion
Esta extension para tu navegador pretende ayudar a la lectura de algunas de las informaciones presentadas en la web ENAIRE Drones ya que pueden resultar confusas para usuarios no acostumbrados a la nomenclatura aeronáutica.

Por ahora:
- convierte fechas de inicio y fin a zona española (Europe/Madrid)
- convierte limites de altura a texto legible y alturas en metros
- extrae de la descripción los datos de coordinación si existen
- extrae de la descripción la informacion de si el espacio está segregado/restringido y lo muestra de una manera más clara
- oculta la descripción por defecto

## Instalación
### Firefox
Accede a la [web de la extensión en Mozilla](https://addons.mozilla.org/en-US/firefox/addon/enaire-drones-extension/) e instalala desde ahí.

### Chrome
Version en desarrollo. Pendiente de publicar.

## Instalación manual
No es recomendado instalar la extension de esta manera puesto que no hay actualizaciones automáticas, pero si quieres hacer pruebas con ella, puedes hacer lo siguiente:

### Firefox
- Descarga el repositorio y descomprimelo
- Abre en tu navegador la dirección `about:debugging`
- Haz click en `This Firefox` en el menú lateral
- Haz click en `Load Temporary Add-On...`
- Navega hasta el directorio donde hayas descomprimido el código y selecciona el fichero `manifest.json`

### Chrome
- Descarga el repositorio y descomprimelo
- Abre en tu navegador la dirección `chrome://extensions/`
- Activa el `Developer mode` en la esquina superior derecha
- Haz clic en `Load unpacked`
- Selecciona la carpeta que contiene los archivos de tu extensión

Para otros navegadores basados en Chromium (Edge, Brave, Opera, etc.) el proceso es muy similar. Busca la página de gestión de extensiones y una opción para cargar extensiones descomprimidas o en modo desarrollador.

## Contacto

- Sergio G. (soukron_at_gmbros.net)
- Telegram: https://t.me/soukron
