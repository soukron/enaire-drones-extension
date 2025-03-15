import { lastClickedCoordinates } from './modules/coordinates.js';
import { processElements } from './modules/processor.js';
import { tooltipStyles } from './modules/ui/styles.js';

// Función para procesar clicks en el mapa
function handleMapClick() {
  const coordInfo = document.querySelector('.coordinate-info');
  if (coordInfo) {
    lastClickedCoordinates = coordInfo.textContent;
    console.log('soukronfpv - Coordenadas capturadas en click:', lastClickedCoordinates);
  }

  setTimeout(async () => {
    await processElements();
  }, 1000);
}

// Inicialización
function initMapMonitor() {
  const map = document.querySelector('.map');
  if (map) {
    map.addEventListener('click', handleMapClick);
    console.log('soukronfpv - Monitor de clicks en mapa iniciado');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', initMapMonitor);
window.addEventListener('load', initMapMonitor);

// Agregar estilos
const style = document.createElement("style");
style.innerHTML = tooltipStyles;
document.head.appendChild(style);