# ![icon of an drone](src/icons/icon-48.png) ENAIRE Drones Extension

## Descripcion
Esta extension para tu navegador pretende ayudar a la lectura de algunas de las informaciones presentadas en la web ENAIRE Drones ya que pueden resultar confusas para usuarios no acostumbrados a la nomenclatura aeronáutica.

Por ahora:
- convierte fechas de inicio y fin a zona española (Europe/Madrid)
- convierte limites de altura a texto legible y alturas en metros
- extrae de la descripción los datos de coordinación si existen
- extrae de la descripción la informacion de si el espacio está segregado/restringido y lo muestra de una manera más clara
- oculta la descripción por defecto

En un futuro, quizá:
- oculte NOTAMS y demás informaciones que no afecten a los drones
- enlace con el formulario del Ministerio del Interior para aquellas zonas que requieran la comunicación
- traduzca los horarios de los NOTAM

## Instalación
### Firefox
Accede a la [web de la extensión en Mozilla](https://addons.mozilla.org/en-US/firefox/addon/enaire-drones-extension/) e instálala desde ahí.

### Chrome
Accede a la [web de la extensión en Chrome Web Store](https://chromewebstore.google.com/detail/enaire-drones-extension/ideoickpjgfkkdcmjlknlcickcmifhck?authuser=0&hl=es) e instálala desde ahí.

## Desarrollo
Usa `make` para construir y empaquetar la extensión y poder probarla localmente.

Revisa la lista siguiente para ver los posibles targes de `make` (revisa el Makefile para obtener más detalles).

| Comando              | Descripcion                                                                             |
| -------------------- | --------------------------------------------------------------------------------------- |
| `make` or `make all` | Prepara el código fuente y prepara las extensiones sin empaquetar para los navegadores  |
| `make extension`     | Prepara el código fuente                                                                |
| `make chromium`      | Prepara el código fuente y prepara la extensión sin empaquetar para Chromium            |
| `make firefox`       | Prepara el código fuente y prepara la extensión sin empaquetar para Firefox             |

### Cargar una extensión localmente
-   En Chromium:
    -   Ve a la dirección `chrome://extensions`
    -   Activa `Developer mode` en la esquina superior derecha
    -   Haz click en `Load unpacked extension`
    -   Selecciona el directorio `enaire-drones-extension/chromium`
-   En Firefox:
    -   Ve a la dirección `about:debugging#addons`
    -   Haz click en `Load temporary add-on`
    -   Selecciona el directorio `enaire-drones-extension/firefox`

## Contribuciones
1. Crea un fork [del repositorio](https://github.com/soukron/enaire-drones-extension)
2. Create una rama de feature
    - `git checkout -b my-new-feature`
3. Guarda tus cambios
    - `git commit -am 'Add some feature'`
4. Sube los cambios
    - `git push origin my-new-feature`
5. Crea una nueva pull request

## Contacto
- Sergio G. (soukron_at_gmbros.net)
- Telegram: https://t.me/soukron
